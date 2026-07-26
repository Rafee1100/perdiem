import { cn } from "@/lib/cn";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  size?: string;
  countSize?: string;
  label?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  size = "h-9 w-9 text-base",
  countSize = "w-6 text-sm",
  label,
  disabled = false,
}: QuantityStepperProps) {
  const ariaLabel = label ? `${label} quantity` : "Quantity";
  const buttonClass = cn(
    "cursor-pointer leading-none text-neutral-700 transition-colors hover:bg-neutral-50",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    "disabled:cursor-not-allowed disabled:opacity-40",
    size,
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-200",
        disabled && "opacity-50",
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={
          label ? `Decrease quantity of ${label}` : "Decrease quantity"
        }
        className={cn(buttonClass, "rounded-l-full")}
      >
        −
      </button>
      <span
        className={cn("text-center tabular-nums", countSize)}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label={
          label ? `Increase quantity of ${label}` : "Increase quantity"
        }
        className={cn(buttonClass, "rounded-r-full")}
      >
        +
      </button>
    </div>
  );
}
