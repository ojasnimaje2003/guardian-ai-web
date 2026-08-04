import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** Every real route this app serves, kept in sync by hand with `src/app/`'s actual route tree. */
const ROUTES = [
  "/",
  "/home",
  "/demo",
  "/demo/call",
  "/demo/warning",
  "/history",
  "/settings",
  "/onboarding/explainer",
  "/onboarding/phone-state",
  "/onboarding/accessibility",
  "/onboarding/contact",
  "/onboarding/complete",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));
}
