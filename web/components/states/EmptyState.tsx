import { Card } from "@/components/ui";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card
      tone="border-dashed border-neutral-300 bg-white"
      padding="p-6"
      className="flex flex-col items-center gap-1 text-center"
    >
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </Card>
  );
}
