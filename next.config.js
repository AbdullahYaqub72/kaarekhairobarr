/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // firebase-admin must run as a normal Node module, not be bundled.
    serverComponentsExternalPackages: ['firebase-admin'],
  },
}

module.exports = nextConfig
