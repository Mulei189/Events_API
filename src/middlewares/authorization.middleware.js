import logger from '#config/logger.js';

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if the user is authenticated and has a role
        if(!req.user || !req.user.role){
            logger.warn('Unauthorized access attempt: No user or role found');
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if the user's role is in the list of allowed roles
        if(allowedRoles.includes(req.user.role)) {
            next(); // User is authorized, proceed to the next middleware
        } else {
            logger.warn(`Forbidden access attempt: User role '${req.user.role}' is not allowed`);
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }
    }
}