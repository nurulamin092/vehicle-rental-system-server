import { Router } from "express";
import { authController } from "./auth.controllers";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

export const authRouter = router;
