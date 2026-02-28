import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import pool from '../utils/db.js';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    proxy: true
},



    async function (accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails[0].value;
            const oauthId = profile.id;
            const name = profile.displayName;
            const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

            // Check if user exists
            const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            let user = userRes.rows[0];

            if (!user) {
                // Create user if not exists
                const newUserRes = await pool.query(
                    'INSERT INTO users (name, email, provider, oauth_id, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [name, email, 'google', oauthId, profilePicture]
                );
                user = newUserRes.rows[0];
            } else if (user.provider !== 'google') {
                // Handle case where user registered with same email but different provider
                if (!user.oauth_id) {
                    const updatedUserRes = await pool.query(
                        'UPDATE users SET provider = $1, oauth_id = $2, profile_picture = $3 WHERE id = $4 RETURNING *',
                        ['google', oauthId, profilePicture, user.id]
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

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_secret_key'
};

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
        const user = userRes.rows[0];

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
