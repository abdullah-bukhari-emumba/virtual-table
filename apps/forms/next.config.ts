import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ================================================================
  // MULTI-ZONE CONFIGURATION - FORMS ZONE
  // ================================================================
  // This zone handles all form-related functionality

  // Asset prefix to avoid conflicts with other zones when accessed via shell zone
  assetPrefix: process.env.NODE_ENV === 'production' ? '/forms-static' : '',

  // Note: We don't use basePath here to allow the forms zone to be accessed
  // independently at its root (http://localhost:3001/) while still being
  // accessible via the shell zone at /forms/* through rewrites

  // Experimental configuration for better monorepo support
  experimental: {
    // Optimize workspace package handling
    optimizePackageImports: ['@virtual-table/ui', '@virtual-table/types'],
  },

  // Rewrites for asset handling when accessed via shell zone
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/forms-static/_next/:path+',
          destination: '/_next/:path+',
        },
      ],
    };
  },
};

export default nextConfig;

