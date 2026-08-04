# Guardian AI Design System

Milestone 2 deliverable: every reusable component the frozen 11-screen
product (`docs/13`) will be built from, styled exactly per `docs/15`. No
screen, onboarding flow, dashboard, or simulation logic lives here — see
each component file's JSDoc for its specific `docs/15` source section.

Import from `@/components/design-system` (barrel export in `index.ts`),
or from an individual file for smaller bundles.

This layer sits above `src/components/ui/` (vendored shadcn/Base UI
primitives). Only `ui/skeleton.tsx` is actually used — every other
Milestone 1 shadcn scaffold file (`badge`, `button`, `card`, `dialog`,
`input`, `label`, `separator`, `sheet`) was confirmed to have zero
importers anywhere in the app and removed in the RC1 audit (see
`docs/reports/release-candidate-1.md`); this design-system layer has its
own bespoke, docs-traced versions of all of those. Milestone 1's minimal
`AppShell` (`src/components/shared/`) was removed in Milestone 3 for the
same reason, once real screens started using `ScreenContainer`/
`TopAppBar` below instead.

## Catalog

| Component                                                       | File                        | docs/15 source                                        | Notes                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | --------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Display`, `Heading`, `BodyLarge`, `Body`, `Caption`, `Numeric` | `typography.tsx`            | Task 2, Typography Scale                              | Polymorphic via `as`; `Numeric` applies `tabular-nums`                                                                                                                                                                                                                                                                  |
| `Button`                                                        | `button.tsx`                | Task 2, Components → Buttons                          | `variant`: filled / filled-tonal / text. `tone`: default / concern (filled & text only)                                                                                                                                                                                                                                 |
| `StatusPill`                                                    | `status-pill.tsx`           | Task 5 naming (`Badge/StatusPill`); Task 3 Screen 10  | `status`: granted / not-granted / unknown                                                                                                                                                                                                                                                                               |
| `PatternBadge`                                                  | `pattern-badge.tsx`         | Task 5 naming (`Badge/PatternLabel`); Task 3 Screen 8 | Reserved for Scam Warning — the one `concern`-toned badge                                                                                                                                                                                                                                                               |
| `Card`                                                          | `card.tsx`                  | Task 2, Components → Cards / Elevation                | `variant`: filled / outlined. `elevation`: none / level1                                                                                                                                                                                                                                                                |
| `Alert`                                                         | `alert.tsx`                 | Task 2, Error components; Task 3 Screens 2–4          | `tone`: neutral / attention / error — **no `concern` tone**, deliberately (see file JSDoc). **Not currently used by any screen** — permission errors currently surface through `PermissionStatusRow` instead; kept as it's the documented, correct component for a future non-permission error state, per the RC1 audit |
| `PermissionStatusRow`                                           | `permission-status-row.tsx` | Component Inventory; Task 3 Screen 10                 | Label + `StatusPill` + conditional "Fix" action                                                                                                                                                                                                                                                                         |
| `TextField`                                                     | `text-field.tsx`            | Task 2, Components → Text fields                      | Persistent visible label, inline error, helper text                                                                                                                                                                                                                                                                     |
| `ScreenContainer`                                               | `screen-container.tsx`      | Task 3 (screen layouts throughout)                    | `variant`: standard / full-bleed / centered                                                                                                                                                                                                                                                                             |
| `TopAppBar`                                                     | `top-app-bar.tsx`           | Task 3 Screens 7/9/10                                 | Back arrow OR trailing actions, never both per the doc's own screens                                                                                                                                                                                                                                                    |
| `BottomActionBar`                                               | `bottom-action-bar.tsx`     | Task 3 Screens 2–6 pattern                            | Generic pinned-bottom action stack; Scam Warning's specific asymmetric weighting is a future screen-level composition, not hardcoded here                                                                                                                                                                               |
| `SectionHeader`                                                 | `section-header.tsx`        | Task 3 Screen 10 accessibility rule                   | Renders a real heading (`level` prop), not a styled `<span>`                                                                                                                                                                                                                                                            |
| `EmptyState`, `REASSURANCE_EMPTY_COPY`                          | `empty-state.tsx`           | Task 2, Components → Empty states                     | The exported copy constant enforces "identical copy in both locations" (Home + History) by construction                                                                                                                                                                                                                 |
| `Spinner`, `ListRowSkeleton`, `CardSkeleton`                    | `loading.tsx`               | Task 2, Loading indicators                            | `Spinner` is reserved for the one documented "Checking..." case — prefer the skeletons elsewhere                                                                                                                                                                                                                        |
| `StepIndicator`                                                 | `step-indicator.tsx`        | Component Inventory, Onboarding Progress Indicator    | Text only ("Step X of 5") — deliberately not a progress bar                                                                                                                                                                                                                                                             |
| `ListRow`                                                       | `list-row.tsx`              | Task 2, Components → Lists                            | Base two-line list item; `SettingsRow`/`HistoryListItem` build on it                                                                                                                                                                                                                                                    |
| `SettingsRow`                                                   | `settings-row.tsx`          | Task 3 Screen 10                                      | `ListRow` + chevron for navigable settings entries                                                                                                                                                                                                                                                                      |
| `HistoryListItem`                                               | `history-list-item.tsx`     | Component Inventory, History List Item (expandable)   | Fulfills the "Timeline component" milestone objective — see the file's JSDoc for why, and why it is _not_ the deferred Fraud Timeline feature                                                                                                                                                                           |
| `ConfirmDialog`                                                 | `confirm-dialog.tsx`        | Task 2, Components → Dialogs                          | 16dp radius, Level 3 elevation, `destructive` → `concern`-toned confirm button                                                                                                                                                                                                                                          |
| `Toast`                                                         | `toast.tsx`                 | Task 4, Snackbar Behavior                             | Controlled; exact 100ms/75ms/4s timing from the doc, no action button                                                                                                                                                                                                                                                   |
| `FadeThrough`                                                   | `fade-through.tsx`          | Task 4, Navigation Transitions                        | The 200ms default cross-fade — never wrap Scam Warning in this                                                                                                                                                                                                                                                          |
| `CheckmarkDraw`                                                 | `checkmark-draw.tsx`        | Task 3 Screen 6                                       | The singular 400ms exception — Onboarding Complete only                                                                                                                                                                                                                                                                 |

## Guardrails baked into this layer

- **`concern` coloring is exclusive to the live-threat semantic.** Only
  `Button` (`tone="concern"`), `PatternBadge`, and `ConfirmDialog`
  (`destructive`) can render it. `Alert` — the component every
  permission-error/technical-error state will use — cannot, on purpose
  (docs/15: "never using `concern` coloring for a technical error ...
  two states this product must always keep visually distinct").
- **No progress bar exists anywhere.** `StepIndicator` is text-only by
  design; adding a visual track would contradict the frozen spec's
  explicit reasoning ("to avoid implying more steps remain than the
  genuinely short flow has").
- **No bottom sheet component was built.** `docs/15` explicitly reserves
  it for V2 ("Not used anywhere in this MVP's 11 frozen screens") —
  building an unused component now would be exactly the placeholder
  architecture this project's engineering principles warn against.
- **Known contrast gap, not silently fixed:** `StatusPill`'s
  `status="not-granted"` uses `docs/15`'s own specified
  `protectionOff`/`protectionOffContainer` pair, which computes to
  3.03:1 — below the 4.5:1 WCAG AA threshold for the small (14px)
  regular-weight text it's rendered at here (it does pass at Home's
  larger/bold usage of the same pair, and passes the 3:1 non-text/UI
  threshold everywhere). This is a frozen-doc-specified color value, not
  an implementation deviation, so it wasn't changed unilaterally — see
  `docs/reports/release-candidate-1.md` for the full finding and the
  recommended resolution path.
- **Every interactive primitive enforces the 44×44dp minimum tap target**
  (`Button`, `ListRow`'s clickable variant, `TopAppBar`'s back button,
  `PermissionStatusRow`'s Fix action) per `docs/13` §11.
