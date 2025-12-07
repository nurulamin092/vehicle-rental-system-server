import { Router } from "express";
import { bookingControllers } from "./booking.controllers";

const router = Router();

router.post("/", bookingControllers.createBooing);

export const bookingRouter = router;
