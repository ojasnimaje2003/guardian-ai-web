import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Typography components — docs/15 Task 2 "Typography Scale".
 *
 * Each maps 1:1 to a frozen `type.*` token (already wired as Tailwind
 * `text-*` utilities in globals.css). `Display`/`Heading` apply the
 * doc's noted Semi-Bold deviation from MD3's default Regular weight;
 * `Numeric` applies `tabular-nums` for the doc's "digit-width jitter
 * would look sloppy" rationale (History timestamps).
 *
 * Every component accepts an `as` prop to control the rendered tag —
 * the *visual* scale (docs/15) and the *semantic* heading level
 * (accessibility) are independent concerns, and the consuming screen
 * knows its own heading hierarchy, not this component.
 */

type TypographyProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** type.display — 28sp/36, Semi-Bold. Splash, Onboarding Complete. */
export function Display<T extends ElementType = "h1">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "h1";
  return (
    <Component
      className={cn("text-display font-semibold", className)}
      {...props}
    />
  );
}

/** type.heading — 20sp/28, Semi-Bold. Section headers, Settings labels. */
export function Heading<T extends ElementType = "h2">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "h2";
  return (
    <Component
      className={cn("text-heading font-semibold", className)}
      {...props}
    />
  );
}

/**
 * type.body-large — 18sp/26, Regular. The accessibility *default*, not
 * the maximum — used for Scam Warning's explanation text and all
 * primary reading content.
 */
export function BodyLarge<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "p";
  return <Component className={cn("text-body-lg", className)} {...props} />;
}

/** type.body — 16sp/24, Regular. Standard UI text, list items, settings rows. */
export function Body<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "p";
  return <Component className={cn("text-body", className)} {...props} />;
}

/** type.caption — 14sp/20, Regular. Timestamps, secondary metadata. */
export function Caption<T extends ElementType = "span">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "span";
  return (
    <Component
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * type.numeric — 18–28sp, Semi-Bold, tabular figures. History timestamps
 * where digit-width jitter would look sloppy.
 */
export function Numeric<T extends ElementType = "span">({
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as || "span";
  return (
    <Component
      className={cn("text-numeric font-semibold tabular-nums", className)}
      {...props}
    />
  );
}
