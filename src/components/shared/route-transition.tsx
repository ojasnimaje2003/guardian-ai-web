"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * App-shell-level navigation behavior for every screen (docs/15 Task 4):
 * - 200ms fade-through on every route change (the doc's default screen
 *   transition), except Scam Warning, whose zero-transition entrance is
 *   a documented, deliberate exception — never fade that one.
 * - Moves keyboard focus to the new screen's content on navigation.
 *   Next.js client-side routing doesn't do this itself (unlike a full
 *   page load), so without it a keyboard user's focus is silently left
 *   on a now-unmounted control after every navigation.
 * - Announces the new screen to screen readers via a polite live
 *   region, for the same reason — an SPA route change is otherwise
 *   invisible to assistive tech.
 */
const ROUTE_TITLES: Record<string, string> = {
  "/": "Welcome",
  "/onboarding/explainer": "Before we start",
  "/onboarding/phone-state": "Confirming call access",
  "/onboarding/accessibility": "Accessibility Service permission",
  "/onboarding/contact": "Emergency contact",
  "/onboarding/complete": "Setup complete",
  "/home": "Home",
  "/demo": "Demo Mode",
  "/demo/call": "Simulated call in progress",
  "/demo/warning": "Scam warning",
  "/history": "Alert History",
  "/settings": "Settings",
};

const NO_TRANSITION_ROUTES = new Set(["/demo/warning"]);

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const skipTransition = NO_TRANSITION_ROUTES.has(pathname);

  useEffect(() => {
    containerRef.current?.focus();
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Scam Warning announces itself, more urgently (assertive), via its
    // own live region — a second, competing "polite" announcement here
    // would only add noise.
    if (!skipTransition) {
      setAnnouncement(ROUTE_TITLES[pathname] ?? "Guardian AI");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div
        key={skipTransition ? undefined : pathname}
        ref={containerRef}
        tabIndex={-1}
        className={cn(
          "outline-none",
          !skipTransition && "animate-in fade-in ease-standard duration-200"
        )}
      >
        {children}
      </div>
    </>
  );
}
