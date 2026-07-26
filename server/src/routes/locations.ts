import { Router } from "express";
import { Location } from "../shared";
import { listLocations } from "../square/locations";
import { normalizeLocations } from "../square/normalize";
import { isLocationActive } from "../square/filter";

export const locationsRouter: Router = Router();

export async function loadActiveLocations(): Promise<Location[]> {
  const rawData = await listLocations();
  return normalizeLocations(rawData).filter((location) =>
    isLocationActive(location.status),
  );
}

locationsRouter.get("/", async (_req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const locations = await loadActiveLocations();
    res.json({ locations });
  } catch (error) {
    next(error);
  }
});
