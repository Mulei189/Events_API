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

