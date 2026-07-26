import type { CatalogObject } from "square";

export function isCatalogObjectVisibleAtLocation(
  object: CatalogObject,
  locationId: string,
): boolean {
  if (object.absentAtLocationIds?.includes(locationId) === true) {
    return false;
  }

  if (object.presentAtAllLocations === true) {
    return true;
  }

  if (
    object.presentAtLocationIds !== undefined &&
    object.presentAtLocationIds !== null
  ) {
    return object.presentAtLocationIds.includes(locationId);
  }

  return true;
}

export function visibleItemIdsAtLocation(
  objects: CatalogObject[],
  locationId: string,
): Set<string> {
  const visibleIds = new Set<string>();

  for (const object of objects) {
    if (object.type !== "ITEM" || typeof object.id !== "string") continue;
    if (isCatalogObjectVisibleAtLocation(object, locationId)) {
      visibleIds.add(object.id);
    }
  }

  return visibleIds;
}

export function isLocationActive(status: string | null | undefined): boolean {
  return status === undefined || status === null || status === "ACTIVE";
}
