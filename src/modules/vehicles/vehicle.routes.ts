import { Router } from "express";
import { vehicleControllers } from "./vehicle.controllers";

const router = Router();

router.post("/", vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getAllVehicle);

router.get("/:vehicleId", vehicleControllers.getSingleUser);
router.put("/:vehicleId", vehicleControllers.updatedVehicle);

export const vehicleRouter = router;
