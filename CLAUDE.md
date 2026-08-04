# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is the permanent operating manual for this project: it defines how to work here, not just what the project is.

---

## 1. Project Overview

**Product vision.** Guardian AI protects people — starting with independent, digitally-active seniors — from real-time social-engineering scams. The wedge moment: a live phone call coaches the victim to open a screen-share/remote-access app or move money, and Guardian AI recognizes that pattern and interrupts it before harm happens.

**Frozen MVP.** A single-purpose Android app, buildable by one engineer in 6–8 weeks: on-device detection of a live call plus a known screen-share/remote-access app coming to the foreground → a full-screen plain-language warning → one-tap notify of one emergency contact (WhatsApp, falling back to SMS) → local alert history. No backend is required. No ML model, no LLM, no server-side scoring — detection is a deterministic, two-signal correlation heuristic. Full scope is defined in `docs/12-strategic-refactor-scam-prevention-mvp-1.md`, `docs/13-ux-specification-scam-prevention-mvp-1.md`, and `docs/14-engineering-specification-android-1.md`; those three documents, together with the visual spec in `docs/15-figma-blueprint-visual-design-spec-1.md`, are the current build target.

**Long-term vision.** `docs/00` through `docs/11a` describe the pre-refactor destination: a cross-institution financial-safety platform (Account Aggregator bank linking, server-side risk scoring, Guardian Pay enforceable holds, full Family Trust Circle, Fraud Timeline, tiered subscriptions). That work is preserved as the V2/V3 roadmap, not discarded — but it is not current scope, and nothing from it gets built until the MVP has proven itself and scope is explicitly reopened.

---

## 2. Product Rules

- **The MVP is frozen.** `docs/12`–`15` define the entire current build. Treat every feature boundary in those documents (the "Must/Should/Could/Won't Have" lists in `docs/12`) as fixed.
- **Do not add features without explicit approval.** This includes features that already exist in the deferred `docs/00`–`11a` platform design — their existence there is not authorization to build them now.
- **Prefer simplification over expansion.** When a design choice is ambiguous, choose the smaller, leaner implementation. Complexity is a cost that must be justified, not a default.
- **Product decisions are immutable unless explicitly changed.** A decision recorded in the docs (a screen's behavior, a copy line, a threshold, a scope boundary) is not something to improve on judgment alone. If it looks wrong, raise it — don't silently override it.

---

## 3. Engineering Principles

- **Production-quality code only.** No throwaway prototypes, no "we'll fix it later" shortcuts committed as if finished.
- **Keep the app buildable after every milestone.** A milestone that leaves the project non-compiling or crash-prone on launch is not done, regardless of how much of it is finished.
- **No placeholder architecture.** Don't stub out layers, services, or abstractions for future scope that isn't being built yet (see `docs/14` §2's explicit rejection of premature multi-module structure). Build what the current milestone needs, correctly.
- **Prefer readability over cleverness.** Code is read far more often than written. A slightly longer, obvious implementation beats a compact, clever one.
- **Follow Material Design 3.** Per `docs/15`, with the project's specific, justified deviations (the muted alert-tier colors, no saturated alarm-red) applied exactly as documented — not reinterpreted.
- **Follow Android best practices.** Standard platform conventions (lifecycle-awareness, permission handling, resource management, battery/OEM realities per `docs/14` §29) apply throughout.

---

## 4. Architecture Rules

- **Respect the documented architecture.** `docs/14` defines the module structure, package boundaries, MVVM layering, DI setup, and the accessibility-service-centric detection design. Build within it.
- **Never bypass architectural layers.** UI never touches a Repository or system API directly; ViewModels depend on Repository interfaces, not implementations; the `AccessibilityService` stays a thin adapter with zero detection logic of its own. These boundaries exist so the one component the product depends on (`ScreenSharePatternDetector`) stays independently testable — don't erode that for convenience.
- **Every implementation must trace back to the documentation.** If a piece of code can't be justified by a specific section of `docs/12`–`15` (or an explicitly approved change), it shouldn't exist yet.

---

## 5. Documentation Rules

- **Treat `/docs` as the source of truth.** When code and docs disagree, the docs win by default — the fix is either to correct the code or to explicitly update the doc, never to let them silently drift apart.
- **If implementation requires changing documentation, explain why before making the change.** State the concrete reason (a platform constraint discovered during build, an ambiguity that needs resolving) before editing the spec, the same way `docs/14` §0 surfaced its two engineering findings against the frozen UX spec instead of quietly reinterpreting it.
- **Never silently change requirements.** No requirement, screen behavior, or acceptance criterion changes without that change being visible and explained, in the docs and to the user.

---

## 6. Implementation Workflow

- **Work in small, reviewable milestones.** Follow the sprint breakdown in `docs/12` §5 (permissions → detection heuristic → warning UI → onboarding → notify action → history/settings → beta hardening) rather than attempting the whole app at once.
- **Finish one milestone completely before starting the next.** Partial, half-wired features across multiple milestones make the project harder to reason about and harder to keep buildable.
- **Never leave the project in a broken state.** Every commit and every milestone should leave the app in a state that compiles and runs.

---

## 7. Git Workflow

- **Recommend meaningful commit boundaries.** Propose commits at natural units of work (one screen, one repository, one bug fix) — don't wait for a whole milestone to accumulate into one commit.
- **Never combine unrelated changes.** A detection-logic fix and a UI copy tweak are two commits, not one.
- **Keep commits focused.** Each commit should do one thing and be describable in one sentence.

---

## 8. Testing Philosophy

- **Test critical logic.** `ScreenSharePatternDetector` and `NotifyContactUseCase` are the highest testing priority in the codebase (`docs/14` §25) — they are pure Kotlin/JVM-testable and carry the product's actual value proposition and its one network-dependent fallback path.
- **Test user-visible behaviour.** ViewModel state transitions (Loading/Empty/Error/Content per screen) and critical Compose flows (onboarding completion, the three Scam Warning actions) need coverage.
- **Add tests with new functionality where appropriate.** Not every line needs a test — the Accessibility Service itself is explicitly acknowledged as untestable in isolation (`docs/14` §25) and is mitigated by keeping it logic-free, not by forcing brittle instrumented tests around it.

---

## 9. UI Philosophy

- **Accessibility first.** WCAG 2.1 AA, 200% font scaling without breaking layout, full read-aloud support — the default experience, not a separate "accessibility mode."
- **Large touch targets.** Minimum 44×44dp everywhere, per `docs/13` §4's screen baseline.
- **Clear language.** Plain, concrete, ~8th-grade reading level; never technical or ML vocabulary in user-facing text.
- **Elder-friendly interactions.** No timed gestures, no multi-finger gestures, no ambiguous iconography, no hidden-behind-a-swipe information.
- **Low cognitive load.** One decision per screen; no tab bar implying false parity between the app's one important surface and its two secondary ones (`docs/13` §1).
- **Trust over visual flair.** Calm, muted, boring by design for 10 of 11 screens — the Scam Warning screen is the one moment allowed to look and feel different, and it earns that contrast precisely because nothing else competes for it (`docs/15` Design Philosophy).

---

## 10. Decision-Making Rules

- **Make reasonable engineering decisions autonomously.** Implementation details not pinned down by the docs (exact variable names, internal helper structure, minor refactors within an approved design) don't need sign-off.
- **Ask for approval only when:**
  - **product scope changes** — anything that adds, removes, or reshapes a feature relative to `docs/12`'s frozen MVP list;
  - **architecture changes** — anything that alters the module structure, layering, or component responsibilities set in `docs/14`;
  - **security implications** — anything touching permissions, data storage, or the app's stated privacy guarantees (no call content or screen content ever leaves the device);
  - **privacy implications** — anything affecting what data is collected, stored, or transmitted, including analytics payloads;
  - **irreversible technical decisions** — anything hard to walk back later (a schema choice, a third-party SDK commitment, a Play Store-facing permission declaration).

---

## 11. Coding Standards

- **Kotlin** — idiomatic, null-safe, no unnecessary Java interop patterns.
- **Jetpack Compose** — all UI; no legacy View system unless a documented platform constraint requires it.
- **MVVM** — Compose UI → ViewModel (`StateFlow<UiState>`) → Repository/Domain, unidirectional data flow throughout.
- **Hilt** — dependency injection, per the module layout in `docs/14` §7.
- **Room** — structured local data (emergency contact, alert history).
- **Coroutines** — all async work; no raw threads or callbacks where a suspend function fits.
- **Flow** — for observable/streamed state (permission snapshots, repository reads).
- **Material Design 3** — component and color-role usage, with the project's documented custom extended color roles.
- **Clean package structure** — package boundaries mirror `docs/14` §3 exactly (`ui/`, `domain/detection/`, `domain/notify/`, `data/repository/`, `data/local/`, `data/system/`, `service/`, `di/`, `analytics/`); no screen imports another screen's package directly.

---

## 12. Definition of Done

Every milestone is complete only when:
- **Code compiles.**
- **No known crashes.**
- **UI matches the specification** (`docs/13`, `docs/15`).
- **Basic tests pass.**
- **Documentation stays consistent** with what was actually built.

---

## 13. Working Style

- Do not generate large batches of code.
- Implement incrementally.
- Explain trade-offs briefly.
- Keep responses concise.
- Prefer building over discussing.

---

## Project Status

- **Documentation:** complete (`docs/00`–`15`, covering both the deferred full-platform design and the frozen MVP scope).
- **Current phase:** Implementation.
- **Next milestone:** Sprint 1 — UI foundation.
