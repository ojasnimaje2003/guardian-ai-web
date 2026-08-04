/**
 * The deployed site's base URL — needed by `robots.ts`, `sitemap.ts`,
 * and `layout.tsx`'s `metadataBase`, all three of which require an
 * absolute URL, not a relative path. This repo has no fixed production
 * domain yet, so the value is resolved at build/request time rather
 * than hardcoded:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — set this once a real custom domain exists.
 * 2. Vercel's own auto-provided `VERCEL_PROJECT_PRODUCTION_URL` (the
 *    stable production domain, not a per-preview-deployment one).
 * 3. `VERCEL_URL` (whatever deployment — preview or production — is
 *    currently building), as a fallback.
 * 4. `localhost:3000`, for local development.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
