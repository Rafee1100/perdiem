// Mirrors server/src/shared/menus.ts and shared/error.ts. Keep these in sync
// if the API shape changes.

export interface Money {
  amount: number;
  currency: string;
}

export interface Location {
  id: string;
  name: string;
  timezone: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ItemVariation {
  id: string;
  name: string;
  price: Money | null;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  imageUrl: string | null;
  variations: ItemVariation[];
}

export interface Menu {
  locationId: string;
  locationName: string;
  timezone: string;
  generatedAt: string;
  categories: Category[];
  items: Item[];
}

export interface AggregatedItem extends Item {
  servedAt: Location[];
}

// Returned by GET /api/menus with no locationId. Not used by UI.
export interface AggregatedMenu {
  mode: "all";
  generatedAt: string;
  locations: Location[];
  timezone: string;
  categories: Category[];
  items: AggregatedItem[];
}

export interface CartLine {
  lineId: string; // `${itemId}:${variationId}`
  itemId: string;
  itemName: string;
  variationId: string;
  variationName: string;
  imageUrl: string | null;
  locationName: string;
  categoryName: string;
  unitPrice: Money; // snapshot at add-time, not re-validated on checkout
  quantity: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type ApiState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; data: T };
