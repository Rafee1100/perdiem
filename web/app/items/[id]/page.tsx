"use client";

import Link from "next/link";
import { use, useState } from "react";
import type { Item, ItemVariation } from "@/lib/types";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingDetail } from "@/components/states/LoadingState";
import {
  Button,
  Card,
  ImageWithFallback,
  QuantityStepper,
} from "@/components/ui";
import { VariationPicker } from "@/components/VariationPicker";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ location?: string; category?: string }>;
}

export default function ItemDetailPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const { location, category } = use(searchParams);
  const [cartOpen, setCartOpen] = useState(false);
  const { addToCart } = useCart();

  const backParams = new URLSearchParams();
  if (location) backParams.set("location", location);
  if (category) backParams.set("category", category);
  const backHref = backParams.toString() ? `/?${backParams}` : "/";

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="cursor-pointer text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          ← Back to menu
        </Link>
        <CartButton onClick={() => setCartOpen(true)} />
      </header>

      <ItemDetail
        itemId={id}
        locationId={location ?? null}
        onAddToCart={(
          item,
          variation,
          quantity,
          locationName,
          categoryName,
        ) => {
          addToCart({ item, variation, quantity, locationName, categoryName });
          setCartOpen(true);
        }}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}

function ItemDetail({
  itemId,
  locationId,
  onAddToCart,
}: {
  itemId: string;
  locationId: string | null;
  onAddToCart: (
    item: Item,
    variation: ItemVariation,
    quantity: number,
    locationName: string,
    categoryName: string,
  ) => void;
}) {
  const { menu } = useMenu(locationId);

  if (!locationId)
    return (
      <ErrorState message="No location selected. Open this item from the menu list." />
    );
  if (menu.status === "loading") return <LoadingDetail />;
  if (menu.status === "error") return <ErrorState message={menu.message} />;
  if (menu.status === "empty")
    return <ErrorState message="No items at this location." />;

  const item = menu.data.items.find((i) => i.id === itemId);
  if (!item)
    return <ErrorState message="That item isn't available at this location." />;

  const categoryName =
    menu.data.categories.find((c) => c.id === item.categoryId)?.name ??
    "Uncategorized";

  return (
    <AddToCartPanel
      key={item.id}
      item={item}
      onAddToCart={(variation, quantity) =>
        onAddToCart(
          item,
          variation,
          quantity,
          menu.data.locationName,
          categoryName,
        )
      }
    />
  );
}

function AddToCartPanel({
  item,
  onAddToCart,
}: {
  item: Item;
  onAddToCart: (variation: ItemVariation, quantity: number) => void;
}) {
  const firstVariation =
    item.variations.find((v) => v.price !== null) ?? item.variations[0] ?? null;
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    firstVariation?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariation =
    item.variations.find((v) => v.id === selectedVariationId) ?? null;
  const canAddToCart = selectedVariation?.price != null;

  return (
    <article>
      <Card size="rounded-2xl">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.name}
          className="aspect-video w-full"
          fallbackClassName="text-sm"
        />

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {item.name}
            </h1>
            <p className="whitespace-nowrap text-lg font-semibold text-neutral-900">
              {selectedVariation?.price
                ? formatMoney(selectedVariation.price)
                : "Price varies"}
            </p>
          </div>

          {item.description && (
            <p className="text-sm leading-relaxed text-neutral-600">
              {item.description}
            </p>
          )}

          {item.variations.length > 1 && (
            <VariationPicker
              variations={item.variations}
              selectedId={selectedVariationId}
              onSelect={setSelectedVariationId}
            />
          )}

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label="Quantity"
              disabled={!canAddToCart}
            />
            <Button
              size="px-5 py-2.5 text-sm"
              disabled={!canAddToCart}
              onClick={() => {
                if (!canAddToCart || !selectedVariation) return;
                onAddToCart(selectedVariation, quantity);
                setJustAdded(true);
                window.setTimeout(() => setJustAdded(false), 1200);
              }}
            >
              {justAdded ? "Added ✓" : "Add to cart"}
            </Button>
          </div>
        </div>
      </Card>
    </article>
  );
}
