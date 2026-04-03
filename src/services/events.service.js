import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { events } from '#models/events.model.js';
import { eq } from 'drizzle-orm';

// Create a new event
export const createEvent = async (organizerId, title, eventDate, ticketsLeft) => {
    try {
        // Check if event with same title and date already exists
        const eventExists = await db.select().from(events).where(eq(events.title, title), eq(events.eventDate, eventDate)).limit(1);
        if(eventExists.length > 0) {
            logger.warn(`Event with title "${title}" and date "${eventDate}" already exists`);
            throw new Error('Event with this title and date already exists');
        }

        // Insert new event into the database
        const [newEvent] = await db.insert(events).values({
            title,
            eventDate,
            ticketsLeft,
            organizerId
        }).returning();
        // Log event creation
        logger.info(`Event created with title: ${title} and date: ${eventDate}`);
        // Return the created event
        return newEvent;
    } catch (error) {
        logger.error('Error creating event:', error);
        throw error;
    }
}

// Retrieve all events
export const getAllEvents = async() => {
    try {
        const allEvents = await db.select().from(events);
        return allEvents;
    } catch (error) {
        logger.error('Error retrieving events:', error);
        throw error;
    }
}

// Get event by ID
export const getEventById = async (eventId) => {
    try {
        // Check if event with the given ID exists
        const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
        if(!event || event.length === 0) {
            logger.warn(`Event with ID ${eventId} not found`);
            throw new Error('Event not found');
        }
        
        // Retrieve event from the database by ID
        return event[0];
        logger.info(`Event with ID ${eventId} retrieved successfully`);
        res.status(200).json({
            message: `Details of event ${eventId} retrieved successfully`,
            event: {
                id: event[0].id,
                title: event[0].title,
                eventDate: event[0].eventDate,
                ticketsLeft: event[0].ticketsLeft
            }
        });
    } catch (error) {
        logger.error('Error retrieving event:', error);
        throw error;
    }
}

// Update event by ID
export const updateEventById = async (eventId, title, eventDate, ticketsLeft) => {
    try {
        // Check if event with the given ID exists
        const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
        if(!event || event.length === 0) {
            logger.warn(`Event with ID ${eventId} not found`);
            throw new Error('Event not found');
        }

        // Update event in the database by ID
        const [updatedEvent] = await db.update(events).set({
            title,
            eventDate,
            ticketsLeft,
        }).where(eq(events.id, eventId)).returning();

        // Log event update
        logger.info(`Event with ID ${eventId} updated successfully`);

        // Return the updated event
        return updatedEvent;
    } catch (error) {
        logger.error('Error updating event:', error);
        throw error;
    }
}

// Delete event by ID
export const deleteEventById = async (eventId) => {
    try {
        // Check if event with the given ID exists  
        const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
        if(!event || event.length === 0) {
            logger.warn(`Event with ID ${eventId} not found`);
            throw new Error('Event not found');
        }

        // Delete event from the database by ID
        const [deletedEvent] = await db.delete(events).where(eq(events.id, eventId)).returning();

        // Log event deletion
        logger.info(`Event with ID ${eventId} deleted successfully`);

        // Return the deleted event
        return deletedEvent;
    } catch (error) {
        logger.error('Error deleting event:', error);
        throw error;
    }
}