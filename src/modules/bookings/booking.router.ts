import { Router } from "express";
import { bookingControllers } from "./booking.controllers";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth.authenticate, bookingControllers.createBooking);
router.get("/", auth.authenticate, bookingControllers.getAllBookings);
router.put("/:bookingId", auth.authenticate, bookingControllers.updateBooking);
export const bookingRouter = router;
