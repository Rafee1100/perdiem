import type { CatalogObject } from "square";
import { getSquareClient, withSquareRetry } from "./client";

function firstErrorDetail(
  errors: ReadonlyArray<{ detail?: string | null }> | undefined,
): string {
  return (
    errors?.map((error) => error.detail ?? "Square error").join("; ") ??
    "Square error"
  );
}

export async function listCatalogPaged(): Promise<CatalogObject[]> {
  return withSquareRetry(async () => {
    const page = await getSquareClient().catalog.list({
      types: "ITEM,CATEGORY,IMAGE",
    });
    // Drain the async iterable eagerly so partial-page failures surface as
    // a single thrown error and callers see one array.
    return Array.fromAsync(page);
  });
}

export async function batchGetCatalog(
  objectIds: string[],
): Promise<CatalogObject[]> {
  if (objectIds.length === 0) {
    return [];
  }

  return withSquareRetry(async () => {
    const response = await getSquareClient().catalog.batchGet({
      objectIds,
      includeRelatedObjects: true,
    });

    if (response.errors !== undefined && response.errors.length > 0) {
      throw new Error(firstErrorDetail(response.errors));
    }

    return [...(response.objects ?? []), ...(response.relatedObjects ?? [])];
  });
}
