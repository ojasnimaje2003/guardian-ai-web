import { cn } from "@/lib/utils";

/**
 * CheckmarkDraw — docs/15 Task 3 Screen 6 (Onboarding Complete): "a
 * single, restrained checkmark-draw animation (under 400ms, the one
 * deliberate exception to the 200ms cap ...) — explicitly not a
 * celebratory bounce or confetti." The 400ms duration (MD3 "medium2")
 * is baked into the `checkmark-draw` keyframe in globals.css, not
 * passed as a prop — this is a singular, named exception, not a
 * general-purpose timing option.
 *
 * The only documented use is Onboarding Complete's confirmation icon —
 * do not reuse this for other success states without checking docs/15
 * first, since its whole justification is "a one-time completion
 * moment, not a repeated interaction."
 */
export function CheckmarkDraw({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("text-primary size-8", className)}
    >
      <path
        d="M4 12.5L9.5 18L20 6"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={24}
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 24,
          animation: "checkmark-draw 400ms var(--ease-standard) forwards",
        }}
      />
    </svg>
  );
}
