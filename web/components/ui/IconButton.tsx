import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  children: ReactNode;
}

export function IconButton({ className, type, children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "cursor-pointer rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
