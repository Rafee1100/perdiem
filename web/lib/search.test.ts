import { describe, it, expect } from "vitest";
import type { Item } from "./types";
import { searchItems } from "./search";

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: "1",
  name: "Coffee",
  description: "Hot brewed",
  categoryId: "cat-1",
  imageUrl: null,
  variations: [],
  ...overrides,
});

describe("searchItems", () => {
  const items: Item[] = [
    makeItem({ id: "1", name: "Coffee", description: "Hot brewed" }),
    makeItem({ id: "2", name: "Iced Tea", description: "Cold and refreshing" }),
    makeItem({ id: "3", name: "Espresso", description: null }),
    makeItem({ id: "4", name: "Sandwich", description: "Turkey & swiss" }),
  ];

  it("returns all items when query is empty", () => {
    expect(searchItems(items, "")).toHaveLength(4);
  });

  it("returns all items when query is whitespace", () => {
    expect(searchItems(items, "   ")).toHaveLength(4);
  });

  it("matches by name (case-insensitive)", () => {
    const result = searchItems(items, "COFFEE");
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("matches by description (case-insensitive)", () => {
    const result = searchItems(items, "refreshing");
    expect(result.map((i) => i.id)).toEqual(["2"]);
  });

  it("matches across name + description as a single haystack", () => {
    const result = searchItems(items, "swiss");
    expect(result.map((i) => i.id)).toEqual(["4"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(searchItems(items, "xyz")).toEqual([]);
  });

  it("handles items with null descriptions without crashing", () => {
    const result = searchItems(items, "espresso");
    expect(result.map((i) => i.id)).toEqual(["3"]);
  });

  it("trims the query before matching", () => {
    expect(searchItems(items, "  coffee  ").map((i) => i.id)).toEqual(["1"]);
  });
});
