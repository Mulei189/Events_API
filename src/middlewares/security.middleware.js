import aj from '#config/arcjet.js';
import {slidingWindow} from '@arcjet/node';
import logger from '#config/logger.js';

// Middleware to apply Arcjet security rules
export const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';

        let limit;
        let message;

        switch (role) {
            case 'organizer':
                limit = 20; // Higher limit for organizers
                message = 'Too many requests from organizer'
                break;
            case 'attendee':
                limit = 10; // Standard limit for attendees
                message = 'Too many requests from attendee'
                break;
            case 'guest':
                limit = 10; // Standard limit for guests
                message = 'Too many requests from guest';
                break;
        }

        const client = aj.withRule(slidingWindow({
            mode: "LIVE",
            interval: '1m',
            max: limit,
            name: `${role}-rate-limit`,
        }));

        const decision = await client.protect(req);

        if(decision.isDenied && decision.reason.isBot()){
            logger.warn(`Bot detected: ${decision.reason.getBotCategory()} - ${req.ip}`);
            return res.status(403).json({ message: 'Access denied - bot detected' });   
        }

        if(decision.isDenied && decision.reason.isShield()){
            logger.warn(`Shield triggered: ${decision.reason.getShieldName()} - ${req.ip}`);
            return res.status(403).json({ message: 'Access denied - security rule triggered' });
        }

        if(decision.isDenied && decision.reason.isRateLimit()){
            logger.warn(`Rate limit exceeded: ${message} - ${req.ip}`);
            return res.status(429).json({ message: 'Too many requests - rate limit exceeded' });
        }

        next();
    } catch (error) {
        logger.error('Error in security middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default securityMiddleware;