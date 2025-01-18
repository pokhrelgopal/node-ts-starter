import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response";
import * as userService from "../services/user.service";

interface DecodedToken {
  userId: string;
}

export const permissionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      errorResponse(res, "No token provided", null, 401);
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      errorResponse(res, "User not found", null, 404);
      return;
    }
    const requestedUserId = req.params.id;
    if (user.role !== "ADMIN" && user.id.toString() !== requestedUserId) {
      errorResponse(
        res,
        "Access denied: Admins only or self-access only",
        null,
        403
      );
      return;
    }
    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, "Invalid or expired token", null, 401);
    } else {
      errorResponse(res, "Internal server error", null, 500);
    }
  }
};
