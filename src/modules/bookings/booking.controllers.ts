import { Request, Response } from "express";
import { bookingServices } from "./booking.services";

const createBooing = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBooing(req.body);
    res.status(200).json({
      success: true,
      message: "Booking create successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
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
  createBooing,
  getAllBookings,
  updateBooking,
};
