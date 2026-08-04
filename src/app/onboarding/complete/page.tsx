"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { StepIndicator } from "@/components/design-system/step-indicator";
import { Display } from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";
import { CheckmarkDraw } from "@/components/design-system/checkmark-draw";

/**
 * Onboarding Complete — docs/13 Screen 6. "This entire screen *is* the
 * success state" — reaching it means onboarding is already done, so
 * `onboardingStep` is marked "done" on arrival, not on the Done tap
 * (which is a confirmation, not a decision point, per the doc).
 */
export default function OnboardingCompletePage() {
  const router = useRouter();
  const { setOnboardingStep } = useAppState();

  useEffect(() => {
    setOnboardingStep("done");
  }, [setOnboardingStep]);

  useEffect(() => {
    const timer = setTimeout(() => router.push("/home"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenContainer variant="centered">
      <div className="gap-xl flex flex-col items-center text-center">
        <StepIndicator current={5} total={5} />
        <div className="bg-secondary flex size-16 items-center justify-center rounded-full">
          <CheckmarkDraw />
        </div>
        <Display>
          You&apos;re set up. Guardian AI is now watching quietly in the
          background — you won&apos;t hear from it unless something looks wrong.
        </Display>
        <Button
          variant="filled"
          className="w-full"
          onClick={() => router.push("/home")}
        >
          Done
        </Button>
      </div>
    </ScreenContainer>
  );
}
