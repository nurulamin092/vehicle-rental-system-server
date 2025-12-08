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
    const result = await bookingServices.createBooking(payload);
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
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const rows = await bookingServices.getBookingForUser({
      id: req.user.id,
      role: req.user.role,
    });

    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: rows,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Your bookings retrieved successfully",
        data: rows,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }
    const payload = req.body;
    const { valid, errors } = bookingValidation.validateUpdateBooking(payload);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const update = await bookingServices.updateBooking(
      bookingId!,
      payload.status,
      { id: req.user.id, role: req.user.role }
    );

    if (payload.status === "cancelled") {
      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: update,
      });
    }

    if (payload.status === "returned") {
      res.status(200).json({
        success: true,
        message: "Booking marked as returned . vehicle is now available",
        data: update,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking update",
      data: update,
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
