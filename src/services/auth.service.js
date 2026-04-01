import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

// Hashing passwords
export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error('Error hashing password:', error);
        throw new Error('Error hashing password');
    }
}

// Create a new user
export const createUser = async (name, email, password, role) => {
    try {
        // Check if user with same email already exists
        const userExists = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if(userExists.length > 0) {
            logger.warn(`User with email ${email} already exists`);
            throw new Error('User with this email already exists');
        }

        // Hash the password before storing
        const hashedPassword = await hashPassword(password);

        // Insert new user into the database
        const [newUser] = await db.insert(users).values({
            name,
            email,
            role,
            password: hashedPassword,
        }).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.createdAt
        });
        
        logger.info(`User created with email: ${email}`);
        return newUser;
    } catch (error) {
        logger.error('Error creating user:', error);
        throw new Error('Error creating user');
    }
}

// Sign-in user logic
export const signInUser = async (email, password) => {
    try {
        // Find user by email
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if(user.length === 0) {
            logger.warn(`No user found with email: ${email}`);
            throw new Error('Invalid email');
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if(!isPasswordValid) {
            logger.warn(`Invalid password for email: ${email}`);
            throw new Error('Invalid password');
        }

        logger.info(`User signed in with email: ${email}`);
        return ({
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
            created_at: user[0].createdAt
        });
    } catch (error) {
        logger.error('Error signing in user:', error);
        throw new Error('Error signing in user');
    }
}

// Sign-out logic
export const signOut = (userId) => {
    try {
        // Currently, JWT is stateless, so logout = just clear the cookie
        // Future enhancement: Add token blacklist for invalidating tokens in database
        logger.info(`User ${userId} logged out successfully`);
        return { success: true };
    } catch (error) {
        logger.error('Error logging out user', error);
        throw new Error('Failed to log out user');
    }
}