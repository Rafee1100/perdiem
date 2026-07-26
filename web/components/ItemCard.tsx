import Link from "next/link";
import type { Item } from "@/lib/types";
import { displayPriceLabel } from "@/lib/money";
import { Card } from "@/components/ui";
import { ImageWithFallback } from "./ui/ImageWithFallback";

export function ItemCard({
  item,
  locationId,
  locationName,
  categoryName,
}: {
  item: Item;
  locationId: string;
  locationName: string;
  categoryName: string;
}) {
  // Category is deliberately left out of the URL — the detail page doesn't
  // filter by it, and this keeps the Back link target simple.
  const href = `/items/${encodeURIComponent(item.id)}?location=${encodeURIComponent(locationId)}`;

  return (
    <Link
      href={href}
      className="flex h-full cursor-pointer transition-shadow hover:shadow-md"
    >
      <Card size="rounded-xl" className="flex w-full flex-col">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.name}
          className="h-32 w-full shrink-0 sm:h-36"
        />
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="line-clamp-2 min-h-10 text-sm font-medium text-neutral-900">
            {item.name}
          </p>
          <p className="text-sm text-neutral-500">{displayPriceLabel(item)}</p>
          <p className="mt-1 text-xs text-neutral-500">
            <span className="text-neutral-700">{locationName}</span>
            <span className="mx-1 text-neutral-300">·</span>
            <span>{categoryName}</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
