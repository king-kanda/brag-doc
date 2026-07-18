"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = "sm",
  color = "text-amber",
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: "sm" | "md";
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const starSize = size === "sm" ? 14 : 18;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", !readOnly && "cursor-pointer")}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          size={starSize}
          className={cn(
            "transition-colors",
            n <= shown ? cn(color, "fill-current") : "text-cloud fill-cloud dark:text-white/15 dark:fill-white/15"
          )}
          onMouseEnter={() => !readOnly && setHover(n)}
          onClick={() => !readOnly && onChange?.(n)}
        />
      ))}
    </div>
  );
}
