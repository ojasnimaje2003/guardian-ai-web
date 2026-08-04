"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";

import { DEMO_CALL_SCRIPT, KNOWN_SCREEN_SHARE_APPS } from "@/data/mock-data";
import { ScreenContainer } from "@/components/design-system/screen-container";
import {
  Heading,
  Body,
  Caption,
  Numeric,
} from "@/components/design-system/typography";
import { Button } from "@/components/design-system/button";
import { BottomActionBar } from "@/components/design-system/bottom-action-bar";

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Demo Mode: Guided Simulation. Not a documented screen on its own;
 * it's the presentation-layer bridge the approved story-first strategy
 * calls for, ending the instant the simulated screen-share app "opens,"
 * the same moment `docs/13` Screen 8 fires from in the real product.
 * A stylized in-app call screen, clearly not a recreation of Android's
 * own call UI (`Caption` below says so explicitly), since faking real
 * system chrome would misrepresent what this prototype is.
 */
export default function DemoCallPage() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const detectedApp = KNOWN_SCREEN_SHARE_APPS[0];

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lineIndex >= DEMO_CALL_SCRIPT.length) {
      const timer = setTimeout(() => router.push("/demo/warning"), 1600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => setLineIndex((i) => i + 1),
      lineIndex === 0 ? 900 : 2600
    );
    return () => clearTimeout(timer);
  }, [lineIndex, router]);

  const finishedScript = lineIndex >= DEMO_CALL_SCRIPT.length;

  return (
    <ScreenContainer variant="full-bleed">
      <div className="gap-xl px-md py-2xl flex flex-1 flex-col items-center">
        <Caption>Demo Mode: simulated call, not a real call</Caption>

        <div className="gap-sm flex flex-col items-center">
          <div className="bg-secondary flex size-20 animate-pulse items-center justify-center rounded-full">
            <Phone className="text-secondary-foreground size-9" aria-hidden />
          </div>
          <Heading as="h1">Unknown Caller</Heading>
          <Numeric className="text-muted-foreground">
            {formatElapsed(elapsed)}
          </Numeric>
        </div>

        <div className="gap-md flex w-full max-w-(--width-content) flex-col">
          {DEMO_CALL_SCRIPT.slice(0, lineIndex).map((line, i) => (
            <Body
              key={i}
              className="animate-in fade-in bg-card p-md text-card-foreground ease-standard rounded-(--radius-card) duration-200"
            >
              {line}
            </Body>
          ))}

          {finishedScript && (
            <div className="gap-sm animate-in fade-in ease-standard flex items-center duration-200">
              <div className="bg-concern size-2 animate-pulse rounded-full" />
              <Caption>{detectedApp.displayName} opened</Caption>
            </div>
          )}
        </div>
      </div>

      <BottomActionBar>
        <Button variant="text" onClick={() => router.push("/demo/warning")}>
          Skip ahead
        </Button>
      </BottomActionBar>
    </ScreenContainer>
  );
}
