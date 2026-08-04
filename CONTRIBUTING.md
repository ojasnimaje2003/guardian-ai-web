# Contributing to Guardian AI (Web Prototype)

Thanks for your interest in this project. It's primarily a portfolio
piece, but it's built to real engineering standards and welcomes issues,
fixes, and thoughtful pull requests.

## Before You Start

This repository implements a **frozen product specification**. The
product, UX, and visual design decisions live in `docs/12`–`15` and are
treated as the source of truth throughout the codebase — most components
and screens cite the exact spec section they implement in a code
comment. Please read the relevant doc section before changing any
screen's behavior, copy, or visual treatment, and:

- **Product/UX changes** (anything that adds, removes, or reshapes a
  screen or flow relative to the frozen spec) should be raised as an
  issue for discussion before a PR — the spec isn't casually amended.
- **Bug fixes, accessibility fixes, dependency updates, and internal
  refactors** that don't change product behavior are welcome directly as
  PRs.
- If you're using Claude Code or another AI coding assistant against
  this repo, `CLAUDE.md` is the operating manual it should already be
  following — it explains the doc-traceability convention above in
  detail.

## Development Setup

```bash
git clone <this-repository-url>
cd guardian-ai-web
npm install
npm run dev
```

See the [README](./README.md) for the full getting-started guide.

## Before Opening a Pull Request

```bash
npm run format:check
npm run lint
npm run build
```

All three must pass. `npm run format` (write mode) will fix most
formatting issues automatically.

## Code Style

- TypeScript `strict` mode — no `any`, no unnecessary type assertions.
- Prettier + ESLint (`next/core-web-vitals`) govern formatting and lint
  rules; don't hand-format against them.
- Reuse an existing component from `src/components/design-system/`
  before adding a new one — check that directory's own `README.md` for
  the current catalog. New design-system components should cite the
  specific `docs/15` section they implement, the same way every existing
  one does.
- Keep the design tokens (`src/app/globals.css`) as the single source
  for color, spacing, typography, and radius — avoid raw Tailwind values
  (`text-lg`, `p-6`, `bg-red-500`, …) that bypass the token system.

## Commit Messages

Small, focused commits describing one change each. No strict convention
is enforced, but a clear imperative summary line (`Fix duplicate h1 on
Demo entry screen`, not `updates`) is appreciated.

## Reporting Issues

Bug reports, accessibility issues, and broken-link reports are all
welcome via GitHub Issues. Please include:

- What you expected vs. what happened.
- Browser/OS/viewport size, if relevant (this app has responsive
  behavior worth being specific about).
- Steps to reproduce.

## Security

This app has no backend, no database, and stores nothing beyond
`localStorage` on the visitor's own device — see the README's
[Architecture Overview](./README.md#architecture-overview). If you
believe you've found a genuine security issue anyway, please open an
issue describing it; there is no separate private disclosure channel for
this project.

## License

By contributing, you agree your contributions are licensed under this
project's [MIT License](./LICENSE).
