import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: string;
  children?: ReactNode;
}

export function Chip({
  selected,
  size = "px-3 py-1 text-sm",
  className,
  type,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type ?? "button"}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer rounded-full border transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size,
        selected
          ? "border-brand bg-brand text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
