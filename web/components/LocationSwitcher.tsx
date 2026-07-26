import type { Location } from "@/lib/types";
import { Chip } from "@/components/ui";

interface Props {
  locations: Location[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function LocationSwitcher({ locations, selectedId, onSelect }: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Select a location"
    >
      {locations.map((location) => (
        <Chip
          key={location.id}
          size="px-4 py-1.5 text-sm font-medium"
          selected={location.id === selectedId}
          onClick={() => onSelect(location.id)}
        >
          {location.name}
        </Chip>
      ))}
    </div>
  );
}
