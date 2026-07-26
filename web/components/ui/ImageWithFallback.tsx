import Image from "next/image";
import { cn } from "@/lib/cn";

export interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackLabel = "No image",
  className,
  fallbackClassName = "text-xs text-neutral-400",
  imgClassName = "object-cover",
}: ImageWithFallbackProps) {
  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={imgClassName}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            fallbackClassName,
          )}
        >
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
