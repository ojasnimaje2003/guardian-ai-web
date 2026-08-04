"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ScreenShare, ChevronDown } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { StepIndicator } from "@/components/design-system/step-indicator";
import { Heading, Body } from "@/components/design-system/typography";
import { Card } from "@/components/design-system/card";
import { Button } from "@/components/design-system/button";
import { BottomActionBar } from "@/components/design-system/bottom-action-bar";
import { cn } from "@/lib/utils";

/**
 * Permission Explainer — docs/13 Screen 2. Explains both permissions
 * before requesting either, since Accessibility Service specifically
 * carries enough real-world stigma that an unexplained request risks
 * decline. "Not now" leads to a truthfully degraded app (Home's
 * "Protection is off" state), never a dead end.
 */
export default function PermissionExplainerPage() {
  const router = useRouter();
  const { setOnboardingStep } = useAppState();

  const continueOnboarding = () => {
    setOnboardingStep("phone-state");
    router.push("/onboarding/phone-state");
  };

  const notNow = () => {
    // Reduced-function path: onboarding is considered "done" so the
    // visitor can reach Home, but both permissions stay ungranted —
    // Home's "Protection is off" state reflects this honestly.
    setOnboardingStep("done");
    router.push("/home");
  };

  return (
    <ScreenContainer>
      <div className="gap-lg flex flex-col">
        <StepIndicator current={1} total={5} />
        <Heading as="h1">Before we start</Heading>

        <ExplainerCard
          icon={<Phone className="size-5" aria-hidden />}
          title="Know when you're on a call"
          body="We check whether a call is active — never who you're calling, and we never listen in."
        />
        <ExplainerCard
          icon={<ScreenShare className="size-5" aria-hidden />}
          title="Notice if a screen-sharing app opens during a call"
          body="This is the one signal scammers rely on — asking you to install an app like AnyDesk or TeamViewer while you're on the phone with them."
        />
      </div>

      <BottomActionBar className="mt-xl">
        <Button variant="filled" onClick={continueOnboarding}>
          Continue
        </Button>
        <Button variant="text" onClick={notNow}>
          Not now
        </Button>
      </BottomActionBar>
    </ScreenContainer>
  );
}

function ExplainerCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="gap-sm flex w-full items-center text-left"
      >
        <span className="text-primary">{icon}</span>
        <Heading as="h2" className="text-body flex-1 font-semibold">
          {title}
        </Heading>
        <ChevronDown
          aria-hidden
          className={cn(
            "text-muted-foreground ease-standard size-5 shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && <Body className="mt-sm text-muted-foreground">{body}</Body>}
    </Card>
  );
}
