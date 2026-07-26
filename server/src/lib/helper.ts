import { ApiError, ApiErrorCodes } from "../shared";

export function notFound(message: string): ApiError {
  return new ApiError(404, ApiErrorCodes.NotFound, message);
}
