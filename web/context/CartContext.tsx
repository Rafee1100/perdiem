"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { CartLine, Item, ItemVariation, Money } from "@/lib/types";

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | {
      type: "ADD";
      item: Item;
      variation: ItemVariation;
      quantity: number;
      locationName: string;
      categoryName: string;
    }
  | { type: "REMOVE"; lineId: string }
  | { type: "SET_QUANTITY"; lineId: string; quantity: number }
  | { type: "CLEAR" };

function lineId(itemId: string, variationId: string): string {
  return `${itemId}:${variationId}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      if (action.variation.price === null) return state;

      const id = lineId(action.item.id, action.variation.id);
      const existing = state.lines.find((l) => l.lineId === id);

      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.lineId === id
              ? { ...l, quantity: l.quantity + action.quantity }
              : l,
          ),
        };
      }

      const newLine: CartLine = {
        lineId: id,
        itemId: action.item.id,
        itemName: action.item.name,
        variationId: action.variation.id,
        variationName: action.variation.name,
        imageUrl: action.item.imageUrl,
        locationName: action.locationName,
        categoryName: action.categoryName,
        unitPrice: action.variation.price,
        quantity: action.quantity,
      };
      return { lines: [...state.lines, newLine] };
    }

    case "REMOVE":
      return { lines: state.lines.filter((l) => l.lineId !== action.lineId) };

    case "SET_QUANTITY":
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => l.lineId !== action.lineId) };
      }
      return {
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, quantity: action.quantity } : l,
        ),
      };

    case "CLEAR":
      return { lines: [] };
  }
}

export interface AddToCartInput {
  item: Item;
  variation: ItemVariation;
  quantity: number;
  locationName: string;
  categoryName: string;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: Money;
  addToCart: (input: AddToCartInput) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.lines.reduce((sum, l) => sum + l.quantity, 0);

    // Assumes one currency per location, true for a single Square location.
    const currency = state.lines[0]?.unitPrice.currency ?? "USD";
    const amount = state.lines.reduce(
      (sum, l) => sum + l.unitPrice.amount * l.quantity,
      0,
    );

    return {
      lines: state.lines,
      itemCount,
      subtotal: { amount, currency },
      addToCart: ({ item, variation, quantity, locationName, categoryName }) =>
        dispatch({
          type: "ADD",
          item,
          variation,
          quantity,
          locationName,
          categoryName,
        }),
      removeLine: (id) => dispatch({ type: "REMOVE", lineId: id }),
      setQuantity: (id, quantity) =>
        dispatch({ type: "SET_QUANTITY", lineId: id, quantity }),
      clearCart: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be called within a CartProvider");
  return context;
}
