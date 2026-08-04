"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AlertHistoryEntry,
  EmergencyContact,
  PermissionState,
} from "@/data/types";

/**
 * Simulated client-side app state: this prototype's stand-in for the
 * Android app's Repository layer (docs/14 §8/§17: EmergencyContactRepository,
 * PermissionStatusRepository, SettingsRepository). There is no backend and
 * no real OS permission system in a browser, so this Context +
 * localStorage pairing plays the same role: a single source of truth the
 * onboarding flow writes to and Home reads from, persisted across
 * reloads. Per the established simulation philosophy, every value here
 * represents a *simulated* Android capability, never a real one.
 */

export type OnboardingStep =
  | "explainer"
  | "phone-state"
  | "accessibility"
  | "contact"
  | "complete"
  | "done";

interface AppState {
  onboardingStep: OnboardingStep;
  phoneState: PermissionState;
  accessibilityService: PermissionState;
  emergencyContact: EmergencyContact | null;
  /** docs/14 §8 AlertHistoryRepository: append-only, reverse-chronological on read. */
  alertHistory: AlertHistoryEntry[];
}

const DEFAULT_STATE: AppState = {
  onboardingStep: "explainer",
  phoneState: "not_requested",
  accessibilityService: "not_requested",
  emergencyContact: null,
  alertHistory: [],
};

const STORAGE_KEY = "guardian-ai-prototype-state";

interface AppStateContextValue extends AppState {
  /** False until the persisted state has been read from localStorage. Screens that redirect based on state must wait for this. */
  isHydrated: boolean;
  setOnboardingStep: (step: OnboardingStep) => void;
  setPhoneState: (state: PermissionState) => void;
  setAccessibilityService: (state: PermissionState) => void;
  setEmergencyContact: (contact: EmergencyContact | null) => void;
  /** Appends one entry: Alert History is append-only (docs/14 §8). */
  addAlertHistoryEntry: (entry: AlertHistoryEntry) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {
      // Corrupt or inaccessible storage: fall back to defaults silently;
      // this is prototype convenience state, not data worth failing over.
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const value: AppStateContextValue = {
    ...state,
    isHydrated,
    setOnboardingStep: (onboardingStep) =>
      setState((s) => ({ ...s, onboardingStep })),
    setPhoneState: (phoneState) => setState((s) => ({ ...s, phoneState })),
    setAccessibilityService: (accessibilityService) =>
      setState((s) => ({ ...s, accessibilityService })),
    setEmergencyContact: (emergencyContact) =>
      setState((s) => ({ ...s, emergencyContact })),
    addAlertHistoryEntry: (entry) =>
      setState((s) => ({ ...s, alertHistory: [entry, ...s.alertHistory] })),
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}

/** docs/13 Screen 7: Active only when both permissions are granted. */
export function deriveProtectionStatus(
  phoneState: PermissionState,
  accessibilityService: PermissionState
): "active" | "off" {
  return phoneState === "granted" && accessibilityService === "granted"
    ? "active"
    : "off";
}
