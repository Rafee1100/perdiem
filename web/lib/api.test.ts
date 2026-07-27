import { describe, it, expect } from "vitest";
import { isApiFailure } from "./api";
import type { ApiFailure } from "./api";

describe("isApiFailure", () => {
  it("returns true for a network failure object", () => {
    const failure: ApiFailure = { kind: "network", message: "down" };
    expect(isApiFailure(failure)).toBe(true);
  });

  it("returns true for a server failure object", () => {
    const failure: ApiFailure = {
      kind: "server",
      status: 500,
      code: "BOOM",
      message: "x",
    };
    expect(isApiFailure(failure)).toBe(true);
  });

  it("returns false for an unknown error shape", () => {
    expect(isApiFailure(new Error("boom"))).toBe(false);
    expect(isApiFailure("a string")).toBe(false);
    expect(isApiFailure(null)).toBe(false);
    expect(isApiFailure(undefined)).toBe(false);
    expect(isApiFailure({ kind: "other" })).toBe(false);
    expect(isApiFailure({})).toBe(false);
  });

  it("returns false for a non-object", () => {
    expect(isApiFailure(42)).toBe(false);
    expect(isApiFailure(true)).toBe(false);
  });
});
