import { Request, Response } from "express";
import { bookingServices } from "./booking.services";
import { bookingValidation } from "./booking.validation";

const createBooking = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { valid, errors, start, end } =
      bookingValidation.validateCreateBooking(payload) as any;
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (
      req.user?.role === "customer" &&
      Number(req.user.id) !== Number(payload.customer_id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: customers can only create their own booking",
      });
    }
    const result = await bookingServices.createBooing(payload);
    return res.status(201).json({
      success: true,
      message: "Booking create successfully",
      data: result,
    });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getAllBookings();

    res.status(200).json({
      success: false,
      message: "fetched bookings",

      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    const result = await bookingServices.updateBooking(bookingId!);

    res.status(200).json({
      success: true,
      message: "booking is updated",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const bookingControllers = {
  createBooking,
  getAllBookings,
  updateBooking,
};
