/**
 * Middleware: permissionMiddleware
 *
 * This middleware is responsible for verifying user permissions and access control.
 * It performs the following tasks:
 *
 * 1. Extracts the authentication token from cookies.
 * 2. Validates and decodes the JWT token to extract the user's information.
 * 3. Fetches the user's details from the database based on the decoded token.
 * 4. Checks if the user has the appropriate permissions:
 *    - Allows access if the user is an ADMIN.
 *    - Allows access if the user is accessing their own resource (based on the `id` in the route parameters).
 * 5. Attaches the user object to the request object for use in subsequent middleware or route handlers.
 * 6. Handles errors such as missing tokens, invalid tokens, or unauthorized access.
 *
 * Usage:
 * Attach this middleware to any route that requires user authentication and role-based access control.
 *
 */

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
