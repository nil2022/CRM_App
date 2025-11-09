// configs/app.config.js
import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fileUpload from "express-fileupload";
import session from "express-session";
import passport from "passport";
import swaggerDocs from "#root/swaggerConfig";
import { limiter } from "#utils/rateLimit";
import errorHandler from "#utils/errorHandler";
import router from "#root/routes/index";

import "#utils/gitHubLogin";
import env from "#configs/env";
import chalk from "chalk";

let PORT = 3000;

if (env.NODE_ENV !== "development") {
    PORT = env.PORT;
}

const app = express();
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: "50mb" })); // parse JSON data & add it to the req.body object

// Convert comma-separated env variable into array
const whitelist = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) : [];

// Log whitelist at startup for clarity
console.log(chalk.cyanBright(`✅ CORS Whitelist: [${whitelist.join(", ")}]`));

const corsOptions = {
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
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

const helmetOptions = {
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
};
app.use(helmet(helmetOptions)); // helmet middleware for additional security
app.use(limiter);
app.use(fileUpload());

app.use("/crm/api/v1", router); // serve all routes here

app.use("/crm/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // serve swagger docs for all routes here

app.get("/crm", (req, res) => {
    return res.status(200).json({
        message: "CRM App is up and running 🚀",
        success: true,
    });
});

app.use(errorHandler);

export default app;
