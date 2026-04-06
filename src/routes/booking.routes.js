import express from 'express';
import { authenticate, authorize } from '#middlewares/authorization.middleware.js';
import { create, getBookings, cancel, getBooking, getAllBookings } from '#controllers/booking.controller.js';

const router = express.Router();

// Routes for bookings
// POST /api/bookings/create - Create a new booking
router.post('/create', authenticate, authorize('attendee'), create);

// GET /api/bookings/all - Get all bookings (admin and organizer)
router.get('/all', authenticate, authorize('admin', 'organizer'), getAllBookings);

// GET /api/bookings - Get all bookings for the authenticated user
router.get('/', authenticate, getBookings);

router.get('/:id', authenticate, getBooking);

// DELETE /api/bookings/:id - Cancel a booking
router.delete('/:id', authenticate, cancel);

export default router;