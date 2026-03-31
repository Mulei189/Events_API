import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
    
// Initialize app
const app = express();
app.use(helmet());
app.use(cors());
app.use(cookieParser());

app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

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

export default app;