# Milestone 2 Implementation Report
### Guardian AI Web Prototype — Design System

*Implements only what `docs/12`–`15` specify. No product, UX, or
architecture decision was revisited in this milestone — see §5 for the
one place a milestone objective (a component name) required an
interpretation call against the frozen spec, flagged rather than
silently decided.*

---

## 1. Executive Summary

Milestone 2 delivers the complete reusable component library every
Guardian AI screen will be built from: 23 components across typography,
buttons, cards, inputs, alerts, status badges, permission rows, screen
layout primitives, empty/loading states, section headers, a top app bar,
a bottom action bar, progress indicators, an expandable
chronological-history component, list/settings rows, a confirm dialog, a
toast, and motion primitives — every one styled and behaviorally
specified directly against `docs/15`, with JSDoc on each component citing
its source section. **No screen, onboarding flow, dashboard, or
simulation logic was built**, per the milestone's explicit scope.

All 23 components live in `src/components/design-system/`, cataloged in
that directory's own `README.md`, and are smoke-tested (see §6) but not
wired into any real page.

---

## 2. What Was Built

| Component | File | docs/15 source |
|---|---|---|
| `Display`, `Heading`, `BodyLarge`, `Body`, `Caption`, `Numeric` | `typography.tsx` | Task 2, Typography Scale |
| `Button` (filled / filled-tonal / text × default / concern) | `button.tsx` | Task 2, Components → Buttons |
| `StatusPill` | `status-pill.tsx` | Task 5 naming; Task 3 Screen 10 |
| `PatternBadge` | `pattern-badge.tsx` | Task 5 naming; Task 3 Screen 8 |
| `Card`, `CardHeading`, `CardSupportingText` | `card.tsx` | Task 2, Cards / Elevation |
| `Alert` (neutral / attention / error) | `alert.tsx` | Task 2, Error components; Screens 2–4 |
| `PermissionStatusRow` | `permission-status-row.tsx` | Component Inventory; Screen 10 |
| `TextField` | `text-field.tsx` | Task 2, Text fields |
| `ScreenContainer` (standard / full-bleed / centered) | `screen-container.tsx` | Task 3, screen layouts |
| `TopAppBar` | `top-app-bar.tsx` | Task 3, Screens 7/9/10 |
| `BottomActionBar` | `bottom-action-bar.tsx` | Task 3, Screens 2–6 |
| `SectionHeader` | `section-header.tsx` | Screen 10 accessibility rule |
| `EmptyState`, `REASSURANCE_EMPTY_COPY` | `empty-state.tsx` | Task 2, Empty states |
| `Spinner`, `ListRowSkeleton`, `CardSkeleton` | `loading.tsx` | Task 2, Loading indicators |
| `StepIndicator` | `step-indicator.tsx` | Component Inventory, Onboarding Progress Indicator |
| `ListRow` | `list-row.tsx` | Task 2, Lists |
| `SettingsRow` | `settings-row.tsx` | Task 3, Screen 10 |
| `HistoryListItem` | `history-list-item.tsx` | Component Inventory, History List Item |
| `ConfirmDialog` | `confirm-dialog.tsx` | Task 2, Dialogs |
| `Toast` | `toast.tsx` | Task 4, Snackbar Behavior |
| `FadeThrough` | `fade-through.tsx` | Task 4, Navigation Transitions |
| `CheckmarkDraw` | `checkmark-draw.tsx` | Task 3, Screen 6 |
| `MOTION`, `EASE_STANDARD` | `motion.ts` | Task 4, Animation Durations & Easing |

Full prop/variant detail is in `src/components/design-system/README.md`,
which this report doesn't duplicate.

---

## 3. Design Decisions Worth Surfacing

- **`ui/` vs. `design-system/`.** Milestone 1's shadcn-generated
  primitives (`src/components/ui/`) were left untouched, not extended in
  place. A new `design-system/` layer was built instead, using `ui/`
  primitives underneath only where they already matched the doc exactly
  (`Dialog`/`Input` internals). Reasoning: `ui/` is a generic, vendored,
  upgradeable base; `docs/15`'s actual 3-tier Button system,
  custom-toned Alert, StatusPill, etc. have no equivalent in shadcn's
  default taxonomy and needed bespoke, precisely-specified components —
  bolting doc-specific variants onto vendored files would make future
  shadcn updates (`shadcn add --overwrite`) destructive.
- **`concern` coloring is deliberately fenced off.** Only `Button
  (tone="concern")`, `PatternBadge`, and `ConfirmDialog (destructive)`
  can render it. `Alert` — the component every permission/technical-error
  state will use — cannot, on purpose: `docs/15` is explicit that a live
  scam-threat warning and a broken permission check "must always [stay]
  visually distinct." This is enforced by the component API (no
  `tone="concern"` option exists on `Alert`), not just a comment.
- **No bottom sheet component was built**, despite being a real MD3
  component. `docs/15` explicitly reserves it for V2 ("Not used anywhere
  in this MVP's 11 frozen screens") — building it now would be exactly
  the placeholder architecture this project's engineering principles
  warn against.
- **`StepIndicator` is text-only, no progress bar**, matching the doc's
  explicit reasoning ("to avoid implying more steps remain than the
  genuinely short flow has") rather than defaulting to a typical
  progress-bar pattern.
- **Base UI's `render` prop, not `asChild`**, is used throughout
  wherever a component needs polymorphic composition (e.g.
  `ConfirmDialog`'s Cancel button rendering as `DialogPrimitive.Close`),
  consistent with the Milestone 1 finding that this project's shadcn
  install uses Base UI, not Radix.

---

## 4. Motion Primitives — Implementation Note

Tailwind v4's `--ease-*` theme namespace is confirmed to generate named
easing utilities (verified against `tailwindcss/theme.css`'s own
built-in `--ease-in`/`--ease-out` entries), so `ease-standard` was added
there directly. Tailwind's `--duration-*` namespace behavior for *named*
(non-numeric) duration utilities isn't similarly documented/verified in
this codebase, so rather than gamble on unverified behavior, durations
use Tailwind's built-in numeric/arbitrary `duration-*` utilities directly
in component code (`duration-200`, `duration-[50ms]`, `duration-[400ms]`)
— `src/components/design-system/motion.ts` is the documented mapping
from each MD3 duration token to the exact utility class used, so
components stay consistent without every author re-deriving the mapping.
`CheckmarkDraw`'s one true keyframe animation (stroke-draw) was added to
`globals.css` since it isn't expressible as a Tailwind utility.

---

## 5. Interpretation Flagged: "Timeline component"

The milestone's objective list includes "Timeline component," which has
no component by that name in `docs/15`. `docs/12` explicitly defers a
**Fraud Timeline** feature to V2/V3 (cross-institution fraud data,
outside this MVP's scope entirely) — building something literally named
"Timeline" risked resembling that deferred feature.

**Decision:** interpreted "Timeline component" as the frozen spec's own
`HistoryListItem` (Component Inventory: "History List Item (expandable)
... Collapsed: date, pattern label, action taken. Expanded: full
original explanation text, verbatim") — a chronological, expandable
alert record, which is the closest and only legitimate match in the
frozen docs. `history-list-item.tsx`'s JSDoc states this mapping and the
non-relation to Fraud Timeline explicitly, so the reasoning is visible in
code, not just this report. No risk scores, cross-institution data, or
anything beyond the one detection pattern was introduced.

This is the only place in this milestone where a requested item didn't
map cleanly onto an existing doc section — every other component traces
to a named `docs/15` section or Component Inventory entry directly.

---

## 6. Verification Performed

- **`npm run format` / `format:check`** — clean across all 23 new
  component files (plus the barrel export and README).
- **`npm run lint`** — zero errors, zero warnings.
- **`npm run build`** — production build succeeds; Next.js's full-project
  type-check (not just reachable files) passes under `strict: true`
  across every new file.
- **Runtime smoke test:** a temporary route (`/ds-preview-temp`,
  `"use client"`) rendered one instance of every component — including
  the three stateful/interactive ones (`TextField` with live validation,
  `ConfirmDialog` open/close, `Toast` open/auto-dismiss/close,
  `HistoryListItem` expand/collapse) — against the running dev server.
  Confirmed `200` response, no compile errors, no runtime exceptions in
  the dev server log, and the expected text content present in the
  rendered HTML (including React's normal SSR text-node comment markers
  around `StepIndicator`'s interpolated values, which is expected
  behavior, not a bug). **The route was deleted before this report was
  written** — it was never a real screen and isn't part of the delivered
  component library.
- Post-cleanup, `format:check`/`lint`/`build` were re-run to confirm the
  repository is exactly as clean with the temp route removed as it was
  with it present.
- `git status` confirms `CLAUDE.md` and `docs/12`–`15` remain untouched
  throughout this milestone.

---

## 7. What Was Intentionally Deferred

Per the milestone's explicit exclusions, none of the following were
built:

- Any of the 11 frozen Guardian AI screens themselves — this milestone
  built the parts, not the assemblies.
- Onboarding flow, dashboard functionality, or any simulation/detection
  logic.
- A bottom sheet component (§3 — explicitly out of MVP scope per
  `docs/15`).
- Wiring the design system into `/` or `/demo` — Milestone 1's
  placeholder pages and `AppShell` are unchanged; a future milestone will
  replace them using this library.
