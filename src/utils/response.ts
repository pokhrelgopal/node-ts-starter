import { Response } from "express";

type SuccessData = Record<string, unknown> | null;
type ErrorDetails = Record<string, unknown> | string | null;

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

export { successResponse, errorResponse };
