// routes/index.js
import { Router } from "express";
import authRouter from "#routes/auth";
import userRouter from "#routes/user";
import ticketRouter from "#routes/ticket";
import adminRouter from "#routes/admin";

const router = Router();

// Admin Routes
router.use("/admin", adminRouter);

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/tickets", ticketRouter);

export default router;
