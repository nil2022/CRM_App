// routes/auth.route.js
import { Router } from "express";
import {
    signup,
    signin,
    logout,
    getLoggedInUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    handleSocialAuth,
    verifyUser,
} from "#controllers/auth";
import { verifyToken } from "#middlewares/auth";
import passport from "passport";
import { sendResponse } from "#utils/sendResponse";
import { changePasswordSchema, loginSchema, userSignupSchema, verifyEmailOtpSchema } from "#validations/user";
import httpStatus from "http-status";

const authRouter = Router();

// GitHub authentication route
authRouter.get(
    "/github",
    passport.authenticate("github", { scope: ["user", "email"] }), // Request email scope
    (req, res) => {
        res.send("Redirecting to GitHub...");
    }
);

// GitHub callback route
authRouter.get(
    "/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/api/v1/auth/login", // Redirect if authentication fails
        successRedirect: "/api/v1/auth/sso/success", // Redirect if authentication succeeds
    })
);

// Route for successful login
authRouter.get("/sso/success", handleSocialAuth);

authRouter.get("/success", (req, res) => {
    console.log("Authentication successful:", req.user);
    res.status(200).json({ message: "Login success", user: req.query });
});

authRouter.post("/register", registerUser);
authRouter.post("/verify-user", verifyUserEmail);
authRouter.post("/login", loginUser);
authRouter.get("/current-user", [verifyToken], getUserProfile);
authRouter.patch("/change-password", [verifyToken], changePassword);
authRouter.get("/refresh-token", refreshUserAccessToken);
authRouter.get("/logout", [verifyToken], logout);

async function registerUser(req, res, next) {
    try {
        const payload = req.body;
        const { error } = userSignupSchema.validate(payload);
        if (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, error.message);
        }
        const result = await signup(payload);
        return sendResponse(res, 201, null, result?.message || `User Registered Successfully`);
    } catch (error) {
        next(error);
    }
}

async function verifyUserEmail(req, res, next) {
    try {
        const { error, value: validatedPayload } = verifyEmailOtpSchema.validate(req.body);
        if (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, error.message);
        }
        const result = await verifyUser(validatedPayload);
        return sendResponse(res, httpStatus.OK, null, result?.message || `OTP Verified Successfully`);
    } catch (error) {
        next(error);
    }
}

async function loginUser(req, res, next) {
    try {
        const { error, value: validatedPayload } = loginSchema.validate(req.body);
        if (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, error.message);
        }
        const { accessToken, refreshToken, message } = await signin(validatedPayload);
        console.log('accessToken: ', accessToken);
        return sendResponse(res, httpStatus.OK, null, message, accessToken);
    } catch (error) {
        next(error);
    }
}

async function getUserProfile(req, res, next) {
    try {
        const loggedInUser = req.decoded;
        const user = await getLoggedInUser(loggedInUser);
        return sendResponse(res, httpStatus.OK, user, user?.message || "Data fetched successfully");
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const loggedInUser = req.decoded;
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, error.message);
        }
        await changeCurrentUserPassword(value, loggedInUser);
        return sendResponse(res, httpStatus.OK, null, "Password changed successfully");
    } catch (error) {
        next(error);
    }
}

async function refreshUserAccessToken(req, res, next) {
    try {
        const header = req.header("Authorization") || "";
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];
        const opts = { ip, userAgent };
        const incomingRefreshToken = header.startsWith("Bearer ")
            ? header.replace("Bearer ", "")
            : req.body?.refreshToken || undefined;

        if (!incomingRefreshToken) {
            throw {
                status: httpStatus.UNAUTHORIZED,
                message: "Refresh token required",
            };
        }
        const { accessToken, refreshToken, message } = await refreshAccessToken(incomingRefreshToken, opts);
        return res.status(200).json({
            status: true,
            message,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
}

export default authRouter;
