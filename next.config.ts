import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// Content-Security-Policy — restricts where scripts, styles, images etc. can load from.
// 'unsafe-inline' for styles is required by Next.js CSS-in-JS at runtime.
// 'unsafe-eval' is required by GSAP and other animation libraries.
const cspDirectives = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live ${isDev ? 'http://localhost:*' : ''}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https://cdn.sanity.io https://api.dicebear.com https://images.unsplash.com https://lh3.googleusercontent.com`,
  `connect-src 'self' https://cdn.sanity.io https://api.sanity.io https://o*.ingest.sentry.io https://vitals.vercel-insights.com https://api.github.com wss: ${isDev ? 'ws://localhost:*' : ''}`,
  `media-src 'self' blob:`,
  `frame-src 'self' https://vercel.live`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth profile images
      },
    ],
  },
  transpilePackages: ['gsap', 'lenis'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // --- Security Headers ---
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            // Enforces HTTPS for 2 years; includes subdomains
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Prevent the page from being embedded in an iframe (clickjacking)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Prevent MIME-type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Don't send the full referrer to cross-origin destinations
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restrict access to browser APIs that are not needed
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-UA-Compatible',
            value: 'IE=Edge,chrome=1',
          },
          // --- CORS for API routes ---
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
