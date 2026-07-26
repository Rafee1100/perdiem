import type { Category } from "@/lib/types";
import { Chip } from "@/components/ui";

interface Props {
  categories: Category[];
  selectedId: string | null; // null = "All"
  onSelect: (id: string | null) => void;
}

export function CategoryFilterBar({ categories, selectedId, onSelect }: Props) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
      <Chip
        size="px-3 py-1 text-sm"
        selected={selectedId === null}
        onClick={() => onSelect(null)}
      >
        All
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category.id}
          size="px-3 py-1 text-sm"
          selected={selectedId === category.id}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </Chip>
      ))}
    </div>
  );
}
