import type { Request, Response, NextFunction } from "express";
import { ApiError, ApiErrorBody, ApiErrorCodes } from "../shared";
import { ZodError } from "zod";

export function handleError(
  error: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ApiErrorCodes.BadRequest,
        message: error.issues.map((issue) => issue.message).join("; "),
      },
    });
    return;
  }

  console.error("Unhandled route error", error);
  res.status(500).json({
    error: { code: ApiErrorCodes.Internal, message: "Unexpected server error" },
  });
}

export function notFoundHandler(
  req: Request,
  res: Response<ApiErrorBody>,
): void {
  res.status(404).json({
    error: {
      code: ApiErrorCodes.NotFound,
      message: "Api route not found",
    },
  });
}
