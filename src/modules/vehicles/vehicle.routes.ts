import { Router } from "express";
import { vehicleControllers } from "./vehicle.controllers";
import { auth } from "../../middleware/auth";

const router = Router();

router.post(
  "/",
  auth.authenticate,
  auth.authorize("admin"),
  vehicleControllers.createVehicle
);

router.get("/", vehicleControllers.getAllVehicle);

router.get("/:vehicleId", vehicleControllers.getSingleVehicle);
router.put(
  "/:vehicleId",
  auth.authenticate,
  auth.authorize("admin"),
  vehicleControllers.updatedVehicle
);
router.delete(
  "/:vehicleId",
  auth.authenticate,
  auth.authorize("admin"),
  vehicleControllers.deleteVehicle
);

export const vehicleRouter = router;
