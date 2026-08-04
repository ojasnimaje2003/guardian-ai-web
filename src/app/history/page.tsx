"use client";

import { useRouter } from "next/navigation";

import { useAppState } from "@/lib/app-state";
import { mockEmergencyContact } from "@/data/mock-data";
import { actionTakenLabel } from "@/data/types";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { TopAppBar } from "@/components/design-system/top-app-bar";
import {
  EmptyState,
  REASSURANCE_EMPTY_COPY,
} from "@/components/design-system/empty-state";
import { HistoryListItem } from "@/components/design-system/history-list-item";
import { ListRowSkeleton } from "@/components/design-system/loading";

/**
 * Alert History — docs/13 Screen 9. Real data now: every completed
 * Scam Warning (from the Demo Mode simulation) appends an entry via
 * `addAlertHistoryEntry`, already stored reverse-chronologically
 * (newest first, docs/13's required order) since new entries are
 * prepended. Empty state uses the exact same reassurance copy as
 * Home's condensed strip, by construction (`REASSURANCE_EMPTY_COPY`).
 */
export default function AlertHistoryPage() {
  const router = useRouter();
  const { isHydrated, alertHistory, emergencyContact } = useAppState();
  const contactName = emergencyContact?.name ?? mockEmergencyContact.name;

  return (
    <ScreenContainer>
      <TopAppBar title="Alert History" onBack={() => router.push("/home")} />
      <div className="py-lg flex flex-col">
        {!isHydrated ? (
          <>
            <ListRowSkeleton />
            <ListRowSkeleton />
          </>
        ) : alertHistory.length === 0 ? (
          <EmptyState message={REASSURANCE_EMPTY_COPY} />
        ) : (
          alertHistory.map((entry) => (
            <HistoryListItem
              key={entry.id}
              date={new Date(entry.detectedAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              patternLabel="Possible scam pattern"
              actionTakenLabel={actionTakenLabel(
                entry.actionTaken,
                contactName
              )}
              expandedContent={`${entry.detectedAppName} opened during your call — scammers often ask for this to access your phone or accounts.`}
            />
          ))
        )}
      </div>
    </ScreenContainer>
  );
}
