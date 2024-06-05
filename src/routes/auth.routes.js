import { Router } from "express";
import {
    signup,
    signin,
    logout,
    getLoggedInUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    verifyUser,
} from "../controllers/auth.controller.js";
import {
    isEmailRegisteredOrProvided,
    isPasswordProvided,
    isUserIdProvided,
    isUserIdRegisteredOrProvided,
} from "../middlewares/validateUserRequest.js";
import { verifyToken } from "../middlewares/auth.jwt.js";

const router = Router();

/* ------ USER SIGNUP -------- */
router.post(
    "/register",
    [
        isUserIdRegisteredOrProvided,
        isEmailRegisteredOrProvided,
        isPasswordProvided,
    ],
    signup
);

router.post("/verify-user", verifyUser)

/* ------ USER SIGNIN -------- */
router.post("/login", [isUserIdProvided, isPasswordProvided], signin);

/* ------ GET LOGGED IN USER -------- */
router.get("/current-user", [verifyToken], getLoggedInUser);

/* ------ CHNAGE USER PASSWORD -------- */
router.patch("/change-password", [verifyToken], changeCurrentUserPassword);

/* ------ REFRESH ACCESS TOKEN -------- */
router.get("/refresh-token", refreshAccessToken);

/* ------ USER LOGOUT -------- */
router.get("/logout", [verifyToken], logout);

export default router;
