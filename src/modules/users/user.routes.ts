import { Router } from "express";
import { usersController } from "./user.controllers";

const router = Router();

router.post("/", usersController.createUser);
export const userRouter = router;
