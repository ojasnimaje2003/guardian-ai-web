# Milestone 6 Implementation Report
### Guardian AI Web Prototype: Product Polish

*No new product features. Every change below is a presentation, motion,
responsiveness, accessibility, or code-quality refinement on top of the
functionally complete MVP delivered through Milestone 5.*

---

## 1. Executive Summary

This milestone audited and polished the whole app rather than adding a
vertical slice: a single `RouteTransition` wrapper now gives every screen
change a consistent 200ms fade, moved keyboard focus, and a screen-reader
route announcement; `ScreenContainer` gained a responsive "phone canvas"
treatment so the product reads intentionally on desktop and tablet
instead of looking like an unstyled column; buttons and rows got a
tasteful press micro-interaction; three screens gained loading-skeleton
guards that fix a real flash-of-wrong-content bug; a spacing/typography/
color audit found the token system already applied consistently
throughout, with six small `gap-1` → `gap-xs` normalizations as the only
findings; and a small icon-button duplication was consolidated into one
component.

---

## 2. Priority-by-Priority

**1. Screen transitions.** `src/components/shared/route-transition.tsx`
(new), wired once into `layout.tsx`, replaces what had been scattered,
inconsistent per-element `animate-in` classes on a couple of pages
(removed as redundant, see §5). Every route change now fades in at
200ms/Standard easing (docs/15 Task 4's default), except `/demo/warning`,
which is explicitly excluded: Scam Warning's zero-transition entrance is
a deliberate, documented exception, not an oversight.

**2. Micro-interactions.** `Button`, `ListRow`'s clickable variant, and
`HistoryListItem`'s expand trigger all gained a `100ms` press-down
(`active:scale-[0.97]`) or hover/active background transition using the
existing `ease-standard` token: small, consistent, using motion values
already established in Milestone 2, not new ones invented for this pass.

**3. Responsive behavior.** `docs/12`–`15` are phone-only specs and say
nothing about desktop/tablet. This was a genuine gap, not something to
verify against an existing rule. `ScreenContainer` now renders a
centered, width-capped, subtly-shadowed "phone canvas" on `sm:` and
wider, with the canvas itself becoming a fixed-height scroll container
at that breakpoint so `BottomActionBar`'s `sticky bottom-0` correctly
pins to the canvas's edge rather than the browser window's. Below `sm:`,
every one of these classes is a no-op: mobile behavior is byte-for-byte
what it already was. Fixed alongside this: two `full-bleed` pages
(`/demo/call`, `/demo/warning`) used their own `min-h-screen` on inner
content divs, which would have fought the canvas's new fixed height on
desktop. Both switched to `flex-1` so they fill whatever height the
canvas actually has, mobile or desktop.

**4. Keyboard accessibility.** `RouteTransition` moves focus to a
`tabIndex={-1}` container on every navigation: without this, Next.js
client-side routing leaves keyboard focus on a now-unmounted control, a
real and easy-to-miss SPA accessibility gap. Existing focus-visible rings
and native-button semantics (audited, all present) were left as they
were, having already been done correctly since Milestone 2.

**5. Screen reader experience.** The same `RouteTransition` announces
each new screen's title via a polite live region: SPA route changes are
otherwise invisible to assistive tech, since nothing like a full page
load occurs. `/demo/warning` is excluded from this generic announcement
(it already fires its own, more specific, assertive announcement) so the
two don't compete. Separately, Scam Warning's own read-aloud region was
already correct from Milestone 5 and wasn't touched here.

**6. Loading and transition states.** Fixed a real bug this audit
surfaced: Home, Settings, and Alert History all read `AppState` before
`isHydrated` resolves, and the default (pre-hydration) state is always
"nothing set yet," meaning a returning user with real data would
briefly see "Protection is off," "Not set," and an empty history list
flash before the real values replaced them a moment later. All three now
render `CardSkeleton`/`ListRowSkeleton` (already-built Milestone 2
components, previously unused for this purpose) until `isHydrated` is
true, then the real content fades in.

**7. Spacing/typography/visual consistency audit.** Grepped the entire
`src/app` and `src/components/design-system` tree for raw Tailwind
spacing (`gap-4`, `p-6`, …), raw text sizes (`text-lg`, …), raw radii
(`rounded-xl`, …), and raw palette colors (`bg-red-500`, …) that would
bypass the docs/15 token system built in Milestone 2. Result: **zero**
raw type-scale or palette-color usages anywhere in the app. The design
system has been applied consistently since it was built. The only
finding was six instances of `gap-1`, which is numerically identical to
`gap-xs` (both 4px) but doesn't carry the token's name. These were
normalized to `gap-xs` for consistency. `rounded-full` (circular elements) and one
pre-existing, already-documented `rounded-md` (text field, no radius
specified in docs/15) were reviewed and left as correct/acknowledged.

**8. Duplicated code.** The 44×44dp icon-button pattern (hover/active/
focus-ring/transition classes) was hand-copied three times: once inside
`TopAppBar`'s own back button, twice more in Home's History/Settings
trailing actions. Extracted to a single exported `IconButton` in
`top-app-bar.tsx`, used by both. The `actionTakenLabel` duplication
identified and fixed in Milestone 5 was already resolved before this
milestone started.

**9. Comment reduction.** Audited every inline comment in `src/app` and
`src/lib` (48 total) individually. Finding: essentially all of them cite
a specific `docs/12`–`15` section or explain a non-obvious constraint
(why a guard exists, why a value is computed a particular way), exactly
the "architectural" category the instruction says to preserve, not
mechanical restatement of what the code already says. No meaningful
bloat was found to remove; forcing deletions to hit an arbitrary
reduction count would have cost real context for no benefit, so none
were made. Reported here as a genuine audit finding, not skipped work.

**10. End-to-end verification.** §4.

---

## 3. New Component

`src/components/shared/route-transition.tsx`: the one new file this
milestone, and the only piece of "infrastructure" added. Justified
because it's the single mechanism behind priorities 1, 4, and 5
simultaneously, applied once at the layout level rather than duplicated
per-screen.

---

## 4. Verification Performed

- `npm run format` / `format:check`: clean.
- `npm run lint`: zero errors, zero warnings.
- `npm run build`: production build succeeds; all 12 routes prerender
  as static content; full-project type-check passes under `strict:
  true`.
- `curl` against all 12 routes: all `200`, zero errors in the dev
  server log.
- Confirmed the new responsive canvas classes (`sm:h-[48rem]`,
  `sm:overflow-y-auto`, `sm:shadow-xl`) are actually present in rendered
  HTML output.
- Manual trace of the responsive/sticky-positioning CSS reasoning (§2.3)
  and the `RouteTransition` focus/announcement/key-remount logic (§2.4/
  2.5), since, as in Milestones 3 and 5, no browser automation tool
  was available this session to visually confirm the result.
- **Not done, flagged honestly again:** actual visual/interactive
  confirmation in a real browser at multiple viewport widths. Every
  change here was reasoned through CSS/React semantics rather than
  observed. This is the same limitation noted in Milestones 3 and 5.
  It's worth a real click-through and resize pass before this is shown
  externally, specifically to confirm the desktop "phone canvas" framing
  looks as intended and the fade/press micro-interactions read as
  tasteful rather than distracting.

---

## 5. Redundancy Removed Alongside the New Transition Layer

Two page-level `animate-in fade-in duration-200 ease-standard` usages on
Splash's icon and heading were removed. They predated `RouteTransition`
and would now double up with the page-level fade it provides. Dynamic,
state-driven reveals elsewhere (permission-grant confirmations, dialogue
lines appearing in the call simulation, the Home status card
cross-fading between Active/Off) were deliberately left untouched: those
are independent content changes within an already-mounted page, not page
transitions, and remain correct, distinct uses of the same motion
tokens.

---

## 6. What Was Intentionally Not Changed

- No new screens, copy, or product behavior.
- The Settings "About & Privacy" row stays inline text rather than
  becoming a navigable sub-screen (a Milestone 3 scope decision,
  unrevisited here, out of this milestone's polish scope).
- TopAppBar's border/background stays inset within the page's content
  padding rather than running fully edge-to-edge within the canvas, a
  minor, previously-flagged (Milestone 3) deviation from strict MD3
  app-bar convention. Fixing it properly would mean touching every
  page's content wrapper to add padding TopAppBar currently inherits for
  free; judged not worth the risk/change surface for this pass given how
  subtle the visual difference is at the app's 360px content width.
