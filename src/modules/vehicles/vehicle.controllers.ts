import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.services";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "vehicle create successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getAllVehicle();

    res.status(201).json({
      success: true,
      message: "All vehicles fetched successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSingleVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  try {
    const result = await vehicleServices.getSingleVehicle(vehicleId!);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "vehicle get",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updatedVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  try {
    const result = await vehicleServices.updatedVehicle(vehicleId!, req.body);

    res.status(201).json({
      success: true,
      message: "Vehicles updates successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    const result = await vehicleServices.deleteVehicle(vehicleId!);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "vehicle not found",
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Vehicle deleted successfully",
        data: null,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const vehicleControllers = {
  createVehicle,
  getAllVehicle,
  getSingleVehicle,
  updatedVehicle,
  deleteVehicle,
};
