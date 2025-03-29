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
app.use(express.urlencoded({ extended: true })); // parse URL-encoded data & add it to the req.body object
app.use(express.json()); // parse JSON data & add it to the req.body object
app.use(cors());
app.use(cookieParser());


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
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
// import router from "./routes/githubRoutes.js";
import router from "./routes/index.js";

import "./utils/GitHub-login.js";

app.use('/api/v1',router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Route not found middleware
app.use((req, res) => {
    // console.log("Route not found!");
    return res.status(404).json({
        message: "Route not found",
        statusCode: 404,
        success: false,
    });
});

app.use(errorHandler);

export { app };
