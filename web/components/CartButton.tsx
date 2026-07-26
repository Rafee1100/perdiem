import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount, subtotal } = useCart();
  const isEmpty = itemCount === 0;

  return (
    <Button
      onClick={onClick}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <ShoppingCart size={16} aria-hidden="true" />
      <span>Cart</span>
      <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs tabular-nums">
        {itemCount}
      </span>
      {!isEmpty && (
        <span className="text-neutral-300 tabular-nums">
          {formatMoney(subtotal)}
        </span>
      )}
    </Button>
  );
}
