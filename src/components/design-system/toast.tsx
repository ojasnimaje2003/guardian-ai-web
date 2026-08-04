"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

/**
 * Toast — docs/15 Task 4 "Snackbar Behavior": "One use in the entire
 * app: the 'Emergency contact updated' confirmation ... MD3 standard
 * Snackbar: single line, no action button (nothing to undo — the
 * frozen UX spec doesn't specify an undo path), auto-dismiss after 4
 * seconds, 100ms slide-up entrance / 75ms fade-out exit."
 *
 * Controlled component — the caller owns `open` state; this only owns
 * the auto-dismiss timer and the entrance/exit motion. No action
 * button prop exists on purpose, matching the one documented use case.
 */
export function Toast({
  open,
  message,
  onOpenChange,
  durationMs = 4000,
}: {
  open: boolean;
  message: string;
  onOpenChange: (open: boolean) => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onOpenChange(false), durationMs);
    return () => clearTimeout(timer);
  }, [open, durationMs, onOpenChange]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "bottom-lg bg-foreground px-md py-sm text-body text-background ease-standard fixed inset-x-0 z-50 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-(--radius-card) shadow-[0_4px_12px_rgba(28,30,31,0.2)] transition-all",
        open
          ? "translate-y-0 opacity-100 duration-100"
          : "pointer-events-none translate-y-2 opacity-0 duration-[75ms]"
      )}
    >
      {message}
    </div>
  );
}
