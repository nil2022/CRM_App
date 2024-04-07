import { isAdmin, verifyToken } from "../middlewares/auth.jwt.js";
import {
    deleteUser,
    findAll,
    findByUserId,
    updateUserStatus,
} from "../controllers/user.controller.js";
import { Router } from "express";

const router = Router();

/* ------ GET ALL USERS API -------- */
router.get("/", [verifyToken, isAdmin], findAll);

/* ------ GET A USER API -------- */
router.get("/get-user", [verifyToken, isAdmin], findByUserId);

/* ----- UPDATE A USER API -------- */
router.patch("/update-user", [verifyToken, isAdmin], updateUserStatus);

/* ----- DELETE A USER API -------- */
router.delete("/deleteUser", [verifyToken, isAdmin], deleteUser);

export default router;
