# Grammar, Punctuation, and Writing Quality Review

*Copyedit only. No product, UX, engineering, or design decisions were changed. No application logic, functionality, or UI behavior was touched. No code identifiers, URLs, JSON keys, TypeScript types, or code examples were altered.*

---

## 1. Scope

A full grammar, spelling, and punctuation pass across the repository: README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE, every file in `docs/` (the four frozen spec documents, the case study, and all eleven milestone/audit reports), every Markdown file (including `src/components/design-system/README.md`), and all user-facing text, comments, and copy in the application source (`src/`), plus a handful of config-file comments discovered along the way (`next.config.ts`, `.prettierignore`, `package.json`'s `description` field).

The dominant, repo-wide issue was mechanical: nearly every prose file used the Unicode em dash (—) as an all-purpose connector, in places where a hyphen, comma, colon, semicolon, or period would read more naturally and more consistently with standard technical-writing style. That em dash removal, plus targeted grammar/spelling/awkward-phrasing fixes, is the bulk of this review.

**69 files changed:** 1,147 lines added, 1,144 lines removed (almost entirely punctuation-level edits; no net content added or removed). LICENSE was reviewed and left untouched: it is standard, correctly formatted MIT boilerplate with no formatting issues to fix, and its legal wording is not this review's to rephrase.

---

## 2. Method

Given the scope (roughly 8,400 lines of Markdown and source across 22 documentation files and 46 source files), the review was split into ten parallel passes, each scoped to a disjoint set of files, followed by a manual reconciliation pass over the combined result. Every pass followed the same rules:

- Replace each em dash with whatever standard punctuation the surrounding grammar actually calls for, judged individually: a hyphen for a compound or interrupting modifier, a comma for a short parenthetical aside, a colon when introducing an explanation or list, a semicolon or period when joining or splitting independent clauses. No blind find-and-replace.
- Fix genuine grammar and spelling mistakes, tighten punctuation, and rewrite any run-on or awkward sentence into plain, professional English, without changing what the sentence says.
- Leave untouched: fenced code blocks, inline code spans, ASCII diagrams, URLs, Markdown table/heading/list structure, file paths, variable/function/component/class names, JSON keys, and TypeScript types.
- In application source, edit only comments (`//`, `/** */`) and user-facing strings (JSX text, `aria-label`, `placeholder`, button/toast/dialog copy); never touch logic, JSX structure, props, Tailwind classes, or type definitions.

### Reconciliation

The parallel-pass approach surfaced two issues that a single linear pass would have avoided, both corrected in a follow-up sweep:

1. **One pass under-delivered.** The fork covering `docs/13-ux-specification-scam-prevention-mvp-1.md` reported completion after editing roughly the first fifth of the file (the introductory sections) but left em dashes throughout the bulk of the document (all eleven per-screen specifications, the component inventory, and the guideline sections). A full re-check of every file against its own remaining em-dash count caught the gap; the remaining ~30 instances in that file were corrected directly.
2. **A handful of source comments were left as "preserved quotations."** One pass judged five em dashes in `src/components/design-system/` (in `alert.tsx`, `confirm-dialog.tsx`, `checkmark-draw.tsx`, `history-list-item.tsx`, `permission-status-row.tsx`) to be direct quotations from `docs/15` and intentionally left them unedited to avoid misquoting the source. On inspection, none of that text is an exact match for current `docs/15` wording (it is the component author's own paraphrase, formatted with quotation marks for emphasis), and `docs/15` itself had already been cleaned of its own em dashes elsewhere in this review. Keeping the old punctuation in the "quoting" comment would have made it drift from the source it was citing, not protected it, so these five were normalized like everything else.

A repo-wide sweep also found several files no single pass owned: `src/app/globals.css` (15 em dashes in CSS comments), `next.config.ts`, `.prettierignore`, and `package.json`'s `description` field. All were fixed directly.

After reconciliation, a final `grep` across every file in the repository (excluding `node_modules`, `.git`, `.next`) confirmed zero remaining em dashes outside fenced code blocks and ASCII diagrams. **38 em dashes remain, all inside code fences** (the docs/13 information-architecture tree, docs/14's folder-structure and sequence diagrams, docs/15's deck-outline listing, case-study.md's Mermaid diagrams, and two milestone reports' folder-tree snippets), where altering them would change whitespace-aligned diagram content that is explicitly out of scope.

---

## 3. Consistency check: docs vs. app copy

Several files quote literal UI microcopy in both the frozen UX spec (`docs/13`) and the actual React components that implement it. Because the docs/13 pass and the relevant `src/` passes ran independently, each rewrote its own copy of that shared text; a manual cross-check confirmed the two sides ended up identical after all edits:

| Shared copy | docs/13 | Component |
|---|---|---|
| Accessibility screen intro | *"One more step: this one happens in your phone's Settings, not here."* | `src/app/onboarding/accessibility/page.tsx` |
| Accessibility screen mini-guide | *"...3. Come back here. We'll check automatically."* | same file |
| Accessibility screen success | *"Got it. Guardian AI can now watch for this pattern."* | same file |
| Home / History empty state | *"No alerts yet. That's exactly what we want to see."* | `src/components/design-system/empty-state.tsx` (`REASSURANCE_EMPTY_COPY`) |
| Home "off" status | *"Protection is off. Guardian AI can't watch for scam calls right now."* | `src/app/home/page.tsx` |
| Scam Warning "fine" action | *"This is fine, I know this person"* | `src/app/demo/warning/page.tsx` |

Two other docs/13 microcopy examples (a combined "Accessibility Service: Not granted. Tap to fix." string, and a "Couldn't send: check your emergency contact number in Settings" error message) describe behavior that the current prototype implements differently or doesn't implement as a literal string. That gap predates this review and is a scope/implementation question, not a grammar issue, so it was left alone.

---

## 4. Representative fixes

**Em dash → colon** (introducing an explanation), the most common single pattern, applied to nearly every `Heading — docs/NN Task X` style comment and `## Screen N — Name` style heading across the codebase:
```
- ## Screen 4 — Accessibility Service Permission
+ ## Screen 4: Accessibility Service Permission
```

**Em dash → period** (joining two independent clauses that read better as two sentences):
```
- Protection is off — Guardian AI can't watch for scam calls right now.
+ Protection is off. Guardian AI can't watch for scam calls right now.
```
(This exact fix landed identically in both `docs/13`'s spec text and `src/app/home/page.tsx`'s rendered heading, and in the corresponding aria-live announcement in the Scam Warning screen.)

**Em dash → comma** (short parenthetical aside):
```
- self-contained statement — never split mid-sentence by the screen reader
+ self-contained statement, never split mid-sentence by the screen reader
```

**Hyphenation fixes** (adverb + adjective should not be hyphenated): `digitally-active` → `digitally active`, `honestly-labeled` → `honestly labeled`, `correctly-dismissed` → `correctly dismissed`, `technologically-helpless` → `technologically helpless`, `mostly-invisible` → `mostly invisible`, `clearly-scoped` → `clearly scoped` (README.md, CLAUDE.md, docs/case-study.md).

**Genuine grammar fixes:**
- `docs/reports/milestone-3-report.md`: "leaving the button silently do nothing" → "having the button silently do nothing" (missing infinitive marker).
- `src/components/design-system/index.ts`: "no screen imports from here directly builds a page" (did not parse) → "no screen imports this directly to build a page. Screens (Milestone 3+) compose these components instead."
- `docs/15-figma-blueprint-visual-design-spec-1.md`: "scanability" → "scannability" (misspelling, two occurrences).
- `docs/reports/*.md`: one missing verb after a dash-fragment became its own sentence ("Every one styled and behaviorally specified" → "Every one **is** styled and behaviorally specified").
- `CHANGELOG.md`: `## [1.0.0] — 2026-08-04` → `## [1.0.0] - 2026-08-04` (standard [Keep a Changelog](https://keepachangelog.com/) heading format uses a plain hyphen, not an em dash).

**Placeholder-cell fix:** a small number of table cells used a bare em dash as a "not applicable" marker (docs/15's Animation Durations table, two milestone/sprint reports). These were replaced with `N/A` rather than any prose punctuation, since they were never sentence punctuation to begin with.

---

## 5. Files reviewed but left unchanged

`LICENSE` (standard MIT text, already correctly formatted), `src/components/ui/skeleton.tsx`, `src/lib/utils.ts`, and `src/components/design-system/status-pill.tsx` had no em dashes and no grammar issues in their comments or user-facing strings, so no edits were made.

---

## 6. Verification

- **Format**: `npm run format` (Prettier) ran clean. Two files (`src/app/home/page.tsx`, `src/components/design-system/README.md`) needed line-rewrap after their content edits; `npm run format:check` now reports all files clean. `CLAUDE.md` and everything under `docs/` are excluded from Prettier by `.prettierignore` (a deliberate, pre-existing rule protecting frozen source-of-truth documents from tooling side effects), so their formatting was reviewed by hand.
- **Lint**: `npm run lint` (ESLint) reported zero warnings or errors.
- **Build**: `npm run build` (`next build --turbopack`) compiles successfully; all 19 routes prerender as static content, with the same route table and page count as before this review.

No product decision, screen behavior, threshold, scope boundary, or technical claim was changed anywhere in this pass. Every edit is punctuation, spelling, or sentence-structure only, with the original meaning preserved.
