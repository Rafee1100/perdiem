import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMenu } from "./useMenu";
import type { Menu } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  fetchMenu: vi.fn(),
  isApiFailure: (v: unknown) =>
    typeof v === "object" &&
    v !== null &&
    "kind" in v &&
    ((v as { kind: unknown }).kind === "network" ||
      (v as { kind: unknown }).kind === "server"),
}));

import { fetchMenu } from "@/lib/api";

const mockedFetchMenu = vi.mocked(fetchMenu);

const makeMenu = (locationId: string, itemsCount = 1): Menu => ({
  locationId,
  locationName: `Location ${locationId}`,
  timezone: "America/Los_Angeles",
  generatedAt: "2026-01-01T00:00:00Z",
  categories: itemsCount > 0 ? [{ id: "cat-1", name: "Mains" }] : [],
  items: Array.from({ length: itemsCount }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    description: null,
    categoryId: "cat-1",
    imageUrl: null,
    variations: [
      {
        id: `var-${i}`,
        name: "Regular",
        price: { amount: 100, currency: "USD" },
      },
    ],
  })),
});

describe("useMenu", () => {
  beforeEach(() => {
    mockedFetchMenu.mockReset();
  });

  it("stays in loading when locationId is null", () => {
    mockedFetchMenu.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMenu(null));
    expect(result.current.menu).toEqual({ status: "loading" });
    expect(mockedFetchMenu).not.toHaveBeenCalled();
  });

  it("transitions to ready with the fetched menu", async () => {
    const menu = makeMenu("loc-1", 3);
    mockedFetchMenu.mockResolvedValue(menu);

    const { result } = renderHook(() => useMenu("loc-1"));

    await waitFor(() => {
      expect(result.current.menu.status).toBe("ready");
    });
    if (result.current.menu.status === "ready") {
      expect(result.current.menu.data).toEqual(menu);
    }
  });

  it("transitions to empty when the menu has no items", async () => {
    mockedFetchMenu.mockResolvedValue(makeMenu("loc-1", 0));
    const { result } = renderHook(() => useMenu("loc-1"));

    await waitFor(() => {
      expect(result.current.menu).toEqual({ status: "empty" });
    });
  });

  it("transitions to error with the API failure message", async () => {
    const failure = {
      kind: "server",
      status: 404,
      code: "NF",
      message: "Not found",
    };
    mockedFetchMenu.mockRejectedValue(failure);

    const { result } = renderHook(() => useMenu("loc-1"));

    await waitFor(() => {
      expect(result.current.menu.status).toBe("error");
    });
    if (result.current.menu.status === "error") {
      expect(result.current.menu.message).toBe("Not found");
    }
  });

  it("uses a generic message for unknown errors", async () => {
    mockedFetchMenu.mockRejectedValue(new Error("kaboom"));

    const { result } = renderHook(() => useMenu("loc-1"));

    await waitFor(() => {
      expect(result.current.menu.status).toBe("error");
    });
    if (result.current.menu.status === "error") {
      expect(result.current.menu.message).toBe("Couldn't load the menu.");
    }
  });

  it("returns 'stale' when the locationId changes while a previous menu is shown", async () => {
    const firstMenu = makeMenu("loc-1", 2);
    const secondMenu = makeMenu("loc-2", 1);

    let resolveSecond: (m: Menu) => void = () => {};
    mockedFetchMenu.mockImplementation(async (locationId: string) => {
      if (locationId === "loc-1") return firstMenu;
      return new Promise<Menu>((resolve) => {
        resolveSecond = resolve;
      });
    });

    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useMenu(id),
      {
        initialProps: { id: "loc-1" as string | null },
      },
    );

    // Wait for the first menu to load.
    await waitFor(() => {
      expect(result.current.menu.status).toBe("ready");
    });

    // Switch to a new location; the second fetch hangs until we resolve it.
    rerender({ id: "loc-2" });

    // The previous location's menu should be shown as 'stale' while the new
    // one is in flight.
    await waitFor(() => {
      expect(result.current.menu.status).toBe("stale");
    });
    if (result.current.menu.status === "stale") {
      expect(result.current.menu.data).toEqual(firstMenu);
    }

    // Resolve the second fetch and confirm we land on 'ready' with new data.
    await act(async () => {
      resolveSecond(secondMenu);
    });

    await waitFor(() => {
      expect(result.current.menu.status).toBe("ready");
    });
    if (result.current.menu.status === "ready") {
      expect(result.current.menu.data).toEqual(secondMenu);
    }
  });
});
