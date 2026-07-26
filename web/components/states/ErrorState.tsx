import { Card } from "@/components/ui";

export function ErrorState({ message }: { message: string }) {
  return (
    <Card tone="border-red-200 bg-red-50" className="text-center">
      <p className="text-sm font-medium text-red-800">{message}</p>
    </Card>
  );
}
