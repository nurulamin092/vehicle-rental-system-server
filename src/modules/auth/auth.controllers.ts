import { Request, Response } from "express";
import { authServices } from "./auth.services";

const signup = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const user = await authServices.signup(payload);
    res.status(200).json({
      success: true,
      message: "User register successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const authController = {
  signup,
};
