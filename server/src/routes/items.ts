import { Router } from "express";
import { z } from "zod";
import { loadActiveLocations } from "./locations";
import { notFound } from "../lib/helper";
import { batchGetCatalog, listCatalogPaged } from "../square/catalog";
import { AggregatedItemDetail, ItemDetail, Location } from "../shared";
import { CatalogObject } from "square";
import { visibleItemIdsAtLocation } from "../square/filter";
import { buildCatalogIndex, normalizeItem } from "../square/normalize";

export const itemsRouter: Router = Router();

const itemQuerySchema = z.object({
  locationId: z.string().trim().min(1).optional(),
});

itemsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { locationId } = itemQuerySchema.parse(req.query);
    res.setHeader("Cache-Control", "no-store");

    const activeLocations = await loadActiveLocations();
    if (activeLocations.length === 0) {
      throw notFound(
        "No active locations are configured in your Square account.",
      );
    }

    if (locationId === undefined) {
      res.json(await aggregateItemDetail(id, activeLocations));
      return;
    }

    const location = activeLocations.find(
      (candidate) => candidate.id === locationId,
    );
    if (location === undefined)
      throw notFound(`Location ${locationId} not found`);

    const catalog = await listCatalogPaged();
    const detail = detailAtLocation(id, location, catalog);
    if (detail === null)
      throw notFound(`Item ${id} not found at location ${location.id}`);
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

function detailAtLocation(
  itemId: string,
  location: Location,
  catalog: CatalogObject[],
): ItemDetail | null {
  // skip the index build if the item isn't even visible here.
  if (!visibleItemIdsAtLocation(catalog, location.id).has(itemId)) return null;

  const index = buildCatalogIndex(catalog);
  const object = index.items.find((candidate) => candidate.id === itemId);
  if (object === undefined) return null;

  const normalized = normalizeItem(object, index, location);
  return normalized === null
    ? null
    : { ...normalized.item, categoryName: normalized.categoryName };
}

async function aggregateItemDetail(
  itemId: string,
  locations: Location[],
): Promise<AggregatedItemDetail> {
  const objects = await batchGetCatalog([itemId]);
  const index = buildCatalogIndex(objects);
  const object = index.items.find((candidate) => candidate.id === itemId);
  if (object === undefined)
    throw notFound(`Item ${itemId} is not on the menu at any active location.`);

  const servedAt = locations.filter((location) =>
    visibleItemIdsAtLocation(objects, location.id).has(itemId),
  );
  if (servedAt.length === 0) {
    throw notFound(`Item ${itemId} is not on the menu at any active location.`);
  }

  for (const location of servedAt) {
    const normalized = normalizeItem(object, index, location);
    if (normalized !== null) {
      return {
        ...normalized.item,
        categoryName: normalized.categoryName,
        servedAt,
      };
    }
  }
  throw notFound(`Item ${itemId} is not on the menu at any active location.`);
}
