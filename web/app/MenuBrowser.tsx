"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocations } from "@/hooks/useLocations";
import { useMenu } from "@/hooks/useMenu";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { MenuGrid } from "@/components/MenuGrid";
import { SearchBox } from "@/components/SearchBox";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import {
  LoadingGrid,
  LoadingPills,
  LoadingOverlay,
} from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";
import { searchItems } from "@/lib/search";

export function MenuBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedLocationId = searchParams.get("location");
  const selectedCategoryId = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const { locations } = useLocations();
  const { menu } = useMenu(selectedLocationId);

  useEffect(() => {
    if (locations.status !== "ready" || selectedLocationId !== null) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", locations.data[0].id);
    router.replace(`${pathname}?${params}`);
  }, [locations, selectedLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleItems =
    menu.status === "ready" || menu.status === "stale"
      ? searchItems(menu.data.items, searchTerm)
      : [];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Menu</h1>
          <p className="text-sm text-neutral-500">
            Browse what is available at each location, right now.
          </p>
        </div>
        <CartButton onClick={() => setCartOpen(true)} />
      </header>

      {locations.status === "loading" && <LoadingPills />}
      {locations.status === "error" && (
        <ErrorState message={locations.message} />
      )}
      {locations.status === "empty" && (
        <EmptyState
          title="No locations configured"
          hint="Seed at least one location in the Square sandbox."
        />
      )}
      {locations.status === "ready" && selectedLocationId && (
        <LocationSwitcher
          locations={locations.data}
          selectedId={selectedLocationId}
          onSelect={(id) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("location", id);
            params.delete("category");
            router.replace(`${pathname}?${params}`);
            setSearchTerm("");
          }}
        />
      )}

      {selectedLocationId && (
        <div className="relative">
          {menu.status === "stale" && <LoadingOverlay />}
          {menu.status === "loading" && <LoadingGrid />}
          {menu.status === "error" && <ErrorState message={menu.message} />}
          {menu.status === "empty" && (
            <EmptyState
              title="No items available at this location"
              hint="This location has no visible items right now — check present_at_location_ids in the sandbox."
            />
          )}
          {(menu.status === "ready" || menu.status === "stale") && (
            <>
              <SearchBox value={searchTerm} onChange={setSearchTerm} />
              <CategoryFilterBar
                categories={menu.data.categories}
                selectedId={selectedCategoryId}
                onSelect={(id) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (id === null) params.delete("category");
                  else params.set("category", id);
                  router.replace(`${pathname}?${params}`);
                }}
              />
              {searchTerm && visibleItems.length === 0 ? (
                <EmptyState
                  title={`No items match "${searchTerm}"`}
                  hint="Try a different search term."
                />
              ) : (
                <MenuGrid
                  categories={menu.data.categories}
                  items={visibleItems}
                  selectedCategoryId={selectedCategoryId}
                  locationId={selectedLocationId}
                  locationName={menu.data.locationName}
                />
              )}
            </>
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
