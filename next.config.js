/** @type {import('next').NextConfig} */
const nextConfig = {
  turbo: {
    enabled: true, // Enable Turbopack
    // Add Turbopack-specific config here if needed
  },
  // Remove or migrate custom webpack config if present
};

module.exports = nextConfig;