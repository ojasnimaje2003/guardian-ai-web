# Strategic Refactor: Guardian AI → AI-Powered Scam Prevention Platform
### From 11-Phase Financial Safety Platform to a 6–8 Week, One-Engineer MVP

*This document does not delete or rewrite Phases 1–11 or the Design Review (`11a`). Per instruction, that work is preserved as V2/V3 roadmap, not discarded. This document is the new canonical strategic layer sitting above it, produced in response to the investment-committee redirection.*

---

# SECTION 1: Strategic Refactor Summary

**What changed:** Guardian AI moves from "cross-institution financial safety platform with ten features across three business channels" to "one on-device scam-detection wedge, everything else deferred." The trigger is the investment committee's core finding: the product's actual pain is severe-but-rare and its urgency is bimodal (near-zero when you'd sell it, extreme when it matters), which means a broad platform asking for AA linking, subscriptions, and a bank partnership before proving the one moment that matters was building trust infrastructure the product hadn't earned yet.

**Why this specific wedge survives everything else:** Scam Detection (original brief feature #4, Phase 3's FR-4) is the only piece of the original ten-feature list that is simultaneously (a) the most painful/urgent moment in the whole product, (b) buildable without any external partnership (no AA, no sponsor bank, no PSP), (c) on-device by requirement (Assumption A25, call content never leaves the device, so it was *always* architecturally independent of everything else), and (d) the best demo the product has ("watch it catch a live scam call"). Every other feature was infrastructure built *around* this moment; the refactor just stops building the infrastructure first.

**What this resolves, as a side effect, that the Design Review flagged as unresolved:** Critical finding C-1 (Android-only MVP breaks the S1+S2 cross-platform household, because Anjali would need to install the app to be a Trust Circle co-reviewer) disappears entirely once Trust Circle collapses to "send a WhatsApp/SMS to one emergency contact." Anjali never needs to install anything. A problem that took a full Design Review to surface is dissolved by scope reduction, not by an engineering fix: a good sign the new scope is actually smaller in the ways that matter, not just smaller on paper.

---

# SECTION 2: Disposition of Every Prior Document

| Document | Disposition | Why |
|---|---|---|
| **Product Strategy** (Phase 1 problem validation + Phase 3 vision/business model) | **MODIFY** | Problem validation (UPI fraud data, RBI regulatory landscape, EverSafe/Carefull comps) remains valid background, kept as appendix context, not rewritten. Vision/mission need re-centering on scam prevention specifically. All six Product Principles (Phase 3 §7) survive unchanged: they map onto the new wedge at least as cleanly as the old one. Three-channel business model and monetization tiers are superseded (Section 8 below). |
| **Market Research** (Phase 2 §1–2, §5) | **MODIFY** | Competitive landscape re-weights: Google's on-device scam-call pilot and Truecaller become the *primary* comps (not EverSafe/Carefull, which were comps for the broad monitoring platform). Fraud-statistics grounding is reusable as-is. TAM/SAM/SOM needs resizing around a lighter, faster-reached installed base, deferred to V2 business planning, not redone here. |
| **Personas** (Phase 2 §4) | **MODIFY** | Ramesh (S2) is now the primary and near-exclusive persona: his story *is* the MVP's core scenario, essentially unchanged. Anjali (S1) shifts from co-reviewer/app-user to notified contact who may never open the app. Deepika (S4) drops out of scope entirely: **DEFER TO V3** with the household segment. |
| **JTBD** (Phase 2 §3) | **SIMPLIFY** | S2's JTBD ("help me pause and get a second opinion... without giving up control") is the MVP's JTBD, tightened to the live-call moment specifically. S1's JTBD reframes from "watch their transactions" to "tell me the moment my parent gets a suspicious call." S3/S4 JTBD statements **DEFER TO V3**. |
| **PRD** (Phase 4) | **MASSIVE SIMPLIFY** | FR-4 (Scam Detection) is kept and becomes the entire MVP. FR-1 (AA onboarding), FR-2 (transaction risk scoring), FR-5 (Guardian Pay), FR-7 (Fraud Timeline) **DEFER TO V2/V3** (Section 3). FR-3 (Trust Circle) **SIMPLIFIES** from a five-screen role/consent/revocation system to one field (an emergency contact) and one action (notify). FR-6 (Dashboard) simplifies to a one-line status screen. Most NFRs simplify dramatically because **MVP never touches financial or bank-account data at all**: no AA means no DPDP-grade financial-consent architecture is even needed yet, which is the single biggest hidden simplification in this whole refactor. NFR-9 (real-time latency, added in Phase 11) becomes the single most important requirement in the document, since it now describes the entire product, not one feature among many. |
| **Architecture** (Phase 8) | **MASSIVE SIMPLIFY** | Five services collapse toward one thin backend (or arguably zero backend, see Section 10). Guardian Pay Service, Risk Scoring Engine (server-side), Fraud Timeline Service **DEFER TO V2/V3** wholesale. Trust Circle Service folds into a single field on the user record. Event bus (Kafka) is **REMOVED**: nothing left that needs async fan-out at this scale. |
| **Database** (Phase 9) | **MASSIVE SIMPLIFY** | Of roughly 17 tables, MVP needs 2–3: a stripped-down `users` table (phone number + emergency contact, no eKYC/AA fields) and `scam_call_events` (survives from Phase 9 almost unchanged, the one piece of schema this refactor validates rather than cuts). Everything else: `linked_accounts`, `consent_artifacts`, `subscriptions`, `trust_circle_relationships`, `co_review_requests`, `guardian_pay_transactions` and its satellite tables, `transaction_events`, `behavioral_baselines`, `risk_scores`, `explanation_generation_log`, `fraud_timeline_events`, and `fraud_timeline_exports` **DEFER TO V2/V3**. |
| **API** (Phase 10) | **MASSIVE SIMPLIFY** | Of roughly 20 endpoints, MVP needs 4–5: simplified signup, set/update emergency contact, submit a scam-detection event, list alert history. Every Guardian Pay, Trust Circle role-management, and Fraud Timeline endpoint **DEFERS TO V2/V3**. Notably, this finally builds the Scam Detection ingestion endpoint the Design Review flagged as missing (C-4), though now in a form radically simpler than originally envisioned, since there's no downstream risk-scoring pipeline for it to feed. |
| **AI Design** (Phase 11) | **MASSIVE SIMPLIFY, core idea KEPT** | The on-device classifier concept (Phase 11 §5) *is* the AI system now: nothing else survives to MVP. Rules engine, ML (LightGBM) risk model, feature store, behavioral baselines, network-reported-payee signal, and the LLM explanation layer (Path B) **all DEFER TO V2/V3**, consistent with, and going further than, the Design Review's own OE-1/OE-2 recommendations, which already flagged Path B and the network signal as premature. The explanation-template philosophy (Path A) survives as the model for how the on-device warning's copy is written. |
| **UX** (Phase 5/6) | **MASSIVE SIMPLIFY** | Of 26 screens, MVP needs 5–6 (Section 12). Alert Detail (Screen 9) survives almost entirely intact as the core warning screen: it was already designed as the product's highest-priority screen, and it still is. Onboarding collapses from 6 screens to 2 (permission consent + set emergency contact). Trust Circle's 5 screens, Guardian Pay's 2, Fraud Timeline's 2, and most of Settings' consent-management complexity **DEFER TO V2/V3**. |
| **Design System** (Phase 7) | **KEEP, nearly unchanged** | The calm, non-alarming visual language (no saturated alarm-red, template-driven explanation blocks, accessibility-first typography) applies directly to the scam-warning screen and requires no rework: it was designed around exactly this kind of moment. Only a much smaller subset of the component library is actually used at launch. |
| **Assumptions Log** (`00-assumptions-log.md`) | **MODIFY** | A14 (Android-first, justified by Scam Detection) is **KEPT and clarified**: the Design Review's C-1 concern about over-applying it to the whole app is now moot, since the whole app *is* Scam Detection. A2–A4, A6–A7 (AA framework, dual business model), A11–A13 (pricing, Guardian Pay, AI Assistant), A15–A16 (Fraud Timeline retention, Trust Circle cap), all **DEFER TO V2/V3** along with the features they describe. A17–A22 (UX/design tokens) **KEPT**. A23–A37 (backend/API/AI architecture specifics) mostly **DEFER TO V2/V3** with the services they describe; the on-device-classifier-specific assumptions within A31–A37 are the exception and are **KEPT**. |
| **Roadmap** (Phase 3 §8) | **FULL REWRITE** | See Section 3 below. |
| **Design Review** (`11a`) | **KEPT as a V2-readiness checklist** | Its findings (missing DPDP erasure endpoint, missing retention policies, representative-only ACs, tier-gating gaps) all apply to features now deferred to V2. None of them apply to the MVP scope defined here, since MVP touches no financial data and has no subscription tiers. Re-run an equivalent review before V2, not before this MVP. |

---

# SECTION 3: Updated Product Roadmap

**MVP (0–8 weeks): Real-time scam-call detection.** On-device pattern detection (screen-share/remote-access during a live call), an immediate plain-language warning, one emergency contact with a one-tap notify action, basic alert history. No AA, no subscriptions, no Guardian Pay, no Fraud Timeline.

**V2 (next, once MVP proves detection accuracy and real retention):** Reintroduce Account Aggregator linking and server-side transaction risk scoring (Phase 11's full pipeline: rules engine, ML model, feature store); expand Trust Circle from one emergency contact to the full role/co-review/consent system (Phase 4/5's original design); reintroduce Financial Safety Dashboard at full scope; reintroduce Fraud Timeline; add a second detection pattern (fake-refund/collect-request, original FR-4.2); introduce Free/Individual/Family monetization tiers; begin the institutional (insurer/bank) B2B conversation validated in Part 6 of the investment review, now with real usage data to sell against, not a pitch deck.

**V3 (later):** Guardian AI's own payment-initiation surface (Guardian Pay) and genuinely enforceable transaction holds, if and only if a sponsor-bank partnership is actually closed; LLM-augmented explanation (Path B); network-reported-payee cross-user signal; Emergency Protection Mode; embedded partner (Channel 3) risk-engine licensing; S3/S4/S5 segment expansion.

**Long-term vision (unchanged from Phase 3, re-anchored):** The original vision, "a trusted, autonomy-respecting second opinion standing between impulse or manipulation and irreversible loss," still holds. This refactor doesn't change the destination; it changes the order: prove the single moment that matters most, on-device, for free, before asking anyone to link a bank account or pay a subscription.

---

# SECTION 4: Technical Simplification

| Layer | Before | After (MVP) | Reduction |
|---|---|---|---|
| Services | 5 (Identity/Consent, Trust Circle, Guardian Pay, Risk Scoring, Fraud Timeline) | 1 thin backend (or 0, Section 10) | ~80–100% |
| API endpoints | ~20 across 5 services | 4–5 | ~80% |
| Database tables | ~17 | 2–3 | ~85% |
| AI components | On-device classifier + rules engine + ML model + feature store + LLM explanation layer | On-device classifier only | ~90% |
| Screens | 26 | 5–6 | ~78% |

**Blended estimate: this MVP is roughly 15–20% of the engineering effort of the full 11-phase design**, consistent with going from a multi-quarter, multi-engineer platform build to a single engineer's 6–8 week build.

---

# SECTION 5: Updated Engineering Readiness

**Can one engineer build this in 6–8 weeks? Yes**, provided the scope stays exactly this narrow: the hard part is one well-bounded Android systems problem (call-screening + accessibility-service integration), not a distributed system.

**Sprint plan:**
- **Week 1:** Android project setup; call-screening/accessibility-service permission flow; first working detection heuristic (concurrent active call + a known screen-share/remote-access app foregrounded).
- **Week 2:** Refine detection against real-world scam-adjacent apps (AnyDesk, TeamViewer, Quick Support, and similar tools documented in India-targeted scam patterns); build the full-screen warning UI, reusing Phase 6/7's Alert Detail visual language and template-copy philosophy directly.
- **Week 3:** Onboarding (permission consent + set one emergency contact); local alert-history storage.
- **Week 4:** One-tap "Notify [contact]" via WhatsApp/SMS intent; minimal home status screen; settings (accessibility, edit contact).
- **Week 5:** Minimal backend for detection-event logging and basic analytics (install, permission_granted/revoked, scam_detected, warning_shown, notify_tapped, marked_false_positive); internal testing and false-positive tuning.
- **Week 6:** Closed beta with real seniors (founder's network); fix bugs; retune detection thresholds against real feedback.
- **Weeks 7–8:** Play Store listing, demo video (a live catch, per the GTM plan), soft launch to the first NGO/RWA contacts, monitor detection accuracy and false-positive rate.

---

# Redefined MVP

**1. Core value proposition:** The moment a live call is coaching you to share your screen or move money, Guardian AI recognizes it and warns you in plain language before you act, and lets you notify someone you trust with one tap.

**2. Target user:** Primary: an independent, digitally-active adult (Ramesh's persona, unchanged) who is a live social-engineering target. Secondary: a family member (Anjali's persona) who receives a notification but needs no account of their own for MVP.

**3. Jobs to be Done:**
- Primary: *"When I'm on a call that feels off, tell me it's a scam pattern before I do something I can't undo."*
- Secondary: *"When my parent might be getting scammed right now, tell me immediately, wherever I am, without me having to check anything myself."*

**4. Core user journey:** Install → grant call-screening/accessibility permission → set one emergency contact → (time passes) → a scam-pattern call happens → on-device detection fires within seconds → full-screen plain-language warning → one-tap notify sends a pre-written WhatsApp/SMS → event logged to a simple history.

**5. Feature prioritization:**
- **Must Have:** On-device screen-share/remote-access-during-call detection; full-screen warning with plain-language explanation; one emergency contact + one-tap notify; permission consent screen; basic alert history.
- **Should Have:** Accessibility settings (font size, read-aloud); "protection is active" home status; edit/remove emergency contact.
- **Could Have:** A second detection pattern (fake-refund/collect-request); 2–3 emergency contacts instead of one; founder-facing basic analytics.
- **Won't Have (MVP):** Account Aggregator, transaction risk scoring, Guardian Pay, Fraud Timeline, Trust Circle roles/co-review, LLM explanations, subscriptions, iOS.

**6. Product principles (carried forward from Phase 3 §7, unchanged in substance):** Autonomy first (the warning informs, never auto-acts); never claim power we don't have (the app cannot stop a call, only warn and help notify, and says so); every warning comes with a reason; friction proportional to risk (the detection stays deliberately narrow rather than firing on vague suspicion, protecting trust in a single-purpose app); evidence over blame.

**7. Success metrics:** Real-time detections the user confirms as genuine (a tightly-scoped VHP); % of installs completing permission grant + emergency contact setup within 24 hours; % of users with the protection service still active after 30 days (the honest engagement signal for a background-only app); false-positive dismissal rate, tracked from day one.

**8. Business model:** Free at launch: no subscription. Prove detection accuracy and retention before testing willingness to pay; the validated long-term B2B angle (insurer/bank paying for the family-trust layer, not licensing a risk engine) is a V2/V3 conversation, not an MVP requirement.

**9. Go-to-market:** Founder network + a demo video of a live catch → elder-care NGO and RWA outreach in one city → Play Store SEO → press angle ("India's first on-device scam-call detector for families"). No paid ads, no partnership dependency.

**10. Technical scope:** One Android app; a minimal backend for event logging is optional: a fully on-device V0 (local storage, direct WhatsApp/SMS intent for notification, no server at all) is a legitimate, even leaner alternative worth considering for the very first release.

**11. AI scope:** On-device heuristic classifier only (rule-based: concurrent call + screen-share/remote-access app signal), no server-side ML, rules engine, feature store, or LLM required to launch.

**12. UX scope:** ~5 screens: permission consent, set emergency contact, the warning screen, home status, history + settings.

**13. Analytics scope:** Install, permission_granted/revoked, contact_set, scam_detected, warning_shown, notify_tapped, marked_false_positive: enough to measure Section 7's metrics, nothing more.

**14. Engineering scope:** One Android engineer, 6–8 weeks, per Section 5's sprint plan.

---

# Is this now a stronger portfolio project than the previous version?

**As a different artifact, yes, and the two together are stronger than either alone.** The original 11-phase build demonstrates something real: the ability to design a coherent, internally consistent, production-grade system across strategy, UX, architecture, database, API, and AI: the kind of depth a senior PM or staff engineer is actually judged on. This refactor demonstrates a different, equally real skill: the discipline to take a gift-wrapped, ego-invested body of work and cut it to 15–20% of its size the moment a credible business challenge showed the full version wasn't the right first bet, without pretending the cut was painless or that nothing was lost.

The weakness of the *original* version alone, as a portfolio piece, is that it never had to survive contact with "would anyone actually pay for this, this way, this fast." The weakness of *this* refactor alone is that it's a thin, single-feature app: a good first release, not an impressive systems-design showcase on its own.

**Together, presented as a sequence**, "here's the full platform I designed, here's the investor pressure-test that found the real weaknesses, here's how I cut it to the smallest version that proves the core hypothesis in eight weeks," is a materially stronger interview and portfolio story than either piece alone, because it demonstrates the full arc: ambition, technical depth, business judgment, and the willingness to be wrong about scope in front of an audience. That arc is the actual answer.
