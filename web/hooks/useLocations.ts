"use client";

import { useEffect, useRef, useState } from "react";
import { fetchLocations, isApiFailure } from "@/lib/api";
import type { ApiState, Location } from "@/lib/types";

export function useLocations() {
  const [locations, setLocations] = useState<ApiState<Location[]>>({ status: "loading" });
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    void (async () => {
      try {
        const data = await fetchLocations();
        if (requestId.current !== id) return;
        setLocations(
          data.length === 0 ? { status: "empty" } : { status: "ready", data },
        );
      } catch (err: unknown) {
        if (requestId.current !== id) return;
        const message = isApiFailure(err) ? err.message : "Couldn't load locations.";
        setLocations({ status: "error", message });
      }
    })();
  }, []);

  return { locations };
}
