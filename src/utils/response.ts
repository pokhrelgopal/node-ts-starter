import { Response } from "express";
import { ZodError } from "zod";

type SuccessData = Record<string, unknown> | null;
type ErrorDetails = Record<string, string[]> | string | null;

function successResponse(
  res: Response,
  message: string,
  data: SuccessData = null
) {
  res.status(200).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(
  res: Response,
  message: string,
  error: ErrorDetails = null,
  statusCode: number = 400
) {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
}

function zodErrorResponse(
  res: Response,
  error: ZodError<any>,
  message: string = "Validation error",
  statusCode: number = 400
) {
  const errorDetails: ErrorDetails = {};
  error.errors.forEach((zodIssue) => {
    const path = zodIssue.path.join(".");
    if (!errorDetails[path]) {
      errorDetails[path] = [];
    }
    errorDetails[path].push(zodIssue.message);
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
  });
}

export { successResponse, errorResponse, zodErrorResponse };
