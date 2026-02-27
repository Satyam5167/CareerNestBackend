import express from 'express';
import { getProfile } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected route
router.get('/profile', authMiddleware, getProfile);

export default router;
