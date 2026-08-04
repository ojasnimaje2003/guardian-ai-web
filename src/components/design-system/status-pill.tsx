import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * StatusPill: docs/15 Task 5 component naming convention `Badge/
 * StatusPill`; described in Task 3 Screen 10 (Settings): "a small status
 * chip (custom, pill-shaped, `primaryContainer` 'Granted' or
 * `protectionOffContainer` 'Not granted') trailing each Permissions row."
 *
 * `status="unknown"` extends the documented two states with the neutral,
 * data-unavailable-equivalent tone already established for Home's rare
 * "can't confirm status" state (docs/15 Task 2 `color.data-unavailable`
 * intent), used consistently, not invented ad hoc, since `docs/14` §6
 * models permission state as a 3-value enum, not a boolean.
 */
const statusPillVariants = cva(
  "inline-flex h-6 items-center gap-xs rounded-full px-sm text-caption font-medium",
  {
    variants: {
      status: {
        granted: "bg-secondary text-secondary-foreground",
        "not-granted": "bg-protection-off-container text-protection-off",
        unknown: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "not-granted",
    },
  }
);

interface StatusPillProps
  extends
    React.ComponentProps<"span">,
    VariantProps<typeof statusPillVariants> {}

export function StatusPill({
  className,
  status,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      className={cn(statusPillVariants({ status, className }))}
      {...props}
    >
      {children}
    </span>
  );
}

export { statusPillVariants };
export type { StatusPillProps };
