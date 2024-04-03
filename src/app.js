import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import logger from "morgan";
import { limiter } from "./utils/api-rate-limit.js";
import cookieParser from "cookie-parser";
import winston from "winston";
import expressWinston from "express-winston";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
        credentials: true,
    })
);

app.use(
    expressWinston.logger({
        transports: [
            new winston.transports.Console(),
            // new winston.transports.Http()
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json(),
            winston.format.prettyPrint(),
            winston.format.timestamp()
        ),
    })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: "16kb" })); // parse JSON data & add it to the req.body object
app.use(express.static("public"));
app.use(helmet()); // helmet middleware for additional security
app.use(logger("dev"));
app.use(cookieParser());
app.use(limiter);

/* ---------HOME PAGE ROUTE-------- */
app.get("/health", (_, res) => {
    res.status(200).json({
        message: "CRM app running Successfully🚀",
        success: true,
    });
});

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
app.use("/crm/api/v1/auth", authRouter);
app.use("/crm/api/v1/users", userRouter);
// const ticketRoutes = require('./routes/ticket.routes')
// const userRoutes = require('./routes/user.routes')
// ticketRoutes(app)
// userRoutes(app)

export { app };
