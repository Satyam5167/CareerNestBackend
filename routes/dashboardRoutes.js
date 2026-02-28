import express from 'express';
export const router = express.Router();
import { getDashboardStats } from '../controllers/dashboardController.js';
import passport from 'passport';

const authMiddleware = passport.authenticate('jwt', { session: false });

router.get('/stats', authMiddleware, getDashboardStats);

export default router;
