import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import { infoLogger, morganMiddleware } from "./utils/winstonLogger.js";
import { limiter } from "./utils/api-rate-limit.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
        credentials: true,
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
app.use("/crm/api/v1/auth", authRouter);
app.use("/crm/api/v1/users", userRouter);
app.use("/crm/api/v1/tickets", ticketRouter);

export { app };
