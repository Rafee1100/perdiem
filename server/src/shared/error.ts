import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export const ApiErrorCodes = {
  BadRequest: "BAD_REQUEST",
  NotFound: "NOT_FOUND",
  UpstreamUnavailable: "UPSTREAM_UNAVAILABLE",
  UpstreamRateLimited: "UPSTREAM_RATE_LIMITED",
  Internal: "INTERNAL",
} as const;

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes];

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
