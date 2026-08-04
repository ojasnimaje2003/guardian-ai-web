"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * HistoryListItem: docs/15 Component Inventory: "History List Item
 * (expandable), Alert History. Collapsed: date, pattern label, action
 * taken. Expanded: full original explanation text, verbatim." Docs/13
 * Screen 9: "a historical record should show what was actually said
 * then, not a regenerated summary, preserving trust that the record is
 * accurate," and "Each list row is a single, complete announced unit
 * ... never split across multiple focus stops per row."
 *
 * This fulfills the "Timeline component" objective (a chronological,
 * expandable alert record) using the frozen spec's own name and shape.
 * It is **not** the deferred Fraud Timeline feature (docs/12: Won't-Have
 * for MVP, V2/V3 scope): no risk scores, cross-institution data, or
 * anything beyond this product's one detection pattern belongs here.
 */
export function HistoryListItem({
  date,
  patternLabel,
  actionTakenLabel,
  expandedContent,
}: {
  date: string;
  patternLabel: string;
  actionTakenLabel: string;
  expandedContent: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  return (
    <div className="border-border border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={regionId}
        className="gap-md px-sm py-sm focus-visible:ring-ring hover:bg-muted active:bg-muted/70 ease-standard flex min-h-11 w-full items-center rounded-(--radius-card) text-left transition-colors duration-100 outline-none focus-visible:ring-2"
      >
        <span className="gap-xs flex flex-1 flex-col">
          <span className="text-body text-foreground">{patternLabel}</span>
          <span className="text-caption text-muted-foreground">
            {date}, {actionTakenLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "text-muted-foreground ease-standard size-5 shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div
          id={regionId}
          role="region"
          className="pb-md text-body text-foreground"
        >
          {expandedContent}
        </div>
      )}
    </div>
  );
}
