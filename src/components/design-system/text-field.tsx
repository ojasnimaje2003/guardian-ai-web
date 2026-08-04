import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * TextField — docs/15 Task 2 "Components → Text fields": "MD3 Outlined
 * Text Field (not Filled) throughout, chosen for better contrast/
 * legibility across the app's warm off-white background."
 *
 * Docs/13 Screen 5/11 accessibility requirement: "Both fields have
 * explicit labels (not placeholder-only, which screen readers can
 * announce inconsistently)" — the `label` prop always renders a visible,
 * persistent `<label>`, never a placeholder standing in for one.
 * `error` renders as an inline field-level message only ("This doesn't
 * look like a valid phone number") — never a top-of-screen generic
 * banner, per the same spec.
 *
 * Corner radius is not specified for text fields in docs/15 (only
 * buttons/cards/dialogs have documented radii) — this uses the same
 * restrained, non-pill radius scale as the rest of the system as a
 * reasonable default, not a frozen value.
 */
export function TextField({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: {
  label: string;
  error?: string;
  helperText?: string;
  id?: string;
  className?: string;
} & Omit<React.ComponentProps<"input">, "id" | "className">) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="gap-xs flex flex-col">
      <label
        htmlFor={inputId}
        className="text-body text-foreground font-medium"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "border-input px-md py-sm text-body text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-11 w-full rounded-md border bg-transparent transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60",
          error &&
            "border-concern focus-visible:border-concern focus-visible:ring-concern/30",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-caption text-concern">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-caption text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
