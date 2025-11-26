// routes/user.route.js
import { Router } from "express";
import { isAdmin, verifyToken } from "#middlewares/auth";
import { deleteUser, fetchAllUsers, findByUserId, updateUserStatus } from "#controllers/user";
import { sendResponse } from "#utils/sendResponse";

const userRouter = Router();

userRouter.use(verifyToken, isAdmin);

userRouter.route("/fetchById").get(getUserById);
userRouter.route("/").get(getAllUsers).patch(updateStatus).delete(removeUser);

async function updateStatus(req, res, next) {
    try {
        const payload = req.body;
        const result = await updateUserStatus(payload);
        return sendResponse(res, 200, result, "User status updated successfully");
    } catch (error) {
        next(error);
    }
}

async function getUserById(req, res, next) {
    try {
        const userId = req.query.userId;
        const result = await findByUserId(userId);
        return sendResponse(res, 200, result, "User fetched successfully");
    } catch (error) {
        next(error);
    }
}

async function getAllUsers(req, res, next) {
    try {
        const queryParams = req.query;
        const result = await fetchAllUsers(queryParams);
        return sendResponse(res, 200, result, "Users fetched successfully");
    } catch (error) {
        next(error);
    }
}

async function removeUser(req, res, next) {
    try {
        await deleteUser(req, res);
    } catch (error) {
        next(error);
    }
}

export default userRouter;
