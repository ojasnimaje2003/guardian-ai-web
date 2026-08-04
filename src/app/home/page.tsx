"use client";

import { useRouter } from "next/navigation";
import {
  History,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import { useAppState, deriveProtectionStatus } from "@/lib/app-state";
import { mockEmergencyContact } from "@/data/mock-data";
import { actionTakenLabel } from "@/data/types";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { TopAppBar, IconButton } from "@/components/design-system/top-app-bar";
import { SectionHeader } from "@/components/design-system/section-header";
import { Heading, Body } from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";
import {
  EmptyState,
  REASSURANCE_EMPTY_COPY,
} from "@/components/design-system/empty-state";
import { HistoryListItem } from "@/components/design-system/history-list-item";
import { CardSkeleton } from "@/components/design-system/loading";
import { FadeThrough } from "@/components/design-system/fade-through";

/**
 * Home: docs/13 Screen 7, the app's resting state. "Must communicate
 * protection status truthfully at a glance, including when protection
 * is *not* fully active." The Status Card is a custom composition per
 * docs/15 Task 2 ("MD3 has no dedicated 'status hero' component"),
 * built inline here rather than as a shared component, since Home is
 * its only documented use.
 *
 * Protection status is derived from the simulated permission state on
 * every render (no caching), the same "never trust a stale value"
 * rule docs/14 §6 specifies for the real Android permission checks.
 *
 * Recent Activity shows the last 1–2 real entries (docs/13 Screen 7)
 * once the Demo Mode simulation has produced any.
 */
export default function HomePage() {
  const router = useRouter();
  const {
    isHydrated,
    phoneState,
    accessibilityService,
    alertHistory,
    emergencyContact,
  } = useAppState();
  const status = deriveProtectionStatus(phoneState, accessibilityService);
  const contactName = emergencyContact?.name ?? mockEmergencyContact.name;
  const recentEntries = alertHistory.slice(0, 2);

  function fixThis() {
    if (phoneState !== "granted") {
      router.push("/onboarding/phone-state");
    } else {
      router.push("/onboarding/accessibility");
    }
  }

  return (
    <ScreenContainer>
      <TopAppBar
        title="Guardian AI"
        actions={
          <>
            <IconButton
              onClick={() => router.push("/history")}
              aria-label="Alert History"
            >
              <History className="size-5" aria-hidden />
            </IconButton>
            <IconButton
              onClick={() => router.push("/settings")}
              aria-label="Settings"
            >
              <SettingsIcon className="size-5" aria-hidden />
            </IconButton>
          </>
        }
      />

      <div className="gap-xl py-lg flex flex-col">
        {/* Guards against a flash of "Protection is off" before the
            real, persisted permission state loads from localStorage:
            the default state is always "off" until hydration resolves,
            which would otherwise flicker for any returning user whose
            protection is actually active. */}
        {!isHydrated ? (
          <CardSkeleton />
        ) : (
          <FadeThrough key={status}>
            {status === "active" ? (
              <div className="gap-md bg-secondary p-lg text-secondary-foreground flex flex-col items-start rounded-(--radius-card)">
                <ShieldCheck className="size-8" aria-hidden />
                <Heading as="h2">Protection is active.</Heading>
              </div>
            ) : (
              <div className="gap-md bg-protection-off-container p-lg text-protection-off flex flex-col items-start rounded-(--radius-card)">
                <ShieldAlert className="size-8" aria-hidden />
                <Heading as="h2">
                  Protection is off. Guardian AI can&apos;t watch for scam calls
                  right now.
                </Heading>
                <Button variant="filled-tonal" onClick={fixThis}>
                  Fix this
                </Button>
              </div>
            )}
          </FadeThrough>
        )}

        <div className="gap-md flex flex-col">
          <SectionHeader>Recent Activity</SectionHeader>
          {!isHydrated ? (
            <CardSkeleton />
          ) : recentEntries.length === 0 ? (
            <EmptyState message={REASSURANCE_EMPTY_COPY} />
          ) : (
            <FadeThrough className="flex flex-col">
              {recentEntries.map((entry) => (
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
                  expandedContent={`${entry.detectedAppName} opened during your call. Scammers often ask for this to access your phone or accounts.`}
                />
              ))}
            </FadeThrough>
          )}
        </div>

        <div className="gap-sm border-border pt-lg flex flex-col items-start border-t">
          <Body className="text-muted-foreground">
            See the full guided walkthrough of a live scam call.
          </Body>
          <Button variant="text" onClick={() => router.push("/demo")}>
            Try Demo Mode
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
}
