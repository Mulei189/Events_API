import express from 'express';
import { signUp, signIn, signOut } from '#controllers/auth.controller.js';

const router = express.Router();

// Sign-up route
router.post('/sign-up', signUp);

// Sign-in route
router.post('/sign-in', signIn);

// Sign-out route
router.post('/sign-out', signOut);

export default router;