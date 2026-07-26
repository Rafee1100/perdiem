"use client";

import { useEffect, useRef } from "react";
import { X, ShoppingCart } from "lucide-react";
import { useCart, type CartLineDisplay } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";
import { Button, IconButton, QuantityStepper } from "@/components/ui";
import { ImageWithFallback } from "./ui/ImageWithFallback";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { lines, subtotal, removeLine, setQuantity, clearCart } = useCart();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 ml-auto h-screen max-h-screen w-full max-w-md bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Your cart
            </h2>
            <p className="text-xs text-neutral-500">
              {lines.length === 0
                ? "Empty"
                : `${lines.length} item${lines.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <IconButton
            aria-label="Close cart"
            onClick={() => ref.current?.close()}
          >
            <X size={16} aria-hidden="true" />
          </IconButton>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-100">
              {lines.map((line) => (
                <CartLineRow
                  key={line.lineId}
                  line={line}
                  onSetQuantity={(quantity) =>
                    setQuantity(line.lineId, quantity)
                  }
                  onRemove={() => removeLine(line.lineId)}
                />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-neutral-200 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Subtotal</span>
              <span className="text-base font-semibold text-neutral-900">
                {formatMoney(subtotal)}
              </span>
            </div>
            <Button size="px-5 py-2.5 text-sm" fullWidth disabled>
              Checkout
            </Button>
            <Button
              variant="text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              size="px-3 py-1.5 text-xs"
              fullWidth
              onClick={clearCart}
              className="mt-2"
            >
              Clear cart
            </Button>
          </footer>
        )}
      </div>
    </dialog>
  );
}

function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="rounded-full bg-neutral-100 p-3 text-neutral-400">
        <ShoppingCart size={24} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-neutral-900">Your cart is empty</p>
      <p className="text-xs text-neutral-500">
        Items you add will show up here.
      </p>
    </div>
  );
}

function CartLineRow({
  line,
  onSetQuantity,
  onRemove,
}: {
  line: CartLineDisplay;
  onSetQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <ImageWithFallback
        src={line.imageUrl}
        alt={line.itemName}
        className="h-16 w-16 shrink-0 rounded-lg"
        fallbackClassName="text-[10px]"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900">
              {line.itemName}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {line.variationName}
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-medium text-neutral-900">
            {formatMoney(line.lineTotal)}
          </p>
        </div>

        <p className="mt-1 text-xs text-neutral-500">
          <span className="text-neutral-700">{line.locationName}</span>
          <span className="mx-1 text-neutral-300">·</span>
          <span>{line.categoryName}</span>
        </p>

        <div className="mt-2 flex items-center justify-between">
          <QuantityStepper
            size="h-7 w-7 text-sm"
            countSize="w-7 text-sm"
            value={line.quantity}
            onChange={onSetQuantity}
            label={line.itemName}
          />
          <Button
            variant="text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            size="px-3 py-1.5 text-xs"
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}
