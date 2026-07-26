import type { Category, Item } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/states/EmptyState";

interface Props {
  categories: Category[];
  items: Item[];
  selectedCategoryId: string | null;
  locationId: string;
  locationName: string;
}

const UNCATEGORIZED_KEY = "uncategorized";

function buildSections(
  categories: Category[],
  items: Item[],
  selectedCategoryId: string | null,
): { category: Category | null; items: Item[] }[] {
  const matched = categories
    .filter((c) => !selectedCategoryId || c.id === selectedCategoryId)
    .map((category) => ({
      category,
      items: items.filter((i) => i.categoryId === category.id),
    }))
    .filter((s) => s.items.length > 0);

  if (selectedCategoryId) return matched;

  const uncategorized = items.filter((i) => i.categoryId === null);
  if (uncategorized.length === 0) return matched;
  return [...matched, { category: null, items: uncategorized }];
}

export function MenuGrid({
  categories,
  items,
  selectedCategoryId,
  locationId,
  locationName,
}: Props) {
  const sections = buildSections(categories, items, selectedCategoryId);

  if (sections.length === 0) {
    return (
      <EmptyState
        title="No items match this filter"
        hint="Try a different category, or switch back to All."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map(({ category, items: sectionItems }) => (
        <section key={category?.id ?? UNCATEGORIZED_KEY}>
          {category && (
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {category.name}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sectionItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                locationId={locationId}
                locationName={locationName}
                categoryName={category?.name ?? "Uncategorized"}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
