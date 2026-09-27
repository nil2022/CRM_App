import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import { limiter } from "./utils/api-rate-limit.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "../swaggerConfig.js";
import fileUpload from "express-fileupload";
import session from "express-session";
import passport from "passport";

const app = express();

// Security headers must apply to every response, including static files
// served below - mount helmet before anything else in the chain.
app.use(helmet());

// `CORS_ORIGIN` is documented in .env.sample as mandatory; without it we fall
// back to the previous wide-open behavior (unchanged risk) but call it out
// loudly. Credentials are only ever enabled for an explicit, configured
// origin allow-list - never combine `credentials: true` with the wide-open
// fallback, or any site could ride a logged-in user's cookies.
const corsOriginConfigured = Boolean(process.env.CORS_ORIGIN);
const corsOrigin = corsOriginConfigured
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : true;
if (!corsOriginConfigured) {
    console.warn(
        "[security] CORS_ORIGIN is not set - allowing all origins. Set CORS_ORIGIN in production."
    );
}
app.use(
    cors({
        origin: corsOrigin,
        credentials: corsOriginConfigured,
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(",").map((h) => h.trim()),
    })
);

app.use(express.urlencoded({ extended: true })); // parse URL-encoded data & add it to the req.body object
app.use(express.json()); // parse JSON data & add it to the req.body object
app.use(cookieParser());


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        // Only persist a session once something is actually stored in it
        // (e.g. during the passport OAuth handshake) - otherwise every
        // anonymous visitor gets a stored session for nothing.
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(limiter);
app.use(
    fileUpload({
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB - no route currently consumes req.files
        abortOnLimit: true,
    })
);

/* ---------HOME PAGE ROUTE-------- */
app.get("/health", (_, res) => {
    // console.log("CRM app is up and running !");

    return res.status(200).json({
        message: "CRM App is up and running 🚀",
        success: true,
    });
});

import errorHandler from "./utils/errorHandler.js";
import { NotFoundError } from "./utils/ApiError.js";
// import router from "./routes/githubRoutes.js";
import router from "./routes/index.js";

import "./utils/GitHub-login.js";

app.use('/api/v1',router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Route not found middleware
app.use((req, res, next) => {
    next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

export { app };
