/**
 * Middleware: authMiddleware
 *
 * This middleware is responsible for verifying the authentication token and attaching
 * the decoded user information to the request object for further use in the application.
 *
 * Functionality:
 * 1. Extracts the authentication token from the cookies in the incoming request.
 * 2. Validates and decodes the token using the secret key (`JWT_SECRET`).
 * 3. Attaches the decoded token payload to the request object as `req.user`.
 * 4. Calls the `next()` function to proceed to the next middleware or route handler.
 * 5. Handles errors such as missing tokens or invalid/expired tokens and responds with a 401 status code.
 *
 */

import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";
import { jwtSecret } from "../config";

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
    const decoded = jwt.verify(token, jwtSecret as string);
    (req as JwtPayload).user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token", null, 401);
  }
};
