const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/page.tsx',           // Exclude Next.js pages (hard to test, mostly composition)
    '!app/**/layout.tsx',          // Exclude Next.js layouts (hard to test, mostly composition)
    '!app/**/route.ts',            // Exclude API routes (server-side, need different test setup)
    '!app/**/types/**',            // Exclude type definitions (no runtime code)
    '!app/**/schemas/**',          // Exclude schemas (mostly Zod definitions, hard to test meaningfully)
    '!app/c-form/components/**',   // Exclude complex form components (very large, would need extensive mocking)
    '!lib/**/types.ts',            // Exclude type definition files
    '!lib/db.ts',                  // Exclude database connection (server-side, hard to test)
    '!lib/performance-tracker.ts', // Exclude performance tracker (browser-specific APIs)
    '!**/__tests__/**',            // Exclude test files themselves
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'test-normalization.js',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)

