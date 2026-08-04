import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Loading states — docs/15 Task 2 "Components → Loading indicators":
 * "skeleton/shimmer placeholders (custom, matching final content shape)
 * as the default pattern for any content load ... never a full-screen
 * spinner."
 *
 * `Spinner` (MD3 Circular Progress Indicator) is the one documented
 * exception: "reserved only for the brief, single-element 'Checking...'
 * wait state on the Accessibility Service permission screen, where a
 * skeleton has nothing meaningful to mimic the shape of." Do not reach
 * for it as a general-purpose loading indicator — use a skeleton
 * composition below instead.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Checking"
      className={cn(
        "border-border border-t-primary inline-block size-5 animate-spin rounded-full border-2",
        className
      )}
    />
  );
}

/** Skeleton shaped like a two-line ListRow (History, Settings rows). */
export function ListRowSkeleton() {
  return (
    <div className="gap-md py-sm flex min-h-11 items-center">
      <div className="gap-xs flex flex-1 flex-col">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Skeleton shaped like the Status Card (docs/15 Task 3 Screen 7). */
export function CardSkeleton() {
  return (
    <div className="gap-sm bg-card p-lg flex flex-col rounded-(--radius-card)">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
