import type { CatalogObject, Location as SquareLocation } from "square";
import { Category, Item, ItemVariation, Location } from "../shared";

// Square's catalog fields are all optional; we drop malformed pieces
// instead of coercing so the DTO contract stays strict.

export interface CatalogIndex {
  categories: Map<string, Category>;
  items: CatalogObject[];
  images: Map<string, string>;
}

export interface NormalizedItem {
  item: Item;
  categoryName: string | null;
}

function getId(object: CatalogObject): string {
  return object.id ?? "";
}

function imageUrl(object: CatalogObject): string | null {
  if (object.type !== "IMAGE") return null;
  const url = object.imageData?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function getItemVariation(object: CatalogObject): ItemVariation | null {
  if (object.type !== "ITEM_VARIATION") return null;
  const data = object.itemVariationData;
  const amount = data?.priceMoney?.amount;
  const currency = data?.priceMoney?.currency;
  // priceMoney.amount is bigint to dodge float drift on currency values.
  const price =
    typeof amount === "bigint" &&
    typeof currency === "string" &&
    currency.length === 3
      ? { amount: Number(amount), currency }
      : null;
  return { id: getId(object), name: data?.name ?? "", price };
}

export function normalizeLocations(locations: SquareLocation[]): Location[] {
  return locations.flatMap((location) => {
    if (typeof location.id !== "string" || location.id.length === 0) return [];
    const loc: Location = {
      id: location.id,
      name: location.name ?? "",
      timezone: location.timezone ?? "UTC",
      status: location.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    };
    return [loc];
  });
}

export function buildCatalogIndex(objects: CatalogObject[]): CatalogIndex {
  const categories = new Map<string, Category>();
  const images = new Map<string, string>();
  const items: CatalogObject[] = [];

  for (const object of objects) {
    if (object.type === "CATEGORY") {
      categories.set(getId(object), {
        id: getId(object),
        name: object.categoryData?.name ?? "",
      });
    }
    if (object.type === "IMAGE") {
      const url = imageUrl(object);
      if (url !== null) images.set(getId(object), url);
    }
    if (object.type === "ITEM") {
      items.push(object);
    }
  }

  return { categories, items, images };
}

export function normalizeItem(
  object: CatalogObject,
  index: CatalogIndex,
  _location: Location,
): NormalizedItem | null {
  if (object.type !== "ITEM") return null;
  const data = object.itemData;
  const variations = (data?.variations ?? [])
    .map(getItemVariation)
    .filter((variation): variation is ItemVariation => variation !== null);
  // Items without at least one variation aren't sellable; drop them.
  if (variations.length === 0) return null;

  // Items without at least one variation aren't sellable; drop them.
  const imageId = data?.imageIds?.[0] ?? object.imageId ?? null;
  const categoryId =
    data?.categoryId ??
    data?.categories?.[0]?.id ??
    data?.reportingCategory?.id ??
    null;
  const category =
    categoryId === null ? undefined : index.categories.get(categoryId);

  return {
    item: {
      id: getId(object),
      name: data?.name ?? "",
      description: data?.descriptionPlaintext ?? data?.description ?? null,
      categoryId,
      imageUrl: imageId === null ? null : (index.images.get(imageId) ?? null),
      variations,
    },
    categoryName: category?.name ?? null,
  };
}
