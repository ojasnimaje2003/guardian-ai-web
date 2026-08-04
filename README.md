# Guardian AI: Scam Call Protection, Prototyped for the Web

**An interactive, high-fidelity web prototype of an Android product that
protects independent seniors from real-time phone scams, built to be
demoed, not just described.**

Guardian AI's actual product is an Android app that watches for one
specific, dangerous pattern: a live phone call coaching someone to
install a screen-sharing app, and interrupts it before money moves or a
device is compromised. This repository is **not** that Android app. It's
a Next.js recreation of its entire user experience: every screen,
every decision, every state, plus a guided, end-to-end simulation of
the moment the product exists for, so anyone can experience it from a
browser with no Android device required.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Why This Product Exists](#why-this-product-exists)
- [Product Vision](#product-vision)
- [Key Features](#key-features)
- [Demo Overview](#demo-overview)
- [Screenshots](#screenshots)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Design Principles](#design-principles)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## Problem Statement

Scam calls that talk a victim into installing a remote-access app
(AnyDesk, TeamViewer, and similar tools) are one of the most damaging,
fastest-moving fraud patterns targeting independent, digitally active
seniors. The moment that matters is narrow and urgent: a live call, a
screen-sharing app opening, and a window of maybe a few minutes before
real harm happens. Generic security software doesn't watch for this
specific pattern in real time, and by the time a victim or family member
realizes what happened, the damage is usually done.

## Why This Product Exists

Guardian AI's Android app is built around exactly one high-conviction
signal: **an active phone call plus a known screen-share/remote-access
app coming to the foreground.** No account linking, no financial data,
no broad "AI fraud detection" claims. Just a narrow, deterministic,
on-device correlation that fires in seconds, warns in plain language,
and offers one clear action: notify someone the user trusts. It was
deliberately scoped down from a much larger, ten-feature financial-
safety platform after investor and product review found that the
broader platform was building trust infrastructure the product hadn't
earned yet. This one moment was the single highest-leverage, most
buildable piece of the whole vision.

## Product Vision

_"A trusted, autonomy-respecting second opinion standing between impulse
or manipulation and irreversible loss."_ Guardian AI never acts on a
user's behalf, never claims a capability it doesn't have, and never
raises an alarm without naming the specific signal that triggered it.
The long-term vision, including cross-institution bank-account
monitoring, server-side risk scoring, a full family "Trust Circle," and
enforceable payment holds, is real and documented, but deliberately
deferred until this one moment proves itself. See [Future
Roadmap](#future-roadmap).

---

## Key Features

This repository implements the frozen MVP's entire UI/UX as a real,
interactive product, not static mockups:

- **Full onboarding flow**: permission explainer, simulated Android
  permission grants (with realistic decline/repair paths), emergency
  contact capture (with a simulated native contacts-picker), and a
  completion screen, all backed by real client-side state that
  persists across reloads.
- **Home dashboard**: a live-derived protection status ("Active" /
  "Off") that genuinely reflects the simulated permission state, with a
  one-tap repair path into the specific missing permission.
- **Interactive Demo Mode**: the product's actual reason to exist,
  made explorable without an Android device. A guided, scripted call
  simulation ends the instant a simulated screen-sharing app "opens,"
  triggering a pixel-for-pixel implementation of the real product's
  full-screen Scam Warning: instant appearance, no dismiss-by-accident,
  automatic screen-reader announcement, and three weighted actions (End
  the call / Notify a contact / Mark as fine).
- **Alert History**: every completed warning is persisted and shown
  chronologically, with the exact original explanation preserved
  verbatim on expand.
- **Settings**: live permission status with repair links, emergency
  contact edit/remove (with a confirmation dialog for removal), and a
  plain-language privacy disclosure.
- **A 20+ component design system**: every visual element (typography,
  buttons, cards, status pills, dialogs, toasts, skeleton loading
  states) traced directly to the frozen visual specification, not
  improvised.

## Demo Overview

The fastest way to understand the product is Home → **Try Demo Mode** →
**Start Demo**:

1. A simulated phone call begins, with scripted scammer dialogue
   appearing progressively (a "Skip ahead" link is always available).
2. The instant the simulated call reaches the moment a screen-sharing
   app would open, the full-screen **Scam Warning** appears with no
   transition, exactly as the real product is specified to behave,
   because a slow entrance would be wrong for a time-critical interrupt.
3. Choose **End the call**, **Notify [contact]**, or **This is fine**.
   Each produces a real, persisted Alert History entry you can see
   afterward on Home and in Alert History.

## Screenshots

_(placeholder: screenshots to be added)_

| Home                 | Scam Warning         | Onboarding           |
| -------------------- | -------------------- | -------------------- |
| _screenshot pending_ | _screenshot pending_ | _screenshot pending_ |

---

## Architecture Overview

- **Next.js App Router**, entirely client-rendered screens (`"use
client"`). This is a stateful, interactive product experience, not a
  content site.
- **No backend, no database, no API routes.** A single React Context
  (`AppStateProvider`) backed by `localStorage` stands in for the real
  Android app's Repository layer, persisting onboarding progress,
  simulated permission grants, the emergency contact, and alert history
  across reloads.
- **Every Android-only capability is simulated, not real.** There is no
  way for a browser to detect a live phone call or a foreground app.
  Every such moment (permission grants, the scam call itself, the
  notify action) is an honest, clearly scoped frontend simulation, never
  presented as more than it is.
- **A dedicated design-system layer** (`src/components/design-system/`)
  sits between generic UI primitives and the actual screens: every
  component in it is traced to a specific section of the frozen visual
  specification; screens compose these rather than hand-styling
  elements inline.
- **A single route-transition layer** (`src/components/shared/`)
  provides consistent screen-to-screen motion, keyboard focus
  management, and screen-reader route announcements for the whole app
  from one place, with an explicit, documented exception for the Scam
  Warning screen's zero-transition entrance.

## Tech Stack

| Layer                | Choice                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| Framework            | [Next.js 15](https://nextjs.org) (App Router)                                        |
| Language             | TypeScript (`strict` mode)                                                           |
| Styling              | [Tailwind CSS v4](https://tailwindcss.com): CSS-first theme, no `tailwind.config.js` |
| Component primitives | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)                 |
| Icons                | [Lucide](https://lucide.dev)                                                         |
| State                | React Context + `localStorage` (no external state library)                           |
| Formatting / linting | Prettier (+ `prettier-plugin-tailwindcss`), ESLint (`next/core-web-vitals`)          |
| Deployment           | [Vercel](https://vercel.com)                                                         |

## Folder Structure

```
src/
├── app/                          Next.js App Router routes
│   ├── page.tsx                  Splash — first-run + resume routing
│   ├── onboarding/                explainer, phone-state, accessibility, contact, complete
│   ├── home/                     Protection status dashboard
│   ├── demo/                     Demo Mode entry, call/ simulation, warning/ (Scam Warning)
│   ├── history/                  Alert History
│   ├── settings/                 Settings
│   ├── layout.tsx                Root layout — providers, metadata
│   ├── globals.css               Design tokens (colors, type, spacing, radius, motion)
│   ├── robots.ts                 Generates /robots.txt
│   ├── sitemap.ts                Generates /sitemap.xml
│   └── manifest.ts               Generates /manifest.webmanifest
├── components/
│   ├── design-system/            The traced, reusable component library (+ its own README)
│   ├── shared/                   App-shell-level infrastructure (route transitions)
│   └── ui/                       Vendored shadcn/Base UI primitive(s) actually in use
├── data/                         Domain types + realistic mock/reference data
└── lib/                          `AppStateProvider`, `cn()` utility, deployment base-URL resolution

docs/                             The frozen product/UX/engineering/visual specs this app implements,
                                   plus per-milestone implementation reports (docs/reports/)
```

## Getting Started

**Prerequisites:** Node.js `>=18.18.0`, npm.

```bash
git clone <this-repository-url>
cd guardian-ai-web
npm install
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app starts at
Splash and will resume onboarding or land on Home depending on what's
already in `localStorage` from a previous visit. Clear site data (or
use a private window) to see the true first-run experience again.

Other scripts:

| Script                 | Purpose                    |
| ---------------------- | -------------------------- |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the production build |
| `npm run lint`         | ESLint                     |
| `npm run format`       | Prettier: write            |
| `npm run format:check` | Prettier: check only       |

## Deployment

Deploys to [Vercel](https://vercel.com) with zero configuration and zero
environment variables. Vercel auto-detects the Next.js App Router
project, and `npm run build` is the standard build command. See
`docs/reports/release-candidate-1.md` §9 for the full step-by-step
deployment guide.

## Accessibility

Accessibility is a first-class requirement of the frozen product
specification (WCAG 2.1 AA, 200% font scaling, full read-aloud support),
not a retrofit:

- Every interactive element has a real accessible name and a visible
  focus ring; icon-only controls are labeled.
- Keyboard focus moves to new content on every navigation, and screen
  readers are told what screen they've landed on: a gap most
  single-page apps leave open, since client-side routing doesn't trigger
  either behavior on its own.
- The Scam Warning screen announces itself automatically and assertively
  the instant it appears, without requiring the user to navigate to it
  first: the one place in the app where read-aloud isn't opt-in.
- Every color pairing in the design system was checked against computed
  WCAG contrast ratios, not eyeballed. One finding from that audit is
  open and documented rather than silently patched. See `docs/reports/
release-candidate-1.md` §3 for the specifics and the recommended
  resolution paths.

## Design Principles

Ported directly from the frozen visual specification, not reinterpreted:

- **Calm by design, loud exactly once.** Ten of eleven screens are
  deliberately muted and quiet; the Scam Warning screen is the only one
  allowed to look and feel different, and it earns that contrast
  precisely because nothing else competes for it.
- **No saturated alarm-red, anywhere**, even at the product's single
  highest-stakes moment. A product whose job is preventing panic-driven
  mistakes shouldn't itself be a source of visual panic.
- **Every warning names its specific reason.** Never a bare "risk
  detected," always "AnyDesk opened during your call."
- **Friction proportional to risk.** A false-positive dismissal is one
  tap, no confirmation; removing an emergency contact is one tap plus a
  confirmation dialog; nothing in the product traps a user into a state
  they didn't choose.
- **Never claim more than the product delivers.** The onboarding, the
  About & Privacy copy, and this README all say plainly that this
  prototype simulates detection. It does not perform it.

## Future Roadmap

**From the product's own frozen V2/V3 plan** (not built here, and out of
scope for this repository): Account Aggregator bank-account linking,
server-side transaction risk scoring, a second detection pattern
(fake-refund/collect-request calls), 2–3 emergency contacts, a full
multi-role family Trust Circle, a Fraud Timeline, and Guardian Pay's
enforceable transaction holds if a sponsor-bank partnership is ever
closed.

**For this web prototype specifically:** a richer guided-demo narrative
(multiple scripted scenarios sharing the same underlying detection
pattern), resolving the one open WCAG contrast finding, and a full
manual QA pass across real devices and viewport sizes (see `docs/
reports/release-candidate-1.md` for exactly what that pass should
cover).

## License

MIT: see [`LICENSE`](./LICENSE).
