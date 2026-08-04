"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { StepIndicator } from "@/components/design-system/step-indicator";
import { Heading, Body } from "@/components/design-system/typography";
import { Card } from "@/components/design-system/card";
import { Button } from "@/components/design-system/button";

/**
 * Phone State Permission: docs/13 Screen 3. On a real device this is
 * Android's standard runtime permission dialog (`READ_PHONE_STATE`),
 * system UI, outside app design control. There is no browser
 * equivalent, so the dialog itself is simulated here as a clearly
 * in-app card (not a fake OS chrome recreation) the visitor actually
 * interacts with. "auto-advances to Accessibility Service Permission
 * screen regardless of outcome (a decline doesn't block progress; it
 * degrades functionality, tracked in Settings)."
 */
export default function PhoneStatePermissionPage() {
  const router = useRouter();
  const { onboardingStep, setPhoneState, setOnboardingStep } = useAppState();
  const isRepairMode = onboardingStep === "done";
  const [dialogVisible, setDialogVisible] = useState(false);
  const [result, setResult] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDialogVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Only advance onboarding progress during first-time onboarding: this
  // screen is also reached post-onboarding via Home/Settings' "Fix
  // this" repair path, which must never regress a completed
  // onboardingStep back to an earlier one (see docs/14 §14).
  useEffect(() => {
    if (onboardingStep !== "done") setOnboardingStep("phone-state");
  }, [onboardingStep, setOnboardingStep]);

  function choose(granted: boolean) {
    setPhoneState(granted ? "granted" : "denied");
    setResult(granted ? "granted" : "denied");
    setTimeout(() => {
      // Reached via Home/Settings' "Fix this" (docs/13 Screen 10's
      // "direct, one-tap path back into the relevant grant flow"): fix
      // just this one permission and return, don't force the rest of
      // the onboarding sequence on someone who already finished it.
      if (isRepairMode) {
        router.push("/home");
      } else {
        setOnboardingStep("accessibility");
        router.push("/onboarding/accessibility");
      }
    }, 700);
  }

  return (
    <ScreenContainer>
      <div className="gap-lg flex flex-col">
        <StepIndicator current={2} total={5} />
        <Heading as="h1">Confirming call access</Heading>
        <Body className="text-muted-foreground">
          Android will ask to confirm this. Tap Allow.
        </Body>

        {dialogVisible && !result && (
          <Card
            variant="outlined"
            className="animate-in fade-in ease-standard duration-200"
          >
            <Heading as="h2" className="text-body font-semibold">
              Allow Guardian AI to access phone state?
            </Heading>
            <Body className="mt-sm text-muted-foreground">
              Guardian AI needs to know whether a call is active.
            </Body>
            <div className="mt-lg gap-sm flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button variant="text" onClick={() => choose(false)}>
                Deny
              </Button>
              <Button variant="filled" onClick={() => choose(true)}>
                Allow
              </Button>
            </div>
          </Card>
        )}

        {result && (
          <div className="gap-sm text-primary animate-in fade-in ease-standard flex items-center duration-200">
            <Check className="size-5" aria-hidden />
            <Body>
              {result === "granted" ? "Allowed" : "Denied, continuing"}
            </Body>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
