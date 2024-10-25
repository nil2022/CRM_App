import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import ticketRouter from "./ticketRoutes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/tickets", ticketRouter);

export default router;