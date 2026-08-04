# Accessibility Permission Flow: QA Fix

*Bug fix only. No redesign, no new features, no UI or copy changes.*

---

## 1. Reported Issue

Manual QA on the onboarding Accessibility Permission screen
(`/onboarding/accessibility`, docs/13 Screen 4) reported: tapping "Open
Settings" is a dead end, because the web prototype has no real Android
Settings app to hand off to.

## 2. Investigation

The screen's simulated grant flow (tap "Open Settings" → "Checking..." →
"Got it" → auto-advance) was already implemented and did not, in fact,
dead-end for the two most common paths:

- **First-time onboarding**: granting correctly advanced
  `onboardingStep` to `"contact"` and navigated to
  `/onboarding/contact`.
- **Repair mode reached from Home's "Fix this"**: granting correctly
  returned to `/home`.

The actual bug was narrower: the screen is reachable via **two**
separate "Fix" entry points, Home's Status Card and Settings'
Permissions row (`src/app/settings/page.tsx`), and both were treated
identically. Per docs/13 §7 ("Home shows 'Protection is off' → ... →
re-enters Screen 3 or 4's grant flow → **returns to Settings**, then
Home"), a grant reached via Settings must return to Settings, not Home.
The code had a single `isRepairMode` branch that always pushed
`/home`, so completing the flow from Settings silently dropped the user
on Home instead: a real, if quiet, dead end relative to where they'd
actually come from.

## 3. Fix

In `src/app/settings/page.tsx`, the Accessibility "Fix" link now tags
its navigation:

```diff
- onFix={() => router.push("/onboarding/accessibility")}
+ onFix={() =>
+   router.push("/onboarding/accessibility?from=settings")
+ }
```

In `src/app/onboarding/accessibility/page.tsx`, `afterResolved()` now
reads that tag (via `window.location.search`, consistent with the
existing direct-`window` pattern already used in
`src/app/demo/warning/page.tsx`, so no new `useSearchParams`/Suspense
plumbing was introduced) to decide where a repair-mode grant returns:

```diff
  function afterResolved() {
    if (isRepairMode) {
-     router.push("/home");
+     const cameFromSettings =
+       new URLSearchParams(window.location.search).get("from") ===
+       "settings";
+     router.push(cameFromSettings ? "/settings" : "/home");
    } else {
      setOnboardingStep("contact");
      router.push("/onboarding/contact");
    }
  }
```

Home's "Fix this" link is unchanged. It still navigates here with no
query string, so it keeps landing back on `/home`, exactly as before.

### Requirements checklist

1. "Open Settings" simulates opening Android Settings: already correct, unchanged.
2. Simulates the user enabling Accessibility: already correct, unchanged.
3. Updates app state so Accessibility becomes Granted: already correct, unchanged (`setAccessibilityService("granted")`).
4. Continues onboarding exactly as the Android app would: already correct, unchanged.
5. Onboarding in progress → advances to the next step (`/onboarding/contact`): already correct, unchanged.
6. Reached from Settings via "Fix" → returns to Settings after granting: **fixed** (was returning to Home).
7. All existing UI and copy preserved: no JSX text, layout, or component changed.
8. No other functionality changed: Home's "Fix this" path, the "Skip for now" path, and first-time onboarding are all unchanged and re-verified above.

## 4. Verification

- **Format**: `npm run format` (Prettier) ran clean, reformatting only the two edited files.
- **Lint**: `npm run lint` (ESLint) ran clean, with zero warnings or errors.
- **Build**: `npm run build` (`next build --turbopack`) compiles successfully. All 19 routes, including `/onboarding/accessibility` and `/settings`, prerender as static content with no new errors or warnings.

## 5. Manual Flow Trace (post-fix)

| Entry point | `onboardingStep` | Query | After grant |
|---|---|---|---|
| First-time onboarding (`/onboarding/phone-state` → here) | not `"done"` | none | → `/onboarding/contact`, step set to `"contact"` |
| Home → "Fix this" (Accessibility not granted) | `"done"` | none | → `/home` |
| Settings → Accessibility row "Fix" | `"done"` | `?from=settings` | → `/settings` |
