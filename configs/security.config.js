//configs/security.config.js
import chalk from "chalk";

// CORS Configuration Options
export const corsConfigOptions = (whitelist) => ({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server calls)
        if (!origin) return callback(null, true);

        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            console.log(chalk.yellowBright(`🚫 CORS Blocked: ${origin}`));
            callback(null, false);
        }
    },

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // include PATCH + OPTIONS for safety
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Content-Length", "X-Kuma-Revision"], // optional, expose any custom headers
    credentials: true, // allow cookies / Authorization headers
    optionsSuccessStatus: 200, // compatibility for old browsers (IE, SmartTVs)
    preflightContinue: false, // let CORS handle OPTIONS automatically
});

// Helmet Configuration Options
export const helmetConfigOptions = (PORT) => ({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow scripts from self and inline scripts
            connectSrc: ["'self'", `http://localhost:${PORT}`], // Allow connections to self and your API
            // Add other directives if needed for images, styles, etc.
            // imgSrc: ["'self'", "data:"],
            // styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
});

// Cookie Session Configuration Options
export const cookieSessionConfigOptions = (env) => ({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
});
