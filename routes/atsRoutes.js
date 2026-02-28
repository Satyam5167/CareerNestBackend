import express from 'express';
export const router = express.Router();
import multer from 'multer';
import { analyzeResume } from '../controllers/atsController.js';
import passport from 'passport';

const authMiddleware = passport.authenticate('jwt', { session: false });

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files allowed'), false);
        }
    }
});

router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);

export default router;
