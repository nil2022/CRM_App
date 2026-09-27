// Dummy environment values so importing the app in tests never touches
// real infrastructure or crashes on a missing required env var.
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRY = "1d";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRY = "7d";
process.env.SESSION_SECRET = "test-session-secret";
process.env.GITHUB_CLIENT_ID = "test-client-id";
process.env.GITHUB_CLIENT_SECRET = "test-client-secret";
process.env.GITHUB_CALLBACK_URL = "http://localhost/auth/github/callback";
process.env.CORS_ORIGIN = "*";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/crm-app-test";
process.env.RATE_LIMIT_TIME = "15";
process.env.MAX_REQUESTS = "100";
