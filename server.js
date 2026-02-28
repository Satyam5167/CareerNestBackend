import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import { initCronJobs } from './cron.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://careernestbackend-4jlj.onrender.com' // render url
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());

// Detailed Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(session({

    secret: process.env.SESSION_SECRET || 'secret_session',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ats', atsRoutes);

app.get('/', (req, res) => {
    res.send('Auth API is Running');
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running on PORT: ${PORT}`);

    // Check DB Connection on startup
    try {
        await pool.query('SELECT NOW()');
        console.log('[DB] Connected to PostgreSQL (Neon) successfully.');
    } catch (err) {
        console.error('[DB] Connection Error:', err.message);
    }

    initCronJobs();
});

