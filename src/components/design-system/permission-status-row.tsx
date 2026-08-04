import { StatusPill } from "./status-pill";
import { Button } from "./button";

/**
 * PermissionStatusRow: docs/15 Component Inventory: "Label +
 * granted/not-granted indicator + conditional re-grant action; reused
 * identically for both permission types so the pattern is learned
 * once." Docs/13 Screen 10 (Settings): "A Permissions row showing 'Not
 * granted' is never just informational: it always has a direct,
 * one-tap path back into the relevant grant flow."
 *
 * `description` carries the copywriting rule from docs/13 §13: the
 * underlying Android permission name is unavoidable here, but is always
 * paired with a plain-language purpose statement next to it.
 */
export function PermissionStatusRow({
  label,
  description,
  status,
  onFix,
}: {
  label: string;
  description?: string;
  status: "granted" | "not-granted" | "unknown";
  onFix?: () => void;
}) {
  return (
    <div className="gap-md py-sm flex min-h-11 items-center justify-between">
      <div className="gap-xs flex flex-1 flex-col">
        <span className="text-body text-foreground">{label}</span>
        {description && (
          <span className="text-caption text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      <div className="gap-sm flex items-center">
        <StatusPill status={status}>
          {status === "granted" ? "Granted" : "Not granted"}
        </StatusPill>
        {status !== "granted" && onFix && (
          <Button variant="text" onClick={onFix} className="px-sm">
            Fix
          </Button>
        )}
      </div>
    </div>
  );
}
