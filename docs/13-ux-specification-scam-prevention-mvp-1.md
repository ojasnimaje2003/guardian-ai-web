# UX Specification: Guardian AI Scam Prevention MVP
### The UX Bible: Every Screen, Flow, and Interaction, Ready for Figma

*Scope is frozen to the MVP defined in `12-strategic-refactor-scam-prevention-mvp.md`: on-device scam-call detection, one emergency contact, alert history, settings. No new features are introduced anywhere in this document. Android-first throughout: where a spec depends on an Android platform mechanism (permission model, notification system), that mechanism is named explicitly, because it changes what's actually designable.*

*One naming convention used throughout: the MVP's single detection pattern (a live call plus a screen-sharing/remote-access app becoming active) is referred to as the **Screen-Share Pattern** in specs, code-facing names, and analytics, not as a generic "risk" or "score," consistent with Principle 3 (every warning comes with a reason) and the product's decision never to expose a bare risk number.*

---

# 1. Information Architecture

Unlike the original 26-screen platform's relationship-and-risk-organized IA (Phase 5), this MVP has no navigation hierarchy worth diagramming as a tree: it is a **single-purpose, mostly-invisible background service with three reachable surfaces**, because that honestly reflects what the product does: it protects silently and only surfaces itself in two situations (an active detection, or the user checking in on their own).

```
Guardian AI
├── Home (root, always the app's default open state)
│   ├── Protection status (the one thing this screen exists to say)
│   ├── Entry to Alert History (icon, top app bar)
│   └── Entry to Settings (icon, top app bar)
│
├── Scam Warning (system-level interrupt — NOT a child of Home; can appear over
│   any screen, any app, or the lock screen, per Section 8's full-screen-intent
│   mechanism — this is the product's actual reason to exist)
│
├── Alert History (reachable from Home only)
│   └── Expandable entries (inline detail, no separate detail screen — MVP has
│       exactly one pattern type, so there is nothing a separate screen would
│       show that an expanded list row can't)
│
└── Settings (reachable from Home only)
    ├── Emergency contact (view / edit)
    ├── Permission status (Phone State, Accessibility Service — with re-grant
    │   path if either was revoked)
    ├── Accessibility (font size, contrast, read-aloud)
    └── About / Privacy (what the app does and doesn't see — see Section 13)
```

**Key IA decision:** there is no tab bar. A four-tab bar (Phase 5's pattern for the full platform) implies four things of comparable daily importance; this product has one thing that matters (protection status) and two secondary, occasionally-visited surfaces (history, settings). A tab bar would overstate the product's own daily relevance to the user: everything reachable from Home's top app bar is the right amount of navigation for what this app actually does.

---

# 2. Navigation Map

```
[App icon tap] ──▶ Home
                     │
                     ├──(history icon)──▶ Alert History ──(back)──▶ Home
                     │
                     └──(settings icon)──▶ Settings
                                             ├──(emergency contact row)──▶ Edit Emergency Contact ──(save/back)──▶ Settings
                                             ├──(permission row, if revoked)──▶ Android System Settings (external) ──▶ back to Settings
                                             └──(back)──▶ Home

[Detection fires, ANY app/screen active] ──▶ Scam Warning (full-screen, system-level)
                                                ├──(End the call now)──▶ dismisses call UI, returns to Home
                                                ├──(This is fine)──▶ confirms false positive, returns to previous app/screen
                                                └──(Notify [contact])──▶ Notify-Sent confirmation (auto-dismisses after 3s) ──▶ returns to previous app/screen

[First install] ──▶ Splash/Welcome ──▶ Permission Explainer ──▶ Phone State grant ──▶ Accessibility Service grant ──▶ Set Emergency Contact ──▶ Onboarding Complete ──▶ Home
```

**Back-navigation rule:** every screen except Scam Warning supports the Android system back gesture/button normally. **Scam Warning intentionally does not support back-to-dismiss**: dismissing an active scam warning requires one of its three explicit actions (Section on that screen), never an accidental back-swipe, because an accidentally-dismissed warning during a live scam is the single worst failure mode this product can have.

---

# 3. Screen Inventory

| # | Screen | Type | Entry | Primary purpose |
|---|---|---|---|---|
| 1 | Splash / Welcome | First-run only | App icon (first launch) | Set expectations before asking for anything |
| 2 | Permission Explainer | Onboarding | From Splash | Explain both permissions before requesting either |
| 3 | Phone State Permission | Onboarding (system dialog + wrapper) | From Explainer | Standard Android runtime permission grant |
| 4 | Accessibility Service Permission | Onboarding (system settings handoff) | From Phone State step | Special-permission grant via System Settings |
| 5 | Set Emergency Contact | Onboarding + reused in Settings | From Accessibility step, or Settings | Capture one contact for the notify action |
| 6 | Onboarding Complete | First-run only | From Set Emergency Contact | Confirm setup, transition to Home |
| 7 | Home | Root, persistent | App open | Show protection status; the app's resting state |
| 8 | Scam Warning | System-level interrupt | Real-time detection event | The core product moment |
| 9 | Alert History | Reachable from Home | History icon | Past detections, self-service reassurance |
| 10 | Settings | Reachable from Home | Settings icon | Contact, permissions, accessibility, privacy |
| 11 | Edit Emergency Contact | Reused (same as Screen 5) | From Settings | Change/remove the contact |

11 entries, 2 of which are the same screen reused (5/11), deliberately lean, matching the frozen MVP's Must/Should-Have scope exactly, with nothing here in service of a Could/Won't-Have feature.

---

# 4. Full Screen Specifications

*Baseline applied to every screen, stated once: minimum 44×44dp tap targets; WCAG 2.1 AA contrast; font scales to 200% without breaking layout; every user-initiated action fires an analytics event named `screen_name.action`, with no PII in the event payload (contact name/number referenced by internal ID only); every screen supports the system read-aloud setting (Screen 10).*

---

## Screen 1: Splash / Welcome

**Purpose:** First impression, sets tone before any ask. Establishes this is a safety tool, not a generic utility app.
**User goal:** Understand in five seconds what this app is for.
**Entry points:** App icon tap, first launch only (never shown again after onboarding completes).
**Exit points:** Auto-advances to Permission Explainer after a brief pause, or immediately on tap.
**Layout hierarchy:** Centered logo/wordmark → one-sentence value statement → single "Get started" button, bottom-anchored.
**Components:** Static illustration or icon (calm, not alarming, per the inherited design language), headline text, single primary button.
**Component behavior:** Button is the only interactive element; entire screen also advances on tap anywhere (reduces friction for a first-time senior user, consistent with the "two taps or fewer" bar the original platform set and this MVP fully retains).
**Validation:** None.
**Empty state:** Not applicable. This screen has no data.
**Loading state:** Not applicable. No network dependency.
**Error state:** Not applicable.
**Success state:** Advancing to the next screen is the success state; no confirmation needed.
**Accessibility:** Screen reader announces the value statement in full before the button; button has an explicit content description ("Get started, begin setup").
**Microcopy:** Headline: *"Guardian AI watches for scam calls, so you don't have to."* Button: *"Get started."*
**Animations:** Simple fade-in on load (200ms cap, per inherited motion rule); no looping or attention-seeking motion: this is a calm first impression, not a marketing splash.
**Haptics:** None.
**Analytics events:** `splash.viewed`, `splash.get_started_tapped`.
**Edge cases:** If the app is force-closed and reopened before onboarding completes, resumes at the last incomplete onboarding step, never back to Splash: Splash is strictly a one-time, first-launch-only screen.

---

## Screen 2: Permission Explainer

**Purpose:** Explain, before asking, exactly what two permissions are needed and why: critical given Android's Accessibility Service permission is the single most scrutinized permission type on the platform, both by users and by Play Store review.
**User goal:** Decide, with full honest information, whether to proceed.
**Entry points:** From Splash (auto-advance or tap).
**Exit points:** "Continue" → Phone State Permission screen. A secondary "Not now" path exists (see Edge cases).
**Layout hierarchy:** Short headline → two concrete explanation blocks (one per permission, each stating exactly what it's for and explicitly what it is *not* used for) → single primary "Continue" button → smaller secondary "Not now" text link.
**Components:** Two explanation cards (icon + short heading + 2–3 line body each), primary button, secondary text link.
**Component behavior:** Both explanation cards are static (no toggle here: the actual grant happens on the next two screens); tapping either card expands a short "why we need this, specifically" detail, collapsed by default.
**Validation:** None.
**Empty/Loading state:** Not applicable.
**Error state:** Not applicable.
**Success state:** Tapping Continue is the success path.
**Accessibility:** Each permission explanation card is read as a complete, self-contained statement, never split mid-sentence by the screen reader.
**Microcopy:**
- Card 1 (Phone State): *"Know when you're on a call. We check whether a call is active, never who you're calling, and we never listen in."*
- Card 2 (Accessibility Service): *"Notice if a screen-sharing app opens during a call. This is the one signal scammers rely on: asking you to install an app like AnyDesk or TeamViewer while you're on the phone with them."*
- Continue button: *"Continue."* Secondary link: *"Not now."*
**Animations:** Standard screen transition (fade-through, 200ms).
**Haptics:** None.
**Analytics events:** `permission_explainer.viewed`, `permission_explainer.card_expanded` (with `card` property), `permission_explainer.continued`, `permission_explainer.deferred`.
**Edge cases:** "Not now" leads to a reduced-function state (Section 9, Permission UX): the app installs but shows a persistent "Protection is off" banner on Home until both permissions are granted; this is never hidden or silently degraded, since a user believing they're protected when they're not is worse than no app at all (Principle 2).

---

## Screen 3: Phone State Permission

**Purpose:** Request the standard Android runtime permission (`READ_PHONE_STATE`) needed to know call-active status.
**User goal:** Grant (or decline) a normal Android permission dialog.
**Entry points:** From Permission Explainer's "Continue."
**Exit points:** System dialog resolves (Allow/Deny) → auto-advances to Accessibility Service Permission screen regardless of outcome (a decline doesn't block progress; it degrades functionality, tracked in Settings).
**Layout hierarchy:** Brief restatement ("Now we'll ask Android to confirm this") → system permission dialog (OS-rendered, not app-designed) → automatic advance.
**Components:** One-line context text above the OS dialog trigger; the dialog itself is system UI, out of this spec's design control by Android platform convention.
**Component behavior:** App triggers the standard `requestPermissions()` dialog on screen entry, after a brief pause so the context text is visible first, never firing the OS dialog instantly on screen load, which reads as demanding rather than explaining.
**Validation:** None (permission result is a system callback, not form input).
**Loading state:** Brief context text shown while the OS dialog is pending, not a spinner.
**Error state:** If the permission was previously permanently denied ("don't ask again"), the screen instead shows a direct link to the app's Android system settings page, with copy explaining exactly which toggle to enable.
**Success state:** Granted → brief checkmark micro-confirmation → auto-advance.
**Empty state:** Not applicable.
**Accessibility:** Context text is read aloud before the OS dialog gains focus.
**Microcopy:** *"Android will ask to confirm this: tap Allow."*
**Animations:** None beyond the standard transition; the OS dialog's own animation is outside this spec.
**Haptics:** Light tap-confirmation haptic on successful grant.
**Analytics events:** `permission_phone_state.requested`, `permission_phone_state.granted`, `permission_phone_state.denied`.
**Edge cases:** Denied-and-continuing users still complete onboarding; the app functions with the Screen-Share Pattern detection permanently degraded (cannot confirm a call is active, so it can only detect the screen-share-app-opening half of the signal): this exact limitation is stated plainly in Settings' permission-status row, never silently assumed fixed.

---

## Screen 4: Accessibility Service Permission

**Purpose:** Grant Android's Accessibility Service permission: a special permission that **cannot** be granted via an in-app dialog; Android requires the user to navigate to System Settings → Accessibility → [Guardian AI] and toggle it on manually, then return to the app. This is a hard Android platform constraint, not a design choice, and the screen is built around it rather than pretending it doesn't exist.
**User goal:** Successfully complete an out-of-app settings toggle and return.
**Entry points:** Auto-advance from Phone State Permission screen.
**Exit points:** Successful grant, detected on app resume, auto-advances to Set Emergency Contact.
**Layout hierarchy:** Restated context (why, specifically, tied to the earlier explainer) → single "Open Settings" button → after return, an automatic re-check with a visible "Checking..." state → success confirmation.
**Components:** Context text block, "Open Settings" primary button, a numbered 3-step mini-guide ("1. Find Guardian AI in the list. 2. Tap it, then tap the toggle. 3. Come back here. We'll check automatically.") shown because this exact settings path is one of the most common places non-technical users get lost in any Android app requiring this permission.
**Component behavior:** Tapping "Open Settings" launches an explicit Intent to the Accessibility Settings screen (`Settings.ACTION_ACCESSIBILITY_SETTINGS`); on app resume (`onResume`), the app automatically re-checks grant status: the user never has to tap a "check again" button themselves.
**Validation:** Grant status is checked programmatically, not self-reported.
**Loading state:** A brief "Checking..." state (under 1 second typically) on resume while the check runs.
**Error state:** If the user returns without granting, the screen stays, restates the 3 steps with slightly expanded detail, and offers a "Skip for now" path with the same honest degraded-functionality framing as Screen 3's decline path, **specifically calling out that without this permission, the app cannot detect the Screen-Share Pattern at all**, since this is the permission the entire detection mechanism depends on.
**Success state:** Checkmark micro-confirmation, brief pause, auto-advance.
**Empty state:** Not applicable.
**Accessibility:** The numbered mini-guide is structured as an actual ordered list for screen readers, not a run-on paragraph.
**Microcopy:** *"One more step: this one happens in your phone's Settings, not here."* Button: *"Open Settings."* Post-return checking: *"Checking..."* Success: *"Got it. Guardian AI can now watch for this pattern."*
**Animations:** Standard transition; no motion during the external Settings visit (outside app control).
**Haptics:** Light confirmation haptic on successful grant detection.
**Analytics events:** `permission_accessibility.instructions_viewed`, `permission_accessibility.settings_opened`, `permission_accessibility.granted`, `permission_accessibility.skipped`.
**Edge cases:** A user who grants the permission but for a *different* accessibility service by mistake (a real risk in a long system list) sees the check simply fail to detect Guardian AI's specific service as active: the "Checking..." state resolves to the error state above, with copy that re-emphasizes finding "Guardian AI" by name in the list, not a generic "still not granted" message.

---

## Screen 5 / 11: Set / Edit Emergency Contact

**Purpose:** Capture the one contact who receives the one-tap notify message during a live warning.
**User goal:** Set (or change) exactly one trusted contact, quickly.
**Entry points:** Onboarding (as Screen 5, first-time capture) or Settings → "Emergency contact" row (as Screen 11, edit).
**Exit points:** "Save" → Onboarding Complete (first-time) or back to Settings (edit mode).
**Layout hierarchy:** Short headline → contact name field → phone number field (with device contact-picker shortcut) → one-line explanation of what happens when this contact is notified → primary "Save" button.
**Components:** Two text inputs (name, phone; phone pre-validated against Indian mobile number format), a "Choose from contacts" button that opens the native Android contact picker, primary Save button.
**Component behavior:** The contacts-picker shortcut is offered first and prominently, since manually typing a phone number is real friction for the primary persona; manual entry remains available as a fallback. Save is disabled until both fields are valid.
**Validation:** Name: non-empty. Phone: valid 10-digit Indian mobile number format, checked on field blur, not only on Save-tap (so the error surfaces before the user reaches the button and gets confused why it's disabled).
**Empty state:** First-time capture (Screen 5) shows both fields empty with placeholder examples ("e.g., Anjali", "e.g., 98765 43210"). Edit mode (Screen 11) pre-fills the current contact.
**Loading state:** Brief spinner on Save only if a network call is involved (Section 10, Technical Scope leaves this optional: if the backend-less V0 is chosen, Save is instant, local-only, no loading state needed at all).
**Error state:** Inline field-level errors only ("This doesn't look like a valid phone number"); never a top-of-screen generic error banner for a two-field form.
**Success state:** In edit mode, a brief toast ("Emergency contact updated") on return to Settings. In onboarding mode, direct advance to Onboarding Complete with no separate toast (the next screen *is* the confirmation).
**Accessibility:** Both fields have explicit labels (not placeholder-only, which screen readers can announce inconsistently); the contacts-picker button is announced as "Choose from your contacts."
**Microcopy:** Headline: *"Who should we notify if something looks like a scam?"* Explanation line: *"We'll send them a short message with your name and the time, nothing about your accounts or money."* Save button: *"Save."*
**Animations:** Standard transition only.
**Haptics:** None on this screen (reserved for higher-stakes moments per Section 6).
**Analytics events:** `emergency_contact.viewed` (with `mode: onboarding|edit`), `emergency_contact.picker_used`, `emergency_contact.saved`, `emergency_contact.removed` (edit mode only).
**Edge cases:** Editing to *remove* the contact entirely (leaving the field blank and saving) is allowed and shows a distinct confirmation ("Without an emergency contact, Guardian AI can still warn you, but won't be able to notify anyone else"): removal degrades one feature, never blocks the rest of the app, consistent with Principle 1 (nothing here should trap a user into keeping data they don't want stored).

---

## Screen 6: Onboarding Complete

**Purpose:** Confirm setup succeeded and set expectations for what happens next (mostly nothing, until it matters).
**User goal:** Understand that setup is done and the app now works quietly in the background.
**Entry points:** From Set Emergency Contact (first-time only).
**Exit points:** "Done" → Home. Auto-advances after a longer pause if not tapped (this is a confirmation, not a decision point).
**Layout hierarchy:** Checkmark/confirmation visual → short reassurance statement → single "Done" button.
**Components:** Static confirmation icon, headline, single button.
**Component behavior:** None beyond the button/auto-advance.
**Validation:** None. **Empty/Loading/Error states:** Not applicable.
**Success state:** This entire screen *is* the success state.
**Accessibility:** Full statement read aloud on screen entry, before requiring any interaction.
**Microcopy:** *"You're set up. Guardian AI is now watching quietly in the background. You won't hear from it unless something looks wrong."* Button: *"Done."*
**Animations:** A single, restrained checkmark-draw animation (under 400ms, the one deliberate exception to the 200ms cap, justified because this is a one-time completion moment, not a repeated interaction), explicitly not a celebratory bounce or confetti, consistent with the inherited "no celebratory motion" design principle (Phase 7, A22) applied here to onboarding completion, not just payments.
**Haptics:** Single light confirmation tap.
**Analytics events:** `onboarding.completed`.
**Edge cases:** None specific to this screen. It cannot be reached in a state that has anything left to fail.

---

## Screen 7: Home

**Purpose:** The app's resting state. Must communicate protection status truthfully at a glance, including when protection is *not* fully active.
**User goal:** Confirm, in under two seconds, "is this working right now."
**Entry points:** App icon tap (any time after onboarding); back-navigation from History or Settings.
**Exit points:** History icon → Alert History. Settings icon → Settings. (No other exits; this is the root.)
**Layout hierarchy:** Top app bar (app name/logo, history icon, settings icon) → large central status card (the dominant element) → below it, a condensed "recent activity" strip (last 1–2 history entries, or an explicit empty-state line if none) → nothing else.
**Components:** Top app bar, Status Card (Section 6 component inventory), condensed recent-activity strip.
**Component behavior:** Status Card has exactly two states: "Protection is active" (both permissions granted) or "Protection is off" (one or both permissions missing/revoked), the latter with a direct "Fix this" button leading straight to the relevant Settings permission row, not a generic Settings link.
**Validation:** Not applicable.
**Empty state:** No detections yet: recent-activity strip shows *"No alerts yet. That's exactly what we want to see,"* explicitly framed as good news (inherited directly from the original platform's Alert List empty-state pattern, Phase 6, which the same reasoning applies to unchanged: an anxious user checking this screen should feel reassured, not greeted by a sterile blank space).
**Loading state:** On first load only (rare, since most data is local), a skeleton version of the Status Card, never a full-screen spinner.
**Error state:** If permission status genuinely cannot be determined (a rare OS-level check failure), the Status Card shows a neutral "Can't confirm protection status right now" state, distinct in color/icon from both the active and off states: never defaulting to looking like "active" when the system isn't sure, which would be a false-confidence failure (Principle 2).
**Success state:** "Protection is active," rendered as the default expected state, not a celebratory one. This is supposed to be the boring, permanent normal.
**Accessibility:** Status Card's state is the first thing the screen reader announces on screen focus, before the app bar icons.
**Microcopy:** Active: *"Protection is active."* Off: *"Protection is off. Guardian AI can't watch for scam calls right now."* Fix button: *"Fix this."*
**Animations:** Status Card transitions between active/off states with a simple cross-fade (200ms), no alarming motion for the "off" state itself, since alarm is reserved for Screen 8 specifically.
**Haptics:** None on this screen.
**Analytics events:** `home.viewed`, `home.protection_status_shown` (with `status` property), `home.fix_this_tapped`, `home.history_icon_tapped`, `home.settings_icon_tapped`.
**Edge cases:** If the Accessibility Service permission is silently revoked by the OS (this happens on some Android manufacturers' aggressive battery-optimization settings, a well-known real-world failure mode for accessibility-service-dependent apps), the Status Card must reflect "off" the next time Home is viewed: the app should not display a stale "active" status from a cached value; status is re-checked on every Home resume, not just on app launch.

---

## Screen 8: Scam Warning

**Purpose:** The single most important screen in the product. Interrupts whatever the user is doing, the instant the Screen-Share Pattern is detected, and helps them act before harm occurs.
**User goal:** Understand, in seconds, that this is a likely scam, and take one clear action.
**Entry points:** **Not a normal in-app navigation.** Triggered via an Android full-screen Intent notification (`Notification.Builder.setFullScreenIntent()`), which is the platform mechanism specifically designed to interrupt the *current* app, the lock screen, or an ongoing phone call UI: the same mechanism incoming-call and alarm-clock apps use. This is a deliberate, correct use of a high-priority Android API, chosen because nothing less than a full-screen interrupt reliably reaches a user who is actively engaged in a phone call with a scammer.
**Exit points:** One of three explicit actions only (no back-dismiss, per Section 2's navigation rule): each returns the user to wherever they were (the call UI, whatever app was open, or the lock screen) rather than into Guardian AI's own Home, since the point is to return control to the moment being interrupted, not to pull the user into the app further.
**Layout hierarchy:** Top: a clear, non-alarmist pattern label ("Possible scam pattern detected," never a bare risk word or color alone). Middle: plain-language explanation, exactly one sentence, naming the specific detected signal. Below that: one contextual detail line (which app was detected, e.g., "AnyDesk opened during your call"). Bottom: three actions, in this fixed order and visual weight: **"End the call now"** (primary, visually dominant: this is the single most protective action available), **"Notify [contact name]"** (secondary, equal-ish weight, one-tap), **"This is fine, I know this person"** (tertiary, smallest, bottom-most, deliberately least prominent without being hidden, since it must remain honestly available, per Principle 1, but should never look like the recommended path).
**Components:** Pattern label badge, explanation text block, context detail line, three-action stack (not a row: full-screen vertical stacking for maximum tap-target size and lock-screen legibility).
**Component behavior:** "End the call now" attempts to end the active call via the telephony API where permitted, or, where Android restricts third-party call termination (a real platform limitation on some OS versions), instead surfaces a large, unmissable "Hang up" instruction pointing at the system call UI rather than falsely claiming to end it itself. **This distinction must never be papered over; the button's actual behavior depends on what the OS allows, and the copy adapts to match exactly what happened, per Principle 2.** "Notify [contact name]" fires an Android Intent to the pre-set contact's WhatsApp (if installed) or SMS (fallback) with a pre-written message (Section 13), then shows a brief inline confirmation without leaving this screen. "This is fine" requires no second confirmation tap (unlike the original platform's two-step override pattern for Guardian Pay), because unlike stopping a payment, dismissing this warning has no truly irreversible consequence attached to a single tap; a false-positive dismissal simply logs and moves on.
**Validation:** Not applicable.
**Loading state:** The screen itself must never show a loading state before rendering. Detection and rendering happen together (Screen 8 only exists once detection has already fired); the "Notify" action shows a brief inline sending indicator (under 1 second typically) on the confirmation line only.
**Error state:** If the notify action fails (e.g., neither WhatsApp nor SMS could be triggered), the confirmation line shows a specific, actionable message ("Couldn't send: check your emergency contact number in Settings") rather than a silent failure: a user must never believe help was notified when it wasn't.
**Success state:** The "Notify sent" inline confirmation, appearing directly below the action, without navigating away from the warning (the user may still need to act on "End the call now" after notifying).
**Accessibility:** Read-aloud (Screen 10's system setting) announces the pattern label and explanation **immediately and automatically** on screen appearance, without waiting for a manual read-aloud trigger: this is the one screen in the product where accessibility announcement should be automatic rather than opt-in-per-use, given the time-criticality and the likelihood the user is mid-call and not looking at the screen continuously.
**Microcopy:** Label: *"Possible scam pattern detected."* Explanation: *"You're on a call, and [app name] just opened: scammers often ask for this to access your phone or accounts."* Context line: *"Detected: [App Name] opened at [time]."* Actions: *"End the call now"* / *"Notify [Contact Name]"* / *"This is fine, I know this person."*
**Animations:** Screen appears instantly, no fade-in: this is the one deliberate exception to every other screen's calm transition rule, because a slow, gentle entrance is wrong for a time-critical interrupt. Once visible, no further motion (no pulsing, no flashing): urgency is communicated through immediacy of appearance and haptic/sound (below), not through sustained agitated motion, staying consistent with the inherited "calm palette, no visual panic" philosophy even on this highest-stakes screen.
**Haptics:** A distinct, strong haptic pattern (Android's `VibrationEffect` with a deliberately different waveform from any other in-app haptic) fires the instant the screen appears: this is the single strongest haptic moment in the entire app, reserved exclusively for this screen, precisely so the user learns to associate this specific vibration with "this matters right now."
**Analytics events:** `scam_warning.shown`, `scam_warning.end_call_tapped`, `scam_warning.notify_tapped`, `scam_warning.notify_sent`, `scam_warning.notify_failed`, `scam_warning.marked_false_positive`.
**Edge cases:** If the detected call ends on its own (scammer hangs up) while this screen is still showing, the screen remains visible with the same three actions available: the warning's value (informing the user, offering to notify someone) doesn't disappear just because the call ended, and "End the call now" simply becomes inert/hidden if there's no longer a call to end, replaced by an acknowledgment-only "Got it" alongside the still-available Notify and false-positive actions. If the screen is triggered while the device is locked, it must be visible and actionable directly over the lock screen (a standard, permitted behavior for full-screen-intent notifications), without requiring the user to first unlock the phone: any added step here directly costs the seconds that matter most.

---

## Screen 9: Alert History

**Purpose:** Let the user (or, later, a family member if this scope reappears in V2) see past detections for self-service reassurance and pattern-checking, without needing to contact support.
**User goal:** Quickly confirm what's happened, if anything, and when.
**Entry points:** Home's history icon.
**Exit points:** Back navigation to Home. Tapping an entry expands it inline (no navigation).
**Layout hierarchy:** Top app bar (back arrow, "Alert History" title) → reverse-chronological list of entries, each showing date/time, the one-line pattern label, and the action taken (notified / marked fine / call ended) → expandable inline detail per entry.
**Components:** List item component (Section 6), inline expand/collapse.
**Component behavior:** Tapping a row expands it in place to show the full original explanation text and context line, exactly as it appeared on Screen 8 at the time: a historical record should show what was actually said then, not a regenerated summary, preserving trust that the record is accurate.
**Validation:** Not applicable.
**Empty state:** *"No alerts yet. That's exactly what we want to see"* (same reassurance-framed copy as Home's condensed strip, Screen 7, kept identical rather than rewritten, so the same message is trusted as consistent wherever it appears).
**Loading state:** Standard list skeleton on initial load (local data, typically near-instant).
**Error state:** Not generally applicable for local-only data; if a future backend sync fails, a small non-blocking "Some recent alerts may not be shown" note appears at the top of the list rather than blocking the whole screen.
**Success state:** The populated, correctly-ordered list is itself the success state.
**Accessibility:** Each list row is a single, complete announced unit ("Possible scam pattern, [date], you chose Notify [contact name]"), never split across multiple focus stops per row.
**Microcopy:** Title: *"Alert History."* Empty state as above. Row action labels use the same past-tense phrasing as the actions taken: *"You notified [Contact Name]"* / *"You marked this as fine"* / *"You ended the call."*
**Animations:** Standard list-item expand/collapse (200ms), standard screen transition.
**Haptics:** None.
**Analytics events:** `alert_history.viewed`, `alert_history.entry_expanded`.
**Edge cases:** An entry where the user chose "This is fine" is still shown (not hidden or treated as a non-event), because a pattern of repeated false-positive-marked entries against the same app/context is useful for the user to notice themselves, and hiding dismissed alerts would quietly imply they didn't matter, which contradicts Principle 5 (evidence over blame: nothing here should make a user feel foolish for having correctly identified a false alarm, but it also shouldn't be erased).

---

## Screen 10: Settings

**Purpose:** Single home for everything not part of daily use: contact, permissions, accessibility, and privacy transparency.
**User goal:** Find and adjust any of the above without hunting.
**Entry points:** Home's settings icon.
**Exit points:** Back to Home. Individual rows lead to their own sub-screens/actions.
**Layout hierarchy:** Top app bar (back arrow, "Settings" title) → grouped list sections in this order: **Emergency Contact** (current contact name, tap to edit) → **Permissions** (two rows, Phone State and Accessibility Service, each showing granted/not-granted status with a re-grant action if needed) → **Accessibility** (font size, contrast, read-aloud toggle) → **About & Privacy** (single row linking to a plain-language explanation of exactly what data the app collects and why).
**Components:** Grouped settings-list rows (standard Android list-item pattern), status indicators on the Permissions rows, toggles/sliders within the Accessibility section.
**Component behavior:** A Permissions row showing "Not granted" is never just informational: it always has a direct, one-tap path back into the relevant grant flow (Screens 3/4's logic, re-entered from here rather than duplicated).
**Validation:** Not applicable (delegated to the specific sub-flows).
**Empty state:** Not applicable. Settings always has content.
**Loading state:** Not applicable (all local, instant).
**Error state:** Not applicable at this screen's level.
**Success state:** Correctly reflecting live permission/contact state at all times is this screen's entire job.
**Accessibility:** Section headers ("Emergency Contact," "Permissions," "Accessibility," "About & Privacy") are announced as headings, not plain list rows, so screen-reader users can jump between sections.
**Microcopy:** Section headers as above. Permission row example: *"Accessibility Service: Not granted. Tap to fix."* About & Privacy row: *"What Guardian AI can and can't see."*
**Animations:** Standard transitions only.
**Haptics:** None.
**Analytics events:** `settings.viewed`, `settings.emergency_contact_tapped`, `settings.permission_row_tapped` (with `permission_type`), `settings.accessibility_changed` (with `setting` property), `settings.privacy_viewed`.
**Edge cases:** If both permissions are already granted, the Permissions section still displays (never hidden once satisfied) so the user always has a place to confirm status is still healthy, given the Home-screen edge case (Screen 7) where an OS can silently revoke Accessibility Service in the background.

---

# 5. Complete User Flows

**Flow A: First-time setup (only flow every user completes once)**
Splash → Permission Explainer → Phone State grant → Accessibility Service grant (with possible Settings round-trip) → Set Emergency Contact → Onboarding Complete → Home.

**Flow B: The core moment (the product's entire reason to exist)**
User is on a phone call, anywhere in any app or on the lock screen → scammer asks them to open a screen-sharing app → on-device detection fires within seconds of the app opening → full-screen intent triggers Scam Warning over whatever was active → user reads the one-sentence explanation → user taps one of three actions → (if Notify) contact receives a WhatsApp/SMS message within seconds → user returns to wherever they were, or ends the call → event appears in Alert History.

**Flow C: Checking in (reassurance-seeking, expected to be common for an anxious user)**
Home → status card confirms "Protection is active" → optionally taps History → sees empty or populated list → returns to Home. No dead ends, no required actions: this flow exists purely to be reassuring, and its empty state (Screen 7/9) is written specifically for this moment.

**Flow D: Fixing a permission that was silently revoked**
Home shows "Protection is off" → user taps "Fix this" → lands directly on the relevant Settings permission row → re-enters Screen 3 or 4's grant flow → returns to Settings, then Home, now showing "Protection is active."

**Flow E: Changing the emergency contact**
Settings → Emergency Contact row → Edit Emergency Contact (Screen 11) → Save → toast confirmation → back to Settings.

---

# 6. Task Flows (condensed, decision-point view)

**Task: "Is this thing actually working?" (Ramesh persona, anxiety check)**
Open app → Home → read Status Card → done. Zero taps beyond opening the app if protection is active; one tap ("Fix this") if not.

**Task: "I'm on a call and something feels wrong, but Guardian AI hasn't said anything."**
This is a real gap the product must be honest about: MVP's detection is narrow (Screen-Share Pattern only, per the frozen scope's Won't-Have list): if a scam is happening through a different mechanism (a fake refund request, a purely verbal impersonation with no app involved), Guardian AI will not detect it, and no screen in this spec claims otherwise. About & Privacy (Screen 10) states this limitation plainly, rather than implying broader protection than the frozen MVP scope delivers.

**Task: "I got a warning and I'm not sure if it's real." (the moment Screen 8 is built entirely around)**
Warning appears → read the one sentence and the context line → decide → tap one action → done, in well under the time it takes to describe the task.

---

# 7. Component Inventory

| Component | Used in | Key spec |
|---|---|---|
| **Status Card** | Home | Two states (active/off) plus a rare error state; the single largest element on its screen; color and icon per inherited design-system tokens (Section 14) |
| **Warning Action Stack** | Scam Warning | Three vertically-stacked actions, fixed order and relative visual weight, never reordered or made symmetrical: the asymmetry itself (End call most prominent, This is fine least) is deliberate design, not a default |
| **Permission Status Row** | Settings | Label + granted/not-granted indicator + conditional re-grant action; reused identically for both permission types so the pattern is learned once |
| **Contact Field Group** | Set/Edit Emergency Contact | Name + phone inputs plus the native contacts-picker shortcut, always offered before manual entry |
| **History List Item (expandable)** | Alert History | Collapsed: date, pattern label, action taken. Expanded: full original explanation text, verbatim |
| **Reassurance Empty State** | Home (condensed strip), Alert History | Identical copy in both locations, explicitly positive framing, never a generic "nothing here" pattern |
| **Onboarding Progress Indicator** | Screens 2–6 | A simple "step X of 5" text indicator (not a visual progress bar, to avoid implying more steps remain than the genuinely short flow has) |

---

# 8. Interaction Specifications

- **Full-screen intent trigger (Scam Warning):** Fires via Android's high-priority full-screen-intent notification API, the same mechanism used by phone/alarm apps to guarantee visibility over the lock screen and other foreground apps: this is not a standard in-app navigation and must be implemented as such, not simulated with a regular Activity launch that could be suppressed by battery optimization or Doze mode.
- **Two distinct permission-grant mechanics, never conflated in copy or flow:** the standard runtime dialog (Phone State, Screen 3) versus the Settings-redirect special permission (Accessibility Service, Screen 4) are visually and textually differentiated at every mention, so a user never expects one mechanism's simplicity from the other.
- **No back-dismiss on Scam Warning** (restated from Section 2): this is the one screen in the entire app where the platform back gesture is intentionally intercepted and does nothing, a deliberate, documented exception to otherwise-universal back-navigation support.
- **Notify action is fire-and-forget with visible confirmation, never blocking**: the user can act on "End the call now" immediately after tapping Notify without waiting for send confirmation to resolve first; both can be in flight at once.

---

# 9. Notification Strategy

Guardian AI has exactly two notification types, and no others, matching the frozen MVP's narrow scope precisely:

1. **The Scam Warning full-screen intent** (Screen 8): maximum priority, bypasses Do Not Disturb (a deliberate, justified exception, since this is the digital equivalent of an emergency alert and treating it as suppressible background noise would defeat its purpose), fires only on an actual detection event, never for any other reason (no marketing notifications, no re-engagement nudges, no "come back and check your history" prompts: this app earns trust specifically by never crying wolf for engagement's sake, directly serving Principle 4).
2. **A standard (non-intrusive) notification for permission-health issues**, e.g., if Accessibility Service is detected as silently revoked (Screen 7's edge case) while the app isn't open, a normal-priority notification (not full-screen) informs the user protection is off, so they don't have to open the app proactively to discover this.

**No other notification category exists in this product.** This absence is itself a stated design decision, not an oversight: anything that would dilute the meaning of a Guardian AI notification arriving is explicitly out of scope.

---

# 10. Permission UX

Two permissions, two fundamentally different Android grant mechanisms, and the UX must never blur them:

| Permission | Android mechanism | UX implication |
|---|---|---|
| **Phone State** (`READ_PHONE_STATE`) | Standard dangerous runtime permission: in-app system dialog, resolved in seconds | Screen 3 designs around a quick in-app moment |
| **Accessibility Service** | Special permission: cannot be granted via any in-app dialog; requires navigating to System Settings and returning | Screen 4 designs around an out-of-app round trip, with explicit step-by-step guidance and automatic re-check on return, because this exact hand-off is where non-technical users most commonly get lost or give up in any app requiring this permission |

**Both permissions are explained (Screen 2) before either is requested**: never a blind, sequential "just tap Allow" pattern with no context, since Accessibility Service specifically carries enough real-world stigma (frequently abused by malware) that an unexplained request is likely to be declined out of reasonable caution, undermining the entire product.

**Decline paths always lead to a truthfully degraded app, never a dead end and never a silent lie about capability** (Screens 3/4's error states, Home's "Protection is off" state), consistent with Principle 2 across the entire permission model, not just at onboarding.

---

# 11. Accessibility Guidelines

- WCAG 2.1 AA contrast minimum, inherited unchanged from the original design system (Phase 7).
- Font scaling to 200% without layout breakage, tested specifically against Scam Warning and Home, the two screens most likely to be viewed under stress or by the primary persona's typical comfort level with dense UI.
- **Read-aloud is opt-in everywhere except Scam Warning, where it is automatic**: this is the one deliberate accessibility exception in the entire spec, justified by the time-criticality of that specific screen (Section 4, Screen 8).
- All interactive elements have explicit content descriptions: no icon-only button anywhere lacks a text label or accessible name, given the primary persona's stated preference (inherited from the original platform's Ramesh persona) against unfamiliar iconography without support.
- Minimum 44×44dp tap targets everywhere, increased spacing (matching the original platform's precedent) specifically on Scam Warning's action stack, where a mis-tap has the highest cost of any screen in the app.

---

# 12. Motion Guidelines

- Standard transitions capped at 200ms, inherited from the original design system, applied to every screen **except** Scam Warning (instant appearance, no fade, per Section 4) and Onboarding Complete's one-time checkmark animation (under 400ms, a stated, singular exception).
- No celebratory or bouncy motion anywhere in the product: inherited unchanged, and if anything more clearly justified here than in the original broader platform, since this app's entire tone is "quiet until it matters."
- No sustained/looping motion on Scam Warning once it has appeared: urgency is communicated by the speed of arrival and the haptic pattern, not by ongoing visual agitation, preserving the inherited "calm palette, no visual panic" philosophy even at the product's single highest-stakes moment.

---

# 13. Copywriting Guidelines

- **Never say "risk score" or expose a number anywhere**: inherited directly and enforced even more simply here, since MVP has exactly one detection pattern to describe, not a multi-factor score to summarize.
- **Name the specific detected fact, every time** ("AnyDesk opened during your call," not "unusual activity detected"), a direct continuation of the original platform's Principle 3 discipline.
- **Active voice, no jargon**: no "accessibility service," "telephony state," or any Android-technical term ever appears in user-facing copy; those terms exist only in this specification and in Settings' permission-status rows, where the underlying Android permission name is unavoidable but is always paired with a plain-language purpose statement next to it.
- **The pre-written Notify message** (sent via WhatsApp/SMS from Screen 8) reads: *"Guardian AI flagged a possible scam call for [User's Name] just now. You might want to check in with them."*, factual, non-alarmist, and names the app so the recipient isn't confused about what generated the message.
- **Never imply broader protection than the frozen scope delivers**: About & Privacy (Screen 10) states plainly that Guardian AI currently watches for one specific pattern (screen-sharing apps opening during a call) and not other kinds of scams, matching the honest task-flow limitation noted in Section 6.

---

# 14. Design Tokens

*This MVP inherits its full token set from the original design system (Phase 7) rather than redefining one. Per instruction, this document is not a design system. Listed here for handoff convenience: which existing tokens this MVP's screens actually use, and the one new token this scope requires.*

- `type.display`, `type.heading`, `type.body-large`, `type.body`, `type.caption`, `type.numeric`: all used as originally specified; `body-large` remains the default for Scam Warning's explanation text, matching the same accessibility reasoning that originally set it.
- `color.calm`: Home's "active" status, default app chrome.
- `color.concern`: Scam Warning's pattern label only; still the muted red-orange, **not** a saturated alarm-red, preserving the original design system's explicit anti-panic decision even on this app's single highest-stakes screen.
- `color.data-unavailable`: repurposed for Home's rare "can't confirm status" state (Screen 7), matching its original intent (a degraded/unknown state must never look like either a clean or an alarmed state).
- **New token required:** `color.protection-off`: a distinct, calm neutral-amber tone (not reusing `color.concern`, since "protection is off" is a configuration state, not a live risk alert, and conflating the two would teach the user to associate the wrong urgency level with a routine settings issue). Recommend deriving from the existing `color.attention` token rather than introducing an entirely new hue, for palette consistency.
- Spacing, radius, and motion tokens (Phase 7 §4/§8) are inherited unchanged.

---

# 15. Handoff Notes for Figma

- Build Scam Warning first: it is the screen every other design decision in this spec was reasoned backward from, and getting its visual weight/hierarchy right in high fidelity should drive the rest of the file's conventions, not the reverse.
- Onboarding (Screens 2–6) should be built as a single Figma flow/section with the step-indicator component (Section 7) applied consistently, since all five screens share layout DNA.
- The Accessibility Service permission screen (Screen 4) needs its 3-step mini-guide designed as a genuinely distinct visual component from a normal body-text paragraph: this is the single highest-drop-off-risk screen in onboarding and deserves disproportionate design attention relative to its apparent simplicity.
- Do not design a tab bar. Confirm with engineering early that Home/History/Settings navigate via a simple back-stack, not a bottom-navigation component, since this affects Android navigation-library setup, not just visuals.
- Two permission-row states (granted/not-granted) in Settings should be built as true component variants, not duplicated static frames, since their live status must be data-driven in the final build.
- No screen in this file requires a dark-mode-specific pass at MVP: out of scope, not addressed here. Flag explicitly if raised later so it isn't silently assumed covered.
