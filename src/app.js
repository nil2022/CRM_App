import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import { errorLogger, infoLogger, morganMiddleware, warningLogger } from "./utils/winstonLogger.js";
import { limiter } from "./utils/api-rate-limit.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "../swaggerConfig.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
        // credentials: true,
    })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: "16kb" })); // parse JSON data & add it to the req.body object
app.use(express.static("public"));
app.use(helmet()); // helmet middleware for additional security
app.use(morganMiddleware);
app.use(cookieParser());
app.use(limiter);

/* ---------HOME PAGE ROUTE-------- */
app.get("/health", (_, res) => {
    infoLogger.info("CRM app is up and running !");

    res.status(200).json({
        message: "CRM App is up and running 🚀",
        success: true,
    });
});

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import errorHandler from "./utils/errorHandler.js";

app.use("/crm/api/v1/auth", authRouter);
app.use("/crm/api/v1/users", userRouter);
app.use("/crm/api/v1/tickets", ticketRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Route not found middleware
app.use("*", (_, res) => {
    warningLogger.warn("Route not found !");
    res.status(404).json({
        message: "Route not found",
        statusCode: 404,
        success: false,
    });
});

app.use(errorHandler);

export { app };
