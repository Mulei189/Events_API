import { 
    pgTable, 
    serial, 
    text, 
    timestamp, 
    integer, 
    pgEnum, 
    unique, 
    check
} from 'drizzle-orm/pg-core';
import { users } from '#models/user.model.js';
import { events } from '#models/events.model.js';
// Define Enums
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled', 'pending']);


// Bookings Table
export const bookings = pgTable('bookings', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    eventId: integer('event_id').references(() => events.id),
    ticketsBooked: integer('tickets_booked').notNull(),
    status: bookingStatusEnum('status'),
    createdAt: timestamp('created_at'),
});