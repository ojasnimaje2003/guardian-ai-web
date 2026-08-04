import { ChevronRight } from "lucide-react";

import { ListRow } from "./list-row";

/**
 * SettingsRow: docs/15 Task 3 Screen 10, grouped settings list rows
 * ("Emergency Contact," "Accessibility," "About & Privacy") showing a
 * label and, where applicable, a current value/status on the second
 * line. A thin `ListRow` composition with a chevron affordance for
 * navigable rows; permission rows specifically use
 * `PermissionStatusRow` instead (they need a status pill + conditional
 * "Fix" action, not a chevron).
 */
export function SettingsRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <ListRow
      title={label}
      subtitle={value}
      onClick={onClick}
      trailing={
        onClick ? (
          <ChevronRight className="text-muted-foreground size-5" aria-hidden />
        ) : undefined
      }
    />
  );
}
