import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLocations } from "./useLocations";
import type { Location } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  fetchLocations: vi.fn(),
  isApiFailure: (v: unknown) =>
    typeof v === "object" &&
    v !== null &&
    "kind" in v &&
    ((v as { kind: unknown }).kind === "network" ||
      (v as { kind: unknown }).kind === "server"),
}));

import { fetchLocations } from "@/lib/api";

const mockedFetchLocations = vi.mocked(fetchLocations);

const sampleLocations: Location[] = [
  { id: "loc-1", name: "Downtown", timezone: "America/Los_Angeles" },
  { id: "loc-2", name: "Airport", timezone: "America/Los_Angeles" },
];

describe("useLocations", () => {
  beforeEach(() => {
    mockedFetchLocations.mockReset();
  });

  it("starts in loading status", () => {
    mockedFetchLocations.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useLocations());
    expect(result.current.locations).toEqual({ status: "loading" });
  });

  it("transitions to ready with the fetched locations", async () => {
    mockedFetchLocations.mockResolvedValue(sampleLocations);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.locations.status).toBe("ready");
    });
    if (result.current.locations.status === "ready") {
      expect(result.current.locations.data).toEqual(sampleLocations);
    }
  });

  it("transitions to empty when the API returns an empty array", async () => {
    mockedFetchLocations.mockResolvedValue([]);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.locations).toEqual({ status: "empty" });
    });
  });

  it("transitions to error with the API failure message on server failure", async () => {
    const failure = {
      kind: "server",
      status: 500,
      code: "BOOM",
      message: "Server crashed",
    };
    mockedFetchLocations.mockRejectedValue(failure);
    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.locations.status).toBe("error");
    });
    if (result.current.locations.status === "error") {
      expect(result.current.locations.message).toBe("Server crashed");
    }
  });

  it("uses a generic message for unknown errors", async () => {
    mockedFetchLocations.mockRejectedValue(new Error("network blip"));
    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.locations.status).toBe("error");
    });
    if (result.current.locations.status === "error") {
      expect(result.current.locations.message).toBe("Couldn't load locations.");
    }
  });
});
