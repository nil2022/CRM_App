// configs/env.config.js
import { str, num, bool, cleanEnv, port } from "envalid";

const envVariables = process.env;

const env = cleanEnv(envVariables, {
    //Server Config
    PORT: port(),
    NODE_ENV: str({ choices: ["development", "production"], default: "development" }),
    MONGODB_URI: str(),
    FORCE_GOOGLE_DNS: str({ default: "false" }),

    NOTIFICATION_URL: str(),

    // JWT Config
    ACCESS_TOKEN_SECRET: str(),
    ACCESS_TOKEN_EXPIRY: str(),
    REFRESH_TOKEN_SECRET: str(),
    REFRESH_TOKEN_EXPIRY: str(),

    // Session Config
    SESSION_SECRET: str(),

    // Github Config
    GITHUB_CLIENT_ID: str(),
    GITHUB_CLIENT_SECRET: str(),
    GITHUB_CALLBACK_URL: str(),

    // CORS Config
    CORS_ORIGIN: str(),

    // ADMIN User Config
    ADMIN_NAME: str(),
    ADMIN_EMAIL: str(),
    ADMIN_PASSWORD: str(),

    // Email Config
    MAIL_HOST: str(),
    MAIL_PORT: num(),
    MAIL_AUTH_SECURE: bool(), // true for 465, false for other ports
    MAIL_USER: str(),
    MAIL_PASS: str(),
    MAIL_FROM_ADDRESS: str(),

    // Rate Limit Config
    RATE_LIMIT_TIME: num({ default: 15 * 60 * 1000 }), // 15 minutes
    MAX_REQUESTS: num({ default: 100 }), // limit each IP to 100 requests per windowMs

    LOG_RESPONSES: bool(),
});

export default env;
