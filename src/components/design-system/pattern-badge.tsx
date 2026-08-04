import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * PatternBadge: docs/15 Task 5 component naming convention `Badge/
 * PatternLabel`: "the one custom, non-MD3-standard component, named
 * distinctly so it's never mistaken for a standard MD3 Badge." Task 3
 * Screen 8 (Scam Warning): a pill-shaped badge in `concernContainer`
 * tone + icon, carrying the pattern label ("Possible scam pattern
 * detected").
 *
 * This is the one component in the design system whose only documented
 * use is the live-threat moment. Do not reuse it for generic warnings
 * or technical errors (see Alert's explicit non-use of `concern` for
 * that reason, alert.tsx). Reserved for Scam Warning.
 */
export function PatternBadge({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-slot="pattern-badge"
      className={cn(
        "gap-sm bg-concern-container px-md py-sm text-body text-concern inline-flex items-center rounded-full font-semibold",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
