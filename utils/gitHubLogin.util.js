// utils/gitHubLogin.util.js
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
            // console.log("User profile:", profile);
            /* formatting data and sending to next function to create user anf generate token*/
            const user = {
                username: profile._json.name || profile.username,
                githubId: profile.id,
                profilePhoto: profile.photos[0].value,
                accessToken,

            }
            // Return the user object to the callback function
            return done(null, user);
        }
    )
);

// Serialize and deserialize user (simplified)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
