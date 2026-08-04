import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * BottomActionBar — the "primary action pinned to bottom, secondary/skip
 * action as a Text button directly above it" pattern from docs/15 Task 3
 * (Screens 2–4's onboarding template, Screen 5/11's "primary Filled
 * 'Save' button pinned bottom").
 *
 * This is a generic pinned-bottom action stack — it does not encode
 * Scam Warning's specific asymmetric three-action weighting (docs/15
 * Task 3 Screen 8's "Warning Action Stack": End Call tallest/primary,
 * Notify secondary, This-is-fine smallest/text). That is a screen-
 * specific composition of `Button` variants inside this same container,
 * to be built alongside Scam Warning itself, not hardcoded here.
 */
export function BottomActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gap-sm border-border bg-background px-md py-md sticky bottom-0 flex flex-col border-t",
        className
      )}
    >
      {children}
    </div>
  );
}
