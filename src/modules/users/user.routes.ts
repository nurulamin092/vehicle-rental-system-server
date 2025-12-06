import { Router } from "express";
import { usersController } from "./user.controllers";

const router = Router();

router.post("/", usersController.createUser);
router.get("/", usersController.getAllUser);
export const userRouter = router;
