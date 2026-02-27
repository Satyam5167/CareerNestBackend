import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.post('/', authMiddleware, updateProfile); // Both POST and PUT can use the same upsert function
router.put('/', authMiddleware, updateProfile);

export default router;
