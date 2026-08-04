"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { Display } from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";

/**
 * Splash / Welcome: docs/13 Screen 1. First-run only: "never shown
 * again after onboarding completes." A returning visitor who is
 * mid-onboarding resumes at their last incomplete step, never back to
 * Splash (docs/13 Screen 1 edge case). A visitor who has finished
 * onboarding goes straight to Home. This route is the only place that
 * routing decision is made.
 */
export default function SplashPage() {
  const router = useRouter();
  const { isHydrated, onboardingStep } = useAppState();

  useEffect(() => {
    if (!isHydrated) return;
    if (onboardingStep === "done") {
      router.replace("/home");
    } else if (onboardingStep !== "explainer") {
      router.replace(`/onboarding/${onboardingStep}`);
    }
  }, [isHydrated, onboardingStep, router]);

  // Blank while hydrating or mid-redirect: avoids a flash of Splash
  // content for a visitor who isn't actually on their first launch.
  if (!isHydrated || onboardingStep !== "explainer") {
    return null;
  }

  return <SplashContent />;
}

function SplashContent() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/onboarding/explainer"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  const continueOnboarding = () => router.push("/onboarding/explainer");

  return (
    <ScreenContainer variant="centered">
      {/* "entire screen also advances on tap anywhere" (docs/13 Screen 1):
          a click on the real button below bubbles up and triggers this
          too, so tapping the button and tapping elsewhere do the same
          thing without nesting an interactive element inside another. */}
      <div
        onClick={continueOnboarding}
        className="gap-xl flex w-full flex-col items-center text-center"
      >
        <ShieldCheck className="text-primary size-16" aria-hidden />
        <Display>
          Guardian AI watches for scam calls, so you don&apos;t have to.
        </Display>
        <Button variant="filled" className="w-full">
          Get started
        </Button>
      </div>
    </ScreenContainer>
  );
}
