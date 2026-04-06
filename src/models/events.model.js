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
import { users } from "#models/user.model.js";

// Events Table
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    organizerId: integer('organizer_id').references(() => users.id),
    title: text('title').notNull(),
    eventDate: timestamp('event_date').notNull(),
    ticketsLeft: integer('tickets_left').notNull(),
});