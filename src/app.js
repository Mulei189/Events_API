import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import eventsRoutes from '#routes/events.routes.js';
import securityMiddleware from '#middlewares/security.middleware.js';
import { authorize, authenticate } from '#middlewares/authorization.middleware.js';
    
// Initialize app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// Apply security middleware globally
app.use(securityMiddleware); 

app.get('/', (req, res) => {
    logger.info('Hello from the Events API!');
    res.send('Welcome to the Events API');
})

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API is working' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authenticate, eventsRoutes);
export default app;