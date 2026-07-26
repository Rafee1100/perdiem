import type { CatalogObject } from "square";
import { describe, expect, it } from "vitest";
import {
  isCatalogObjectVisibleAtLocation,
  visibleItemIdsAtLocation,
} from "../src/square/filter";

function makeItem(overrides: Partial<CatalogObject>): CatalogObject {
  return {
    type: "ITEM",
    id: "ITEM_1",
    presentAtAllLocations: undefined,
    presentAtLocationIds: undefined,
    absentAtLocationIds: undefined,
    ...overrides,
  } as CatalogObject;
}

describe("isCatalogObjectVisibleAtLocation", () => {
  it("is visible everywhere when presentAtAllLocations is true", () => {
    const item = makeItem({ presentAtAllLocations: true });
    expect(isCatalogObjectVisibleAtLocation(item, "L1")).toBe(true);
  });

  it("hides items in absentAtLocationIds even when also in presentAtLocationIds", () => {
    const item = makeItem({
      presentAtAllLocations: true,
      presentAtLocationIds: ["L1", "L2"],
      absentAtLocationIds: ["L2"],
    });
    expect(isCatalogObjectVisibleAtLocation(item, "L2")).toBe(false);
  });

  it("shows only the locations in presentAtLocationIds when not everywhere", () => {
    const item = makeItem({ presentAtLocationIds: ["L2"] });
    expect(isCatalogObjectVisibleAtLocation(item, "L1")).toBe(false);
    expect(isCatalogObjectVisibleAtLocation(item, "L2")).toBe(true);
  });

  it("defaults to visible when no location fields are set", () => {
    const item = makeItem({});
    expect(isCatalogObjectVisibleAtLocation(item, "L1")).toBe(true);
  });
});

describe("visibleItemIdsAtLocation", () => {
  it("returns the set of item ids visible at the location", () => {
    const objects = [
      makeItem({ id: "ITEM_1", presentAtLocationIds: ["L1"] }),
      makeItem({ id: "ITEM_2", presentAtLocationIds: ["L2"] }),
      makeItem({ id: "ITEM_3", presentAtAllLocations: true }),
    ];
    const result = visibleItemIdsAtLocation(objects, "L1");
    expect([...result].sort()).toEqual(["ITEM_1", "ITEM_3"]);
  });
});
