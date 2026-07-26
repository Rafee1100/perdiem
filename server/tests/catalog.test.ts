import { describe, expect, it, vi } from "vitest";
import { batchGetCatalog } from "../src/square/catalog.ts";

vi.mock("../src/square/client", () => ({
  getSquareClient: vi.fn(),
  withSquareRetry: <T>(fn: () => Promise<T>) => fn(),
}));

describe("batchGetCatalog", () => {
  it("return an empty array without calling square when ids are empty", async () => {
    const result = await batchGetCatalog([]);
    expect(result).toEqual([]);
  });
});
