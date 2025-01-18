import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return errorResponse(res, "No token provided", null, 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token", null, 401);
  }
};
