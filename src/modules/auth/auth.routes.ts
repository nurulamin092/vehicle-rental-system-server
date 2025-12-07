import { Router } from "express";
import { authController } from "./auth.controllers";

const router = Router();

router.post("/signup", authController.signup);

export const authRouter = router;
