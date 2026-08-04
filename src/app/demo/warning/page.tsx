"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Check } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import {
  mockEmergencyContact,
  KNOWN_SCREEN_SHARE_APPS,
} from "@/data/mock-data";
import type { ActionTaken } from "@/data/types";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { BodyLarge, Caption } from "@/components/design-system/typography";
import { PatternBadge } from "@/components/design-system/pattern-badge";
import { Button } from "@/components/design-system/button";
import { BottomActionBar } from "@/components/design-system/bottom-action-bar";

/**
 * Scam Warning: docs/13 Screen 8, "the single most important screen
 * in the product." Implemented exactly per spec:
 * - Full-bleed, no app bar, no back button (ScreenContainer full-bleed).
 * - **Zero entrance transition**: the one deliberate exception to
 *   every other screen's motion language. Do not wrap this in
 *   FadeThrough or add any animate-in/duration class to the root.
 * - No back-dismiss: only the three explicit actions can leave this
 *   screen (history-trap effect below).
 * - Automatic (non-opt-in) read-aloud announcement on appearance:
 *   the one deliberate accessibility exception in the whole app.
 * - Asymmetric three-action stack: "End the call now" (Filled,
 *   `concern` tone, tallest button in the app, a deliberate exception
 *   to standard button height), "Notify [Contact]" (Filled Tonal),
 *   "This is fine" (Text, smallest, bottom-most).
 *
 * The detected app is fixed to AnyDesk for this demo (the frozen MVP
 * has exactly one detection pattern): `KNOWN_SCREEN_SHARE_APPS[0]`.
 */
export default function ScamWarningPage() {
  const router = useRouter();
  const { emergencyContact, addAlertHistoryEntry } = useAppState();
  const contact = emergencyContact ?? mockEmergencyContact;
  const detectedApp = KNOWN_SCREEN_SHARE_APPS[0];
  const detectedAt = useRef(new Date()).current;

  const [notifyState, setNotifyState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [resolution, setResolution] = useState<string | null>(null);
  const [announced, setAnnounced] = useState("");

  // No back-dismiss (docs/13 §2): trap browser back/gesture navigation
  // while this screen is showing. Released automatically once we
  // navigate away ourselves via one of the three actions below.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const trap = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, []);

  // Distinct haptic on appearance (docs/13 §4 Screen 8): a no-op on
  // desktop browsers and devices without vibration support.
  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const announcement = `Possible scam pattern detected. You're on a call, and ${detectedApp.displayName} just opened. Scammers often ask for this to access your phone or accounts.`;

  // Live regions are announced more reliably by screen readers when
  // their content *changes* after mount than when it's already present
  // at first paint. Starting empty and setting it here (rather than
  // rendering `announcement` directly) makes the automatic read-aloud
  // (docs/13 Screen 8's one opt-out accessibility exception) dependable
  // across screen readers, not just the ones that announce on insert.
  useEffect(() => {
    setAnnounced(announcement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notify() {
    setNotifyState("sending");
    setTimeout(() => setNotifyState("sent"), 900);
  }

  function finish(baseAction: ActionTaken, message: string) {
    const notified = notifyState === "sent";
    // docs/14 §15's ActionTaken enum includes NOTIFIED as its own value:
    // when the contact was notified, that's the more significant,
    // product-relevant fact and takes priority over how the warning
    // was otherwise dismissed, even though the UI still lets the user
    // separately end the call or dismiss after notifying.
    addAlertHistoryEntry({
      id: crypto.randomUUID(),
      detectedAppPackage: detectedApp.packageName,
      detectedAppName: detectedApp.displayName,
      detectedAt: detectedAt.toISOString(),
      actionTaken: notified ? "notified" : baseAction,
      notifiedContactId: notified ? contact.id : null,
    });
    setResolution(
      notified ? `${message} ${contact.name} was notified.` : message
    );
    setTimeout(() => router.push("/home"), 1800);
  }

  if (resolution) {
    return (
      <ScreenContainer variant="full-bleed">
        <div className="gap-md px-md flex flex-1 flex-col items-center justify-center text-center">
          <Check className="text-primary size-10" aria-hidden />
          <BodyLarge>{resolution}</BodyLarge>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer variant="full-bleed">
      {/* Automatic read-aloud: announced immediately, not opt-in, per docs/13 Screen 8. */}
      <div role="status" aria-live="assertive" className="sr-only">
        {announced}
      </div>

      <div className="gap-xl px-md py-2xl flex flex-1 flex-col">
        <PatternBadge icon={<ShieldAlert className="size-4" aria-hidden />}>
          Possible scam pattern detected
        </PatternBadge>

        <div className="gap-md flex flex-1 flex-col justify-center">
          <BodyLarge>
            You&apos;re on a call, and {detectedApp.displayName} just opened.
            Scammers often ask for this to access your phone or accounts.
          </BodyLarge>
          <Caption>
            Detected: {detectedApp.displayName} opened at{" "}
            {/* This screen is only ever reached via client-side
                navigation from /demo/call in normal use, so hydration
                never actually races here, suppressed defensively for
                the edge case of a direct/refreshed visit, where the
                prerendered build-time clock and the real client clock
                would otherwise legitimately differ. */}
            <span suppressHydrationWarning>
              {detectedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Caption>
        </div>
      </div>

      <BottomActionBar>
        <Button
          variant="filled"
          tone="concern"
          className="text-body-lg min-h-14"
          onClick={() => finish("call_ended", "Call ended.")}
        >
          End the call now
        </Button>

        <Button
          variant="filled-tonal"
          onClick={notify}
          disabled={notifyState !== "idle"}
        >
          Notify {contact.name}
        </Button>
        {notifyState !== "idle" && (
          <div className="gap-sm animate-in fade-in ease-standard flex items-center duration-200">
            {notifyState === "sending" ? (
              <Caption>Sending...</Caption>
            ) : (
              <>
                <Check className="text-primary size-4" aria-hidden />
                <Caption>Notify sent</Caption>
              </>
            )}
          </div>
        )}

        <Button
          variant="text"
          onClick={() => finish("marked_fine", "Got it. Marked as fine.")}
        >
          This is fine, I know this person
        </Button>
      </BottomActionBar>
    </ScreenContainer>
  );
}
