import { Router } from "express";
import { usersController } from "./user.controllers";
import { auth } from "../../middleware/auth";

const router = Router();

router.get(
  "/",
  auth.authenticate,
  auth.authorize("admin"),
  usersController.getAllUser
);
// router.get("/:userId", auth.authenticate, usersController.getSingleUser);
router.put("/:userId", auth.authenticate, usersController.updatedUser);
router.delete(
  "/:userId",
  auth.authenticate,
  auth.authorize("admin"),
  usersController.deleteUser
);
export const userRouter = router;
