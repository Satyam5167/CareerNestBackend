import express from 'express';
import { searchAndSyncJobs, getJobs, applyToJob } from '../controllers/jobController.js';
import passport from 'passport';

const router = express.Router();
const authMiddleware = passport.authenticate('jwt', { session: false });

// Search via JSearch API and Save to DB
router.get('/sync', searchAndSyncJobs);

// Get stored jobs from DB
router.get('/', getJobs);

// Apply for a job (record the application)
router.post('/apply', authMiddleware, applyToJob);

export default router;
