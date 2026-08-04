import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Alert: docs/15 Task 2 "Error components" and Task 3 Screens 2–4's
 * inline attention row.
 *
 * Three tones, each grounded in a specific documented state:
 * - `neutral`: general informational content, no severity implied.
 * - `attention`: "a small warning-toned inline text row (using
 *   `attentionContainer` coloring, not `concern`: a permission not yet
 *   granted is not the same severity as a live scam)." Screens 3/4's
 *   permission-not-granted error state.
 *   error." Named retry action, never a generic system error dialog.
 *
 * **`concern` is deliberately not an available tone here.** Docs/15 is
 * explicit: "never using `concern` coloring for a technical error ...
 * two states this product must always keep visually distinct." A live
 * scam-threat warning and a broken permission check must never look the
 * same severity. If a screen needs the former, that's PatternBadge/
 * Button `tone="concern"` in the actual Scam Warning composition, not
 * this component.
 */
const alertVariants = cva(
  "flex items-start gap-sm rounded-(--radius-card) p-md text-body",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-foreground",
        attention: "bg-attention-container text-attention-container-foreground",
        error: "border border-border bg-card text-card-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  icon?: ReactNode;
  message: ReactNode;
  /** Named retry/action label, per docs/15: "never a silent failure." */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function Alert({
  tone,
  icon,
  message,
  actionLabel,
  onAction,
  className,
}: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ tone, className }))}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="gap-sm flex flex-1 flex-col">
        <p>{message}</p>
        {actionLabel && (
          <Button
            variant="text"
            className="text-body h-auto min-h-0 w-fit p-0 font-medium underline underline-offset-4"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export { alertVariants };
export type { AlertProps };
