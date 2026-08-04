import type { Metadata } from "next";
import "./globals.css";

import { AppStateProvider } from "@/lib/app-state";
import { RouteTransition } from "@/components/shared/route-transition";
import { SITE_URL } from "@/lib/site";

// No custom webfont is loaded: docs/15's Typography Rationale specifies the
// system default font stack deliberately ("no custom typeface licensing/
// loading cost for a one-engineer build") — Tailwind's default `font-sans`
// utility (ui-sans-serif, system-ui, ...) already satisfies this.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Guardian AI",
  description:
    "Guardian AI — an interactive prototype of a real-time scam-call protection product.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppStateProvider>
          <RouteTransition>{children}</RouteTransition>
        </AppStateProvider>
      </body>
    </html>
  );
}
