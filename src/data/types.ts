/**
 * Domain types for the Guardian AI prototype's mock data layer.
 *
 * These mirror the data models specified in docs/14 (Engineering
 * Specification) §16 "Data Models" and §6 "Permission State" — ported from
 * the original Android/Room shapes to plain TypeScript, since this repo has
 * no backend or database. Every Android-only capability they describe
 * (live call/foreground-app detection, Accessibility Service) is simulated
 * in this prototype rather than real; see docs/12–15 for the frozen product
 * spec these types represent.
 */

/**
 * docs/14 §6 — permission state is modeled as a 3-value state per
 * permission, not a boolean, because "not yet asked" and "explicitly
 * denied" require different UI treatment (docs/13 Screens 3/4).
 */
export type PermissionState = "not_requested" | "granted" | "denied";

/** docs/14 §15 — EmergencyContactEntity, ported field-for-field. */
export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string; // ISO 8601
}

/**
 * docs/14 §15 — AlertHistoryEntity.ActionTaken enum, and docs/13 §4 Screen
 * 8's three warning actions plus the "call ended while warning was showing"
 * edge case, which resolves to an acknowledgement-only action.
 */
export type ActionTaken =
  "notified" | "marked_fine" | "call_ended" | "acknowledged";

/** docs/14 §15 — AlertHistoryEntity, ported field-for-field. */
export interface AlertHistoryEntry {
  id: string;
  detectedAppPackage: string;
  detectedAppName: string;
  detectedAt: string; // ISO 8601
  actionTaken: ActionTaken;
  notifiedContactId: string | null;
}

/**
 * docs/15 Component Inventory — History List Item: "Row action labels
 * use the same past-tense phrasing as the actions taken." Shared by
 * Home's condensed strip and Alert History so the two never drift.
 */
export function actionTakenLabel(
  actionTaken: ActionTaken,
  contactName: string
): string {
  switch (actionTaken) {
    case "notified":
      return `You notified ${contactName}`;
    case "marked_fine":
      return "You marked this as fine";
    case "call_ended":
      return "You ended the call";
    case "acknowledged":
      return "You acknowledged this";
  }
}
