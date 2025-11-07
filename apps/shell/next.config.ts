import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Shell zone doesn't need assetPrefix since it's the main zone
  // It handles routing to other zones via rewrites

  // Configure server external packages for native modules
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
    // Optimize workspace package handling
    optimizePackageImports: ['@virtual-table/ui', '@virtual-table/types', '@virtual-table/utils', '@virtual-table/database'],
  },

  async rewrites() {
    return [
      // ================================================================
      // BACKWARD COMPATIBILITY REDIRECTS
      // ================================================================
      // Redirect old /c-form route to new forms zone
      {
        source: '/c-form',
        destination: `${process.env.FORMS_URL}/forms/patient-intake`,
      },

      // ================================================================
      // FORMS ZONE REWRITES
      // ================================================================
      // Route all /forms/* requests to the forms zone
      {
        source: '/forms',
        destination: `${process.env.FORMS_URL}/forms`,
      },
      {
        source: '/forms/:path*',
        destination: `${process.env.FORMS_URL}/forms/:path*`,
      },
      // Route static assets for forms zone
      {
        source: '/forms-static/:path*',
        destination: `${process.env.FORMS_URL}/forms-static/:path*`,
      },
    ];
  },
};

export default nextConfig;

