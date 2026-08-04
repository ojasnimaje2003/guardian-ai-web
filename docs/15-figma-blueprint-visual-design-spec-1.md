# Figma Blueprint — Guardian AI Scam Prevention MVP
### The Complete Visual Design Specification

*Implements the frozen UX Specification (`13-ux-specification-scam-prevention-mvp.md`) and is buildable against the frozen Engineering Specification (`14-engineering-specification-android.md`). No screen, flow, microcopy line, or interaction is introduced here that isn't already in the frozen UX spec — this document adds the visual and motion layer on top of behavior that's already decided, and specifies Material Design 3 mappings with every intentional deviation named and justified, per instruction.*

---

# TASK 1 — Visual Design Strategy

## Design Philosophy

Guardian AI is designed to be **boring on purpose, and unmistakable exactly once.** The app's entire visual job, 99% of the time, is to look calm, trustworthy, and quietly competent while doing nothing visible — and then, in the single moment it matters, to look and feel completely different from everything else on the phone, without ever looking alarmist or cheap. Every visual decision in this document is in service of one of those two states; nothing is designed to be interesting for its own sake.

## Visual Principles

1. **Restraint is the brand, not a constraint on it.** Muted tones, generous whitespace, and minimal ornamentation throughout — closer to Google Wallet's calm card hierarchy than to a typical safety/security app's instinct to look "serious" via dark UI and red accents everywhere.
2. **One moment gets to be loud. Everything else stays quiet.** The Scam Warning screen is visually and motion-wise unlike every other screen in the app — that contrast is the entire point, and it only works if the other 10 screens are genuinely, consistently calm.
3. **Clarity beats cleverness, always, for this user.** No custom gestures, no ambiguous iconography, no information hidden behind a swipe or a long-press — direct visual borrowing from Duolingo's onboarding structure (not its playful tone), where exactly one decision is presented per screen with nothing competing for attention.
4. **Never look more capable than the app actually is.** Visual confidence is calibrated to actual capability (Principle 2 from the frozen strategy) — a status indicator, a permission row, or a warning label never implies certainty or coverage the underlying detection doesn't have.

## Emotional Goals

| Moment | Target feeling |
|---|---|
| First open (Splash, Explainer) | Reassured, not sold to |
| Onboarding (permissions, contact) | Guided, never confused or rushed |
| Home, day-to-day | Quietly confident — "this is working, I don't need to think about it" |
| Scam Warning | Alert and clear-headed — never panicked, never condescended to |
| Alert History (empty) | Reassured, specifically not anxious about an empty list |
| Settings | In control, never buried in options |

## Accessibility Principles

Designed primary-first for an independent, digitally-active senior user (per the frozen persona), not retrofitted for accessibility after the fact:
- Default body text size is already what many apps treat as an "accessibility mode" size — there is no separate "senior mode," because the default *is* the accessible mode.
- Color is never the sole carrier of meaning — every status/warning state pairs color with an icon and a text label.
- No interaction requires more precision or speed than a resting hand can comfortably manage — no timed gestures, no small-target multi-step taps, no reliance on multi-finger gestures anywhere.

## Color Rationale

The existing brand palette (Phase 7 of the original platform design: deep muted teal-green, muted amber, muted red-orange, warm off-white, deliberately **no saturated alarm-red anywhere**) is inherited unchanged as the seed for this MVP's Material 3 color system (full mapping in Task 2). The rationale carries over directly: a product whose job is to prevent panic-driven mistakes should not itself be a source of visual panic, even at its single highest-stakes screen. This is a deliberate departure from most security-product visual convention, which leans on red/black urgency cues — Guardian AI's target user (an older adult mid-scam-call) is better served by a system that reads as calm authority, not alarm.

## Typography Rationale

Larger-than-typical default body text (an inherited, unchanged decision) is a primary design driver, not an accommodation — the single most consequential piece of text in the entire app (Scam Warning's one-sentence explanation) must be legible at a glance, under stress, by a user who may not have reading glasses at hand. Every other typographic decision in Task 2 is subordinate to that constraint.

## Motion Philosophy

Motion communicates *meaning*, not *personality*. Ten of eleven screens share one calm, low-emphasis motion language (Task 4). The eleventh (Scam Warning) breaks that language completely and instantly — no transition at all, just immediate presence — because the single moment motion needs to communicate urgency is exactly the moment a typical app would reach for a flashy animation, and that instinct is wrong here: speed of arrival, not decorative motion, is what communicates urgency without inducing panic.

## Iconography Philosophy

A small, custom icon set only where a generic system icon would misrepresent the product's behavior (inherited directly from the original platform's reasoning) — specifically the Status Card's protection states and the Scam Warning pattern badge. Everywhere else (settings gear, history, contact, back arrow), standard Material Symbols are used without modification, because novelty icons for familiar concepts add relearning cost with no benefit to this user.

---

# TASK 2 — Design System

## Color Palette (Material 3 mapping)

Material 3's role-based color system (primary/secondary/tertiary, each with a container pairing, plus surface and outline roles) is used as the structural framework, seeded from the inherited brand teal-green. **Deviation from default MD3:** standard MD3 typically defines a single `error` role; this product's alert semantics require three distinct tiers (calm / attention / concern) plus a fourth configuration-state tier (protection off), so three **custom extended color roles** are defined alongside the standard MD3 roles — this is an explicitly supported MD3 extension pattern (Material Theme Builder's "custom colors"), not an ad hoc departure from the system.

| MD3 role | Hex (seed/derived) | Usage |
|---|---|---|
| `primary` | `#2E5D4E` (inherited brand teal-green) | App bar, primary buttons (filled), Status Card "active" state, brand touchpoints |
| `onPrimary` | `#FFFFFF` | Text/icons on primary-filled surfaces |
| `primaryContainer` | `#CFE8DC` (light tonal derivation of primary) | Filled-tonal button backgrounds, Status Card "active" background |
| `onPrimaryContainer` | `#0A2A20` | Text/icons on primaryContainer |
| `surface` | `#FAF9F6` (inherited warm off-white — deliberately not pure white, per original rationale) | Screen backgrounds |
| `onSurface` | `#1C1E1F` (inherited neutral-ink) | Primary body text |
| `surfaceVariant` | `#EDEAE3` | Card backgrounds one step above the base surface (History rows, Settings rows) |
| `outline` | `#79747E` (MD3 default-derived) | Text field borders, dividers |
| **Custom: `attentionContainer`** | `#F3E1C4` / text `#5C3F0A` | "Unusual, worth a look" tier — not used at MVP's single-pattern scope but reserved (V2's second detection pattern will need a lower-severity tier) |
| **Custom: `concern` / `concernContainer`** | `#A6473A` / `#F6DFDA` | Scam Warning's pattern label and primary action — muted red-orange, explicitly **not** MD3's default saturated error red |
| **Custom: `protectionOff` / `protectionOffContainer`** | `#B8791E` (reusing the inherited `color.attention` amber) / `#F6E9D4` | Home's "Protection is off" state — deliberately distinct from `concern`, since a configuration issue is not a live threat and must never share visual language with one |

## Typography Scale (Material 3 mapping)

| Our token | MD3 nearest role | Size / Line-height / Weight | Deviation from MD3 default |
|---|---|---|---|
| `type.display` | Headline Medium | 28sp / 36 / **Semi-Bold** | MD3 default headline weight is Regular; bumped to Semi-Bold for scanability at a glance — used only for Splash and Onboarding Complete |
| `type.heading` | Title Large | 20sp / 28 / **Semi-Bold** | Same rationale as above — used for section headers ("Recent Activity," Settings section labels) |
| `type.body-large` | *Between* Body Large and Title Medium (custom step) | 18sp / 26 / Regular | MD3's Body Large (16sp) doesn't hit the accessibility bar this product sets as its default, not its maximum — a deliberate custom intermediate step, used for Scam Warning's explanation text and all primary reading content |
| `type.body` | Body Large | 16sp / 24 / Regular | Direct MD3 alignment — standard UI text, list items, settings rows |
| `type.caption` | Body Medium | 14sp / 20 / Regular | Direct MD3 alignment — timestamps, secondary metadata |
| `type.numeric` | Custom utility (not an MD3 role) | 18–28sp / Semi-Bold, **tabular figures** (`font-feature-settings: 'tnum'`) | MD3 has no dedicated numeric/tabular variant — used for History timestamps where digit-width jitter would look sloppy |

Font family: system default (Roboto Flex or the device's system font) — no custom typeface licensing/loading cost for a one-engineer build, and Android users' system font is already the most legible choice for their specific device/accessibility settings.

## Spacing System

8dp base unit, inherited unchanged: `space.xs`=4, `space.sm`=8, `space.md`=16, `space.lg`=24, `space.xl`=32, `space.xxl`=48. Content max-width 360dp on any single column even on larger phones, keeping `body-large` line lengths comfortable.

## Corner Radius (Material 3 Shape mapping)

| Token | Value | MD3 shape scale equivalent | Deviation |
|---|---|---|---|
| Buttons | 8dp | Closer to MD3's "Small" shape token | **Deliberate deviation from MD3 default**, which specifies a fully-rounded (pill/stadium) shape for filled buttons. A pill shape reads as casual/playful, appropriate for consumer social apps — this product's calm, serious positioning uses a more restrained, less playful geometry instead, consistent with the "no celebratory motion" decision elsewhere |
| Cards | 12dp | MD3 "Medium" | Direct alignment |
| Modals/Dialogs | 16dp | MD3 "Large" | Direct alignment |
| Scam Warning (full-bleed) | 0dp (edge-to-edge) | Not applicable — full-screen Activity, not a floating surface | N/A |

## Elevation

MD3's tonal-elevation approach (surface color shift, not heavy drop shadow) is used throughout, matching the calm/restrained aesthetic:
- Level 0 (no elevation): screen backgrounds, Scam Warning (full-bleed, no card metaphor — it *is* the screen).
- Level 1: Status Card, History list items, Settings rows — a subtle surface-tint lift only, no visible shadow.
- Level 3: Dialogs (the "Remove emergency contact?" confirmation) — MD3's standard modal elevation, the one place a visible shadow is appropriate, since a dialog needs to read as clearly above the page.

## Components

**Buttons** — three emphasis tiers used deliberately, mapped to the frozen UX spec's own described emphasis levels:
- *Filled* (MD3 Filled Button, 8dp radius per deviation above): highest emphasis — "Get started," "End the call now" (using `concernContainer`/`concern` coloring specifically on Scam Warning), "Save," "Continue."
- *Filled Tonal* (MD3 Filled Tonal Button): medium emphasis — "Notify [Contact Name]" on Scam Warning, "Choose from contacts."
- *Text Button* (MD3 Text Button): lowest emphasis — "This is fine — I know this person," "Not now," "Skip for now." Deliberately the smallest, least visually prominent tier, per the frozen UX spec's explicit instruction that dismissal must remain honestly available without ever looking like the recommended path.

**Text fields** — MD3 Outlined Text Field (not Filled) throughout, chosen for better contrast/legibility across the app's warm off-white background than MD3's Filled variant, which relies on a filled background tone that would compete with the surface color. Used for Name and Phone Number (Set/Edit Emergency Contact).

**Cards** — MD3 Filled Card as the default (Status Card, History rows) — not Elevated Card, keeping shadow use minimal per the elevation philosophy above; MD3 Outlined Card used only for the (rare) Data-unavailable/error variant of the Status Card, where a visible border helps it read as distinct from the normal filled state without needing a jarring color change.

**Bottom sheets** — **Not used anywhere in this MVP's 11 frozen screens.** Specified here per instruction as a reserved, ready component (MD3 Modal Bottom Sheet, 16dp top corner radius, standard scrim) for V2 scope (e.g., selecting among multiple emergency contacts) — flagged explicitly rather than inventing a use for it now, since introducing a new interaction pattern not in the frozen UX spec would violate the "maintain complete consistency with the frozen MVP" instruction.

**Dialogs** — MD3 Basic Dialog, used exactly once: the "Remove emergency contact?" confirmation (frozen UX spec, Screen 5/11 edge case). Two actions (Cancel — Text button; Remove — Filled button in `concern` coloring, since this is a meaningful, if reversible, action worth a moment's pause).

**Lists** — MD3 List Item, two-line variant: Alert History rows (date/pattern label as line one, action-taken as line two) and Settings rows (label as line one, current value/status as line two where applicable, e.g. permission status).

**Status indicators** — the Status Card (Home) is a custom composition (MD3 has no dedicated "status hero" component) built from a Filled Card + a custom icon + `type.heading` label + `type.body` supporting line — explicitly documented as custom rather than force-fitting an ill-suited MD3 primitive.

**Warning components** — Scam Warning's pattern-label badge and three-action stack are custom compositions, following MD3's color/typography token system precisely (so they feel native to the rest of the app) while deliberately not resembling any standard MD3 component (Banner, Snackbar, Dialog) — none of which are designed for a full-screen, non-dismissible, maximum-priority interrupt, which is closer in spirit to Android's own system-level incoming-call UI than to any app-level MD3 pattern.

**Empty states** — a simple, custom composition (icon + `type.body-large` reassurance copy, no illustration asset needed for MVP) used identically on Home's condensed strip and Alert History (frozen UX spec's explicit instruction that the copy match verbatim in both places).

**Loading indicators** — skeleton/shimmer placeholders (custom, matching final content shape) as the default pattern for any content load, inherited unchanged from the original platform's "never a full-screen spinner" rule; MD3's Circular Progress Indicator is reserved only for the brief, single-element "Checking..." wait state on the Accessibility Service permission screen, where a skeleton has nothing meaningful to mimic the shape of.

**Error components** — a custom Error Card (Filled Card in a neutral, non-alarming tone + icon + specific message + named retry action) used for the Data-unavailable-equivalent states; never a generic system error dialog, and never using `concern` coloring for a technical error (which would visually conflate "something's broken" with "you might be getting scammed" — two states this product must always keep visually distinct).

---

# TASK 3 — Screen-by-Screen Visual Specification

*Behavior, exact microcopy, and states are already fully specified in the frozen UX doc (§4) and are not repeated verbatim here — this section adds the visual layer: layout grid, component choices, and how each state actually looks.*

## Screen 1 — Splash / Welcome
**Layout:** Single-column, vertically centered composition on a `surface` background. Logo mark centered at roughly 30% from top; `type.display` headline directly below with `space.lg` gap; primary Filled button pinned `space.xl` from the bottom safe area, full content-width minus `space.lg` margins each side.
**Component hierarchy:** Background (surface) → centered logo asset → headline text block → primary button.
**Responsive behavior:** Portrait-only for MVP (a deliberate simplification, consistent with reducing scope — this is a phone-call-context app, and portrait covers the overwhelming majority of real usage); on larger phone displays, the same composition simply gains more top/bottom breathing room rather than restructuring.
**States:** Single state only — no loading/error/empty applicable.
**Motion:** 200ms standard fade-in on load (MD3 Standard easing, not Emphasized — see Task 4).
**Accessibility:** Logo marked as decorative (no content description needed); headline and button both individually focusable in reading order.

## Screens 2–4 — Onboarding Explainer & Permission Grants
**Layout:** Shared template across all three: top-anchored step indicator ("Step X of 5," `type.caption`, `onSurfaceVariant` color) → `type.heading` screen title → one or two explanation card(s) (Filled Card, `surfaceVariant` background, icon + `type.heading` micro-label + `type.body` description, expandable on Screen 2 per the frozen UX spec) → primary action pinned to bottom, secondary/skip action as a Text button directly above it.
**Component hierarchy:** Step indicator → title → card(s) → button stack.
**Responsive behavior:** Cards use Auto-Layout "fill container width, hug height" so expanded card content never clips at 200% font scale (directly serving the accessibility principle above).
**States:** Screen 3/4 each have the frozen UX spec's specific loading ("Checking...") and error (permanently-denied / not-yet-granted) states — visually, the error state swaps the primary button's action and adds a small warning-toned inline text row (using `attentionContainer` coloring, not `concern` — a permission not yet granted is not the same severity as a live scam) above the button.
**Motion:** Standard 200ms screen transitions between steps; the step indicator's number cross-fades rather than sliding, keeping motion minimal.
**Accessibility:** Step indicator announced first ("Step 2 of 5"), then title, then card content in document order.

## Screen 5 / 11 — Set / Edit Emergency Contact
**Layout:** `type.heading` headline → Outlined Text Field (Name) → `space.md` gap → Outlined Text Field (Phone) → Filled Tonal "Choose from contacts" button directly below the phone field → `type.caption` explanation line → primary Filled "Save" button pinned bottom.
**Component hierarchy:** Headline → field group → contacts-picker shortcut → explanation → save button.
**Responsive behavior:** Fields use fill-width Auto Layout; save button disabled state (per frozen UX spec) rendered as 60% opacity per the inherited disabled-state rule (Task 2 reference), not fully hidden.
**States:** Empty (onboarding, both fields blank with placeholder examples) vs. pre-filled (edit mode) — both use the identical component, differing only in initial field values, per Auto Layout best practice (one component, data-driven, not two designs).
**Motion:** Standard transitions; Save button's enabled/disabled cross-fade is 100ms (MD3 "short1" token), fast enough not to feel laggy as the user finishes typing.
**Accessibility:** Both fields have persistent visible labels (not placeholder-only), satisfying the frozen UX spec's explicit accessibility requirement.

## Screen 6 — Onboarding Complete
**Layout:** Centered checkmark icon (custom, in `primaryContainer` circular badge) → `type.display` reassurance headline → primary Filled "Done" button.
**Component hierarchy:** Icon badge → headline → button.
**States:** Single state.
**Motion:** The one deliberate exception to the 200ms cap — a restrained checkmark-draw animation at 400ms (MD3 "medium2" duration token), justified as a one-time completion moment, explicitly not a bounce/confetti pattern.
**Accessibility:** Full headline read on screen entry before requiring interaction.

## Screen 7 — Home
**Layout:** Top app bar (MD3 Center-Aligned or Small Top App Bar — recommend **Small Top App Bar, left-aligned title**, since a centered title reads slightly more formal/branded than this quiet-utility screen needs) with logo/title left, History icon and Settings icon right, `space.md` apart. Below the app bar: Status Card (Filled Card, full-width minus `space.lg` margins, occupying roughly 35–40% of screen height — the clearly dominant element) → `space.lg` gap → condensed Recent Activity section (`type.heading` label + up to 2 History-style rows, or the Empty-state composition).
**Component hierarchy:** App bar → Status Card → Recent Activity section.
**Responsive behavior:** Status Card height is content-driven (hug), not fixed, so it accommodates the rare error-state's extra text without clipping.
**States:** Active (Filled Card, `primaryContainer` tone, custom shield-check icon), Off (Filled Card, `protectionOffContainer` tone, custom shield-alert icon, "Fix this" Filled Tonal button inline within the card), Unknown/error (Outlined Card variant, neutral tone, custom shield-question icon).
**Motion:** Status Card cross-fades between states (200ms, Standard easing) — never a jarring instant swap, since this state can change based on a background check the user didn't directly trigger.
**Accessibility:** Status Card's full state (icon meaning + text) announced as one unit before the app bar icons, per the frozen UX spec.

## Screen 8 — Scam Warning
**Layout:** Full-bleed, no app bar, no back button, no status-bar chrome treated as "away" — this screen owns the entire display including behind the system status bar (edge-to-edge). Top third: pattern-label badge (custom pill-shaped badge — the one place a fuller rounding is appropriate, since this is a status badge, not a button, and MD3 badges are conventionally pill-shaped) in `concernContainer` tone + icon. Middle: `type.body-large` explanation sentence, then `type.body` context detail line, generously spaced (`space.xl` above and below) so nothing feels cramped under stress. Bottom: three-action vertical stack, **not evenly spaced** — "End the call now" (Filled, `concern` color, full-width, tallest button in the entire app — a deliberate, singular exception to standard button height, since this is the single highest-stakes tap in the product) → `space.md` → "Notify [Contact]" (Filled Tonal, full-width, standard height) → `space.lg` (larger gap, deliberately separating it from the two primary actions above) → "This is fine" (Text button, smaller, bottom-most).
**Component hierarchy:** Pattern badge → explanation block → context line → action stack (asymmetric).
**Responsive behavior:** Locked portrait; content vertically distributes with flexible spacing (not fixed pixel gaps) so it reflows correctly at 200% font scale without the action stack being pushed off-screen — validated specifically per the frozen UX spec's instruction that this screen be tested at maximum font scale before any other.
**States:** Default (as above); Notify-sent (inline confirmation row appears directly beneath the Notify button — `type.caption`, checkmark icon, no screen transition); Notify-failed (same slot, `attentionContainer`-toned inline row with the specific retry message); Call-ended-during-warning (End Call button replaced by an inert "Got it" acknowledgment, per frozen UX spec edge case).
**Motion:** **Zero entrance transition** — the screen is simply present the instant it's triggered, the single largest, most deliberate departure from every other screen's motion language in this document.
**Accessibility:** Full content (badge label + explanation + context line) announced automatically via a live-region/`announceForAccessibility` call the instant the screen appears — the only screen in the app where read-aloud is not opt-in.

## Screen 9 — Alert History
**Layout:** Top app bar (back arrow + "Alert History" title) → reverse-chronological List (MD3 two-line List Items, divided by a hairline `outline`-colored divider, not card-separated — a plain list reads appropriately lower-ceremony for a history log than individually elevated cards would).
**Component hierarchy:** App bar → List.
**States:** Populated list; Empty state (centered composition, matching Home's condensed strip copy verbatim); Loading (list-shaped skeleton rows).
**Motion:** Row expand/collapse at 200ms (Standard easing, height + opacity animating together, not a hard cut).
**Accessibility:** Each row a single announced unit (frozen UX spec requirement) — implemented via a single `mergeDescendants` semantics node per row in the eventual Compose build, noted here for the designer's awareness of how the visual grouping should map to a single accessible unit.

## Screen 10 — Settings
**Layout:** Top app bar (back arrow + "Settings" title) → grouped MD3 List sections with `type.heading` section labels ("Emergency Contact," "Permissions," "Accessibility," "About & Privacy"), `space.lg` between section groups, `space.sm` between rows within a group.
**Component hierarchy:** App bar → four labeled list-item groups in the fixed order specified by the frozen UX spec.
**States:** Permission rows carry their own inline state — a small status chip (custom, pill-shaped, `primaryContainer` "Granted" or `protectionOffContainer` "Not granted") trailing each Permissions row.
**Motion:** Standard transitions; a Snackbar (see Task 4) surfaces after returning from Edit Emergency Contact.
**Accessibility:** Section headers announced as headings (not plain rows), per the frozen UX spec.

---

# TASK 4 — Prototype Interactions

## Navigation Transitions
Standard screens (all except Scam Warning) use MD3's **Standard easing curve**, not Emphasized — Emphasized is MD3's default recommendation for most transitions, but its more expressive deceleration reads as slightly more "energetic" than this product's calm tone wants; Standard easing is used everywhere for consistency and restraint. Duration: **200ms (MD3 "short4" token)** for all screen-to-screen transitions, using a simple fade-through (content cross-fades, no shared-axis slide) — a slide implies spatial navigation depth this shallow, single-stack app doesn't have.

## Shared Element Transitions
Deliberately **not used** anywhere in this MVP. Shared-element/container-transform patterns (an MD3-recommended technique) are reserved for moments where a specific element visibly persists between two screens with a clear before/after relationship (e.g., a list item expanding into a detail screen) — this app's one candidate for that pattern, Alert History, uses an **inline expand** instead precisely so no separate detail screen or shared-element transition is needed at all, keeping this simpler than the pattern would otherwise require.

## Gesture Interactions
Standard Android back gesture/button supported on every screen except Scam Warning (explicitly intercepted, per frozen UX spec — no gesture dismisses it). Tap-to-expand on Alert History rows. No swipe actions, no long-press menus, no drag-and-drop anywhere in this app — each of these was considered and deliberately excluded as unnecessary interaction surface for the frozen scope.

## Bottom Sheet Behavior
Not used in MVP (Task 2). If implemented for V2, standard MD3 modal bottom sheet behavior applies: scrim-dimmed background, drag-handle affordance, dismiss via downward drag or scrim tap, `250ms` (MD3 "medium1") open/close duration.

## Snackbar Behavior
One use in the entire app: the "Emergency contact updated" confirmation (Task 2/Screen 10), appearing at the bottom of the Settings screen after a save. MD3 standard Snackbar: single line, no action button (nothing to undo — the frozen UX spec doesn't specify an undo path), auto-dismiss after **4 seconds**, `100ms` slide-up entrance / `75ms` fade-out exit (MD3 default Snackbar timing).

## Permission Flows
The system permission dialog (Phone State, Screen 3) is OS-rendered and outside this document's design control — the app-side screen is a static context frame the system dialog appears over; no custom design is applied to the dialog itself, and none should be attempted (a common mistake is trying to "skin" a system permission dialog, which Android does not support and which would look inconsistent if faked). Screen 4's Settings hand-off similarly exits the app's visual context entirely — the return transition (app resuming) uses the same 200ms standard fade as any other screen resume, with no special "welcome back" treatment.

## Notification Interactions
- **Scam Warning notification:** status-bar icon is a simple monochrome silhouette (per Android's notification icon requirements — no color, no gradient), tapping the full-screen-intent notification (if it was ever reduced to a heads-up state rather than a true full-screen launch, per the engineering spec's fallback path) re-opens Scam Warning exactly as if freshly triggered.
- **Permission-health notification:** standard heads-up notification, title + one-line body matching Settings' permission-row copy, tapping it opens Settings directly to the relevant Permissions row (not just Settings' top level).

## Haptic Feedback

| Moment | Haptic |
|---|---|
| Standard button taps (Save, Continue, Done) | Light tap (`HapticFeedbackConstants.VIRTUAL_KEY`-equivalent) |
| Successful permission grant (Screens 3/4) | Confirm-pattern haptic (`CONFIRM` constant) |
| **Scam Warning appearance** | A distinct, stronger custom vibration waveform, reserved exclusively for this moment, deliberately different from every other haptic in the app so the user learns to associate this specific pattern with "this matters right now" (per the frozen UX/engineering specs) |
| All other interactions (list expand, settings toggles) | No haptic — reserved for moments that matter, not applied indiscriminately |

## Animation Durations & Easing (Material 3 tokens)

| Token | Duration | Easing | Used for |
|---|---|---|---|
| `short1` | 50ms | Standard | Micro-feedback (button press state) |
| `short2` | 100ms | Standard | Field enabled/disabled cross-fades |
| `short4` | 200ms | Standard | **Default for all screen transitions and state cross-fades** |
| `medium1` | 250ms | Standard | (Reserved for V2 bottom sheet open/close) |
| `medium2` | 400ms | Standard, decelerate | Onboarding Complete's checkmark draw (the one non-instant exception outside the 200ms default) |
| **Instant (0ms)** | — | — | **Scam Warning's entrance — the singular, deliberate departure from every duration token above** |

Standard (not Emphasized) easing is used at every single duration token in this app — a consistent, deliberate, documented departure from MD3's own default recommendation, in service of the calm/restrained visual philosophy stated in Task 1.

---

# TASK 5 — Figma Handoff

## Page Structure
```
📄 Cover & Overview           — project summary, links to frozen strategy/UX/engineering docs
🎨 Foundations                — Color, Type, Spacing, Shape, Elevation (Task 2, as Figma Styles + Variables)
🧩 Components                 — the full component library (buttons, fields, cards, list items, dialogs, badges)
🟢 01–06 Onboarding           — Splash through Onboarding Complete
🏠 07–09 Core                 — Home, Scam Warning, Alert History
⚙️ 10–11 Settings             — Settings, Edit Emergency Contact
🔔 System & Notifications     — notification mockup frames (status bar + lock screen reference frames), for stakeholder review only, not implemented as-is (system UI is OS-rendered)
🔗 Prototype                  — a dedicated flow-map frame documenting every prototype connection, plus the wired, click-through prototype itself living on the screen frames above
```

## Frame Naming Convention
`[screen-number]-[ScreenName]/[State]` — e.g. `07-Home/Active`, `07-Home/ProtectionOff`, `07-Home/Unknown`, `08-ScamWarning/Default`, `08-ScamWarning/NotifySent`, `08-ScamWarning/NotifyFailed`, `08-ScamWarning/CallEnded`, `05-EmergencyContact/Onboarding-Empty`, `11-EmergencyContact/Edit-Prefilled`. The slash groups states as Figma variants of one frame family, not disconnected, independently-named frames.

## Component Naming Convention
Mirrors MD3's own naming so the library reads consistently with any designer's prior MD3 experience: `Button/Filled`, `Button/FilledTonal`, `Button/Text`, `TextField/Outlined`, `Card/Filled`, `Card/Outlined`, `List/TwoLine`, `Dialog/Basic`, `Badge/StatusPill`, `Badge/PatternLabel` (the one custom, non-MD3-standard component, named distinctly so it's never mistaken for a standard MD3 Badge in the library panel).

## Auto Layout Strategy
Every component and screen frame is built with Auto Layout, never fixed-position elements — this is not a Figma-hygiene preference but a direct requirement of the accessibility principle (200% font scale support): text-containing frames are set to **Fill container (width) / Hug contents (height)**, so growing text pushes the layout taller rather than clipping or overlapping. Padding and gap values are set exclusively from the 8dp spacing scale (Task 2) — no arbitrary pixel values anywhere in the file.

## Variables
Figma Variables (not static Styles alone) are used for every color, spacing, and radius token defined in Task 2, organized into three collections — **Color**, **Spacing**, **Shape** — with variable names matching the engineering spec's token names exactly (e.g., the Figma variable `color/primary` corresponds 1:1 to the Compose theme's `MaterialTheme.colorScheme.primary`, and `color/concern` to the custom extended color role defined in the engineering spec), so a Dev Mode handoff produces values an engineer can paste directly into the app's theme definition without a translation step. Using Variables rather than only Styles also means a future dark-mode or V2 rebrand is a mode/collection swap, not a rebuild — deliberately cheap for later, per the same extensibility discipline the engineering spec applied to code.

## Styles
Text Styles for every row in Task 2's type scale table; Effect Styles for the two elevation levels actually used (Level 1 tonal lift, Level 3 dialog shadow); no Grid Styles beyond the single content-max-width constraint, given this app's simple single-column layout throughout.

## Prototyping Links
The click-through prototype wires exactly the Navigation Map already defined in the frozen UX spec (§2) — no additional connections are invented. One prototyping note specific to this app: **Scam Warning cannot be triggered in a Figma prototype the way it's triggered on-device** (a real full-screen-intent notification interrupt has no Figma equivalent). Recommend wiring a hidden "Simulate Detection" hotspot on the Home frame (visible only in prototype/review mode, clearly labeled as a stakeholder-review aid, never part of the shipped design) that opens `08-ScamWarning/Default` as a full-screen overlay transition — this lets reviewers experience the actual moment the product exists for, without misrepresenting it as a normal in-app navigation action a real user would take.
