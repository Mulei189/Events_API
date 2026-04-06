// Create a validation schema for bookings
import { z } from 'zod';

// Create booking validation schema
export const createBookingSchema = z.object({
    eventId: z.number().positive('Event ID must be a positive number'),
    ticketsBooked: z.number().int().positive('Number of tickets must be a positive integer').max(10, 'Maximum 10 tickets per booking')
})

// Update booking validation schema
export const updateBookingSchema = z.object({
    status: z.enum(['confirmed', 'cancelled', 'pending']).optional(),
    ticketsBooked: z.number().int().positive('Number of tickets must be a positive integer').max(10, 'Maximum 10 tickets per booking').optional()
})
