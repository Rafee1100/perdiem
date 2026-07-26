import type { Location } from "square";
import { getSquareClient, withSquareRetry } from "./client";

function firstErrorDetail(
  errors: ReadonlyArray<{ detail?: string | null }> | undefined,
): string {
  return (
    errors?.map((error) => error.detail ?? "Square error").join(": ") ??
    "Square error"
  );
}

export async function listLocations(): Promise<Location[]> {
  return withSquareRetry(async () => {
    const response = await getSquareClient().locations.list();

    if (response.errors !== undefined && response.errors.length > 0) {
      throw new Error(firstErrorDetail(response.errors));
    }

    return response.locations ?? [];
  });
}
