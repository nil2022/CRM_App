import { isAdmin, verifyToken } from "../middlewares/auth.jwt.js";
import {
    deleteUser,
    findAll,
    findById,
    update,
} from "../controllers/user.controller.js";
import { Router } from "express";

const router = Router();

/* ------ GET ALL USERS API -------- */
router.get("/", [verifyToken, isAdmin], findAll);

/* ------ GET A USER API -------- */
router.get("/get-user", [verifyToken, isAdmin], findById);

/* ----- UPDATE A USER API -------- */
router.patch("/updateUser", [verifyToken, isAdmin], update);

/* ----- DELETE A USER API -------- */
router.delete("/deleteUser", [verifyToken, isAdmin], deleteUser);

export default router;
