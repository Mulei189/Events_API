import express from 'express';
import { create, getEvents, getEvent, updateEvent, deleteEvent } from '#controllers/event.controller.js';
import { authorize } from '#middlewares/authorization.middleware.js';

const router = express.Router();

// RouteS for events
// post /api/events/create
router.post('/create', authorize(['organizer', 'admin']), create);
// GET /api/events
router.get('/', getEvents);
// GET /api/events/:id
router.get('/:id', getEvent);
// PUT /api/events/:id
router.put('/:id', authorize(['organizer', 'admin']), updateEvent);
// DELETE /api/events/:id
router.delete('/:id', authorize(['organizer', 'admin']), deleteEvent);

export default router;