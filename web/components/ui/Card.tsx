import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: string;
  padding?: string;
  tone?: string;
  children?: ReactNode;
}

export function Card({
  size = "rounded-2xl",
  padding = "p-5",
  tone = "border-neutral-200 bg-white",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn("overflow-hidden border", size, padding, tone, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
