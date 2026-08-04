import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * ScreenContainer — the three layout shapes docs/13/15 actually use
 * across the 11 frozen screens, not a generic page wrapper:
 *
 * - `standard` — a top app bar (composed separately, see TopAppBar) plus
 *   a width-capped content column. History, Settings, onboarding steps.
 * - `full-bleed` — edge-to-edge, no chrome, no max-width. Docs/15 Task 3
 *   Screen 8: "Full-bleed, no app bar, no back button ... this screen
 *   owns the entire display including behind the system status bar."
 *   Scam Warning only.
 * - `centered` — vertically centered, single decision, no scroll.
 *   Splash, Onboarding Complete.
 *
 * Content width is capped at `--width-content` (360dp, docs/15 Task 2)
 * on every variant except `full-bleed`, which has no cap of its own.
 *
 * Responsive framing (docs/12–15 are phone-only specs and don't address
 * desktop/tablet at all): on `sm:` and up, every variant renders inside
 * a fixed-height, self-scrolling "phone canvas" — centered, capped
 * width, subtle shadow — so the product still reads as a phone app on
 * a wide viewport instead of a narrow column adrift in empty space.
 * The canvas becomes its own scroll container at that breakpoint so
 * `BottomActionBar`'s `sticky bottom-0` pins to the canvas's own edge,
 * not the browser window's. Below `sm:`, this is a no-op — the real
 * page just scrolls naturally, as it always has.
 */
const CANVAS =
  "flex w-full flex-col bg-background text-foreground sm:h-[48rem] sm:max-w-(--width-content) sm:overflow-y-auto sm:rounded-(--radius-card) sm:shadow-xl";

export function ScreenContainer({
  variant = "standard",
  className,
  children,
}: {
  variant?: "standard" | "full-bleed" | "centered";
  className?: string;
  children: ReactNode;
}) {
  if (variant === "full-bleed") {
    return (
      <div className="bg-muted sm:py-xl flex min-h-screen justify-center sm:items-center">
        <div className={cn(CANVAS, "min-h-screen sm:min-h-0", className)}>
          {children}
        </div>
      </div>
    );
  }

  if (variant === "centered") {
    return (
      <div className="bg-muted px-md sm:py-xl flex min-h-screen justify-center sm:items-center">
        <div
          className={cn(
            CANVAS,
            "px-md min-h-screen items-center justify-center text-center sm:min-h-0",
            className
          )}
        >
          <div className="w-full max-w-(--width-content)">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted sm:py-xl flex min-h-screen justify-center sm:items-center">
      <div className={cn(CANVAS, "min-h-screen sm:min-h-0", className)}>
        <div className="px-md py-lg mx-auto w-full max-w-(--width-content)">
          {children}
        </div>
      </div>
    </div>
  );
}
