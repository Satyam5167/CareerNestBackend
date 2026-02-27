import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../utils/db.js';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails[0].value;
            const oauthId = profile.id;
            const name = profile.displayName;

            // Check if user exists
            const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            let user = userRes.rows[0];

            if (!user) {
                // Create user if not exists
                const newUserRes = await pool.query(
                    'INSERT INTO users (name, email, provider, oauth_id) VALUES ($1, $2, $3, $4) RETURNING *',
                    [name, email, 'google', oauthId]
                );
                user = newUserRes.rows[0];
            } else if (user.provider !== 'google') {
                // Handle case where user registered with same email but different provider
                // For simplicity, we could update provider or return error. 
                // Let's allow linking if oauth_id is empty.
                if (!user.oauth_id) {
                    const updatedUserRes = await pool.query(
                        'UPDATE users SET provider = $1, oauth_id = $2 WHERE id = $3 RETURNING *',
                        ['google', oauthId, user.id]
                    );
                    user = updatedUserRes.rows[0];
                }
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
