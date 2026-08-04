import { cn } from "@/lib/utils";

/**
 * StepIndicator — docs/15 Component Inventory: "Onboarding Progress
 * Indicator — Screens 2–6 — a simple 'step X of 5' text indicator (not
 * a visual progress bar, to avoid implying more steps remain than the
 * genuinely short flow has)."
 *
 * Deliberately text-only — do not add a progress bar/track visual to
 * this component; that was considered and rejected in the frozen spec.
 * Styled `type.caption` in the doc's `onSurfaceVariant`-equivalent tone
 * (docs/15 Task 3 Screens 2–4). Pass a `key` on this component from the
 * parent when `current` changes if a cross-fade between steps is
 * wanted (docs: "the step indicator's number cross-fades rather than
 * sliding, keeping motion minimal") — the built-in opacity transition
 * below animates in on mount for that purpose.
 */
export function StepIndicator({
  current,
  total = 5,
  className,
}: {
  current: number;
  total?: number;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-caption text-muted-foreground ease-standard animate-in fade-in duration-200",
        className
      )}
    >
      Step {current} of {total}
    </p>
  );
}
