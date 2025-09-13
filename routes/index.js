// routes/index.js
import { Router } from "express";
import authRouter from "#routes/auth";
import userRouter from "#routes/user";
import ticketRouter from "#routes/ticket";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/tickets", ticketRouter);

export default router;
