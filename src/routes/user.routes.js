import { isAdmin, verifyToken } from "../middlewares/auth.jwt.js";
import {
    deleteUser,
    findAll,
    findByUserId,
    updateUserStatus,
} from "../controllers/user.controller.js";
import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User routes for CRM App
 */
const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", [verifyToken, isAdmin], findAll);

/**
 * @swagger
 * /users/get-user:
 *   get:
 *     summary: Get a user
 *     description: Get a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/get-user", [verifyToken, isAdmin], findByUserId);

/**
 * @swagger
 * /users/update-user:
 *   patch:
 *     summary: Update a user
 *     description: Update a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userStatus:
 *                 type: string
 *                 enum: [approved, pending, rejected]
 *             example:
 *               userStatus: approved
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch("/update-user", [verifyToken, isAdmin], updateUserStatus);

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Delete a user
 *     description: WARNING!! ⚠️Deletes a user⚠️
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/deleteUser", [verifyToken, isAdmin], deleteUser);

export default router;
