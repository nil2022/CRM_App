// midllewares/adminAuth.middleware.js
import chalk from "chalk";
import jwt from "jsonwebtoken";

export const verifyAdminToken = (req, res, next) => {
    try {
        // Extract token from headers
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.headers["x-access-token"];

        if (!token) {
            console.log(chalk.red("Admin not logged in or Token not provided, Please Login!"));
            return res.status(403).json({
                status: 403,
                message: "Admin not logged in or Token not provided, Please Login!",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

        // Optional: check if the decoded token has admin privileges
        if (decoded?.role !== "SUPER_ADMIN") {
            console.log(chalk.red("Access denied - Super admin privileges required!"));
            return res.status(401).json({
                status: 401,
                message: "Access denied - Super admin privileges required!",
            });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === "TokenExpiredError") {
            console.log(chalk.red("Admin session expired! Please re-login."));
            return res.status(401).json({
                status: 401,
                message: "Session expired, please login again!",
            });
        }

        console.log(chalk.red(`Invalid token: ${err.message}`));
        return res.status(401).json({
            status: 401,
            message: "Invalid token, please login again!",
        });
    }
};
