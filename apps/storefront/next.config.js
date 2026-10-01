/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["mac-mini", "mac-mini.local", "192.168.1.235"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // URLs from the Medusa starter carried a country prefix (/br/sacola) and had a /cart page.
  async redirects() {
    return [
      { source: "/:cc(br|dk|us)", destination: "/", permanent: true },
      { source: "/:cc(br|dk|us)/:path*", destination: "/:path*", permanent: true },
      { source: "/cart", destination: "/sacola", permanent: true },
    ]
  },
}

module.exports = nextConfig
