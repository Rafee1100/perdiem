import type { Item } from "./types";

// Client-side filter over the already-fetched menu. Matches name + description.
export function searchItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) => {
    const haystack = `${item.name} ${item.description ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}
