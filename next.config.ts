import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "0", // Modern browsers use CSP; this header is legacy and can introduce vulnerabilities
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    // script-src 'self' allows same-origin scripts only.
    // 'unsafe-inline' is NOT present — inline scripts are blocked.
    // The Sonner toast and Recharts libraries work without unsafe-inline.
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // Tailwind injects inline styles at runtime
      "img-src 'self' https: data:",       // Allow product images from CDN
      "font-src 'self'",
      "connect-src 'self' https://api-orders.deuxcerie.com.br", // API + presigned upload targets
      "frame-ancestors 'none'",            // Redundant with X-Frame-Options but belt-and-suspenders
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Restrict to known CDN — replace with the actual R2/CDN hostname in production
        protocol: "https",
        hostname: "*.deuxcerie.com.br",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
