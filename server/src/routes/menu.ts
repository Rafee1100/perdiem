import { Router } from "express";
import { z } from "zod";
import { loadActiveLocations } from "./locations";
import { listCatalogPaged } from "../square/catalog";
import { notFound } from "../lib/helper";
import { CatalogObject } from "square";
import {
  AggregatedItem,
  AggregatedMenu,
  Item,
  Location,
  Menu,
} from "../shared";
import { buildCatalogIndex, normalizeItem } from "../square/normalize";
import { visibleItemIdsAtLocation } from "../square/filter";

export const menuRouter: Router = Router();

const menuQuerySchema = z.object({
  locationId: z.string().trim().min(1).optional(),
});

menuRouter.get("/", async (require, res, next) => {
  try {
    const { locationId } = menuQuerySchema.parse(require.query);
    // Menu data changes between calls; opt out of all caching layers.
    res.setHeader("Cache-Control", "no-store");

    const [activeLocations, catalog] = await Promise.all([
      loadActiveLocations(),
      listCatalogPaged(),
    ]);

    if (activeLocations.length === 0) {
      throw notFound(
        "No active locations are configured in your Square account.",
      );
    }

    if (locationId === undefined) {
      res.json(aggregateMenu(catalog, activeLocations));
      return;
    }

    const location = activeLocations.find(
      (candidate) => candidate.id === locationId,
    );
    if (location === undefined)
      throw notFound(`Location ${locationId} not found`);
    res.json(menuForLocation(catalog, location));
  } catch (error) {
    next(error);
  }
});

function aggregateMenu(
  catalog: CatalogObject[],
  locations: Location[],
): AggregatedMenu {
  const index = buildCatalogIndex(catalog);
  const visibilityByLocation = new Map(
    locations.map((location) => [
      location.id,
      visibleItemIdsAtLocation(catalog, location.id),
    ]),
  );

  const items: AggregatedItem[] = [];
  for (const object of index.items) {
    const itemId = object.id;
    if (typeof itemId !== "string") continue;

    const servedAt = locations.filter(
      (location) => visibilityByLocation.get(location.id)?.has(itemId) ?? false,
    );
    if (servedAt.length === 0) continue;

    // First servedAt that yields a valid data becomes the card body;
    // the rest only contribute via servedAt.
    const representative = servedAt
      .map((location) => normalizeItem(object, index, location))
      .find(
        (normalized): normalized is NonNullable<typeof normalized> =>
          normalized !== null,
      );
    if (representative === undefined) continue;

    items.push({ ...representative.item, servedAt });
  }

  return {
    mode: "all",
    generatedAt: new Date().toISOString(),
    locations,
    // Header timezone defaults to the first active location.
    timezone: locations[0]?.timezone ?? "UTC",
    categories: [...index.categories.values()],
    items,
  };
}

function menuForLocation(catalog: CatalogObject[], location: Location): Menu {
  const index = buildCatalogIndex(catalog);
  const visible = visibleItemIdsAtLocation(catalog, location.id);
  const items: Item[] = [];

  for (const object of index.items) {
    if (typeof object.id !== "string" || !visible.has(object.id)) continue;
    const normalized = normalizeItem(object, index, location);
    if (normalized !== null) items.push(normalized.item);
  }

  return {
    locationId: location.id,
    locationName: location.name,
    timezone: location.timezone,
    generatedAt: new Date().toISOString(),
    categories: [...index.categories.values()],
    items,
  };
}
