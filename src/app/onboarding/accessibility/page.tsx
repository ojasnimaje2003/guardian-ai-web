"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { StepIndicator } from "@/components/design-system/step-indicator";
import { Heading, Body, Caption } from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";
import { Spinner } from "@/components/design-system/loading";

/**
 * Accessibility Service Permission — docs/13 Screen 4. On a real device
 * this permission cannot be granted in-app at all — Android requires a
 * round trip to System Settings and back. There is no such settings app
 * to hand off to in a browser, so "Open Settings" simulates the entire
 * round trip (the wait, the automatic re-check on "return") rather than
 * a fake Settings UI, which would misrepresent a mechanism this
 * prototype cannot actually perform.
 */
export default function AccessibilityPermissionPage() {
  const router = useRouter();
  const { onboardingStep, setAccessibilityService, setOnboardingStep } =
    useAppState();
  const isRepairMode = onboardingStep === "done";
  const [phase, setPhase] = useState<"idle" | "checking" | "granted">("idle");

  // See the equivalent guard in onboarding/phone-state: this screen is
  // also reached post-onboarding via the "Fix this" repair path and
  // must not regress a completed onboardingStep.
  useEffect(() => {
    if (onboardingStep !== "done") setOnboardingStep("accessibility");
  }, [onboardingStep, setOnboardingStep]);

  function afterResolved() {
    if (isRepairMode) {
      router.push("/home");
    } else {
      setOnboardingStep("contact");
      router.push("/onboarding/contact");
    }
  }

  function openSettings() {
    setPhase("checking");
    setTimeout(() => {
      setAccessibilityService("granted");
      setPhase("granted");
      setTimeout(afterResolved, 700);
    }, 1100);
  }

  function skipForNow() {
    setAccessibilityService("denied");
    afterResolved();
  }

  return (
    <ScreenContainer>
      <div className="gap-lg flex flex-col">
        <StepIndicator current={3} total={5} />
        <Heading as="h1">
          One more step — this one happens in your phone&apos;s Settings, not
          here.
        </Heading>

        <ol className="gap-sm text-body text-foreground flex flex-col">
          <li>1. Find Guardian AI in the list.</li>
          <li>2. Tap it, then tap the toggle.</li>
          <li>3. Come back here — we&apos;ll check automatically.</li>
        </ol>

        {phase === "checking" && (
          <div className="gap-sm animate-in fade-in ease-standard flex items-center duration-200">
            <Spinner />
            <Body>Checking...</Body>
          </div>
        )}

        {phase === "granted" && (
          <div className="gap-sm text-primary animate-in fade-in ease-standard flex items-center duration-200">
            <Check className="size-5" aria-hidden />
            <Body>Got it — Guardian AI can now watch for this pattern.</Body>
          </div>
        )}

        {phase === "idle" && (
          <Button variant="filled" onClick={openSettings} className="w-full">
            Open Settings
          </Button>
        )}

        {phase === "idle" && (
          <Button variant="text" onClick={skipForNow} className="w-fit">
            Skip for now
          </Button>
        )}

        <Caption>
          Without this permission, Guardian AI cannot detect the Screen-Share
          Pattern at all.
        </Caption>
      </div>
    </ScreenContainer>
  );
}
