# Engineering Specification: Guardian AI Scam Prevention MVP
### Android Architecture, Systems Design, and Build Plan

*Implements the frozen Product Strategy (`12-strategic-refactor-scam-prevention-mvp.md`) and frozen UX Specification (`13-ux-specification-scam-prevention-mvp.md`) exactly as written. This document makes no product or UX decisions: where Android platform reality requires a technical constraint the UX spec didn't anticipate, it is flagged explicitly as a finding for product sign-off, not silently resolved by engineering fiat. Two such findings exist and are called out in Section 0 before anything else, because they affect how early sections should be read.*

---

## Section 0: Engineering Findings Requiring Product/UX Awareness

These are not scope changes. They are Android platform facts discovered while turning the frozen UX spec into a buildable design, presented up front so the rest of this document can be read without ambiguity about what's assumed.

**Finding E-1: "Bypasses Do Not Disturb" (UX spec §9) requires a permission the UX spec doesn't mention.** Programmatically bypassing DND requires `NotificationManager.isNotificationPolicyAccessGranted()`: Notification Policy Access, a third special Android permission with its own Settings-redirect grant flow, structurally identical to the Accessibility Service request (Screen 4). The frozen onboarding flow only requests two permissions. **Recommendation, not a decision:** implement Scam Warning as a `HIGH`-importance notification channel with a full-screen intent, which reliably interrupts the current app and the lock screen regardless of DND policy access. This alone satisfies the product's real requirement ("reach the user during a live call"). True DND override is not requested at MVP; the UX copy "bypasses Do Not Disturb" should be read as "reaches the user through a full-screen interrupt," which is the mechanism that actually matters, and product should confirm this reading or decide whether a third permission screen is worth adding.

**Finding E-2: Full-screen intent notifications are a restricted API on Android 14 (API 34) and above.** `USE_FULL_SCREEN_INTENT` is now limited to apps whose core function matches Google's approved categories (calling, alarms); apps outside those categories may have the permission auto-revoked or face Play Store review friction. Guardian AI's use case is adjacent but not identical to the approved list. **Recommendation:** build the fallback path (a maximum-priority heads-up notification, not full-screen) as a first-class code path from day one, not an afterthought. Section 11 designs both paths. Play Store approval risk is carried in Section 30 as the single largest launch risk in this entire specification.

Both findings are engineering-discovered constraints on *how* the frozen UX ships, not requests to change *what* it does. Proceeding on that basis.

---

## 1. Android Architecture: Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                          │
│   Jetpack Compose UI  ←→  ViewModels (StateFlow, unidirectional)     │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────────┐
│                            Domain Layer (thin)                        │
│   ScreenSharePatternDetector · NotifyContactUseCase · PermissionState │
│   (only where real logic exists — see §5 for what's promoted here     │
│   vs. handled directly by a Repository)                               │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────────┐
│                              Data Layer                               │
│   Repositories (interfaces) → Room DB · DataStore · Android system    │
│   APIs (TelephonyManager, AccessibilityService, NotificationManager,  │
│   Intent-based WhatsApp/SMS dispatch)                                 │
└─────────────────────────────────────────────────────────────────────┘

Independent, always-on component (not part of the UI's lifecycle):
┌─────────────────────────────────────────────────────────────────────┐
│  ScamDetectionAccessibilityService (system-bound, survives app       │
│  process death per Android's accessibility subsystem — §9/§13)       │
└─────────────────────────────────────────────────────────────────────┘
```

**Governing principle:** this is a pragmatic 3-layer architecture (Presentation → thin Domain → Data), not textbook Clean Architecture with a UseCase for every button tap. A UseCase/Interactor class is introduced only where real business logic exists independent of any one screen (the detection heuristic, the notify-with-fallback orchestration). Everything else (loading a contact, saving a settings toggle) goes ViewModel → Repository directly. For a one-engineer, 6–8 week build, ceremony that doesn't earn its keep is a cost, not a virtue. This mirrors the same discipline the product strategy applied when it cut the platform down to this MVP in the first place.

---

## 2. Module Architecture

**Decision: ship MVP as a single Gradle module (`:app`) with strict internal package boundaries, not a multi-module setup.** Multi-module Android projects earn their build-time and configuration overhead when multiple engineers need parallel, independently-buildable ownership boundaries. Neither is true for a one-engineer, 6–8 week build. Introducing module boundaries now would be solving a team-scaling problem that doesn't exist yet, at the direct cost of the sprint timeline in Section 5 of the strategy doc.

**The extraction path, planned now so it's cheap later:** package boundaries inside `:app` are drawn exactly where module boundaries would eventually go (Section 3), so that if V2 (per `12-strategic-refactor-scam-prevention-mvp.md`'s roadmap) reintroduces a backend, a second detection pattern, or a second engineer, the highest-value extraction, `detection` into `:core:detection`, is a mechanical move, not a rewrite, because it already has no dependency on `:app`'s UI or DI wiring beyond a clean public interface.

---

## 3. Folder & Package Structure

```
com.guardianai.app/
├── GuardianApplication.kt                 // Hilt @HiltAndroidApp entry point
│
├── ui/                                    // Presentation layer — mirrors UX spec's 11 screens
│   ├── splash/            (Screen 1)
│   ├── onboarding/
│   │   ├── explainer/     (Screen 2)
│   │   ├── phonestate/    (Screen 3)
│   │   ├── accessibility/ (Screen 4)
│   │   ├── contact/       (Screens 5/11 — shared composable + mode flag)
│   │   └── complete/      (Screen 6)
│   ├── home/              (Screen 7)
│   ├── warning/           (Screen 8 — separate Activity, see §14)
│   ├── history/           (Screen 9)
│   ├── settings/          (Screen 10)
│   ├── components/                        // shared composables — Status Card, Warning Action
│   │                                       // Stack, Permission Status Row, etc. (UX spec §7)
│   └── theme/                             // inherited design tokens (UX spec §14), Compose theme
│
├── domain/                                // thin — only genuine business logic lives here
│   ├── detection/
│   │   ├── ScreenSharePatternDetector.kt  // pure Kotlin, no Android framework deps (see §9)
│   │   ├── DetectionRule.kt               // interface — extensibility point, §35
│   │   └── KnownScreenShareApps.kt        // bundled package-name list, §10
│   └── notify/
│       └── NotifyContactUseCase.kt        // WhatsApp→SMS fallback orchestration, §18
│
├── data/
│   ├── repository/
│   │   ├── EmergencyContactRepository.kt (interface) + Impl
│   │   ├── AlertHistoryRepository.kt (interface) + Impl
│   │   ├── PermissionStatusRepository.kt (interface) + Impl
│   │   └── SettingsRepository.kt (interface) + Impl
│   ├── local/
│   │   ├── db/            // Room: AppDatabase, DAOs, Entities (§15)
│   │   └── datastore/      // Jetpack DataStore for simple prefs (§15)
│   └── system/
│       ├── CallStateProvider.kt           // wraps TelephonyManager (§9)
│       └── NotificationDispatcher.kt      // wraps NotificationManager (§11)
│
├── service/
│   └── ScamDetectionAccessibilityService.kt   // §9 — the always-on component
│
├── di/                                     // Hilt modules (§7)
│
└── analytics/
    └── AnalyticsLogger.kt                  // thin interface, §20
```

**Package naming convention:** `com.guardianai.app.<layer>.<feature>`. No screen's package imports another screen's package directly. Cross-screen communication happens only through shared `ui/components`, the `domain` layer, or navigation arguments, never a direct import of e.g. `ui.home` from `ui.settings`.

---

## 4. MVVM / Architecture Boundaries

| Boundary | Rule |
|---|---|
| Compose UI → ViewModel | UI never touches a Repository or system API directly; it only reads `StateFlow<UiState>` and sends events/method calls to the ViewModel |
| ViewModel → Domain/Repository | A ViewModel depends on interfaces only (`EmergencyContactRepository`, never `EmergencyContactRepositoryImpl`). This is what makes ViewModel unit tests possible without Room or Android framework classes (§25) |
| Domain → Data | `ScreenSharePatternDetector` and `NotifyContactUseCase` depend on injected interfaces (`CallStateProvider`, `NotificationDispatcher`) so their core logic is unit-testable in plain JVM tests, not instrumented tests |
| `ScamDetectionAccessibilityService` → everything else | The Service is a thin adapter: it receives raw Android accessibility/telephony events and immediately hands them to `ScreenSharePatternDetector` (injected via Hilt's `@AndroidEntryPoint` support for Services). **The Service class itself contains no detection logic**, only event plumbing, so the actual heuristic can be tested without an emulator |

---

## 5. State Management

Every screen exposes a single `StateFlow<ScreenUiState>` from its ViewModel, where `ScreenUiState` is a sealed class matching the UX spec's explicit Loading/Empty/Error/Success states per screen (UX spec §4). This isn't a generic Android pattern applied incidentally. It's a direct 1:1 implementation of what the UX spec already specified per screen:

```kotlin
sealed interface HomeUiState {
    object Loading : HomeUiState
    data class Content(
        val protectionStatus: ProtectionStatus, // Active / Off / Unknown — UX spec Screen 7
        val recentActivity: RecentActivityState  // Empty("no alerts yet") or LatestEntry(...)
    ) : HomeUiState
}
```

Unidirectional data flow throughout: UI → ViewModel event → Repository/Domain call → new state emitted → UI recomposes. No screen holds mutable state outside its ViewModel; Compose `remember` is used only for ephemeral UI-only state (e.g., a text field's cursor position), never for anything that survives configuration change or matters to product logic.

**`Scam Warning` is the one screen with a materially different state model**, because it isn't reached through normal navigation: its ViewModel is seeded directly from the `DetectionEvent` payload delivered via the launching Intent (§14), not from a repository read, since the whole point is zero-latency display of an already-decided detection.

---

## 6. State Management: Permission State Specifically

Permission state is modeled explicitly as a 3-value state per permission, not a boolean, because "not yet asked" and "explicitly denied" require different UI treatment (UX spec Screens 3/4's distinct error states):

```kotlin
enum class PermissionState { NOT_REQUESTED, GRANTED, DENIED }
data class PermissionsSnapshot(
    val phoneState: PermissionState,
    val accessibilityService: PermissionState
)
```
`PermissionStatusRepository` is the single source of truth for this snapshot, re-derived from live Android system checks on every read (`ContextCompat.checkSelfPermission` for Phone State; `AccessibilityManager.getEnabledAccessibilityServiceList()` for Accessibility Service), **never cached across app resume**, directly implementing the UX spec's Screen 7 edge case (an OS-level silent revocation must be reflected the next time Home is viewed, not masked by a stale cached value).

---

## 7. Dependency Injection

**Hilt** (Google's standard, built on Dagger) is the correct default for a solo-engineer Android build: minimal boilerplate relative to raw Dagger, first-class support for `@AndroidEntryPoint` on Services (needed for `ScamDetectionAccessibilityService`, §9) and `@HiltViewModel`.

| Module | Provides | Scope |
|---|---|---|
| `DatabaseModule` | `AppDatabase`, DAOs | `@Singleton` |
| `DataStoreModule` | Settings `DataStore<Preferences>` | `@Singleton` |
| `RepositoryModule` | Binds each Repository interface to its Impl | `@Singleton` |
| `SystemModule` | `CallStateProvider`, `NotificationDispatcher` (wrapping Android system services) | `@Singleton` |
| `DetectionModule` | `ScreenSharePatternDetector`, `DetectionRule` set | `@Singleton` (one detector instance shared by the Service and any UI screen that needs to display "what was detected") |

No `@ActivityScoped` or `@ViewModelScoped` bindings are needed anywhere in this MVP. The app's data genuinely is app-lifetime-scoped (a single emergency contact, a settings blob, a history list), and introducing narrower scopes would model a data-freshness problem this app doesn't have.

---

## 8. Repository Layer

| Repository | Backing store | Responsibility |
|---|---|---|
| `EmergencyContactRepository` | Room (`emergency_contacts` table, §15) | CRUD for the one (V2: 2–3) contact record(s) |
| `AlertHistoryRepository` | Room (`alert_history` table) | Append-only insert on detection resolution; chronological read for Screen 9 |
| `PermissionStatusRepository` | Live Android system checks (no persistence, see §6) | Always-fresh permission snapshot |
| `SettingsRepository` | DataStore Preferences | Accessibility settings (font scale, contrast, read-aloud), onboarding-completion flag |

All four are defined as interfaces in `data/repository/`, with a single `Impl` each bound via Hilt (§7). This is the seam Section 19/35 point to when describing how a future backend gets introduced without touching any ViewModel.

---

## 9. Accessibility Service Architecture: The Core of the App

```
┌──────────────────────────────────────────────────────────────────┐
│              ScamDetectionAccessibilityService                    │
│              (extends AccessibilityService, @AndroidEntryPoint)   │
│                                                                    │
│  onServiceConnected() → registers a TelephonyCallback (API 31+)   │
│    or PhoneStateListener (below API 31) directly on this Service  │
│    — see rationale below on why call-state monitoring lives here, │
│    not in a separate component                                   │
│                                                                    │
│  onAccessibilityEvent(event) → filters for TYPE_WINDOW_STATE_     │
│    CHANGED events where event.packageName is in                  │
│    KnownScreenShareApps (domain layer) → forwards                 │
│    (packageName, timestamp) to ScreenSharePatternDetector         │
│                                                                    │
│  [internal] onCallStateChanged(state) → forwards                  │
│    (state, timestamp) to the same ScreenSharePatternDetector      │
│                                                                    │
│  ScreenSharePatternDetector.correlate() → if an active call AND   │
│    a known screen-share package foregrounded within the           │
│    correlation window (60s, tunable) → emits DetectionEvent        │
│                                                                    │
│  DetectionEvent → NotificationDispatcher.showScamWarning(event)   │
│    (§11) → launches ScamWarningActivity via full-screen intent    │
└──────────────────────────────────────────────────────────────────┘
```

**Why call-state monitoring lives inside the Accessibility Service, not a separate background Service (a genuine architecture decision, not a default):** an `AccessibilityService`, once granted, is bound directly to the system's accessibility subsystem and is materially more resistant to being killed by Doze/App Standby than an ordinary background `Service`. This is precisely why this class of app relies on the Accessibility API in the first place. A regular foreground `Service` running alongside it would additionally require a persistent status-bar notification (mandatory since Android 8), which directly contradicts the product's "watches quietly in the background" promise (UX spec, Screen 6 microcopy) with a visible, permanent notification icon. Consolidating both signals into the one component Android already keeps alive entirely avoids introducing a foreground service and its unavoidable persistent notification.

**Accessibility Service configuration (`res/xml/accessibility_service_config.xml`) is deliberately minimal**, requesting only what the detection actually needs:
```xml
<accessibility-service
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:canRetrieveWindowContent="false"
    android:notificationTimeout="100"
    android:packageNames="@array/known_screen_share_packages" />
```
`canRetrieveWindowContent="false"` is a deliberate, load-bearing choice: the service only ever needs to know *which app* came to the foreground, never *what's on screen*. Declaring the narrower capability is both the correct privacy posture (matches the UX copy's explicit promise, "we never see who you're calling or listen in," and its implicit extension "or see your screen") and a materially easier Play Store review case (§30) than requesting content-reading capability the app doesn't use. `android:packageNames` scopes event delivery to only the known screen-share app list (§10), so the Service never even receives window-state events for unrelated apps, a deliberate choice for both privacy and battery efficiency.

---

## 10. Detection Engine

`ScreenSharePatternDetector` is a **pure Kotlin class with zero Android framework imports**: its inputs are two plain data events (`CallStateEvent`, `ForegroundAppEvent`), its output is a plain `DetectionEvent?`, and its correlation logic (a sliding time-window check) is entirely unit-testable on the JVM without an emulator, which is the single most important testability decision in this codebase (§25) given it's the one component the product's entire value proposition depends on.

```kotlin
class ScreenSharePatternDetector(
    private val correlationWindow: Duration = 60.seconds
) {
    private var lastCallStateChange: CallStateEvent? = null

    fun onCallStateChanged(event: CallStateEvent): DetectionEvent? {
        lastCallStateChange = event
        return null // a call starting is never itself a detection
    }

    fun onForegroundAppChanged(event: ForegroundAppEvent): DetectionEvent? {
        val call = lastCallStateChange
        if (call?.state == CallState.OFFHOOK &&
            event.packageName in KnownScreenShareApps.PACKAGES &&
            (event.timestamp - call.timestamp) < correlationWindow) {
            return DetectionEvent(
                appPackage = event.packageName,
                detectedAt = event.timestamp
            )
        }
        return null
    }
}
```

`KnownScreenShareApps.PACKAGES` is a bundled, versioned local list (AnyDesk, TeamViewer QuickSupport, and other remote-access tools documented in India-targeted scam patterns, per the strategy doc's Week 2 sprint task) shipped as a static resource for MVP. **Section 35 (Future Extensibility)** designs the path to make this remotely updatable without an app release, since new tools entering scammers' playbooks faster than app-store review cycles is a realistic risk the product should be able to respond to without this document pretending otherwise.

**This is the entirety of the MVP's "AI."** Consistent with the frozen strategy's explicit Won't-Have list, there is no ML model, no server-side scoring, no LLM: a deterministic, two-signal correlation heuristic *is* the detection engine, and this document does not gold-plate it with unrequested sophistication.

---

## 11. Notification Pipeline

Exactly two notification types exist (UX spec §9) and are implemented as two distinct channels:

| Channel | Importance | Trigger | Delivery mechanism |
|---|---|---|---|
| `scam_warning` | `IMPORTANCE_HIGH` | `DetectionEvent` emitted by the detector | **Primary path:** `setFullScreenIntent()` launching `ScamWarningActivity` directly (Finding E-2 applies: see fallback). **Fallback path (if full-screen-intent is restricted or denied by the OS on API 34+):** a maximum-priority heads-up notification with the same content and the same three actions rendered as notification action buttons, so the core promise (interrupt + inform + act) survives even without the full-screen mechanism |
| `permission_health` | `IMPORTANCE_DEFAULT` | Accessibility Service detected as revoked on a Home-screen re-check (§6) while the app isn't foregrounded | Standard notification, non-intrusive, per UX spec §9 |

`ScamWarningActivity` (not a Compose destination inside the main navigation graph, but a standalone launch-mode-`singleTask` Activity) is what the full-screen intent targets, configured to display over the lock screen:
```kotlin
if (Build.VERSION.SDK_INT >= 27) {
    setShowWhenLocked(true)
    setTurnScreenOn(true)
} else {
    @Suppress("DEPRECATION")
    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
}
```
This directly implements the UX spec's requirement that Screen 8 "must be visible and actionable directly over the lock screen ... without requiring the user to first unlock the phone."

---

## 12. Permission Lifecycle

```
                    ┌───────────────┐
                    │ NOT_REQUESTED │
                    └───────┬───────┘
                            │ user reaches Screen 3 or 4
                            ▼
              ┌─────────────────────────┐
              │  Requested (in-flight)   │
              └────────┬────────┬────────┘
                       │        │
                 grants│        │declines
                       ▼        ▼
                 ┌─────────┐ ┌────────┐
                 │ GRANTED │ │ DENIED │
                 └────┬────┘ └───┬────┘
                      │          │ (recheck on every Home resume —
             OS may   │          │  §6 — never assumed permanent)
             silently │          │
             revoke   ▼          ▼
              (Accessibility  Settings row offers
               Service only,  re-entry to Screen 3/4's
               §29) ──────▶  grant flow at any time
```

Phone State follows the standard Android runtime-permission lifecycle (`shouldShowRequestPermissionRationale` governs whether a second in-app ask is allowed before falling back to the Settings-link error state, per Screen 3's spec). Accessibility Service has no equivalent OS-level rationale API: its lifecycle is entirely poll-based (checked on every relevant screen's resume), which is why Screen 4's design explicitly builds an automatic re-check rather than relying on any callback.

---

## 13. Foreground / Background Behavior

**No foreground Service exists in this app.** This is a direct consequence of §9's architecture decision (Accessibility Service absorbs the always-on responsibility) and is worth stating as its own section, because it's easy for a reviewer to assume an "always watching" app needs one. It doesn't, and adding one would cost the product its "quiet" promise for no detection benefit.

**What does need explicit background-behavior handling:**
- `ScamWarningActivity` must launch reliably even if `GuardianApplication`'s process was previously killed by the OS: this is exactly what the full-screen-intent + `singleTask` launch mode combination guarantees; the Activity does not depend on any other part of the app's process being warm.
- `AlertHistoryRepository`'s write (logging the detection event) happens from within the Accessibility Service's process context, not the UI process. Room's `WAL` journaling mode (default) makes this safe for concurrent access from both the Service and any simultaneously-open UI screen.

---

## 14. Android Lifecycle Notes Per Screen

| Screen | Lifecycle note |
|---|---|
| Splash (1) | No ViewModel state to restore: pure one-shot navigation, safe to skip `rememberSaveable` entirely |
| Onboarding (2–6) | Each step's completion is persisted to `SettingsRepository` (DataStore) immediately on completion, not held only in navigation back-stack state, so a process death mid-onboarding resumes at the correct step, never restarts from Splash |
| Home (7) | `PermissionsSnapshot` is re-read in `onResume` (via a `LifecycleEventObserver`, not just `onCreate`), directly implementing the "never cached across app resume" rule from §6 |
| Scam Warning (8) | Separate `Activity`, not a Compose `NavHost` destination, deliberately isolated from the rest of the app's navigation graph so it can be launched independently of whatever navigation state the main Activity was in |
| History (9), Settings (10) | Standard Compose destinations within the main `NavHost`; state survives configuration change via the standard `ViewModel` + `SavedStateHandle` pattern, no special handling needed |

---

## 15. Local Database (Room) & Data Store Split

**Room** for structured, historical, queryable data:
```kotlin
@Entity(tableName = "emergency_contacts")
data class EmergencyContactEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val phoneNumber: String,
    val createdAt: Instant
)
// Table, not a single-row assumption, deliberately — see §35: MVP's Repository
// and UI enforce "exactly one" at the product layer; the schema itself doesn't
// need a breaking migration when V2 allows 2–3 contacts.

@Entity(tableName = "alert_history")
data class AlertHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val detectedAppPackage: String,
    val detectedAt: Instant,
    val actionTaken: ActionTaken, // enum: NOTIFIED, MARKED_FINE, CALL_ENDED, ACKNOWLEDGED
    val notifiedContactId: Long?
)
```

**Jetpack DataStore (Preferences)** for simple, non-relational settings, deliberately *not* Room, since a single-value settings blob in a relational table is the wrong tool:
- `onboarding_completed: Boolean`
- `accessibility_font_scale: Float`
- `accessibility_high_contrast: Boolean`
- `accessibility_read_aloud_enabled: Boolean`

**Migration strategy:** Room's `fallbackToDestructiveMigration()` is an acceptable choice for this MVP specifically: unlike the original platform's financial/audit data (which required a strict expand/contract migration discipline, per the earlier Database Design phase), `alert_history` here is low-stakes, locally-scoped convenience data; losing it on a schema change during early development is an acceptable trade against the cost of writing full migrations for a pre-launch app.

---

## 16. Data Models

Three model layers, kept deliberately thin (not a full DTO/Entity/Domain triad for every field, only where the shapes genuinely differ):

- **Entities** (`data/local/db`): Room-annotated, exactly matching table schema (§15).
- **Domain events** (`domain/detection`): `CallStateEvent`, `ForegroundAppEvent`, `DetectionEvent`, plain data classes with no Android or Room dependency, used by the detector (§10) and by the Service/ViewModel layers that consume its output.
- **UI models** (`ui/*/state`): e.g., `AlertHistoryItemUiModel`, formatted for display (localized date strings, resolved contact name rather than raw `notifiedContactId`), mapped from domain/entity data at the ViewModel boundary, never leaking a Room entity directly into a Composable's parameters.

---

## 17. Repository Interfaces (full contracts)

```kotlin
interface EmergencyContactRepository {
    fun observeContact(): Flow<EmergencyContact?>
    suspend fun setContact(name: String, phoneNumber: String)
    suspend fun removeContact()
}

interface AlertHistoryRepository {
    fun observeHistory(): Flow<List<AlertHistoryItem>>
    suspend fun recordAlert(event: DetectionEvent, action: ActionTaken)
}

interface PermissionStatusRepository {
    fun currentSnapshot(): PermissionsSnapshot // synchronous, always-fresh read — see §6
}

interface SettingsRepository {
    val onboardingCompleted: Flow<Boolean>
    suspend fun setOnboardingCompleted()
    val accessibilityPrefs: Flow<AccessibilityPrefs>
    suspend fun updateAccessibilityPrefs(prefs: AccessibilityPrefs)
}
```
Every ViewModel constructor-injects only these interfaces: no ViewModel in the codebase imports `androidx.room.*` or `android.telephony.*` directly, which is what makes §25's ViewModel unit tests possible without Robolectric or an emulator.

---

## 18. Offline Behavior

**The entire app is offline-first by construction, not as a resilience feature bolted on.** Per the frozen strategy's backend-less V0 decision (Section 10 of the strategy doc), there is no server dependency for detection, history, contact storage, or settings. The **one** network-dependent action in the whole product is the Notify step's WhatsApp send:

```
NotifyContactUseCase.execute(contact):
    1. Attempt WhatsApp Intent (ACTION_SEND to WhatsApp's package,
       pre-filled message per UX spec §13)
    2. If WhatsApp is not installed, OR the Intent fails to resolve,
       OR (defensive) no network connectivity is detected →
       immediately fall back to SMS via SmsManager — SMS requires
       only cellular signal, not data connectivity, which matters
       specifically because a scam call in progress is exactly the
       moment data connectivity might be poor while a voice call is
       still connected
    3. Report outcome (sent / failed) back to the calling ViewModel
       for the Screen 8 confirmation/error state
```
This fallback logic lives in `NotifyContactUseCase` (domain layer), not scattered across the ViewModel or UI, so it's independently unit-testable (§25).

---

## 19. Sync Strategy

**None exists for MVP, and none should be built.** There is no remote data to reconcile. This section exists to document the extension seam rather than a mechanism: because every Repository (§8/§17) is consumed only through its interface, introducing a V2 backend means adding a second implementation (e.g., `AlertHistoryRepositoryRemoteImpl` composing the existing local Room-backed one with a `WorkManager`-scheduled upload job) and rebinding one line in `RepositoryModule`, with no ViewModel, Composable, or domain class changes, since none of them ever depended on *how* the data was stored, only on the interface contract.

---

## 20. Analytics Architecture

```kotlin
interface AnalyticsLogger {
    fun logEvent(name: String, params: Map<String, Any> = emptyMap())
}
```
**Implementation choice: Firebase Analytics**, a managed, offline-batching, zero-custom-backend service, is the correct build-vs-buy call for a one-engineer team, given the events themselves (UX spec's per-screen analytics list) are simple named events with a handful of properties, not a requirement for a custom event-taxonomy platform (the kind the original full platform's deferred Phase 12 would have built). Every event name from the UX spec (`splash.viewed`, `scam_warning.shown`, etc.) is implemented as a literal, unmodified string constant: no translation layer between what the UX spec named and what the code logs, so a product manager reading the UX spec can find the exact analytics event in the codebase by searching for its name.

**No PII in any event payload**: contact name/phone number are never passed as event parameters; where an event needs to reference the contact, it uses a stable anonymous boolean/count only (e.g., `has_emergency_contact: true`), matching the UX spec's own stated rule (§4 baseline: "no PII in the event payload").

---

## 21. Logging

**Timber**, standard for Android. Two trees, swapped by build variant (§24):
- Debug: `Timber.DebugTree()`, full verbose logging to Logcat.
- Release: a custom tree that **drops all log calls below `WARN`** and, for `WARN`/`ERROR`, strips any parameter that could contain contact name/phone number or detected-app package name before forwarding to Crashlytics as a breadcrumb. Call content itself is never logged anywhere, at any level, since the Accessibility Service never reads window content in the first place (§9).

---

## 22. Crash Reporting

**Firebase Crashlytics.** Configured with a custom key-scrubbing wrapper so that any custom key set before a crash (e.g., "last known permission state") never includes the contact's name or number: only booleans/enums/counts. This is a deliberate, minimal-PII posture consistent with the product's own privacy claims (UX spec §13's "About & Privacy" promise). The crash-reporting pipeline should not become the place where the promise made in the UI is quietly broken.

---

## 23. Feature Flags

Given the MVP has exactly one feature, flagging needs are minimal, but the mechanism is worth setting up now because the strategy doc's Could-Have items (a second detection pattern, 2–3 contacts) are explicitly anticipated future work:

- **Firebase Remote Config** for a small number of boolean/JSON flags, chosen over a custom flag service for the same build-vs-buy reasoning as §20/§22 (no custom backend to build).
- `KnownScreenShareApps.PACKAGES` (§10) is designed as a Remote-Config-overridable list (falling back to the bundled static list if Remote Config is unreachable) from day one. This is the one piece of "future extensibility" cheap enough to build now rather than retrofit, since new scam-adjacent apps entering the wild is a realistic near-term need, not a speculative one.

---

## 24. Build Variants

| Variant | Purpose | Config |
|---|---|---|
| `debug` | Local development | Verbose Timber, Crashlytics disabled, no ProGuard/R8 |
| `internal` | Closed beta (strategy doc's Week 6 sprint task) | Verbose-but-scrubbed Timber, Crashlytics enabled in a separate Firebase project (so beta crashes never pollute production dashboards), distributed via Firebase App Distribution |
| `release` | Play Store | Release Timber tree, Crashlytics enabled (production project), full R8 shrink/obfuscate |

---

## 25. Testing Strategy

| Layer | Test type | Coverage priority |
|---|---|---|
| `ScreenSharePatternDetector` | Plain JVM unit test | **Highest**: this is the product's entire value proposition; exhaustive test cases for the correlation window's edge conditions (call ends before app opens, app opens then call starts, exactly-at-boundary timing) |
| `NotifyContactUseCase` | Plain JVM unit test with faked Intent-resolution/connectivity | High: WhatsApp-unavailable and no-connectivity fallback paths must both be covered explicitly, not just the happy path |
| ViewModels | Plain JVM unit test with fake Repository implementations | High: every `UiState` variant per screen (§5) has at least one test forcing the ViewModel into it |
| Repositories | Instrumented test against an in-memory Room database | Medium |
| Compose screens | Compose UI tests for critical flows (onboarding completion, Scam Warning's three actions) | Medium |
| Accessibility Service itself | **Cannot be meaningfully unit- or instrumented-tested in isolation**. Android provides no reliable way to simulate real accessibility events end-to-end in CI. **This is stated honestly as a testing gap, not hidden**: mitigated by (a) keeping the Service itself logic-free (§4, all real logic lives in the already-tested `ScreenSharePatternDetector`) so the untestable surface is as thin as possible, and (b) a manual QA checklist, run before every release, that physically exercises the real permission-grant flow and a real triggered detection on at least two physical device manufacturers (stock Android + one aggressive-battery-management OEM, §29) |

---

## 26. CI/CD

Given solo-engineer scale, a lightweight pipeline (GitHub Actions or equivalent), not a multi-stage enterprise setup:
1. **On every PR:** lint (`ktlint`/Android Lint) + full unit test suite (§25's JVM-level tests), which fails the build on any regression in `ScreenSharePatternDetector` or `NotifyContactUseCase` specifically, called out as required checks.
2. **On merge to `main`:** build the `internal` variant, upload to Firebase App Distribution automatically.
3. **Release cut:** manual trigger, builds `release` AAB, manual upload to Play Console (no automated Play Store publishing at this scale: the extra safety of a human final check before a release touching Accessibility Service permissions is worth the manual step).

---

## 27. Security

- **Minimized permission footprint by design** (§9's `canRetrieveWindowContent="false"`, §9's package-scoped event filtering) is itself the primary security control. The app architecturally cannot capture call content or screen content. It does not merely promise, by policy, not to.
- Room database is stored in standard Android app-sandboxed private storage, sufficient for MVP's low-sensitivity data (one name, one phone number, an alert timestamp list); this is a materially lighter security posture than the original full-platform design's financial-data encryption requirements, correctly, since **MVP never touches financial or bank-account data at all.**
- No custom crypto, no server-side secrets to manage, no API keys beyond Firebase's (which are not secret by design in Firebase's model). This section is short because the offline-first, backend-less architecture removes most of the attack surface a typical spec like this would need to cover.

---

## 28. Performance Budgets

| Metric | Budget | Rationale |
|---|---|---|
| Detection-to-warning latency (foreground-app event → `ScamWarningActivity` visible) | **< 2 seconds** | Directly implements the product's "within seconds" promise; achievable because the entire path is on-device with no network round-trip |
| Cold app start (icon tap → Home rendered) | < 1.5s | Standard Play Store Core Vitals guidance |
| Accessibility Service memory footprint (steady state) | < 20MB | The Service runs continuously for the app's entire installed lifetime; it must stay lightweight enough that Android's system-level memory pressure handling never has a reason to target it |
| Room queries (History list, Contact read) | < 50ms | Small dataset by construction (one contact, a bounded local history). No pagination needed at MVP scale |

---

## 29. Battery Optimization

Accessibility Services are generally exempt from standard Doze/App Standby restrictions once granted. This is precisely why the architecture in §9/§13 relies on one rather than a background `Service`. **The real-world risk is OEM-specific battery managers** (Xiaomi/MIUI, Oppo/ColorOS, Vivo, OnePlus, and similar) that impose additional, non-stock restrictions beyond AOSP's, and are well-documented to silently kill Accessibility Services in practice regardless of the app's own correctness. **No new UX is required to handle this.** It's an instance of the failure mode Screen 7's edge case already specifies generically (Accessibility Service silently revoked → Home reflects "Protection is off" on next resume, §6). Engineering-level mitigation: `AlertHistoryRepository`/analytics should log a distinguishable event when the Service's `onServiceConnected` fires after an unexpected gap, so aggregate Firebase Analytics data (§20) can reveal which OEMs are causing this in practice, informing, not blocking, whether a future release adds OEM-specific battery-exemption deep links (a V2 UX decision, not made here).

---

## 30. Play Store Compliance

**This is the largest launch risk in the entire specification, and is treated as such rather than a checklist afterthought.**

1. **Accessibility API Declaration Form**: required for any app requesting Accessibility Service access; must state the core use case plainly ("detects when a screen-sharing or remote-access app opens during an active phone call, to warn users of a common scam pattern"). Google's review for this category has real, documented rejection risk even for legitimate uses adjacent to security/parental-control categories. Budget review-cycle time (historically days to a few weeks) into any launch-date commitment, and do not treat Play Store approval as a formality.
2. **Full-screen intent (`USE_FULL_SCREEN_INTENT`) restriction on API 34+** (Finding E-2, Section 0): the fallback heads-up-notification path (§11) must ship in the same release as the primary path, not as a follow-up patch, precisely because this permission's availability at review time isn't fully guaranteed.
3. **Data Safety section** must disclose: Phone State access (purpose: call-state detection, not shared), Accessibility Service use (purpose: foreground-app detection, not shared, no content read), Contact data (name/phone number, collected, stored locally only, not shared with any third party). The "not shared, local-only" answer across the board is a genuine, accurate, and favorable Data Safety label this architecture earns honestly, not a claim requiring careful wording to be technically true.
4. **Play Store listing copy must not overstate protection scope**, matching the UX spec's own §13 discipline (never implying broader protection than the one detected pattern), since a listing that oversells scope relative to the Accessibility Declaration Form's stated use case is itself a plausible rejection or suspension trigger, independent of user trust concerns.

---

## 31. Accessibility Compliance

*(Note the deliberate naming collision in this product specifically: "Accessibility Service," the Android permission this app requests to detect screen-sharing apps, and "accessibility compliance," WCAG-style support for users with disabilities, are unrelated concepts that share a name. Both are addressed in this app; they must never be conflated in code comments, PR descriptions, or Play Store copy, where confusing them would be a genuine, embarrassing mistake.)*

Implementing UX spec §11 concretely:
- Every interactive Composable has an explicit `contentDescription` or `Modifier.semantics { }` block. No icon-only element ships without one, enforced via a lint check (Compose's accessibility lint rules) in CI (§26).
- Font scaling to 200% is tested via Compose's `LocalDensity`/font-scale preview configurations for Home and Scam Warning specifically (the UX spec's flagged priority screens), not just relying on system-wide scaling working "by default."
- Scam Warning's automatic (non-opt-in) TalkBack announcement (UX spec §4, the one deliberate accessibility exception) is implemented via `View.announceForAccessibility()` or Compose's `LiveRegion` semantics fired on Activity creation, not left to TalkBack's default focus-order announcement, which would otherwise require the user to have TalkBack's reading cursor already positioned correctly.

---

## 32. Error Recovery

| Failure | Recovery |
|---|---|
| `ScamDetectionAccessibilityService` process crashes | Android's accessibility subsystem restarts a crashed accessibility service automatically in most cases; a crash is still logged to Crashlytics (§22) and Home's next resume re-verifies the service is actually re-connected (not just "was granted at the OS-settings level," a subtly different check), consistent with never trusting a cached "on" state |
| Notify action fails (both WhatsApp and SMS) | Screen 8's error state (UX spec) surfaces a specific, actionable message, never a silent failure |
| Room database corruption | `fallbackToDestructiveMigration()` (§15): acceptable given the low-stakes nature of local history data at MVP |
| Full-screen intent suppressed by OS (Finding E-2) | Automatic fallback to heads-up notification (§11): the user still receives an actionable warning, just not over the lock screen in every OS/permission configuration |

---

## 33. Monitoring

No custom monitoring backend: Firebase Crashlytics (crash-free-users rate, the single most important operational metric for an app requesting sensitive permissions) and Firebase Analytics (funnel completion from the UX spec's event list: onboarding completion rate, `scam_warning.shown` volume, `notify_tapped` rate, `marked_false_positive` rate) are sufficient at this scale and consistent with the build-vs-buy decisions made throughout this document (§20, §22, §23).

---

## 34. Deployment

Play Store staged rollout, not a 100%-at-once release, specifically because this app requests two sensitive permissions across a highly fragmented Android OEM landscape (§29): recommend 10% → 50% → 100% over roughly one to two weeks post-launch, watching Crashlytics crash-free rate and the `permission_accessibility.granted` funnel step closely at each stage before expanding. A fragmentation-related failure (a specific OEM silently breaking the Accessibility Service) is far cheaper to catch at 10% than at 100%.

---

## 35. Future Extensibility

Every extension point below was designed *into* the architecture above, not bolted on after the fact. This section is a map of seams already built, not a new proposal:

- **Second detection pattern** (fake-refund/collect-request, strategy doc's V2 list): implement as a second `DetectionRule` alongside `ScreenSharePatternDetector` behind the same interface (§10); the Accessibility Service's event-forwarding plumbing doesn't change.
- **Multiple emergency contacts**: `emergency_contacts` is already a table, not a single-row assumption (§15); UI/Repository enforcement of "exactly one" is a product-layer constraint, cheap to relax later without a schema migration.
- **Backend introduction (AA linking, server-side risk scoring, full Trust Circle, V2/V3 per the strategy doc)**: every Repository is consumed only through its interface (§8/§17/§19); a remote-backed implementation is an additive rebinding, not a rewrite.
- **Module extraction** (§2): `domain/detection` already has zero dependency on `ui/*` or `di/*` beyond its own public interface, making it the first and cheapest package to extract into `:core:detection` when a second engineer joins.
- **Remote-updatable detection-app list** (§23): already designed as Remote-Config-first with a static fallback, not deferred to a "someday" backend project.

None of these are built now. All of them are cheaper to build later because of decisions made in this document now, which is the entire point of a Staff-level architecture pass on a one-engineer MVP: not to build more than the frozen scope requires, but to make sure the scope that *is* built doesn't quietly foreclose the roadmap the strategy doc already committed to.
