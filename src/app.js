import express from "express";
import cors from "cors";
import helmet from "helmet"; // Add additional security headers to request
import { limiter } from "./utils/api-rate-limit.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "../swaggerConfig.js";
import fileUpload from "express-fileupload";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
        credentials: true,
    })
);

app.use(express.urlencoded({ extended: true, limit: "5mb" })); // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: "5mb" })); // parse JSON data & add it to the req.body object
app.use(express.static("public"));
app.use(helmet()); // helmet middleware for additional security
app.use(cookieParser());
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
import router from "./routes/index.js";

app.use("/api/v1", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

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
