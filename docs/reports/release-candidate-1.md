# Release Candidate 1 (RC1)
### Guardian AI Web Prototype — Production-Readiness Audit

*No new product features, no redesign. Every fix in this report is
either (a) removal of code/files with zero references anywhere in the
app, or (b) a narrowly-scoped, objectively-verifiable correctness fix
(duplicate heading elements). Findings that require a subjective design
call or would touch the frozen docs' own specified values are reported,
not silently resolved.*

---

## 1. Executive Summary

The app was functionally complete and polished after Milestone 6. This
audit found the codebase in genuinely good shape — the design-token
system had zero raw-value violations, comments were already
well-calibrated, and there were no debug artifacts, `console.*` calls,
`any` types, or TODO markers anywhere. The real findings were:
**dead code** (an entire unused shadcn primitive layer, an unused
constants module, unused mock data/types, two unused component exports),
**two genuine accessibility bugs** (duplicate `<h1>` elements on two
screens), and **one accessibility finding that traces back to the frozen
docs' own specified color values**, reported rather than silently
patched. All objectively-fixable items are fixed; everything else is
documented below for a human decision.

---

## 2. Dead Code & Unused Components (Objectives 3–4)

### Removed (zero references anywhere in the app, verified by grep + a clean build after removal)

| Removed | Why |
|---|---|
| `src/components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `sheet.tsx` | Milestone 2 built bespoke, docs-traced replacements in `design-system/` for every one of these and never extended the originals in place (a deliberate architecture decision, documented in the Milestone 2 report) — the consequence, never previously audited, is that these 8 files had zero importers anywhere in the running app. `ui/skeleton.tsx` is the one exception — it's genuinely used, wrapped by `design-system/loading.tsx` — and was kept. |
| `src/components/design-system/motion.ts` (`MOTION`, `EASE_STANDARD`) | A documentation-only constants module; every component always used raw Tailwind `duration-*` classes directly instead (as the module's own comment already said was the plan), so nothing ever imported it. |
| `CardHeading`, `CardSupportingText` (exports from `card.tsx`) | Zero call sites — every screen using `Card` composes `Typography` components directly inside it instead. |
| `mockAlertHistory`, `mockPermissionsSnapshot`, `mockAccessibilityPrefs` (`data/mock-data.ts`) | Built in Milestone 1 as foundation-layer sample data before real screens existed; superseded by the real `AppState`-backed data (Milestone 3/5) and never referenced afterward. |
| `PermissionsSnapshot`, `AccessibilityPrefs`, `ProtectionStatus` (`data/types.ts`) | Unused types — `AppState`/`deriveProtectionStatus` (`lib/app-state.tsx`) define their own inline shapes instead of importing these; `ProtectionStatus` additionally included an `"unknown"` value that's honestly documented elsewhere as unreachable in this simulated environment, so keeping it was actively slightly misleading, not just unused. |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default `create-next-app` template assets from the original Milestone 1 scaffold, orphaned the moment the placeholder homepage that referenced them was replaced. |

### Identified but deliberately kept (not dead code — reported for a decision, not deleted)

- **`Alert` component (`design-system/alert.tsx`)** — fully built, docs-traced, and exported, but no current screen calls it (permission-error states currently go through `PermissionStatusRow` instead). Unlike the items above, this has a legitimate future call site the frozen docs describe (a non-alarming technical-error state), so it wasn't deleted — flagged in the design-system README instead. A human should decide whether an unused-but-correct library component is worth keeping for a portfolio review (arguably yes — it demonstrates the full system was built) or should be removed for leanness; that's a judgment call, not an objective one.

### Verification

Both removals were confirmed safe the same way: `grep` across `src/` for every import path before deleting, then a full `format` → `lint` → `build` cycle after, all clean. Total: **16 files removed**, zero behavior change (the build's route table, page content, and route count are identical before and after).

---

## 3. Accessibility Issues (Objective 6)

### Fixed: duplicate `<h1>` on two screens

`TopAppBar` always renders its `title` prop as a real `<h1>`. Two screens
*also* rendered their own `Heading as="h1"` in the body, giving those
pages two top-level headings — a real, objective violation of "one `h1`
per page" (confuses heading-based screen-reader navigation; multiple h1s
with *different* text is a standard accessibility-linter flag, not a
style nitpick):

- **`/demo`** — TopAppBar's "Demo Mode" *and* a body heading "Watch
  Guardian AI catch a scam call." Fixed: body heading is now `h2`.
- **`/onboarding/contact` in edit mode only** — TopAppBar's "Emergency
  Contact" *and* the body's "Who should we notify..." heading. Fixed:
  the body heading is `h2` specifically in edit mode (where TopAppBar is
  present) and stays `h1` in first-time onboarding mode (where there's
  no TopAppBar, so it's correctly the page's only heading). Verified by
  fetching both rendered pages and counting `<h1>` tags: `1` in both
  cases, both modes.

This is a pure semantics fix — `Heading`'s `as` prop only changes the
HTML tag, not its visual styling, so nothing looks different.

### Verified clean (checked, not assumed)

- **Every icon usage in the app** (18 call sites across all screens and
  design-system components) carries `aria-hidden` — confirmed by
  grepping every Lucide icon component tag in the codebase, not spot-
  checked.
- **No color-only status indicators** — `StatusPill`, the Home status
  card, and `PatternBadge` all pair color with an icon and/or text label
  everywhere they're used.
- **No `text-border` (or other non-text token) misuse** — the `outline`/
  border color is never applied to text anywhere.

### Found, not fixed: a contrast value that traces back to the frozen docs

Computed WCAG 2.1 contrast ratios for every color pair actually used in
the app (relative-luminance formula, not eyeballed):

| Pair | Ratio | Verdict |
|---|---|---|
| `protection-off` on `protection-off-container` | **3.03:1** | Fails AA for normal text (needs 4.5:1); passes AA for large/bold text and the 3:1 non-text-UI threshold |
| Every other token pair in the app (13 checked) | 4.32:1–15.89:1 | All pass their applicable threshold |

This pair is `docs/15` Task 2's own specified hex values
(`#B8791E`/`#F6E9D4`, "reusing the inherited `color.attention` amber").
Two places use it:
- **Home's "Protection is off" card** — the text is rendered at
  `type.heading` (20px) **bold**, which qualifies as WCAG "large text"
  (≥18.66px bold) — the 3.03:1 ratio *passes* at that size.
- **`StatusPill`'s "Not granted" label** (Settings' permission rows) —
  rendered at `type.caption` (14px) medium-weight, which does **not**
  qualify as large text — the same 3.03:1 ratio **fails** here.

**Not changed, on purpose:** the color values are the frozen spec's own
numbers, not an implementation choice — per this project's standing rule
(established since the very first session) that docs/12–15 conflicts get
surfaced for explicit sign-off, never silently patched. Recommended
resolution paths, for a human to choose between: (a) product/design
signs off on a darker `protectionOff` value that still reads as the same
amber but clears 4.5:1 at small sizes, or (b) `StatusPill` is changed to
render its label at a size/weight that qualifies as WCAG large text
(implementation-only, but changes the pill's visual size, which is why
it wasn't done unilaterally either).

---

## 4. Responsive Issues (Objective 7)

No new issues found beyond what Milestone 6 already fixed (the
`ScreenContainer` phone-canvas treatment and the `full-bleed` pages'
`min-h-screen` → `flex-1` fix). Re-verified this audit:

- 200% font-scaling reasoning re-checked against the Milestone 6 fixed-
  height desktop canvas (`sm:h-[48rem] sm:overflow-y-auto`): at large
  zoom, content that no longer fits becomes scrollable within the canvas
  rather than clipping or overlapping — WCAG 1.4.10 (Reflow) explicitly
  permits vertical scrolling as a valid outcome, so this degrades
  correctly, not incorrectly.
- Mobile behavior (below the `sm:` breakpoint) is untouched by any
  Milestone 6 or RC1 change — confirmed by re-reading `ScreenContainer`
  and grepping for any remaining bare (non-`sm:`-prefixed) fixed-height
  class that could affect it. None found.
- As in every prior milestone, this was verified by CSS/HTML reasoning
  and rendered-output inspection, not a real browser at real viewport
  widths — no browser automation tool has been available in any session
  this project has run. This remains the single largest gap between
  "verified" and "visually confirmed" in this whole audit — see the
  manual QA checklist (§8) for what a human pass should specifically
  check.

---

## 5. Unnecessary Complexity (Objective 5)

Reviewed the state machines and branching logic most likely to have
accumulated incidental complexity (the onboarding repair-mode branching,
`RouteTransition`, the Scam Warning action/resolution flow). None were
simplified — in each case the branching reflects genuine, documented
product complexity (two distinct entry points with different exit
behavior; docs/13's own multi-state screens), not accidental complexity
introduced along the way. The one real complexity finding was the dead
`ui/` layer itself (§2) — a second, fully-built, entirely-unused
component system sitting alongside the real one is exactly the kind of
"unnecessary complexity" this objective is asking about, and it's now
gone.

---

## 6. Production Readiness (Objective 1)

- **No debug artifacts:** zero `console.*` calls, zero `debugger`
  statements, zero `TODO`/`FIXME`/`HACK` markers anywhere in `src/`.
- **No unsafe types:** zero `any` usages anywhere in `src/`.
- **No environment variables:** the app reads zero `process.env` values
  — nothing needs to be configured in Vercel's project settings for this
  to run.
- **Metadata:** `title`/`description` set in `layout.tsx`; favicon is
  served automatically via the App Router's `src/app/favicon.ico`
  convention (no explicit code needed).
- **One flagged, evidence-based risk, not changed:** `package.json`'s
  `build` script uses `next build --turbopack`. This has produced a
  clean, successful build in every one of this project's six prior
  milestones plus this one — real, repeated evidence it works for this
  codebase — but Turbopack production builds are newer than Turbopack
  dev and worth knowing about if a Vercel build ever behaves
  unexpectedly. Mitigation, if ever needed: drop `--turbopack` from the
  `build` script (`next build`) — no other change required.

## 7. Performance (Objective 8)

- Bundle sizes are already small and consistent across all 12 routes
  (128–152kB First Load JS; the outlier, `/onboarding/contact` at
  152kB, is explained by that screen's real complexity — form
  validation, edit/remove flow, `ConfirmDialog` — not bloat).
- No images are used anywhere in the app (icons are all inline SVG via
  `lucide-react`), so Next's image-optimization pipeline has nothing to
  do here — not a gap, just not applicable.
- No custom webfont is loaded (a docs/15-driven decision from Milestone
  1) — the system font stack has zero network cost.
- Removing the 8 dead `ui/` files (§2) measured a small (~3kB) First
  Load JS reduction on rebuild. Given these files had zero import
  references, this is most plausibly explained by Next/Turbopack's
  cross-route chunk analysis having still accounted for them in some
  form pre-removal; reported as an observed data point, not a claimed
  mechanism, since it wasn't isolated further.
- No obvious unnecessary re-render sources were found in the state layer
  (`AppState`'s context value is reconstructed every render, which is
  normal/expected for a Context provider at this scale and not worth
  optimizing for a 12-route prototype with no measured performance
  problem).

---

## 8. Manual QA Checklist

For a human to run through in an actual browser (no automation tool was
available to any session in this project) before this is shown
externally:

**Core flow**
- [ ] `/` shows Splash on true first visit; auto-advances after ~3s or
      on tap/click anywhere.
- [ ] Complete onboarding (Explainer → Phone State → Accessibility →
      Contact → Complete) and confirm you land on `/home` showing
      "Protection is active."
- [ ] Reload the browser at each onboarding step mid-flow — confirm you
      resume at that exact step, never back at Splash.
- [ ] Reload at `/home` after completing onboarding — confirm no visible
      flash of "Protection is off" before the real state appears.
- [ ] From Home, run the full Demo Mode flow (`Try Demo Mode` → `Start
      Demo` → watch the simulated call → confirm the Scam Warning screen
      appears **instantly**, no fade-in) and try all three exit actions
      (End the call / Notify / This is fine) across separate runs.
- [ ] After a Demo run, confirm the new entry appears in both Home's
      Recent Activity and `/history`, with matching past-tense action
      text.
- [ ] From Settings, edit the emergency contact; confirm the "Emergency
      contact updated" toast appears back on Settings.
- [ ] From Settings, clear both contact fields and Save; confirm the
      "Remove emergency contact?" dialog appears and works.
- [ ] From Home, tap "Fix this" when protection is off; confirm it
      routes to the specific missing permission, not a generic screen.

**Responsive** (§4 — the least-verified area in this audit)
- [ ] Resize the browser across mobile (<640px), tablet (~768px), and
      desktop (≥1024px) widths on at least 3 screens (Home, Scam
      Warning, an onboarding form). Confirm the "phone canvas" framing
      looks intentional on wider viewports, not broken.
- [ ] On a screen with `BottomActionBar` (e.g., onboarding Contact),
      confirm the action bar visually stays pinned to the bottom of the
      phone canvas on desktop, not the browser window's actual bottom
      edge.
- [ ] Zoom the browser to 200% on Home and Scam Warning specifically
      (docs/13 §11's flagged priority screens) — confirm no clipped or
      overlapping text.

**Accessibility**
- [ ] Tab through the entire onboarding flow using only the keyboard —
      confirm every control is reachable and has a visible focus ring.
- [ ] Confirm keyboard focus visibly moves to new content after every
      navigation (not left on a stale, invisible element).
- [ ] With a screen reader on, navigate to the Scam Warning screen and
      confirm the warning text is announced automatically, without
      needing to manually navigate to it.
- [ ] With a screen reader on, navigate between a few other screens and
      confirm the new screen's name is announced.

---

## 9. Vercel Deployment Instructions

This app requires **zero environment variables** and **zero special
Vercel configuration** — it's a standard Next.js 15 App Router project.

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel: **Add New Project** → import the repository.
3. Framework Preset: Vercel auto-detects **Next.js** — leave it as-is.
4. Build Command: leave default (`npm run build`, which runs `next
   build --turbopack` per `package.json`).
5. Output Directory: leave default (Next.js's own `.next`).
6. Install Command: leave default (`npm install`).
7. Environment Variables: none required.
8. Node.js Version: Vercel will respect `package.json`'s `engines.node`
   (`>=18.18.0`) — no manual override needed.
9. Click **Deploy**.
10. Once live, click through the manual QA checklist (§8) against the
    production URL, not just local dev — client-side state (localStorage)
    and route transitions should behave identically, but this is the
    first time the built (not dev-server) output will be exercised.

If a Turbopack production build ever fails or behaves unexpectedly on
Vercel (see §6's flagged risk), the fallback is a one-line change:
edit `package.json`'s `build` script from `next build --turbopack` to
`next build`, commit, redeploy.

---

## 10. Release Checklist

- [x] `npm run format:check` passes.
- [x] `npm run lint` passes with zero errors/warnings.
- [x] `npm run build` succeeds; all 12 routes prerender as static
      content.
- [x] Dead code and unused components identified; objectively-dead code
      removed (§2); everything else flagged for a human decision.
- [x] Accessibility audit performed; both found bugs fixed (§3); the one
      frozen-doc-level contrast finding documented for sign-off, not
      silently changed.
- [x] Responsive behavior re-verified by reasoning (§4) — **not** by an
      actual browser/viewport pass; §8's checklist covers what that pass
      should confirm before external sharing.
- [x] `docs/12`–`15` remain byte-for-byte unmodified throughout this
      entire project (re-confirmed via `git status` this session, as
      every session before it).
- [ ] **Before external sharing:** run the manual QA checklist (§8) in a
      real browser — this is the one item this audit could not itself
      complete.
- [ ] **Product/design sign-off needed:** the `protectionOff`/
      `protectionOffContainer` contrast finding (§3) — not a blocker for
      an internal/portfolio deploy, but worth a decision before treating
      this as a fully WCAG AA-compliant release.
- [ ] Deploy to Vercel per §9, then re-run §8 against the live URL.
