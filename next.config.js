/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // node-ical (and its rrule/luxon deps) use BigInt at module-eval time,
    // which webpack mangles. Excluding it from bundling fixes the build error.
    serverComponentsExternalPackages: ['node-ical'],
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
