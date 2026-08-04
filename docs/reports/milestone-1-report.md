# Milestone 1 Implementation Report
### Guardian AI Web Prototype — Frontend Foundation

*Prepared against the frozen product spec (`docs/12`–`15`) and the
implementation strategy agreed in this session (story-first presentation
layer with an optional Demo Mode, layered over the unchanged frozen
product). This report documents what was built, not what was decided —
product/UX decisions remain owned by `docs/12`–`15`.*

---

## 1. Executive Summary

Milestone 1 delivers a production-quality Next.js 15 frontend foundation
for the Guardian AI web prototype: TypeScript, Tailwind CSS v4, and
shadcn/ui scaffolded into the existing repository (alongside `CLAUDE.md`
and `docs/`, which were preserved untouched); the full MD3 design-token
mapping from `docs/15` ported into CSS variables and Tailwind theme
extensions; a minimal app shell; a mock data layer typed against the data
models in `docs/14` §16; and two placeholder routes (`/` and `/demo`)
proving the shell, tokens, and routing work end-to-end.

**Per the milestone's explicit scope, no Guardian AI screens, onboarding,
dashboard functionality, or simulations were implemented.** Both routes
are intentionally minimal placeholders — this milestone is foundation
only.

---

## 2. Folder Tree

```
guardian-ai-web/
├── CLAUDE.md
├── README.md
├── docs/
│   ├── 12–15 (frozen design docs, unmodified)
│   └── reports/
│       ├── sprint-1-report.md          (Android repo's historical report, unmodified)
│       └── milestone-1-report.md       ← this file
├── .prettierrc.json
├── .prettierignore
├── eslint.config.mjs
├── components.json                     (shadcn/ui config: Base UI, Nova preset)
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx                  (root layout — no custom webfont)
    │   ├── globals.css                 (MD3 design tokens, ported from docs/15)
    │   ├── page.tsx                    (placeholder Home — future Screen 7)
    │   └── demo/
    │       └── page.tsx                (placeholder Demo Mode entry)
    ├── components/
    │   ├── shared/
    │   │   └── app-shell.tsx           (minimal layout shell)
    │   └── ui/                         (9 shadcn/ui primitives — see §5)
    ├── data/
    │   ├── types.ts                    (domain types, ported from docs/14 §16)
    │   └── mock-data.ts                (mock instances + known-app list)
    └── lib/
        └── utils.ts                    (shadcn's `cn()` helper)
```

Nothing under `docs/` was modified. `CLAUDE.md` was preserved as-is (it
was temporarily moved aside during scaffolding to satisfy
`create-next-app`'s empty-directory check, then restored unchanged).

---

## 3. Stack & Versions

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js, App Router, `src/` layout | **15.5.22** (pinned to the 15.x line per instruction — see §8) |
| Language | TypeScript, `strict: true` | ^5 |
| Styling | Tailwind CSS | ^4 (CSS-first `@theme`, no `tailwind.config.js`) |
| Component layer | shadcn/ui | Base UI primitives, **Nova** preset, Lucide icons |
| Runtime | React / React DOM | 19.1.0 |
| Formatting | Prettier + `prettier-plugin-tailwindcss` | ^3.9 |
| Linting | ESLint (`next/core-web-vitals`, `next/typescript`, `prettier`) | ^9 |

**A note on the shadcn "component library" choice:** the CLI's current
default is **Base UI** (not Radix, which most existing shadcn examples
assume) — I accepted the CLI's own recommended default rather than
picking Radix from memory, since fighting the tool's current default
would add churn for no benefit at this stage. The practical consequence:
polymorphic composition uses Base UI's `render={<Element />}` prop, not
Radix's `asChild` — used in both placeholder pages' buttons (§6) and
worth knowing before building real components later.

---

## 4. Design Tokens & Theme

`src/app/globals.css` replaces shadcn's generic neutral-gray defaults
with the exact MD3 role mapping from `docs/15` Task 2:

- **Color roles** — `primary` (#2E5D4E), `primaryContainer`→`secondary`
  (#CFE8DC), `surface`→`background` (#FAF9F6), `surfaceVariant`→`card`/
  `muted` (#EDEAE3), `outline`→`border`/`input` (#79747E), plus the three
  **custom extended roles** the doc specifies beyond standard MD3:
  `concern`/`concernContainer` (mapped to shadcn's `destructive` slot),
  `attentionContainer`, and `protectionOff`/`protectionOffContainer`
  (added as new custom tokens, since MD3/shadcn has no built-in
  equivalent).
- **Typography scale** — all six tokens (`display`, `heading`,
  `body-large`, `body`, `caption`, `numeric`) ported as paired
  `--text-*`/`--text-*--line-height` Tailwind v4 theme entries, generating
  `text-display`, `text-heading`, etc. utilities directly.
- **Spacing** — the 8dp-base scale (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`) added
  as named Tailwind spacing tokens, matching the doc's own vocabulary
  (`gap-lg`, `p-md`) rather than relying on Tailwind's numeric scale.
- **Corner radius** — the three frozen, deliberate MD3 deviations (8dp
  buttons, 12dp cards, 16dp dialogs) as explicit `--radius-button`/
  `--radius-card`/`--radius-dialog` tokens, alongside `--radius` (12dp)
  driving shadcn's own `rounded-sm/md/lg/xl` scale.
- **Content max-width** — 360dp, as `--width-content`, used by the app
  shell.

**Font:** no custom webfont is loaded. `docs/15`'s Typography Rationale
specifies the system default font stack deliberately ("no custom typeface
licensing/loading cost for a one-engineer build") — the scaffold's
default Geist Sans/Mono Google Fonts loading was removed from
`layout.tsx`; Tailwind's default `font-sans` (the system-ui stack)
satisfies the spec directly.

**Dark mode:** `docs/15` Task 5 states plainly that dark mode is out of
scope for the MVP. The `.dark` CSS class block is present (shadcn's
scaffold expects the token shape) but is set **identical** to `:root`,
with a comment explaining why — not a second palette, just keeping the
variable shape ready in case a future milestone reopens this scope.

**One undocumented value:** `--muted-foreground` (#5B6560, a secondary/
disabled-text tone) isn't specified anywhere in `docs/15` — it's an
engineering judgment call for a token shadcn's primitives need but the
frozen spec doesn't define. Flagged here per CLAUDE.md's spirit of
surfacing gaps rather than silently inventing product decisions; revisit
if it reads wrong during a visual QA pass.

---

## 5. Reusable UI Primitives

Nine shadcn/ui primitives installed as a **generic foundation layer**,
deliberately left unskinned: `Button`, `Card` (+ subcomponents), `Input`,
`Badge`, `Dialog`, `Sheet`, `Skeleton`, `Separator`, `Label`. These are
shadcn's stock components, not yet the Guardian AI-specific variants
`docs/15` Task 2 describes (Button's three emphasis tiers — Filled/
FilledTonal/Text — mapped to `concern` coloring on Scam Warning, Card's
Filled-vs-Outlined states for the Status Card, etc.). Skinning them to
those exact specs is deferred to the milestone that actually builds
Guardian AI's screens, per this milestone's explicit "do not implement
Guardian AI screens yet" boundary — building final component variants
now, with no real screen to validate them against, would be exactly the
premature/placeholder work the project's engineering principles warn
against.

`src/components/shared/app-shell.tsx` is a minimal layout wrapper (a
plain header + centered, width-capped content column) — also explicitly
not yet Screen 7's real top app bar; it exists only to prove the shell/
token/routing pipeline end-to-end.

---

## 6. Routing

Two routes, both placeholders:

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Placeholder Home — will become the Interactive Dashboard (docs/13 Screen 7) |
| `/demo` | `src/app/demo/page.tsx` | Placeholder Demo Mode entry — the future guided, cinematic simulation |

Each links to the other (Home → "Try Demo Mode" → `/demo`; Demo Mode →
"Back to Home" → `/`) purely to verify `next/link` navigation and the
shared primitives work together, not as any part of the real onboarding
or narrative flow.

---

## 7. Mock Data Layer

`src/data/types.ts` defines TypeScript types mirroring the data models in
`docs/14` §16 (`EmergencyContact`, `AlertHistoryEntry` + its `ActionTaken`
union, `PermissionsSnapshot`/`PermissionState`, `AccessibilityPrefs`) and
§10 (`ProtectionStatus`). `src/data/mock-data.ts` provides sample
instances of each, plus the known screen-share app list from §10
(AnyDesk, TeamViewer QuickSupport/Host) for future use by the simulated
detection flow. **Nothing yet consumes this data** — no screen reads from
it — it exists purely as a typed foundation for the next milestone.

---

## 8. Known Issues & Flagged Decisions

- **`npm audit` reports 3 high-severity findings** (`postcss`, `sharp`) —
  both are transitive dependencies bundled inside `next@15.5.22` itself.
  The only fix path `npm audit fix --force` offers is a forced upgrade to
  `next@16.3.0`, which directly contradicts the "Initialize Next.js 15"
  instruction. **Decision: stayed on 15.x, did not silently bump the major
  version.** These are build/dev-time (PostCSS sourcemap handling) and
  image-optimization-time (`sharp`/libvips) vulnerabilities, not exposed
  by anything this prototype's own code does — an accepted, visible risk,
  not a silent one. Worth revisiting if/when the product owner is ready
  to move to Next 16.
- **Base UI vs. Radix (§3):** the shadcn CLI's current default component
  library is Base UI, not Radix. Accepted as the tool's own recommended
  default; means `render={<Element />}` is this project's polymorphic
  composition pattern going forward, not `asChild`.
- **`--muted-foreground` value (§4)** is an engineering judgment call, not
  a value from `docs/15` — flagged for a future visual QA pass.
- **Prettier initially reformatted `CLAUDE.md` and `docs/*.md`** when
  `npm run format` was first run project-wide, since `.prettierignore`
  didn't yet exclude them — a tooling side effect, caught immediately via
  `git status`/`git diff`, reverted with `git checkout -- CLAUDE.md docs/`
  before anything was committed, and fixed by adding `CLAUDE.md` and
  `docs/` to `.prettierignore` with a comment explaining why. No frozen
  document content was lost; flagged here for the record since it's
  exactly the kind of silent-drift risk CLAUDE.md §5 warns about, even
  though in this case it was accidental and caught pre-commit.
- **Vercel deployment:** no `vercel.json` was added. Vercel auto-detects
  Next.js App Router projects with zero configuration; adding one now
  would be unused placeholder config with nothing yet to override. What
  *was* added: an `engines.node` field in `package.json` (`>=18.18.0`,
  Next 15's own minimum) so Vercel provisions a compatible Node runtime.
  Deploying to Vercel itself (connecting the repo, first deploy) is an
  account-level action outside this milestone's file-based scope and
  wasn't performed.

---

## 9. Verification Performed

- `npm run format` — Prettier applied cleanly across the project (Tailwind
  class sorting via `prettier-plugin-tailwindcss` confirmed working).
- `npm run lint` — zero errors, zero warnings.
- `npm run build` — production build succeeds (`next build --turbopack`),
  type-checks cleanly under `strict: true`, both routes prerender as
  static content (`○ (Static)`).
- `npm run dev` — started locally; `GET /` and `GET /demo` both returned
  `200`, with the expected placeholder copy present in the rendered HTML
  and no console/runtime errors in the dev server log.

---

## 10. What Was Intentionally Deferred

Per the milestone's explicit exclusions, none of the following were
built, and none should be read as accidentally missing:

- Any of the 11 frozen Guardian AI screens (docs/13) — Splash, Permission
  Explainer, permission grant simulations, Emergency Contact, Home's real
  status card, Scam Warning, Alert History, Settings.
- Onboarding flow.
- Dashboard functionality (protection-status derivation, history, contact
  management).
- Any simulation logic (detection, notify, the Demo Mode narrative
  itself).
- Guardian AI-specific component skinning (Button emphasis tiers, Status
  Card states, Warning Action Stack, etc.) — the primitives installed in
  §5 are generic shadcn defaults, not yet these.
- A real Vercel deployment (account/project connection).
