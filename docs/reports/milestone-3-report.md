# Milestone 3 Implementation Report
### Guardian AI Web Prototype — Vertical Screens

*Per this milestone's directive: optimize for visible product progress over
internal infrastructure. No new design-system components were created —
every screen below is built entirely from Milestone 2's existing
component library, wired to real (simulated) state for the first time.*

---

## 1. Executive Summary

Milestone 3 turns the foundation into a real, clickable product: 10 routes
covering the full onboarding sequence (Screens 1–6), Home (Screen 7), the
Demo Mode entry screen, and honest stub routes for Alert History and
Settings — connected by an actual client-side state layer
(`src/lib/app-state.tsx`) that persists onboarding progress, simulated
permission grants, and the emergency contact across reloads. A visitor can
now go from first launch through onboarding to a live Home screen whose
status genuinely reflects what they did, edit or remove their emergency
contact from Settings, and see Home's "Fix this" repair path actually
work.

No new files were added to `src/components/design-system/`. Two files
outside it were added (`src/lib/app-state.tsx`) or removed
(`src/components/shared/app-shell.tsx`, superseded now that real screens
use `ScreenContainer`/`TopAppBar` directly).

---

## 2. Routes Built

| Route | Screen | State |
|---|---|---|
| `/` | Splash (docs/13 Screen 1) | Real — resume-aware redirect logic |
| `/onboarding/explainer` | Permission Explainer (Screen 2) | Real — expandable cards, Continue/Not now |
| `/onboarding/phone-state` | Phone State Permission (Screen 3) | Real — simulated in-app permission dialog |
| `/onboarding/accessibility` | Accessibility Service Permission (Screen 4) | Real — simulated Settings round-trip |
| `/onboarding/contact` | Set/Edit Emergency Contact (Screens 5/11) | Real — one component, both modes |
| `/onboarding/complete` | Onboarding Complete (Screen 6) | Real |
| `/home` | Home (Screen 7) | Real — live derived status |
| `/demo` | Demo Mode entry | Real entry screen; guided simulation itself is honestly deferred |
| `/history` | Alert History (Screen 9) | Honest placeholder — no data source exists yet (see §5) |
| `/settings` | Settings (Screen 10) | Real — Emergency Contact + Permissions sections; Accessibility section deferred (Should-Have, not Must-Have) |

---

## 3. The State Layer

`src/lib/app-state.tsx` is a single React Context + `localStorage` pairing
standing in for the Android app's Repository layer (docs/14 §8/§17) — the
minimum needed to make onboarding and Home genuinely connected, not
speculative infrastructure. It holds `onboardingStep`, the simulated
`phoneState`/`accessibilityService` permission states, and the emergency
contact, hydrating from `localStorage` on mount (an `isHydrated` flag lets
Splash avoid a flash-of-wrong-content before that resolves) and persisting
on every change.

This is deliberately one pragmatic hook, not four separate Repository
classes/interfaces — building that separation now, with no second data
source to abstract over, would be exactly the internal infrastructure this
milestone was told to stop prioritizing.

---

## 4. A Bug Caught by Manual Trace, Not Testing

No browser automation was available this session (the user chose not to
finish installing the Chrome extension mid-milestone) and Milestone 3 has
genuine client-side interactivity — routing redirects, persisted state,
multi-step forms — that `curl`/`next build` can't exercise. Verification
therefore relied on running the dev server plus a deliberate manual trace
of the state logic, which caught a real bug before it shipped:

**The bug:** `/onboarding/phone-state` and `/onboarding/accessibility`
each unconditionally called `setOnboardingStep(...)` on mount. That's
correct during first-time onboarding, but both screens are *also* reached
post-onboarding via Home/Settings' "Fix this" repair path — and
unconditionally resetting `onboardingStep` there would regress a
completed onboarding back to an earlier step. A visitor who finished
onboarding, then later used "Fix this" to re-grant a silently-revoked
permission, would have been redirected back into the middle of onboarding
on their next visit instead of straight to Home.

**The fix:** both screens now guard the step-write (`if (onboardingStep
!== "done") setOnboardingStep(...)`), and their post-action navigation
branches on whether they're in first-time onboarding or repair mode —
repair mode returns to `/home` directly instead of chaining into the next
onboarding screen, matching docs/13 Screen 10's actual description of
"Fix" as "a direct, one-tap path back into the relevant grant flow," not
a re-run of the whole sequence. The equivalent guard already existed in
the contact screen (built earlier in this milestone) but was missed on
these two until the trace caught it.

This is called out explicitly because it's the kind of bug that
`build`/`lint` cannot catch (both are type-correct, lint-clean) and that
real interactive testing would have caught immediately — worth being
transparent that verification here was code-review-depth, not
click-through-depth, for the reason stated above.

---

## 5. Two Screens Correctly Scoped as Stubs, and Why

- **`/history`** — genuinely cannot be real yet. Alert History requires
  actual detection events, and no detection/simulation exists in this
  repo (by design — this is a UI prototype, not a working detector, and
  the guided Demo Mode simulation that would generate sample events is
  explicitly future scope). An honest "coming in a future milestone"
  placeholder is the correct choice, not a fabricated data set.
- **`/settings`** was *not* left as a stub, on the same reasoning in
  reverse: it needs only the state this milestone already has (contact,
  permissions), so it was built for real — including wiring in two
  previously-unused Milestone 2 components (`PermissionStatusRow`,
  `SettingsRow`) and, via the contact-removal flow, `ConfirmDialog` and
  `Toast`. Building Settings as a stub when the real data was already
  available would have been the wrong kind of caution for this
  milestone's directive.

---

## 6. Demo Mode Entry — What "Entry" Means Here

Per the priority list, only the *entry* screen was built, not the guided
simulation. It presents real, final copy and a working "Start Demo"
button — clicking it reveals an honest inline note (via the `Alert`
component) that the full simulation isn't built yet, plus a working
"Explore the app instead" path that correctly routes to onboarding or
Home depending on the visitor's actual state. This avoids two worse
options: faking a simulation that would need throwaway rework later, or
leaving the button silently do nothing.

---

## 7. Component Usage — Before and After

Of Milestone 2's 23 components, 19 are now imported directly by real
screens (up from 0). The remaining 4 (`ConfirmDialog`, `HistoryListItem`,
`PatternBadge`, plus `motion.ts`'s constants, which are documented but not
literally imported anywhere — screens use Tailwind's `duration-*`
utilities directly, per `motion.ts`'s own guidance) are unused for
concrete, documented reasons, not oversight:

- `ConfirmDialog` — **now used** (contact removal flow, §5).
- `HistoryListItem` — has no real use until Alert History has real data
  (§5's `/history` stub).
- `PatternBadge` — reserved for the Scam Warning screen, which remains
  out of scope for this milestone.

No new design-system component was created this milestone, satisfying
"avoid creating components that are not yet used" by construction — there
was nothing new to risk leaving unused.

---

## 8. Verification Performed

- `npm run format` / `format:check` — clean.
- `npm run lint` — zero errors, zero warnings.
- `npm run build` — production build succeeds; all 10 routes prerender as
  static content; Next's full-project type-check passes under `strict:
  true`.
- Dev server run for all 10 routes via `curl` — all return `200`, zero
  errors or warnings in the dev server log across every route's
  compilation.
- Manual trace of all state-mutating code paths (onboarding sequence,
  repair/"Fix this" paths, contact edit/remove, Demo entry) — caught and
  fixed the regression bug in §4.
- **Not done, and flagged honestly:** real click-through browser testing
  of the redirect/hydration/form-validation/dialog behavior. No browser
  automation tool was available this session. This is the one area where
  confidence is lower than in prior milestones' verification — worth a
  manual pass (or automated E2E coverage) before this is shown externally.

---

## 9. What Was Intentionally Deferred

- The Scam Warning screen and any real/simulated detection trigger.
- The guided Demo Mode simulation itself (only its entry screen was
  built, per §6).
- Alert History's real content (§5).
- Settings' Accessibility section (font size, contrast, read-aloud) —
  docs/12 Should-Have, not Must-Have, and not in this milestone's
  priority list.
- Any new design-system component (per this milestone's directive).
