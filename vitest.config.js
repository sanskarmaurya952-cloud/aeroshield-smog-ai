import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration with Istanbul code coverage reporting.
 *
 * Run tests with coverage:    npm run test:coverage
 * Run tests without coverage: npm test
 *
 * Coverage thresholds enforce minimum quality gates — CI fails if coverage
 * drops below these values, preventing accidental regression.
 */
export default defineConfig({
  test: {
    // Run each test file in its own Node.js worker for complete isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },

    // Environment variables available during all tests
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
    },

    // Coverage configuration (activated with --coverage flag)
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',

      // Minimum thresholds — build fails if any metric drops below these
      thresholds: {
        lines:     80,
        functions: 80,
        branches:  75,
        statements: 80,
      },

      // Only measure coverage for server-side business logic
      include: [
        'server/services/**/*.js',
        'server/controllers/**/*.js',
        'server/utils/**/*.js',
        'server/config/**/*.js',
        'server/routes/**/*.js',
      ],

      // Exclude external declarations and auto-generated files
      exclude: [
        'server/data/**',
        '**/*.test.js',
        '**/node_modules/**',
        'client/**',
      ],
    },

    // Report slow tests for performance awareness
    slowTestThreshold: 500,
  },
});
