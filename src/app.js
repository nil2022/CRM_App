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
import { csrfProtection } from "./middlewares/csrf.js";

const app = express();
// Set TRUST_PROXY (e.g. 1) when running behind a TLS-terminating proxy (Render, Railway, Nginx...) so
// `req.secure` is correct and the session cookie gets the Secure flag
if (process.env.TRUST_PROXY) {
    const hops = Number(process.env.TRUST_PROXY);
    app.set("trust proxy", Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
}
app.use(express.urlencoded({ extended: true })); // parse URL-encoded data & add it to the req.body object
app.use(express.json()); // parse JSON data & add it to the req.body object
app.use(cors());
app.use(cookieParser());
app.use(csrfProtection);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: "auto", // Secure flag whenever the request came over HTTPS
            sameSite: "lax", // lax (not strict) so the GitHub OAuth callback redirect still carries the session
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(helmet()); // helmet middleware for additional security
app.use(limiter);
app.use(fileUpload());

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
