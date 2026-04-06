import { formatValidationErrors } from "#utils/format.js";
import { createBooking, getUserBookings, cancelBooking, fetchAllBookings } from "#services/bookings.service.js";
import logger from "#config/logger.js";
import { createBookingSchema } from "#validations/bookings.validations.js";

// Create booking controller
export const create = async (req, res, next) => {
    try {
        // Validate input
        const validationResult = createBookingSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                details: formatValidationErrors(validationResult.error),
                error: 'Invalid input data for creating booking'
            });
        }

        // Extract validated data
        const { eventId, ticketsBooked } = validationResult.data;
        const userId = req.user.userId; // Get user ID from authenticated token

        // Create booking
        const newBooking = await createBooking(userId, eventId, ticketsBooked);

        // Respond with created booking data
        logger.info(`Booking created successfully: User ${userId} booked ${ticketsBooked} tickets for event ${eventId}`);
        return res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                id: newBooking.id,
                userId: newBooking.userId,
                eventId: newBooking.eventId,
                ticketsBooked: newBooking.ticketsBooked,
                status: newBooking.status,
                createdAt: newBooking.createdAt
            }
        });
    } catch (error) {
        logger.error('Error creating booking:', error);
        if (error.message === 'Event not found') {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (error.message.includes('tickets available')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        next(error);
    }
};

// Get all bookings controller
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await fetchAllBookings();
        
        // Format the response with user and event names
        const formattedBookings = bookings.map(({ booking, event, user }) => ({
            id: booking.id,
            userId: booking.userId,
            userName: user?.name || 'User not available',
            userEmail: user?.email || 'Email not available',
            eventId: booking.eventId,
            eventTitle: event?.title || 'Event not available',
            eventDate: event?.eventDate,
            ticketsBooked: booking.ticketsBooked,
            status: booking.status,
            createdAt: booking.createdAt,
            ticketsLeft: event?.ticketsLeft || 0
        }));
        
        return res.status(200).json({
            message: 'All bookings retrieved successfully',
            bookings: formattedBookings,
            total: formattedBookings.length
        });
    } catch (error) {
        logger.error('Error retrieving all bookings:', error);
        return res.status(500).json({
            error: 'Failed to retrieve bookings',
            details: error.message
        });
    }
};

// Get user bookings controller
export const getBookings = async (req, res, next) => {
    try {
        const userId = req.user.userId; // Get user ID from authenticated token

        // Get all bookings for the user
        const userBookings = await getUserBookings(userId);

        // Format the response
        const formattedBookings = userBookings.map(({ booking, event }) => ({
            id: booking.id,
            eventId: booking.eventId,
            eventTitle: event?.title || 'Event not available',
            eventDate: event?.eventDate,
            ticketsBooked: booking.ticketsBooked,
            status: booking.status,
            createdAt: booking.createdAt,
            ticketsLeft: event?.ticketsLeft || 0
        }));

        // Respond with user bookings
        return res.status(200).json({
            message: 'User bookings retrieved successfully',
            bookings: formattedBookings,
            total: formattedBookings.length
        });
    } catch (error) {
        logger.error('Error retrieving user bookings:', error);
        next(error);
    }
};

// Cancel booking controller
export const cancel = async (req, res, next) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        const userId = req.user.userId; // Get user ID from authenticated token

        // Validate booking ID
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: 'Invalid booking ID' });
        }

        // Cancel the booking
        const result = await cancelBooking(bookingId, userId);

        // Respond with success message
        logger.info(`Booking ${bookingId} cancelled successfully by user ${userId}`);
        return res.status(200).json({
            message: result.message,
            bookingId: bookingId
        });
    } catch (error) {
        logger.error('Error cancelling booking:', error);
        if (error.message === 'Booking not found') {
            return res.status(404).json({ error: 'Booking not found' });
        }
        if (error.message === 'Unauthorized to cancel this booking') {
            return res.status(403).json({ error: 'You are not authorized to cancel this booking' });
        }
        if (error.message === 'Booking is already cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }
        next(error);
    }
};

// Get booking details controller
export const getBooking = async (req, res, next) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        const userId = req.user.userId; // Get user ID from authenticated token

        // Validate booking ID
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: 'Invalid booking ID' });
        }

        // Get booking details (this would need to be implemented in the service)
        // For now, we'll use getUserBookings and filter
        const userBookings = await getUserBookings(userId);
        const booking = userBookings.find(({ booking }) => booking.id === bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if booking belongs to user
        if (booking.booking.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to view this booking' });
        }

        // Format the response
        const formattedBooking = {
            id: booking.booking.id,
            eventId: booking.booking.eventId,
            eventTitle: booking.event?.title || 'Event not available',
            eventDate: booking.event?.eventDate,
            ticketsBooked: booking.booking.ticketsBooked,
            status: booking.booking.status,
            createdAt: booking.booking.createdAt,
            ticketsLeft: booking.event?.ticketsLeft || 0
        };

        // Respond with booking details
        return res.status(200).json({
            message: 'Booking details retrieved successfully',
            booking: formattedBooking
        });
    } catch (error) {
        logger.error('Error retrieving booking details:', error);
        next(error);
    }
};