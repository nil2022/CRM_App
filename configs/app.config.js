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
import { cookieSessionConfigOptions, corsConfigOptions, helmetConfigOptions } from "#configs/security";
import PORT from "#configs/server";
import { sendResponse } from "#utils/sendResponse";

const app = express();
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: "50mb" })); // parse JSON data & add it to the req.body object
app.use(express.static("public"));
app.use(fileUpload());

// Convert comma-separated env variable into array
const whitelist = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) : [];

// Log whitelist at startup for clarity
console.log(chalk.cyanBright(`✅ CORS Whitelist: [${whitelist.join(", ")}]`));

// CORS middleware
app.use(cors(corsConfigOptions(whitelist)));
app.use(cookieParser());
app.use(session(cookieSessionConfigOptions(env)));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet(helmetConfigOptions(PORT))); // helmet middleware for additional security
app.use(limiter);

app.use("/crm/api/v1", router); // serve all routes here
app.use("/crm/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // serve swagger docs for all routes here
app.get("/crm", (req, res) => {
    return sendResponse(res, 200, null, `✅ CRM Backend service is healthy`);
});

// Global Error Handler
app.use(errorHandler);

export default app;
