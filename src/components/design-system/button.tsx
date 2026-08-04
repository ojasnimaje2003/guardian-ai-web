import type { ComponentProps } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — docs/15 Task 2 "Components → Buttons".
 *
 * Three emphasis tiers, used deliberately, mapped to the frozen UX spec's
 * own described emphasis levels — not a generic button with arbitrary
 * variants:
 * - `filled` (highest emphasis) — "Get started," "Save," "Continue,"
 *   "End the call now" (with `tone="concern"`).
 * - `filled-tonal` (medium emphasis) — "Notify [Contact Name]," "Choose
 *   from contacts."
 * - `text` (lowest emphasis) — "This is fine," "Not now," "Skip for
 *   now." Deliberately the smallest, least visually prominent tier, per
 *   the frozen UX spec's explicit instruction that dismissal must remain
 *   honestly available without ever looking like the recommended path.
 *
 * `tone="concern"` is the one documented color override (Scam Warning's
 * "End the call now", the Remove-contact dialog's destructive action) —
 * it is not a generic "danger" tone for arbitrary use; see Alert (§
 * alert.tsx) for non-threat error/attention states, which deliberately
 * do NOT use concern coloring (docs/15 Task 2, Error components).
 *
 * 8dp radius (`--radius-button`) and a 44×44dp minimum tap target are
 * applied unconditionally, per docs/13 §11 Accessibility Guidelines.
 * Disabled state renders at 60% opacity, matching the frozen UX spec's
 * explicit disabled-button treatment (docs/15 Task 3, Screen 5/11).
 */
const buttonVariants = cva(
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-sm rounded-(--radius-button) px-lg text-body font-medium whitespace-nowrap outline-none transition-[background-color,color,transform] duration-100 ease-standard focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled: "bg-primary text-primary-foreground hover:bg-primary/90",
        "filled-tonal":
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        text: "bg-transparent px-md text-primary hover:bg-primary/10",
      },
      tone: {
        default: "",
        concern: "",
      },
    },
    compoundVariants: [
      {
        variant: "filled",
        tone: "concern",
        className: "bg-concern text-white hover:bg-concern/90",
      },
      {
        variant: "text",
        tone: "concern",
        className: "text-concern hover:bg-concern/10",
      },
    ],
    defaultVariants: {
      variant: "filled",
      tone: "default",
    },
  }
);

interface ButtonProps
  extends
    Omit<ButtonPrimitive.Props, "render">,
    VariantProps<typeof buttonVariants> {
  render?: ComponentProps<typeof ButtonPrimitive>["render"];
}

export function Button({ className, variant, tone, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, tone, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
export type { ButtonProps };
