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

/**
 * @swagger
 * tags:
 *   name: Authorization
 *   description: Authorization routes for CRM App
 */

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user using fullName, userId, email and password provided.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fullName: John Doe
 *             userId: john123
 *             email: john@email.com
 *             password: john123
 *             userType: CUSTOMER
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 user:
 *                   _id: 66a137196dc8047f160cbed0
 *                   fullName: John Doe
 *                   userId: john123
 *                   email: john@email.com
 *                   avatar: ""
 *                   loginType: OTP
 *                   isEmailVerified: false
 *                   userType: CUSTOMER
 *                   userStatus: APPROVED
 *                   createdAt: 2022-09-27T06:32:33.000Z
 *               message: User registered successfully and verification email has been sent on your email.
 *               statusCode: 201
 *               success: true
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", [isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided], signup);

/**
 * @swagger
 * /auth/verify-user:
 *   post:
 *     summary: Verify user
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: john123
 *             otp: 123456
 *     responses:
 *       200:
 *         description: User verified
 *         content:
 *           application/json:
 *             example:
 *               data: ""
 *               message: User verified successfully
 *               statusCode: 200
 *               success: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post("/verify-user", verifyUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user with userId and password provided
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: john123
 *             password: john123
 *     responses:
 *       200:
 *         description: User logged in
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/login", [isUserIdProvided, isPasswordProvided], signin);

/**
 * @swagger
 * /auth/current-user:
 *   get:
 *     summary: Get current user
 *     description: Get current user details based on access token provided
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/current-user", [verifyToken], getLoggedInUser);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change current user password
 *     description: Change current user password
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             oldPassword: john123
 *             newPassword: john123
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/change-password", [verifyToken], changeCurrentUserPassword);

/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     description: Refresh access token
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout a user
 *     description: Logout a user
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/logout", [verifyToken], logout);

export default router;
