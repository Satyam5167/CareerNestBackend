import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../utils/db.js';

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`[Signup] Attempt for: ${email}`);


        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserRes = await pool.query(
            'INSERT INTO users (name, email, password, provider) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
            [name, email, hashedPassword, 'local']
        );

        const user = newUserRes.rows[0];
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[Login] Attempt for: ${email}`);


        const userRes = await pool.query('SELECT * FROM users WHERE email = $1 AND provider = $2', [email, 'local']);
        const user = userRes.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log(`[Login] FAILED: Invalid credentials for ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(`[Login] SUCCESS: User found, generating token for ${email}`);


        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const googleAuthCallback = (req, res) => {
    // Passport adds the user to req.user after success
    const token = jwt.sign(
        { id: req.user.id, name: req.user.name, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Remove trailing slash if present to avoid double slashes in redirect
    if (frontendUrl.endsWith('/')) {
        frontendUrl = frontendUrl.slice(0, -1);
    }

    res.redirect(`${frontendUrl}/login-success?token=${token}`);
};

