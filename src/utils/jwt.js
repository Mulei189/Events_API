import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = '1d'; // Token expires in 1 day

// Function to generate a JWT token
export const jwttoken = {
    // payload should contain user information (e.g., user ID, email)
    sign:(payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Error generating JWT token:', error);
            throw new Error('Failed to generate JWT token');
        }
    },
    // You can also add a verify function if needed
    verify:(token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Error verifying JWT token:', error);
            throw new Error('Failed to verify JWT token');
        }
    }
}