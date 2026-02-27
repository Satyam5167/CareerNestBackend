import express from 'express';
import passport from 'passport';
import { signup, login, googleAuthCallback } from '../controllers/authController.js';

const router = express.Router();

// Manual Auth
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleAuthCallback
);

export default router;
