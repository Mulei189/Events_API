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
// Define Enums
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled', 'pending']);


// Bookings Table
export const bookings = pgTable('bookings', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    eventId: integer('event_id').references(() => events.id),
    status: bookingStatusEnum('status').default('confirmed'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    // UNIQUE(user_id, event_id) constraint
    userEventUnique: unique().on(table.userId, table.eventId),
}));