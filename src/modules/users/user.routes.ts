import { Router } from "express";
import { usersController } from "./user.controllers";

const router = Router();

router.post("/", usersController.createUser);
router.get("/", usersController.getAllUser);
router.get("/:userId", usersController.getSingleUser);
router.put("/:userId", usersController.updatedUser);
router.delete("/:userId", usersController.deleteUser);
export const userRouter = router;
