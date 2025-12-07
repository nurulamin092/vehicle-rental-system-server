import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/database";

export interface AuthRequest extends Request {
  user?: any;
}

const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorize",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload: any = jwt.verify(
      token as string,
      config.jwt_secret as string
    );

    const userId = payload?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const result = await pool.query(
      `
      SELECT id ,name,email, role FROM users WHERE id =$1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: "Unauthorize" + (err.message || err),
    });
  }
};

const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorize",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    next();
  };
};

export const auth = {
  authenticate,
  authorize,
};
