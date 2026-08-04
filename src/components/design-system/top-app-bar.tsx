import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * IconButton: the 44×44dp icon-only tap target used by TopAppBar's own
 * back button and by any screen's app-bar trailing actions (Home's
 * History/Settings icons). Pulled out once here rather than duplicated
 * per call site.
 */
export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "hover:bg-muted active:bg-muted/70 focus-visible:ring-ring text-foreground ease-standard flex size-11 shrink-0 items-center justify-center rounded-(--radius-button) transition-colors duration-100 outline-none focus-visible:ring-2",
        className
      )}
      {...props}
    />
  );
}

/**
 * TopAppBar: docs/15 Task 3.
 *
 * Screen 7 (Home): "Small Top App Bar, left-aligned title ... since a
 * centered title reads slightly more formal/branded than this
 * quiet-utility screen needs", logo/title left, trailing icons right,
 * `space.md` apart (no `onBack`).
 * Screens 9/10 (History, Settings): "Top app bar (back arrow +
 * title)" (`onBack` provided, no trailing actions).
 *
 * Never used on Scam Warning (docs/15 Task 3 Screen 8: "no app bar, no
 * back button"); that screen uses `ScreenContainer variant="full-bleed"`
 * with no TopAppBar at all.
 */
export function TopAppBar({
  title,
  onBack,
  actions,
  className,
}: {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "gap-md border-border py-sm flex min-h-11 items-center border-b",
        className
      )}
    >
      {onBack && (
        <IconButton onClick={onBack} aria-label="Back">
          <ArrowLeft className="size-5" aria-hidden />
        </IconButton>
      )}
      <h1 className="text-heading text-foreground flex-1 truncate font-semibold">
        {title}
      </h1>
      {actions && (
        <div className="gap-sm flex shrink-0 items-center">{actions}</div>
      )}
    </header>
  );
}
