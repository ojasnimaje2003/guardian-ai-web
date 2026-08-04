import type { MetadataRoute } from "next";

/**
 * `theme_color`/`background_color` are the real `--primary`/
 * `--background` design tokens (globals.css), not invented values.
 * `icons` references the existing `favicon.ico` only: this repo has
 * no dedicated 192×192/512×512 PNG app icons, and generating placeholder
 * ones wasn't in scope here (see the deployment-readiness report).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guardian AI",
    short_name: "Guardian AI",
    description:
      "Guardian AI: an interactive prototype of a real-time scam-call protection product.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#2e5d4e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
