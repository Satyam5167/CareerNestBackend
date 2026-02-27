import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
    callbackURL: "/api/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        // Here you would typically find or create a user in your database
        // For now, we'll just return the profile
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photos: profile.photos[0].value
        };
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
