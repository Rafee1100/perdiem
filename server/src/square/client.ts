import { SquareClient, SquareEnvironment } from "square";
import { getEnv } from "../env";
import { ApiError, ApiErrorCodes } from "../shared";

let client: SquareClient | undefined;

export function getSquareClinet(): SquareClient {
  if (client !== undefined) {
    return client;
  }

  const env = getEnv();
  client = new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment:
      env.SQUARE_ENVIRONMENT === "sandbox"
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
  });

  return client;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Square request failed";
}

function statusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return undefined;
  }
  const value = (error as { statusCode?: unknown }).statusCode;
  return typeof value === "number" ? value : undefined;
}

function throwSquareError(error: unknown): never {
  const status = statusCode(error);

  if (status === 429) {
    throw new ApiError(
      429,
      ApiErrorCodes.UpstreamRateLimited,
      "Square is rate limiting requests. Please retry shortly.",
    );
  }

  // Upstream 5xx → 503; everything else (incl. connection errors) → 502.
  // Lets callers tell upstream failure apart from our own bugs (500).
  throw new ApiError(
    status !== undefined && status >= 500 ? 503 : 502,
    ApiErrorCodes.UpstreamUnavailable,
    errorMessage(error),
  );
}

export async function withSquareRetry<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      const status = statusCode(error);
      // Retry 429, 5xx, and unknown status.
      // Other 4xx are caller errors and surface immediately.
      const retryable = status === 429 || status === undefined || status >= 500;

      if (!retryable || attempt === maxAttempts) {
        throwSquareError(error);
      }

      const delayMs = 250 * 2 ** (attempt - 1);
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }

  throw new Error("Unreachable retry state");
}

export function resetSquareClientForTests(): void {
  client = undefined;
}
