# Sprint 1 Implementation Report
### Guardian AI: Android UI Foundation

*Prepared against the frozen MVP scope (`docs/12`–`15`) and the engineering spec (`docs/14`). This report documents what was built, not what was decided: product/architecture decisions remain owned by the docs in `/docs`.*

---

## 1. Executive Summary

Sprint 1 delivered a complete, buildable-by-design Android application shell for Guardian AI's scam-detection MVP: Gradle project scaffolding, a Material 3 design system matching `docs/15`'s visual spec, all 11 frozen UX screens (`docs/13`) wired into a single-stack Navigation Compose graph, 9 reusable components, MVVM + Hilt throughout, and 3 unit test files.

Per the sprint brief's explicit exclusions, **no Accessibility Service, scam detection, real notifications, persisted emergency contact, backend, or networking exist yet.** Every screen that depends on one of those (Accessibility grant, Emergency Contact save, Scam Warning, Alert History) is built with real, working UI and either an honest "not yet" state or a clearly-labeled mock, rather than a fake success path. This was a deliberate application of the product's own Principle 2 ("never claim power we don't have") to the app's own current state.

**The build has not been executed.** This sandbox has no JDK, no Gradle, and no Android SDK, and the Gradle wrapper's binary (`gradle-wrapper.jar`) could not be generated offline. Every file was instead hand-reviewed through a systematic grep-based sweep for missing/incorrect imports, mismatched Composable signatures, and other patterns a compiler would normally catch; that pass found and fixed roughly a dozen real bugs (wrong `rememberSaveable` import path in three files, a fabricated `collectAsStateSafely()` call, leftover garbled code referencing an undefined function, several missing `androidx.compose.foundation.layout.size`/`weight` imports, and others, see §10, §13). This closes the highest-risk categories but is not a substitute for a real compile. First actual verification will happen when this is opened in Android Studio or built with `./gradlew assembleDebug` on a machine with the toolchain installed.

---

## 2. Folder Tree

```
guardian-ai/
├── CLAUDE.md
├── docs/
│   ├── 00–15 (frozen design docs, unmodified)
│   └── reports/
│       └── sprint-1-report.md          ← this file
├── assets/  backend/  design/          (empty, unmodified)
└── android/
    ├── settings.gradle.kts
    ├── build.gradle.kts
    ├── gradle.properties
    ├── gradlew, gradlew.bat
    ├── .gitignore
    ├── gradle/
    │   ├── libs.versions.toml
    │   └── wrapper/gradle-wrapper.properties   (.jar missing — see §10)
    └── app/
        ├── build.gradle.kts
        ├── proguard-rules.pro
        └── src/
            ├── main/
            │   ├── AndroidManifest.xml
            │   ├── java/com/guardianai/app/
            │   │   ├── GuardianApplication.kt
            │   │   ├── MainActivity.kt
            │   │   ├── navigation/         (GuardianNavHost, GuardianRoutes)
            │   │   ├── di/                 (DataStoreModule, RepositoryModule)
            │   │   ├── data/
            │   │   │   ├── repository/     (Settings, PermissionStatus + Impls)
            │   │   │   └── local/datastore/
            │   │   └── ui/
            │   │       ├── theme/          (Color, Type, Shape, Spacing, Motion, Theme)
            │   │       ├── components/     (9 reusable composables)
            │   │       ├── util/           (ContextExt)
            │   │       ├── splash/
            │   │       ├── onboarding/{explainer,phonestate,accessibility,contact,complete}/
            │   │       ├── home/
            │   │       ├── warning/
            │   │       ├── history/
            │   │       └── settings/
            │   └── res/
            │       ├── values/             (strings, colors, themes)
            │       ├── drawable/           (launcher bg/fg, shield icon)
            │       └── mipmap-anydpi-v26/  (adaptive icon)
            └── test/java/com/guardianai/app/ui/
                ├── home/HomeViewModelTest.kt
                ├── onboarding/contact/EmergencyContactUiStateTest.kt
                └── onboarding/phonestate/PhoneStatePermissionViewModelTest.kt
```

---

## 3. Files Created

| Category | Count | Notes |
|---|---|---|
| Root Gradle files | 8 | `settings.gradle.kts`, `build.gradle.kts`, `gradle.properties`, `.gitignore`, `gradlew`, `gradlew.bat`, `libs.versions.toml`, `gradle-wrapper.properties` |
| App module config | 3 | `app/build.gradle.kts`, `proguard-rules.pro`, `AndroidManifest.xml` |
| Kotlin: main | 49 | Application/Activity (2), navigation (2), DI (2), data layer (4), theme (6), components (9), util (1), screens + ViewModels (21) |
| Kotlin: tests | 3 | See §11 |
| Android resources | 8 | 3 `values/*.xml`, 3 `drawable/*.xml`, 2 `mipmap-anydpi-v26/*.xml` |
| **Total files created** | **71** | |

Only one pre-existing file was touched this sprint: `CLAUDE.md` (in a prior conversation turn, unrelated to this implementation pass). Nothing under `docs/`, `assets/`, `backend/`, or `design/` was modified.

---

## 4. Dependencies Added

Declared via a single Gradle version catalog (`gradle/libs.versions.toml`):

| Group | Libraries | Version basis |
|---|---|---|
| Kotlin / build tooling | AGP, Kotlin, KSP, Compose compiler plugin | AGP 8.7.3, Kotlin 2.1.0, KSP 2.1.0-1.0.29 |
| Jetpack Compose | BOM, ui, ui-graphics, ui-tooling(-preview), material3, material-icons-extended | Compose BOM 2024.12.01 |
| Navigation | navigation-compose | 2.8.5 |
| DI | hilt-android, hilt-android-compiler (KSP), hilt-navigation-compose | Hilt 2.53.1 |
| Persistence | room-runtime, room-ktx, room-compiler (KSP), datastore-preferences | Room 2.6.1, DataStore 1.1.1 |
| Lifecycle | lifecycle-runtime-ktx, lifecycle-viewmodel-compose, lifecycle-runtime-compose | 2.8.7 |
| Other AndroidX | activity-compose, core-ktx, core-splashscreen | 1.9.3 / 1.15.0 / 1.0.1 |
| Coroutines | kotlinx-coroutines-android, kotlinx-coroutines-test | 1.9.0 |
| Logging | Timber | 5.0.1 |
| Testing | JUnit 4.13.2, MockK 1.13.13, androidx-test-ext-junit, espresso-core, compose-ui-test-junit4 | |

**Room and DataStore are declared but only DataStore is wired to real code this sprint.** No `AppDatabase`/`@Entity`/`@Dao` exists yet. Alert History and Emergency Contact have no real data to persist until Sprint 2, and creating an unused schema now would be exactly the "placeholder architecture" the sprint rules prohibit. The dependency is present so Sprint 2 can start using it immediately.

---

## 5. Architecture Implemented

Matches `docs/14`'s pragmatic 3-layer design, scoped to what Sprint 1 actually needs:

- **Presentation:** Jetpack Compose screens, each with a `@HiltViewModel` exposing a `StateFlow<UiState>` (or stateless where a screen genuinely has no state, e.g. Permission Explainer's static content).
- **Data layer:** Two real repositories behind interfaces:
  - `SettingsRepository` (DataStore-backed): onboarding-completed flag, accessibility prefs (font scale, high contrast, read-aloud).
  - `PermissionStatusRepository` (live OS query, never cached): Phone State via `ContextCompat.checkSelfPermission`; Accessibility Service via `AccessibilityManager`'s enabled-services list, which will honestly report "not granted" all sprint since no service is declared yet.
- **DI:** Hilt, single Gradle module (`:app`), two modules (`DataStoreModule`, `RepositoryModule`) binding the above.
- **Domain layer:** Not created. No detection or notify logic exists yet, so there is nothing to put there: an empty `domain/` package would itself be placeholder architecture.
- **Deferred packages** (per sprint rules, not built): `data/local/db` (Room schema), `data/system`, `service/` (Accessibility Service), `analytics/`.

---

## 6. Screens Implemented

All 11 screens from `docs/13`'s screen inventory:

| # | Screen | State |
|---|---|---|
| 1 | Splash | Real: reads onboarding-completed flag, routes accordingly |
| 2 | Permission Explainer | Real, stateless except the "Not now" exit path |
| 3 | Phone State Permission | Real: genuine `READ_PHONE_STATE` runtime permission request |
| 4 | Accessibility Service Permission | Real UI + real live check; always resolves "not granted" (no service exists yet, honest, not broken) |
| 5 / 11 | Set / Edit Emergency Contact | Real validation (Indian mobile format, on-blur errors); **not persisted**: explicitly disclosed in-UI |
| 6 | Onboarding Complete | Real: marks onboarding complete in DataStore |
| 7 | Home | Real: live protection-status derivation (Active/Off/Unknown), re-checked on every resume |
| 8 | Scam Warning | **Mocked** per sprint brief item 14: sample data, reachable only via a debug-only entry point in Settings |
| 9 | Alert History | Real screen/empty-state; always empty (no persistence layer yet) |
| 10 | Settings | Real: live permission rows, working accessibility toggles, About & Privacy link |
| N/A | About & Privacy | Static disclosure screen |

---

## 7. Reusable Components

Nine components under `ui/components/`, each traced to a specific spec section:

`StatusCard` (Home's 3-state hero), `WarningActionStack` (Scam Warning's asymmetric 3-action stack), `PermissionStatusRow` (Settings), `HistoryListItem` (expandable, Alert History), `ReassuranceEmptyState` (identical copy on Home + History), `OnboardingStepIndicator` ("Step X of 5" text, not a progress bar), `GuardianTextField` (MD3 Outlined), `GuardianButtons` (Filled/FilledTonal/Text emphasis tiers, 8dp shape, 44dp min tap target), `LoadingSkeleton` / `ErrorCard` (loading and non-alarming error states).

---

## 8. Navigation Graph

Single-stack `NavHost` (`GuardianNavHost.kt`), no bottom tab bar (per `docs/13`'s explicit instruction). Route constants centralized in `GuardianRoutes.kt`. Splash pops itself off the back stack on exit either direction. The Scam Warning route runs with `EnterTransition.None`/`ExitTransition.None` for instant appearance, matching the one deliberate motion exception in the spec, noted in-code as a Sprint 1 simplification, since the real trigger mechanism (full-screen-intent notification, separate Activity) ships with the detection engine in a later sprint.

---

## 9. Theme Implementation

Full Material 3 theme in `ui/theme/`: `Color.kt` (documented brand roles from `docs/15` plus derived roles for MD3 slots the spec doesn't explicitly assign, each commented with its rationale), `Type.kt` (the six documented type tokens, including the two custom, non-MD3-role tokens `type.body-large` and `type.numeric`), `Shape.kt` (8dp buttons, a deliberate deviation from MD3's default pill shape), `Spacing.kt` (8dp-base scale), `Motion.kt` (duration/easing tokens, including Scam Warning's 0ms exception), and `Theme.kt` (assembles the above into `GuardianAITheme`, with custom extended color roles exposed via `GuardianTheme.extendedColors`). Only a light scheme exists: the frozen docs define one palette, so none was invented for dark mode.

---

## 10. Build Status

**Not built. Not verifiable in this environment.**

- No JDK, Gradle, or Android SDK present (`java`, `gradle`, `$ANDROID_HOME` all absent).
- `gradle-wrapper.jar` (binary) could not be generated offline; `gradlew`/`gradlew.bat` scripts and `gradle-wrapper.properties` exist but the jar they invoke does not.
- No `local.properties`: expected; generated on first open in Android Studio or must be supplied on the build machine.

**Mitigation performed:** a manual, grep-driven consistency pass across all 49 main + 3 test Kotlin files, checking every Composable call site against its declared signature and every modifier/API usage against its required import. This caught and fixed real defects before this report was written, including:
- Three files importing `rememberSaveable` from the wrong package (`androidx.compose.runtime` instead of `androidx.compose.runtime.saveable`).
- A fabricated `collectAsStateSafely()` call (should have been `collectAsStateWithLifecycle()`).
- Leftover garbled code in the Accessibility Permission screen referencing an undefined function.
- A wrong `installSplashScreen()` import path in `MainActivity`.
- Missing `androidx.compose.foundation.layout.size` imports (2 files) and a missing `.weight()` import (1 file).
- A `Modifier.fillMaxSize()` used where `.fillMaxWidth()` was intended inside a `Column`, which would have broken the Permission Explainer's layout.
- An incorrect `clickable()` call syntax in Settings.

This review closes the highest-risk categories (imports, signatures, layout logic) but is explicitly **not equivalent to a compiler run**: type-checking, resource-reference resolution edge cases, and annotation-processor behavior (Hilt/Room/KSP) are unverified.

---

## 11. Unit Tests Added

Three JUnit + MockK test files, deliberately scoped to logic that doesn't require Robolectric or an emulator:

- **`EmergencyContactUiStateTest`**: Indian mobile-number validation regex, Save-enablement logic, touched/blur error-display behavior. 9 cases.
- **`HomeViewModelTest`**: protection-status derivation (Active only when both permissions granted; Off otherwise; Unknown on a thrown exception), using MockK to fake `PermissionStatusRepository`. 5 cases.
- **`PhoneStatePermissionViewModelTest`**: the three-way permission outcome (granted / retryable decline / permanently denied), plus initial-state derivation. 5 cases.

No tests exist yet for Compose UI (screen-level interaction tests) or for the Accessibility/Settings/History ViewModels. See §12.

---

## 12. Remaining Sprint 1 Work

- **Execute an actual build** on a machine with JDK + Android SDK, generate `gradle-wrapper.jar` (via `gradle wrapper` or Android Studio's first-sync), and fix whatever the compiler finds that manual review didn't.
- **Manual QA pass**: install and click through all 11 screens on a real device/emulator, since Compose Previews only validate rendering in isolation, not the full navigation flow or lifecycle-driven re-checks (permission resume logic, DataStore reads).
- **Widen unit test coverage**: `SettingsViewModel`, `AccessibilityPermissionViewModel`, `AlertHistoryViewModel`, and `SplashViewModel` currently have no tests.

---

## 13. Known Issues

- **`gradle-wrapper.jar` is absent**: the project cannot be built via `./gradlew` until this is generated on a machine with Gradle or Android Studio available (§10).
- **Accessibility Service permission can never show as "Granted" in Sprint 1**: this is by design (no service is declared yet, see §6), not a defect, but it means the Accessibility screen's success path and Home's "Active" status card are currently unreachable in a real run; only visible via `@Preview`.
- **Emergency Contact "Save" does not persist anything**: disclosed directly in the UI (`contact_note_not_persisted` string), but worth flagging here too since it means Settings' "Emergency Contact" row will always read "Not set."
- **`onFixProtection` from Home routes to Settings generally**, not to the specific missing permission's row. Home only knows aggregate status, not which permission is the problem. A minor UX imprecision, not a broken path.
- Manual code review (not a compiler) is the only verification this codebase has received: residual import/signature errors beyond what the grep sweep could catch are possible.

---

## 14. Technical Debt

- **No Compose UI tests** (`ui-test-junit4` is a declared dependency but unused): flagged in `docs/14` §25 as necessary before shipping onboarding-completion and Scam Warning's three-action flows; not written this sprint.
- **`FontScaleRow` in Settings uses plain +/- buttons**, not a documented alternative (slider, segmented control): a reasonable, low-risk implementation choice made in the absence of a specified control type, but worth revisiting once the visual design system's Settings mockups are available.
- **Release-build Timber tree** (log-level filtering + PII scrubbing per `docs/14` §21) is not implemented. Only a `DebugTree` exists, gated on `BuildConfig.DEBUG`. Deferred because there's no PII-bearing logging yet to scrub.
- **No CI pipeline**: `docs/14` §26 specifies lint + unit tests on every PR; nothing has been set up (no CI service configured in this environment).

---

## 15. What Was Intentionally Deferred to Sprint 2

Per the sprint brief's explicit exclusion list, none of the following were built, and none should be inferred as accidentally missing:

- **Accessibility Service**: the `ScamDetectionAccessibilityService` class, its manifest declaration, and `canRetrieveWindowContent="false"` config (`docs/14` §9).
- **Scam detection**: `ScreenSharePatternDetector` and the on-device correlation heuristic (`docs/14` §10).
- **Real notifications**: the full-screen-intent pipeline and its API-34+ heads-up fallback (`docs/14` §11, Finding E-2).
- **Emergency contact persistence**: `EmergencyContactRepository`, its Room-backed table, and the native contacts-picker shortcut.
- **Notify delivery**: `NotifyContactUseCase`'s WhatsApp→SMS fallback chain (`docs/14` §18).
- **Backend / networking**: none exists or is planned before V2 per `docs/12`.
- **Room database**: dependency declared, no `AppDatabase`/entities created (§4, §5).
- **Analytics**: `AnalyticsLogger` and Firebase Analytics wiring (`docs/14` §20).
- **Crash reporting**: Firebase Crashlytics (`docs/14` §22).
