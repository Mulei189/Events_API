import express from 'express';

// Initialize app
const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the Events API');
})

export default app;