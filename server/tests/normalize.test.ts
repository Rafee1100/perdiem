import { describe, expect, it } from "vitest";
import { Location } from "../src/shared";
import type { CatalogObject, Location as SquareLocation } from "square";
import {
  buildCatalogIndex,
  normalizeItem,
  normalizeLocations,
} from "../src/square/normalize";

const activeLocation: Location = {
  id: "L1",
  name: "Downtown",
  timezone: "America/Los_Angeles",
  status: "ACTIVE",
};

describe("normalizeLocations", () => {
  it("defaults missing fields and preserves INACTIVE status", () => {
    const input = [
      {
        id: "L1",
        name: undefined,
        timezone: undefined,
        status: undefined,
      } as unknown as SquareLocation,
      {
        id: "L2",
        name: "X",
        timezone: "UTC",
        status: "INACTIVE",
      } as SquareLocation,
    ];
    expect(normalizeLocations(input)).toEqual([
      { id: "L1", name: "", timezone: "UTC", status: "ACTIVE" },
      { id: "L2", name: "X", timezone: "UTC", status: "INACTIVE" },
    ]);
  });
});

describe("buildCatalogIndex", () => {
  it("buckets categories, images, and items", () => {
    const cat = {
      type: "CATEGORY",
      id: "CAT_1",
      categoryData: { name: "Drinks" },
    } as CatalogObject;
    const img = {
      type: "IMAGE",
      id: "IMG_1",
      imageData: { url: "https://x/y.png" },
    } as CatalogObject;
    const it = { type: "ITEM", id: "ITEM_1" } as CatalogObject;
    const index = buildCatalogIndex([cat, img, it]);

    expect(index.categories.get("CAT_1")?.name).toBe("Drinks");
    expect(index.images.get("IMG_1")).toBe("https://x/y.png");
    expect(index.items).toEqual([it]);
  });
});

describe("normalizeItem", () => {
  it("returns null when the item has no variations", () => {
    const it = {
      type: "ITEM",
      id: "ITEM_1",
      itemData: { variations: [] },
    } as CatalogObject;
    expect(
      normalizeItem(it, buildCatalogIndex([it]), activeLocation),
    ).toBeNull();
  });

  it("converts priceMoney.bigint to a number and forwards currency", () => {
    const priced = {
      type: "ITEM_VARIATION",
      id: "VAR_1",
      itemVariationData: {
        name: "Small",
        priceMoney: { amount: 1099n, currency: "USD" },
      },
    } as CatalogObject;
    const it = {
      type: "ITEM",
      id: "ITEM_1",
      itemData: { variations: [priced] },
    } as CatalogObject;
    const result = normalizeItem(it, buildCatalogIndex([it]), activeLocation);
    expect(result?.item.variations[0]?.price).toEqual({
      amount: 1099,
      currency: "USD",
    });
  });

  it("resolves the category name from the index", () => {
    const cat = {
      type: "CATEGORY",
      id: "CAT_1",
      categoryData: { name: "Mains" },
    } as CatalogObject;
    const it = {
      type: "ITEM",
      id: "ITEM_1",
      itemData: {
        categoryId: "CAT_1",
        variations: [{ type: "ITEM_VARIATION", id: "VAR_1" } as CatalogObject],
      },
    } as CatalogObject;
    const result = normalizeItem(
      it,
      buildCatalogIndex([cat, it]),
      activeLocation,
    );
    expect(result?.categoryName).toBe("Mains");
  });
});
