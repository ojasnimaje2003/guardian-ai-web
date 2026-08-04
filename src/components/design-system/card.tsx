import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card: docs/15 Task 2 "Components → Cards" and "Elevation".
 *
 * `variant="filled"` (default) is MD3 Filled Card, used everywhere a
 * card appears in this product (Status Card, History rows, Settings
 * rows), not Elevated Card, keeping shadow use minimal per the doc's
 * elevation philosophy. `variant="outlined"` is used *only* for the
 * rare Data-unavailable/error variant of the Status Card, where a
 * visible border helps it read as distinct from the normal filled state
 * without a jarring color change.
 *
 * Elevation "level1" (default) is a subtle surface-tint lift only, no
 * visible shadow: Status Card, History list items, Settings rows.
 * "none" is for cards that sit flush with the screen background.
 * Level 3 (visible shadow) is Dialog's territory, not Card's. See
 * confirm-dialog.tsx.
 *
 * 12dp radius (`--radius-card`) is applied unconditionally.
 */
const cardVariants = cva("rounded-(--radius-card) p-lg", {
  variants: {
    variant: {
      filled: "bg-card text-card-foreground",
      outlined: "border border-border bg-background text-foreground",
    },
    elevation: {
      none: "",
      level1: "shadow-[0_1px_2px_rgba(28,30,31,0.06)]",
    },
  },
  defaultVariants: {
    variant: "filled",
    elevation: "level1",
  },
});

interface CardProps
  extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, elevation, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, elevation, className }))}
      {...props}
    />
  );
}

export { cardVariants };
export type { CardProps };
