import express from 'express';
export const router = express.Router();
import { toggleBookmark, getBookmarkedJobs, getBookmarkIds } from '../controllers/bookmarkController.js';
import passport from 'passport';

const authMiddleware = passport.authenticate('jwt', { session: false });

router.get('/', authMiddleware, getBookmarkedJobs);
router.get('/ids', authMiddleware, getBookmarkIds);
router.post('/toggle', authMiddleware, toggleBookmark);

export default router;
