"use client";

import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { TopAppBar } from "@/components/design-system/top-app-bar";
import { Heading, Body } from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";

/**
 * Demo Mode entry: the presentation-layer addition from the approved
 * story-first strategy: an optional, honest on-ramp that runs a
 * guided simulation of Guardian AI catching a live scam call, then
 * hands the visitor into the normal app. "Start Demo" now runs the
 * real guided simulation (`/demo/call` → `/demo/warning`), not a
 * placeholder.
 */
export default function DemoModePage() {
  const router = useRouter();
  const { onboardingStep } = useAppState();

  const exploreApp = () =>
    router.push(onboardingStep === "done" ? "/home" : "/onboarding/explainer");

  return (
    <ScreenContainer>
      <TopAppBar title="Demo Mode" onBack={() => router.push("/")} />

      <div className="gap-lg py-lg flex flex-col items-start">
        <PlayCircle className="text-primary size-12" aria-hidden />
        {/* h2, not h1: TopAppBar above already renders this screen's one
            h1 ("Demo Mode"), a second h1 here would give the page two
            top-level headings, which confuses heading-based screen-reader
            navigation. */}
        <Heading as="h2">Watch Guardian AI catch a scam call</Heading>
        <Body className="text-muted-foreground">
          A guided walkthrough of the product&apos;s core moment: a live call, a
          screen-sharing app opening, and the warning that interrupts it, all
          before you explore every screen yourself.
        </Body>

        <Button variant="filled" onClick={() => router.push("/demo/call")}>
          Start Demo
        </Button>

        <Button variant="text" onClick={exploreApp}>
          Explore the app instead
        </Button>
      </div>
    </ScreenContainer>
  );
}
