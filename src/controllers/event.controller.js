import { formatValidationErrors } from "#utils/format.js";
import { createEvent, getAllEvents, getEventById, updateEventById, deleteEventById } from "#services/events.service.js";
import logger from "#config/logger.js";
import { createEventSchema, updateEventSchema } from "#validations/events.validation.js";

// Create event controller
export const create = async(req, res, next) => {
    try {
        // Validate input
        const validationResult = createEventSchema.safeParse(req.body);
        if(!validationResult.success) {
            return res.status(400).json({
                details: formatValidationErrors(validationResult.error),
                error: 'Invalid input data for creating event'
            });
        }

        // 1. Extract the organizerId from the authenticated user
        const organizerId = req.user.userId; 
        // Extract validated data
        const { title, eventDate, ticketsLeft} = validationResult.data;

        // Create event - Call service function to create event in the database
        // Pass the organizerId along with other event details to the service function
        const newEvent = await createEvent(organizerId, title, eventDate, ticketsLeft);

        // Respond with created event data
        logger.info(`Event created with title: ${title} and date: ${eventDate}`);
        return res.status(201).json({
            message: 'Event created successfully',
            event: {
                id: newEvent.id,
                title: newEvent.title,
                eventDate: newEvent.eventDate,
                ticketsLeft: newEvent.ticketsLeft
            }
        })
    } catch (error) {
        logger.error('Error creating event:', error);
        if(error.message === 'Event with this title and date already exists') {
            return res.status(409).json({ error: 'Event with this title and date already exists' });
        }
        next(error);
    }
}

// Get all events controller
export const getEvents = async(req, res, next) => {
    try {
        // Get all events - Call service function to retrieve all events from the database
        const events = await getAllEvents();

        // Respond with list of events
        return res.status(200).json({
            message: 'List of events retrieved successfully',
            events: events.map(event => ({
                id: event.id,
                title: event.title,
                eventDate: event.eventDate,
                ticketsLeft: event.ticketsLeft
            }))
        });
    } catch (error) {
        logger.error('Error retrieving events:', error);
        next(error);
    }
}

// Get event by ID controller
export const getEvent = async(req, res, next) => {
    try {
        // Extract event ID from request parameters
        const eventId = parseInt(req.params.id, 10);
        if(isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        // Get event by ID - Call service function to retrieve event from the database by ID
        const event = await getEventById(eventId);

        // Respond with event details        logger.info(`Event with ID ${eventId} retrieved successfully`);
        return res.status(200).json({
            message: `Details of event ${eventId} retrieved successfully`,
            event: {
                id: event.id,
                title: event.title,
                eventDate: event.eventDate,
                ticketsLeft: event.ticketsLeft
            }
        });
    } catch (error) {
        logger.error('Error retrieving event:', error);
        next(error);
    }
}

// Update event by ID controller
export const updateEvent = async(req, res, next) => {
    try {
        // Validate input - You can create a separate validation schema for updating events if needed
        const validationResult = updateEventSchema.safeParse(req.body);
        if(!validationResult.success) {
            return res.status(400).json({
                details: formatValidationErrors(validationResult.error),
                error: 'Invalid input data for updating event'
            })
        }

        // Extract event ID from request parameters
        const eventId = parseInt(req.params.id, 10);
        if(isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        // Extract validated data
        const { title, eventDate, ticketsLeft} = validationResult.data;

        // Update event by ID - Call service function to update event in the database by ID
        const updatedEvent = await updateEventById(eventId, title, eventDate, ticketsLeft);

        // Respond with updated event details
        logger.info(`Event with ID ${eventId} updated successfully`);
        return res.status(200).json({
            message: `Event ${eventId} updated successfully`,
            event: {
                id: updatedEvent.id,
                title: updatedEvent.title,
                eventDate: updatedEvent.eventDate,
                ticketsLeft: updatedEvent.ticketsLeft
            }
        });
    } catch (error) {
        logger.error('Error updating event:', error);
        next(error);
    }
}

// Delete event by ID controller
export const deleteEvent = async(req, res, next) => {
    try {  
        // Extract event ID from request parameters
        const eventId = parseInt(req.params.id, 10);
        if(isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        // Delete event by ID - Call service function to delete event from the database by ID
        await deleteEventById(eventId);

        // Respond with success message
        logger.info(`Event with ID ${eventId} deleted successfully`);
        return res.status(200).json({
            message: `Event ${eventId} deleted successfully`
        });
    } catch (error) {
        logger.error('Error deleting event:', error);
        next(error);
    }
}
