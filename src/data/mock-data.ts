import type { EmergencyContact } from "./types";

/**
 * docs/14 §10: KnownScreenShareApps.PACKAGES, the bundled list of
 * remote-access tools the detector correlates against a live call. Ported
 * here as static reference data: the demo simulation (`/demo/call`,
 * `/demo/warning`) always uses index 0 (AnyDesk); the remaining entries
 * represent the same full known-app list docs/14 §10 describes and are
 * kept for that fidelity, not because more of the demo indexes into them.
 */
export const KNOWN_SCREEN_SHARE_APPS = [
  { packageName: "com.anydesk.anydeskandroid", displayName: "AnyDesk" },
  {
    packageName: "com.teamviewer.quicksupport.market",
    displayName: "TeamViewer QuickSupport",
  },
  { packageName: "com.teamviewer.host.market", displayName: "TeamViewer Host" },
] as const;

export const mockEmergencyContact: EmergencyContact = {
  id: "contact-1",
  name: "Anjali",
  phoneNumber: "9876543210",
  createdAt: "2026-06-01T09:00:00.000Z",
};

/**
 * Scripted scammer dialogue for the Demo Mode guided simulation
 * (docs/12 §"Week 2" sprint task references "India-targeted scam
 * patterns" as the basis for the known-app list this script ends with;
 * the pattern itself, a fake bank/fraud-team caller talking a victim
 * into installing a remote-access app mid-call, is the same one
 * `docs/13` Screen 2's Accessibility explanation card describes).
 * Presentation-layer content only: it does not change what the
 * product detects (still the single Screen-Share Pattern) or add a
 * new detection mechanism.
 */
export const DEMO_CALL_SCRIPT = [
  "Hello, I'm calling from your bank's fraud prevention team.",
  "We've detected a suspicious transaction on your account just now.",
  "To help secure your account, I'll need to verify your device remotely.",
  "Please install AnyDesk from the Play Store so I can assist you.",
  "Go ahead and open it once it's installed.",
] as const;
