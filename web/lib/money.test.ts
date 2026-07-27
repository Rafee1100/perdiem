import { describe, it, expect } from "vitest";
import type { Item } from "./types";
import { formatMoney, displayPriceLabel } from "./money";

describe("formatMoney", () => {
  it("formats USD with two decimals", () => {
    expect(formatMoney({ amount: 1234, currency: "USD" })).toBe("$12.34");
  });

  it("formats zero", () => {
    expect(formatMoney({ amount: 0, currency: "USD" })).toBe("$0.00");
  });

  it("formats large amounts with thousands separators", () => {
    expect(formatMoney({ amount: 1234567, currency: "USD" })).toBe(
      "$12,345.67",
    );
  });

  it("formats other currencies by ISO code", () => {
    expect(formatMoney({ amount: 1000, currency: "EUR" })).toMatch(/€10\.00/);
  });
});

describe("displayPriceLabel", () => {
  const pricedVar = (amount: number) => ({
    id: "v",
    name: "v",
    price: { amount, currency: "USD" },
  });
  const openVar = { id: "v", name: "v", price: null };

  it("returns 'Price varies' when no variations are priced", () => {
    const item = { variations: [openVar, openVar] } as unknown as Item;
    expect(displayPriceLabel(item)).toBe("Price varies");
  });

  it("returns the single price when only one variation is priced", () => {
    const item = {
      variations: [openVar, pricedVar(500)],
    } as unknown as Item;
    expect(displayPriceLabel(item)).toBe("$5.00");
  });

  it("returns the single price when all variations are priced identically", () => {
    const item = {
      variations: [pricedVar(500), pricedVar(500)],
    } as unknown as Item;
    expect(displayPriceLabel(item)).toBe("$5.00");
  });

  it("returns 'From {cheapest}' when variations have different prices", () => {
    const item = {
      variations: [pricedVar(1000), pricedVar(500), pricedVar(750)],
    } as unknown as Item;
    expect(displayPriceLabel(item)).toBe("From $5.00");
  });
});
