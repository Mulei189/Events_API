import { db } from '#config/database.js';
import { bookings } from '#models/bookings.models.js';
import { events } from '#models/events.model.js';
import { users } from '#models/user.model.js';
import { eq, and, lt, gte } from 'drizzle-orm';
import { sendBookingConfirmationEmail } from '#utils/emails.js';
import logger from '#config/logger.js';

// Create a new booking
export const createBooking = async (userId, eventId, ticketsBooked) => {
    try {
        // Check event exists and get event details
        const eventDetails = await db.select()
            .from(events)
            .where(eq(events.id, eventId))
            .limit(1);
            
        if(eventDetails.length === 0) {
            logger.warn(`Event ${eventId} not found`);
            throw new Error('Event not found');
        }

        const event = eventDetails[0];

        // Check if enough tickets are available
        if(event.ticketsLeft < ticketsBooked) {
            logger.warn(`Not enough tickets available for event ${eventId}. Requested: ${ticketsBooked}, Available: ${event.ticketsLeft}`);
            throw new Error(`Only ${event.ticketsLeft} tickets available for this event`);
        }

        // Get user details for email
        const userDetails = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
            
        if(userDetails.length === 0) {
            logger.warn(`User ${userId} not found`);
            throw new Error('User not found');
        }

        const user = userDetails[0];

        // Create booking and update tickets (sequential operations for Neon)
        const [newBooking] = await db.insert(bookings)
            .values({
                userId: userId,
                eventId: eventId,
                ticketsBooked: ticketsBooked,
                status: 'confirmed',
                createdAt: new Date()
            })
            .returning()

        // Update tickets left for the event
        await db.update(events)
            .set({ ticketsLeft: event.ticketsLeft - ticketsBooked })
            .where(eq(events.id, eventId));

        // Send confirmation email with QR code
        try {
            await sendBookingConfirmationEmail({
                userEmail: user.email,
                userName: user.name,
                eventTitle: event.title,
                eventDate: event.eventDate,
                bookingId: newBooking.id,
                userId: userId,
                eventId: eventId
            });
            logger.info(`Confirmation email sent to ${user.email} for booking ${newBooking.id}`);
        } catch (emailError) {
            logger.error('Failed to send confirmation email:', emailError);
            // Don't throw error - booking was successful, just log the email failure
        }

        logger.info(`Booking created: User ${userId} booked ${ticketsBooked} tickets for event ${eventId}`);
        return newBooking;

    } catch (error) {
        logger.error('Error creating booking:', error);
        throw error;
    }
};

// Get all bookings
export const fetchAllBookings = async () => {
    try {
        const results = await db.select({
            booking: bookings,
            event: events,
            user: users
        })
        .from(bookings)
        .leftJoin(events, eq(bookings.eventId, events.id))
        .leftJoin(users, eq(bookings.userId, users.id));
        
        return results;
    } catch (error) {
        logger.error('Error in fetchAllBookings service:', error);
        throw error;
    }
}

// Get all bookings for a user
export const getUserBookings = async (userId) => {
    try {
        const userBookings = await db.select({
            booking: bookings,
            event: events
        })
        .from(bookings)
        .leftJoin(events, eq(bookings.eventId, events.id))
        .where(eq(bookings.userId, userId));

        return userBookings;
    } catch (error) {
        logger.error('Error retrieving user bookings:', error);
        throw error;
    }
};

// Cancel a booking
export const cancelBooking = async (bookingId, userId) => {
    try {
        // Get booking details
        const bookingDetails = await db.select({
            booking: bookings,
            event: events,
            user: users
        })
        .from(bookings)
        .leftJoin(events, eq(bookings.eventId, events.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .where(eq(bookings.id, bookingId))
        .limit(1);

        if(bookingDetails.length === 0) {
            throw new Error('Booking not found');
        }

        const { booking, event, user } = bookingDetails[0];

        // Check if booking belongs to user
        if(booking.userId !== userId) {
            throw new Error('Unauthorized to cancel this booking');
        }

        // Cancel booking and restore tickets (sequential operations for Neon)
        // Update booking status
        await db.update(bookings)
            .set({ status: 'cancelled' })
            .where(eq(bookings.id, bookingId));

        // Restore tickets to event (restore the exact number that was booked)
        await db.update(events)
            .set({ ticketsLeft: event.ticketsLeft + booking.ticketsBooked })
            .where(eq(events.id, event.id));

        // Send cancellation email
        try {
            await sendCancellationEmail({
                userEmail: user.email,
                userName: user.name,
                eventTitle: event.title,
                bookingId: bookingId
            });
            logger.info(`Cancellation email sent to ${user.email} for booking ${bookingId}`);
        } catch (emailError) {
            logger.error('Failed to send cancellation email:', emailError);
        }

        logger.info(`Booking ${bookingId} cancelled by user ${userId}`);
        return { message: 'Booking cancelled successfully' };

    } catch (error) {
        logger.error('Error cancelling booking:', error);
        throw error;
    }
};