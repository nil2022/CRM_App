// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { userTypes } from "#utils/constants";
import env from "#configs/env";
import { sendResponse } from "#utils/sendResponse";

export const verifyToken = (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.headers["x-access-token"];

    if (!token) {
        console.log("User not logged in or Token not provided, Please Login!");
        return res.status(403).json({
            data: "",
            message: "User not logged in or Token not provided, Please Login!",
            statusCode: 403,
            success: false,
        });
    }

    jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(`Session(JWT Token) Expired! Please Re-Login! -> [${err.message}]`);
            return res.status(401).json({
                data: "",
                message: "Session Expired, Please Re-Login!",
                statusCode: 401,
                success: false,
            });
        }
        req.decoded = decoded;
        next();
    });
};

/* -------- CHECK WHETHER USER IS ADMIN OR NOT ----------- */
export const isAdmin = async (req, res, next) => {
    if (req.decoded.userType === userTypes.admin) {
        next();
    } else {
        console.log("Access denied, Require Admin Role!");
        return sendResponse(res, 401, null, "Access denied, Require Admin Role!", false);
    }
};
