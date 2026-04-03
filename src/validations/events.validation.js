// Create validation schemas for events
import { z } from 'zod';

// Create event validation schema
export const createEventSchema = z.object({
    id: z.number().optional(),
    organizerId: z.number().optional(),
    title: z.string().min(1, 'Title is required'),
    eventDate: z.string().datetime().pipe(z.coerce.date()),
    ticketsLeft: z.number().min(0, 'Tickets left cannot be negative'),
})

// Update event validation schema
export const updateEventSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    eventDate: z.string().datetime().pipe(z.coerce.date()).optional(),
    ticketsLeft: z.number().min(0, 'Tickets left cannot be negative').optional(),   
})