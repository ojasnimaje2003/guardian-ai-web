import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * ListRow: docs/15 Task 2 "Components → Lists": "MD3 List Item,
 * two-line variant": the base building block `SettingsRow` and
 * `HistoryListItem` compose from.
 *
 * Renders as a `<button>` when `onClick` is given (the whole row is one
 * tap target, per docs/13's 44dp-minimum accessibility baseline),
 * otherwise a plain `<div>` for non-interactive rows.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {leading && (
        <span className="text-muted-foreground shrink-0">{leading}</span>
      )}
      <span className="gap-xs flex flex-1 flex-col text-left">
        <span className="text-body text-foreground">{title}</span>
        {subtitle && (
          <span className="text-caption text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </>
  );

  const rowClassName = cn(
    "flex min-h-11 w-full items-center gap-md py-sm",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          rowClassName,
          "hover:bg-muted focus-visible:ring-ring active:bg-muted/70 ease-standard rounded-(--radius-card) text-left transition-colors duration-100 outline-none focus-visible:ring-2"
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
