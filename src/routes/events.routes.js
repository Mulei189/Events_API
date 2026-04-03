import express from 'express';
import { create, getEvents, getEvent, updateEvent, deleteEvent } from '#controllers/event.controller.js';

const router = express.Router();

// RouteS for events
// post /api/events/create
router.post('/create', create);
// GET /api/events
router.get('/', getEvents);
// GET /api/events/:id
router.get('/:id', getEvent);
// PUT /api/events/:id
router.put('/:id', updateEvent);
// DELETE /api/events/:id
router.delete('/:id', deleteEvent);

export default router;