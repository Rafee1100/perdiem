"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMenu, isApiFailure } from "@/lib/api";
import type { Menu } from "@/lib/types";
export type MenuState =
  | { status: "loading" }
  | { status: "ready"; data: Menu }
  | { status: "stale"; data: Menu }
  | { status: "error"; message: string }
  | { status: "empty" };

type Resolved =
  | { kind: "ok"; locationId: string; menu: Menu }
  | { kind: "error"; locationId: string; message: string };

export function useMenu(locationId: string | null) {
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!locationId) return;
    const id = ++requestId.current;

    void (async () => {
      try {
        const menu = await fetchMenu(locationId);
        if (requestId.current !== id) return;
        setResolved({ kind: "ok", locationId, menu });
      } catch (err: unknown) {
        if (requestId.current !== id) return;
        const message = isApiFailure(err)
          ? err.message
          : "Couldn't load the menu.";
        setResolved({ kind: "error", locationId, message });
      }
    })();
  }, [locationId]);

  const menu: MenuState = (() => {
    if (resolved?.kind === "ok" && resolved.locationId === locationId) {
      return resolved.menu.items.length === 0
        ? { status: "empty" }
        : { status: "ready", data: resolved.menu };
    }
    if (resolved?.kind === "ok") {
      return { status: "stale", data: resolved.menu };
    }
    if (resolved?.kind === "error" && resolved.locationId === locationId) {
      return { status: "error", message: resolved.message };
    }
    return { status: "loading" };
  })();

  return { menu };
}
