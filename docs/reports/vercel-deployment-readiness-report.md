# Vercel Deployment Readiness Report
### Guardian AI Web Prototype: Phase 2

*No product feature, UI, or UX was changed. Every change in this phase
is production/deployment configuration: metadata files, response
headers, and a small shared URL constant those files need. Application
screens, styling, and behavior are untouched.*

---

## 1. Executive Summary

The app was already deploy-ready in substance (clean build, strict
TypeScript, clean lint, zero environment variables, zero secrets, all
confirmed in `release-candidate-1.md`). This phase audited the specific
checklist Vercel-facing production readiness calls for and found three
genuinely missing, standard pieces (`robots.txt`, `sitemap.xml`,
`manifest.webmanifest`, none existed), one config hardening opportunity
(`X-Powered-By` header), and confirmed everything else (TypeScript,
ESLint, routing, metadata, favicon, fonts, image optimization) was
already correct. All additions use real values already established
elsewhere in the codebase (design tokens, the actual route table).
Nothing was fabricated.

---

## 2. Audit Results (Objective 2 checklist)

| Item | Status before | Action |
|---|---|---|
| `next.config.*` | Empty options object | Added `poweredByHeader: false` (§3) |
| `package.json` | Complete (Phase 1) | No change needed |
| Scripts | Correct (`dev`/`build`/`start`/`lint`/`format`) | No change needed |
| Production build | Passing | Re-verified, still passing (§5) |
| TypeScript | `strict: true`, zero errors | No change needed |
| ESLint | Zero errors/warnings | No change needed |
| Routing | All 12 routes return 200 | Re-verified (§5) |
| Metadata | `title`/`description` set (Phase 1) | Added `metadataBase` (§3, needed once `robots`/`sitemap` generate absolute URLs) |
| Favicon | `src/app/favicon.ico`, auto-served | No change needed |
| `robots.txt` | **Did not exist** | Added (`src/app/robots.ts`) |
| `sitemap.xml` | **Did not exist** | Added (`src/app/sitemap.ts`), lists all 12 real routes |
| `manifest.webmanifest` | **Did not exist** | Added (`src/app/manifest.ts`), real design-token colors, honest about its one icon (§4) |
| Static assets | `public/` is empty | Correct: nothing in the app references a static asset that isn't already handled by convention (favicon) |
| Fonts | System font stack, no `next/font` usage | No change needed: confirmed zero font-loading code exists, matching the documented Milestone 1 decision |
| Image optimization | N/A | Confirmed zero `next/image` or `<img>` usage anywhere in `src/`, nothing to optimize |

---

## 3. What Was Added

- **`src/lib/site.ts`**: a single `SITE_URL` constant, resolved at
  build/request time: `NEXT_PUBLIC_SITE_URL` (once a real custom domain
  exists) → Vercel's own `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`
  → `http://localhost:3000`. This repo has no fixed production domain
  yet, so hardcoding one would have been fabrication; this is the
  standard idiom for exactly this situation on Vercel.
- **`src/app/robots.ts`** → generates `/robots.txt`: allows all
  crawlers, points to the sitemap.
- **`src/app/sitemap.ts`** → generates `/sitemap.xml`: all 12 real
  routes, mechanically listed from the actual route tree, no editorial
  judgment about which routes "deserve" indexing.
- **`src/app/manifest.ts`** → generates `/manifest.webmanifest`: real
  name/description, and `theme_color`/`background_color` set to the
  app's actual `--primary`/`--background` design tokens (`#2e5d4e`/
  `#faf9f6`), not invented values.
- **`layout.tsx`**: added `metadataBase: new URL(SITE_URL)`, required
  once any metadata resolves to an absolute URL, which `robots.ts`/
  `sitemap.ts` now do.
- **`next.config.ts`**: added `poweredByHeader: false`, removing the
  `X-Powered-By: Next.js` response header, standard production
  hardening (no functional or visible change), verified removed (§5).

## 4. What Was Deliberately Not Added

- **Dedicated PNG app icons** (192×192, 512×512) for the manifest: the
  manifest references the existing `favicon.ico` only. A manifest
  without properly-sized PNG icons is still valid and functional for
  browser tab/bookmark purposes; it just won't produce as polished an
  "Add to Home Screen" icon. Generating placeholder icon images was
  judged to be fabricating an asset, not auditing a gap, flagged here
  for a human decision, matching how the Phase 1 report handled the
  equivalent Open Graph image gap.
- **`sitemap.xml` `priority`/`changeFrequency` fields**: both optional,
  and setting them would mean making an editorial judgment about which
  screens matter more, which this phase's "no subjective redesign"
  constraint argues against. Omitted rather than guessed.
- **`repository`/`homepage` fields anywhere**: still no real GitHub URL
  (unchanged from Phase 1's finding).

---

## 5. Verification Performed

- `npm run format:check` / `npm run lint`: both clean.
- `npm run build`: succeeds. All 12 application routes unchanged in
  size from the pre-Phase-2 build; three new static routes appear
  (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, each `0 B`
  JS, purely static generated output, as expected).
- `curl` against all 12 application routes: all `200`, zero errors in
  the dev server log.
- Fetched and read the actual generated content of `/robots.txt`,
  `/sitemap.xml`, and `/manifest.webmanifest` against the local dev
  server: all three resolve correctly with the `localhost:3000`
  fallback `SITE_URL`.
- Confirmed via response headers that `X-Powered-By` is actually absent
  after the `next.config.ts` change (not just configured and unverified).

---

## 6. Deployment Checklist

### Local

- [ ] `npm install`
- [ ] `npm run format:check && npm run lint && npm run build` all pass
- [ ] `npm run start` and click through the app against the production
      build locally (not just `npm run dev`) at
      [http://localhost:3000](http://localhost:3000)

### GitHub

- [ ] Create the GitHub repository (this project has never been pushed,
      confirmed via `git log`, one prior commit only)
- [ ] `git remote add origin <repository-url>`
- [ ] Review `git status`, confirm nothing unexpected is staged (this
      project's secrets scan in `release-candidate-1.md` found nothing,
      but re-check before the *first* push specifically)
- [ ] Push: `git add`, commit, `git push -u origin main` (or your
      default branch)
- [ ] Fill in `package.json`'s `repository`/`homepage`/`bugs` fields
      with the real URL (flagged as outstanding in both prior phase
      reports)

### Vercel

- [ ] **Add New Project** in Vercel → import the GitHub repository
- [ ] Framework Preset: Next.js (auto-detected, leave as-is)
- [ ] Build Command: leave default (`npm run build`)
- [ ] Output Directory: leave default
- [ ] Install Command: leave default (`npm install`)
- [ ] Environment Variables: **none required** to run. Optionally set
      `NEXT_PUBLIC_SITE_URL` once a custom domain is attached (§3) so
      `robots.txt`/`sitemap.xml` emit that domain instead of the
      Vercel-assigned one
- [ ] Node.js Version: leave default: `package.json`'s `engines.node`
      (`>=18.18.0`) is respected automatically
- [ ] Deploy
- [ ] Run the manual QA checklist (§7) against the **live** Vercel URL,
      not just local. This is the first time the real built output
      under a real domain gets exercised
- [ ] Visit `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`
      on the live URL and confirm they show the real deployed domain,
      not `localhost`

### Domain Configuration (if applicable)

- [ ] In Vercel: Project → Settings → Domains → add the custom domain
- [ ] Follow Vercel's DNS instructions (A/CNAME record at your
      registrar)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the final custom domain in Vercel's
      Environment Variables, then redeploy, otherwise `robots.txt`/
      `sitemap.xml` will keep pointing at the `*.vercel.app` URL instead
      of the custom domain
- [ ] Re-verify `/robots.txt` and `/sitemap.xml` show the custom domain
      after redeploy

---

## 7. Manual Browser QA Checklist

No browser automation tool has been available in any session of this
project (noted in every milestone report since Milestone 3): every
item below still needs a real human pass; nothing here has been visually
confirmed, only reasoned through code/CSS and confirmed via `curl`/build
output.

### Mobile (< 640px)

- [ ] Full onboarding flow, Home, Demo Mode, Settings, and Alert History
      all render without horizontal scrolling or clipped text
- [ ] `BottomActionBar` (onboarding Contact, Scam Warning) stays pinned
      to the real bottom of the viewport
- [ ] Scam Warning appears **instantly**, full-bleed, no visible
      transition

### Tablet (~768px) and Desktop (≥1024px)

- [ ] The "phone canvas" framing (centered, capped-width, subtle shadow)
      looks intentional, not like a layout bug
- [ ] `BottomActionBar` stays pinned to the bottom of the phone canvas
      itself, not the actual browser window edge
- [ ] Resize the window through the `sm:` breakpoint (640px) live and
      confirm the transition between mobile and framed layouts is clean

### Accessibility

- [ ] Tab through the entire onboarding flow using only the keyboard,
      every control reachable, visible focus ring throughout
- [ ] Keyboard focus visibly lands on new content after every navigation
- [ ] Zoom to 200% on Home and Scam Warning specifically, no clipped or
      overlapping text
- [ ] With a screen reader on: confirm Scam Warning's text is announced
      automatically without manual navigation, and that ordinary
      navigation between other screens is announced too
- [ ] Confirm `/demo` and the emergency-contact edit screen each expose
      exactly one `<h1>` (the Phase RC1 fix) via a real screen reader or
      the browser's accessibility tree inspector, not just the rendered
      HTML

### Navigation

- [ ] Every link/button in the app leads somewhere real, no dead ends
- [ ] Browser back/forward buttons behave sensibly on every screen
      **except** Scam Warning, which must not be dismissible via back
- [ ] Reloading mid-onboarding resumes at the correct step, not Splash

### Demo Mode

- [ ] Home → Try Demo Mode → Start Demo → full scripted call → Scam
      Warning fires automatically
- [ ] "Skip ahead" on the call-simulation screen works
- [ ] All three Scam Warning exit actions (End the call / Notify /
      This is fine) work independently across separate runs, and each
      produces the correct entry in Alert History and Home's Recent
      Activity
- [ ] Notify's inline "Sending... → Notify sent" state displays
      correctly before the screen resolves

### Responsive Layouts

- [ ] Re-run the full onboarding-to-Home flow at three concrete widths:
      375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` are
      all reachable and correctly formatted in a real browser (not just
      `curl`)
