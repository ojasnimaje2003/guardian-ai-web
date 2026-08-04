import { cn } from "@/lib/utils";

/**
 * SectionHeader: docs/13 Screen 10 (Settings) accessibility rule:
 * "Section headers ('Emergency Contact,' 'Permissions,' 'Accessibility,'
 * 'About & Privacy') are announced as headings, not plain list rows, so
 * screen-reader users can jump between sections." Also used for Home's
 * "Recent Activity" label (docs/15 Task 3 Screen 7).
 *
 * Renders `type.heading` (docs/15 Task 2) as a real heading element.
 * `level` lets the consuming screen fit it into its own heading
 * hierarchy correctly rather than always assuming one level.
 */
export function SectionHeader({
  children,
  level = 2,
  className,
}: {
  children: string;
  level?: 2 | 3 | 4;
  className?: string;
}) {
  const Component = `h${level}` as const;
  return (
    <Component
      className={cn("text-heading text-foreground font-semibold", className)}
    >
      {children}
    </Component>
  );
}
