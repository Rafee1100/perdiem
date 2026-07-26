import type { ItemVariation } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

export function VariationPicker({
  variations,
  selectedId,
  onSelect,
}: {
  variations: ItemVariation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Choose an option
      </p>
      <div
        role="radiogroup"
        aria-label="Item options"
        className="flex flex-col gap-2"
      >
        {variations.map((v) => (
          <label
            key={v.id}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm",
              selectedId === v.id
                ? "border-brand"
                : "border-neutral-200 hover:border-neutral-300",
            )}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="variation"
                checked={selectedId === v.id}
                onChange={() => onSelect(v.id)}
                className="accent-brand"
              />
              {v.name}
            </span>
            <span className="text-neutral-500">
              {v.price ? formatMoney(v.price) : "Price varies"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
