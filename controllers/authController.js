import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock DB for demonstration (In real app, use MongoDB/PostgreSQL)
const users = [];

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now(), username, email, password: hashedPassword };
        users.push(newUser);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const googleAuthCallback = (req, res) => {
    // Passport adds the user to req.user
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Redirect or send token in a way the frontend can use (e.g., query param or cookie)
    res.redirect(`http://localhost:3000/login-success?token=${token}`);
};
