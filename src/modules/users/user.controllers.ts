import { Request, Response } from "express";
import { userServices } from "./user.services";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUser();
    res.status(200).json({
      success: true,
      message: "Fetched all user",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const result = await userServices.getSingleUser(userId!);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "user retrieved successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updatedUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const payload = req.body;

    if (
      !(req.user?.role === "admin" || String(req.user?.id) === String(userId))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (payload.role && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can change role",
      });
    }
    const result = await userServices.updatedUser(userId as string, payload);

    res.status(200).json({
      success: true,
      message: "user update successfully",
      data: result.rows ? result.rows[0] : null,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const result = await userServices.deleteUser(userId!);

    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!result) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "User delete successfully",
      data: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const usersController = {
  getAllUser,
  getSingleUser,
  updatedUser,
  deleteUser,
};
