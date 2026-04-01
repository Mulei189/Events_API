import { formatValidationErrors} from '#utils/format.js';
import { createUser, signInUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';
import { cookies } from '#utils/cookie.js';
import { signUpSchema, signInSchema } from '#validations/auth.validation.js';

// Sign-up controller
export const signUp = async (req, res, next) => {
    try {
        // Validate input
        const validationResult = signUpSchema.safeParse(req.body);
        if(!validationResult.success) {
            return res.status(400).json({ 
                details: formatValidationErrors(validationResult.error),
                error: 'Invalid input data for sign-up'
            });
        }

        // Extract validated data
        const { name, email, password, role} = validationResult.data;

        // Create user
        const newUser = await createUser(name, email, password, role);

        // Generate JWT token and store in HTTP-only cookie
        const token = jwttoken.sign({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        })
        cookies.setCookie(res, 'token', token);

        // Respond with user data (excluding password)
        logger.info(`User signed up with email: ${email}`);
        return res.status(201).json({
            message: `User registered successfully with email: ${email}`,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            token: token
        })
    } catch (error) {
        logger.error('Error in sign-up controller:', error);
        if(error.message === 'User with this email already exists') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        next(error);
    }
}

// Sign-in controller
export const signIn = async (req, res, next) => {
    try {
        // Validate input
        const validationResult = signInSchema.safeParse(req.body);
        if(!validationResult.success) {
            return res.status(400).json({ 
                details: formatValidationErrors(validationResult.error),
                error: 'Invalid input data for sign-in'
            });
        }

        // Extract validated data
        const {email, password} = validationResult.data;

        // Sign-in user
        const user = await signInUser(email, password);

        // Generate JWT token and store in HTTP-only cookie
        const token =jwttoken.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        })
        cookies.setCookie(res, 'token', token)

        // Respond with user data (excluding password)
        logger.info(`User signed in with email: ${email}`);
        res.status(200).json({
            message: `User signed in successfully with email: ${email}`,
            user: {
                id: user.id,
                email: user.email,  
                role: user.role
            },
            token: token
        })
    } catch (error) {
        logger.error('Error in sign-in controller:', error);
        next(error);
    }
}

// Sign out controller
export const signOut = async (req, res, next) => {
    try {
        // Note: Extract userId from token if needed (from JWT payload)
        // For now, just clear the cookie
        
        // Call service to handle logout logic
        await logoutUser(req.user?.id);

        // Clear the token cookie
        cookies.clearCookie(res, 'token');

        res.status(200).json({ 
            message: 'User logged out successfully' 
        });
    } catch (error) {
        logger.error('Sign out error', error);
        next(error);
    }
}