import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * FadeThrough — docs/15 Task 4 "Navigation Transitions": "a simple
 * fade-through (content cross-fades, no shared-axis slide) ... Duration:
 * 200ms (MD3 'short4' token)." The default transition for every screen
 * change and state cross-fade in this app *except* Scam Warning (which
 * uses no transition at all — do not wrap it in this component) and
 * Onboarding Complete's checkmark (see CheckmarkDraw).
 *
 * Pass a `key` that changes with the content (e.g. a status enum) from
 * the parent to re-trigger the fade — this component only supplies the
 * animation classes for a mount/remount, it does not track state itself.
 */
export function FadeThrough({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-in fade-in ease-standard duration-200", className)}
    >
      {children}
    </div>
  );
}
