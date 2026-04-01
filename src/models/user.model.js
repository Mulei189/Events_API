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
import { sql } from 'drizzle-orm';

// Define Enums
export const userRoleEnum = pgEnum('user_role', ['attendee', 'organizer']);
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled', 'pending']);

// Users Table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: userRoleEnum('role').default('attendee').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Events Table
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    organizerId: integer('organizer_id').references(() => users.id),
    title: text('title').notNull(),
    eventDate: timestamp('event_date').notNull(),
    ticketsLeft: integer('tickets_left').notNull(),
}, (table) => ({
    // SQL CHECK constraint for tickets_left >= 0
    ticketsCheck: check('tickets_left_check', sql`${table.ticketsLeft} >= 0`),
}));

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
