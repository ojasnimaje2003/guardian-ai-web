import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * EmptyState — docs/15 Task 2 "Components → Empty states": "a simple,
 * custom composition (icon + `type.body-large` reassurance copy, no
 * illustration asset needed for MVP) used identically on Home's
 * condensed strip and Alert History."
 *
 * `REASSURANCE_EMPTY_COPY` is exported so both call sites can share the
 * exact same string by construction — docs/13 Screen 9 is explicit that
 * this copy must be "kept identical rather than rewritten, so the same
 * message is trusted as consistent wherever it appears."
 */
export const REASSURANCE_EMPTY_COPY =
  "No alerts yet — that's exactly what we want to see";

export function EmptyState({
  icon,
  message,
  className,
}: {
  icon?: ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gap-md py-xl flex flex-col items-center text-center",
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-body-lg text-foreground">{message}</p>
    </div>
  );
}
