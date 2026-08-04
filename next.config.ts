import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removes the `X-Powered-By: Next.js` response header: standard
  // production hardening (avoids advertising the framework/version to
  // every request for no functional benefit), not a behavior change.
  poweredByHeader: false,
};

export default nextConfig;
