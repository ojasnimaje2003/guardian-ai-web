# Milestone 5 Implementation Report
### Guardian AI Web Prototype: Demo Simulation, Scam Warning, Alert History

*Compared the implemented app against `docs/12`, `docs/13`, and `docs/15`
before writing code (§1). Everything below reuses Milestone 2's
components and Milestone 3's `AppStateProvider`: no UI redesign, no new
product feature, no new design-system component.*

---

## 1. Gap Analysis: What Was Actually Missing

Before this milestone, every screen up through onboarding → Home →
Settings was real. Three things stood between that and a demonstrable
frozen MVP:

1. **Scam Warning (docs/13 Screen 8)**, "the single most important
   screen in the product," didn't exist at all.
2. **No trigger reached it.** Demo Mode's entry screen existed
   (Milestone 3) but "Start Demo" only showed a static "coming soon"
   message. There was no guided simulation to fire the warning.
3. **Alert History had no data source.** `/history` was an honest stub;
   Home's Recent Activity always showed the empty state, even though
   the `AlertHistoryEntry` type and `HistoryListItem` component had
   existed, unused, since Milestones 1–2.

Everything else the frozen docs describe for the MVP (onboarding,
Home, Settings, permission simulation) was already built and confirmed
working in Milestones 3–4. This milestone's job was exactly those three
gaps, in order: build the simulation that leads to Scam Warning, build
Scam Warning itself, and close the loop by persisting what happened.

---

## 2. What Was Built

| Route | Purpose |
|---|---|
| `/demo/call` (new) | Guided Simulation: a stylized simulated call with scripted scammer dialogue, ending when the simulated screen-share app "opens" |
| `/demo/warning` (new) | Scam Warning: docs/13 Screen 8, built to the full spec (§3) |
| `/demo` (modified) | "Start Demo" now launches the real simulation instead of a placeholder |
| `/history` (modified) | Renders real `alertHistory` entries via `HistoryListItem`, empty state otherwise |
| `/home` (modified) | Recent Activity shows the last 1–2 real entries (docs/13 Screen 7), not always empty |

`src/lib/app-state.tsx` gained `alertHistory: AlertHistoryEntry[]` and
`addAlertHistoryEntry` (append-only, newest-first, per docs/14 §8). Realistic
mock content was added to `src/data/mock-data.ts`
(`DEMO_CALL_SCRIPT`, five lines of scripted scammer dialogue reflecting
the same fake-bank/remote-access pattern `docs/13` Screen 2's own
explanation card describes) and a shared `actionTakenLabel()` helper was
added to `src/data/types.ts` so Home and Alert History render identical
past-tense action copy from one source, not two hand-maintained copies.

---

## 3. Scam Warning: Fidelity to docs/13 Screen 8 / docs/15 Task 3

Every documented behavior was implemented, not approximated:

- **Full-bleed, no chrome**: `ScreenContainer variant="full-bleed"`, no
  `TopAppBar`.
- **Zero entrance transition**: the root container carries no
  `animate-in`/`duration` class, the one deliberate departure from
  every other screen in the app.
- **No back-dismiss**: a `popstate`-trap effect re-pushes history state
  while the screen is mounted, released automatically when one of the
  three actions navigates away. (Known limitation: since this is a SPA
  history trick rather than a separate Activity, pressing back *after*
  leaving via an action can land on a stray duplicate history entry,
  documented in §6, not hidden.)
- **Automatic, non-opt-in read-aloud**: a `role="status"
  aria-live="assertive"` region starts empty and is filled via
  `useEffect` after mount, which announces reliably across screen
  readers (an aria-live region already containing text at first paint is
  announced inconsistently across screen readers, so starting empty and
  setting it after mount avoids that).
- **Distinct haptic on appearance**: `navigator.vibrate([200, 100,
  200])`, feature-detected, a no-op on desktop/unsupported devices.
- **Asymmetric three-action stack**: "End the call now" (Filled,
  `concern` tone, `min-h-14`, the one deliberate exception to the
  standard 44dp button height, "tallest button in the entire app" per
  the doc), "Notify [Contact]" (Filled Tonal, inline sending/sent
  state, doesn't dismiss the screen, matching "the user may still need
  to act on 'End the call now' after notifying"), "This is fine" (Text,
  smallest, single-tap, no confirmation).
- **Named, specific detected fact**: "AnyDesk opened at [time]," never
  a generic "unusual activity."

**One data-model correction caught during implementation:** `docs/14`
§15's `ActionTaken` enum includes `NOTIFIED` as its own value, distinct
from `CALL_ENDED`/`MARKED_FINE`. My first pass recorded whichever button
dismissed the screen as the action, with notification tracked only via
`notifiedContactId`. Re-reading the enum definition against the UI
behavior, that was wrong: if the contact was notified, that's the more
significant fact and should be the recorded action regardless of which
button was tapped afterward. Fixed before this was verified: `finish()`
now checks `notifyState` and records `"notified"` whenever it applies.

---

## 4. Guided Simulation (`/demo/call`): Scope Decision

The approved story-first presentation strategy (from an earlier session)
sketched a "Choose Demo Scenario" step offering multiple narrative
pretexts before the simulated call. This milestone implements a single
scripted scenario instead, reached directly from "Start Demo."

**Why:** every milestone since has consistently prioritized lean,
direct, documented behavior over presentation elaboration, and none of
this milestone's six numbered priorities mention a scenario picker. The
frozen MVP has exactly one detection pattern regardless of which fictional
pretext narrates it, so a picker would add UI surface without adding
anything the priorities asked for, the opposite of "do not add new
product features." Flagged here as a deliberate, in-scope simplification
of an earlier (superseded) idea, not an oversight.

A "Skip ahead" link is available throughout the call simulation so the
full flow can be demonstrated quickly on request (priority 6) without
waiting through the scripted dialogue every time.

---

## 5. Closing the Loop

Alert History is no longer a stub. Completing the Scam Warning flow,
via either exit action, appends a real entry; `/history` and Home's
Recent Activity both read from the same `alertHistory` state and render
it through the same `actionTakenLabel()` helper, so a demo run is
immediately visible in both places. This is what makes the flow actually
demonstrable end-to-end (priority 6): Demo → simulated call → warning →
decision → Home, now showing real data instead of an evergreen empty
state.

---

## 6. Verification Performed

- `npm run format` / `format:check`: clean.
- `npm run lint`: zero errors, zero warnings.
- `npm run build`: production build succeeds; all 12 routes prerender
  as static content; full-project type-check passes under `strict: true`.
- `curl` against all 12 routes (including the two new ones): all `200`,
  zero errors in the dev server log.
- **Manual code trace of the full flow** (Demo entry → call script →
  warning → each of the three exit actions → resolution → Home/History
  reflecting the new entry), since no browser automation tool was
  available this session (same limitation noted in Milestone 3). This
  trace caught and fixed two real issues before they shipped:
  - The `ActionTaken` priority bug described in §3.
  - A hydration-mismatch risk: `/demo/warning` is statically prerendered,
    and computing `new Date()` for the "Detected at [time]" display would
    make the build-time server value and the real client-time value
    differ on a direct/refreshed visit. In the actual intended flow this
    screen is only ever reached by client-side navigation (no hydration
    involved), but it's reachable directly too, so the display value is
    now wrapped in `suppressHydrationWarning`: the standard, documented
    React pattern for exactly this "legitimately time-dependent" case.
- **Not done, flagged honestly again:** real click-through browser
  testing of the timers, animations, and vibration/haptic behavior.
  Confidence here is code-review-depth: every interaction was traced by
  hand and the data flow was verified end-to-end through the state
  layer, but the actual pixel/timing experience (does the call script
  feel well-paced, does the warning's entrance genuinely read as
  "instant") has not been visually confirmed. Worth a manual pass before
  this is shown externally.

---

## 7. What Was Intentionally Not Built

- A scenario picker (§4).
- The call-ends-on-its-own edge case (docs/13 Screen 8: "End the call
  now" becoming inert if the simulated call ends independently), the
  demo's simulated call is always "active" until the user acts, a
  reasonable simplification for a controlled demo, not a random event
  the docs require simulating.
- Any change to onboarding, Home's core layout, or Settings: this
  milestone only added the demo/warning/history vertical slice.
