import { Router } from "express";
import { bookingControllers } from "./booking.controllers";

const router = Router();

router.post("/", bookingControllers.createBooing);
router.get("/", bookingControllers.getAllBookings);
export const bookingRouter = router;
