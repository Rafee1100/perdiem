import { Input } from "@/components/ui";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: Props) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search the menu…"
      aria-label="Search the menu"
    />
  );
}
