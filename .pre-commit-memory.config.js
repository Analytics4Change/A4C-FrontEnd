/**
 * Pre-commit Memory Check Configuration
 * 
 * This file contains configuration options for the pre-commit memory checker.
 * These settings can be overridden by environment variables.
 */

module.exports = {
  // Memory thresholds (in MB)
  thresholds: {
    // Heap memory usage threshold per test
    heap: process.env.PRE_COMMIT_HEAP_THRESHOLD_MB ? 
      parseInt(process.env.PRE_COMMIT_HEAP_THRESHOLD_MB) : 50,
    
    // Peak memory usage threshold per test
    peak: process.env.PRE_COMMIT_PEAK_THRESHOLD_MB ? 
      parseInt(process.env.PRE_COMMIT_PEAK_THRESHOLD_MB) : 200,
    
    // Memory growth rate threshold (as percentage, e.g., 0.1 = 10%)
    growth: process.env.PRE_COMMIT_GROWTH_THRESHOLD ? 
      parseFloat(process.env.PRE_COMMIT_GROWTH_THRESHOLD) : 0.1,
      
    // RSS (Resident Set Size) threshold - total memory used by process
    rss: process.env.PRE_COMMIT_RSS_THRESHOLD_MB ? 
      parseInt(process.env.PRE_COMMIT_RSS_THRESHOLD_MB) : 300,
      
    // External memory (C++ objects) threshold
    external: process.env.PRE_COMMIT_EXTERNAL_THRESHOLD_MB ? 
      parseInt(process.env.PRE_COMMIT_EXTERNAL_THRESHOLD_MB) : 50
  },

  // Performance settings
  performance: {
    // Quick mode - stops on first failure and uses faster checks
    quickMode: process.env.PRE_COMMIT_QUICK_MODE === 'true',
    
    // Cache results to avoid re-running unchanged tests
    cacheResults: process.env.PRE_COMMIT_CACHE_RESULTS !== 'false',
    
    // Detailed mode - includes heap snapshots and comprehensive analysis
    detailedMode: process.env.PRE_COMMIT_DETAILED_MODE === 'true',
    
    // Timeout per test in milliseconds
    testTimeout: process.env.PRE_COMMIT_TEST_TIMEOUT ? 
      parseInt(process.env.PRE_COMMIT_TEST_TIMEOUT) : 15000,
    
    // Maximum number of tests to run concurrently
    maxConcurrency: process.env.PRE_COMMIT_MAX_CONCURRENCY ? 
      parseInt(process.env.PRE_COMMIT_MAX_CONCURRENCY) : 1
  },

  // Path configuration
  paths: {
    // Directory for caching test results
    cacheDir: process.env.PRE_COMMIT_CACHE_DIR || './memory-reports/pre-commit-cache',
    
    // Directory for memory reports
    reportDir: process.env.PRE_COMMIT_REPORT_DIR || './memory-reports/pre-commit',
    
    // Directory for heap snapshots (when detailed mode is enabled)
    snapshotDir: process.env.PRE_COMMIT_SNAPSHOT_DIR || './memory-reports/pre-commit/snapshots'
  },

  // Test patterns
  testPatterns: {
    // Glob patterns for test files
    include: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}'
    ],
    
    // Patterns to exclude from memory checking
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts'
    ],
    
    // Test types to prioritize (checked first)
    priority: [
      '**/focus/**/*.test.{js,jsx,ts,tsx}',  // Focus management tests
      '**/medication/**/*.test.{js,jsx,ts,tsx}' // Medication tests
    ]
  },

  // Integration settings
  integration: {
    // Enable integration with memory dashboard
    dashboardIntegration: process.env.PRE_COMMIT_DASHBOARD_INTEGRATION !== 'false',
    
    // Post results to dashboard endpoint (if configured)
    dashboardEndpoint: process.env.PRE_COMMIT_DASHBOARD_ENDPOINT || null,
    
    // Generate HTML report for failed tests
    generateHtmlReport: process.env.PRE_COMMIT_GENERATE_HTML !== 'false',
    
    // Send notifications on failure (requires notification service setup)
    notifications: {
      enabled: process.env.PRE_COMMIT_NOTIFICATIONS === 'true',
      webhook: process.env.PRE_COMMIT_NOTIFICATION_WEBHOOK || null
    }
  },

  // Developer experience settings
  ui: {
    // Use colors in output
    colors: process.env.NO_COLOR !== '1' && process.env.PRE_COMMIT_COLORS !== 'false',
    
    // Show progress indicators
    progress: process.env.PRE_COMMIT_PROGRESS !== 'false',
    
    // Verbose logging
    verbose: process.env.PRE_COMMIT_VERBOSE === 'true',
    
    // Show tips and recommendations
    showTips: process.env.PRE_COMMIT_SHOW_TIPS !== 'false'
  },

  // Environment-specific configurations
  environments: {
    // Development environment (more permissive)
    development: {
      thresholds: {
        heap: 75,
        peak: 300,
        growth: 0.15
      },
      performance: {
        quickMode: true,
        testTimeout: 20000
      }
    },
    
    // CI environment (stricter)
    ci: {
      thresholds: {
        heap: 40,
        peak: 150,
        growth: 0.08
      },
      performance: {
        quickMode: false,
        detailedMode: true,
        cacheResults: false
      }
    },
    
    // Production pre-deployment (strictest)
    production: {
      thresholds: {
        heap: 30,
        peak: 100,
        growth: 0.05
      },
      performance: {
        quickMode: false,
        detailedMode: true,
        testTimeout: 30000
      }
    }
  }
};

/**
 * Get configuration for current environment
 */
function getCurrentConfig() {
  const baseConfig = module.exports;
  const env = process.env.NODE_ENV || 'development';
  const envConfig = baseConfig.environments[env] || {};
  
  // Deep merge environment-specific config
  return {
    ...baseConfig,
    thresholds: { ...baseConfig.thresholds, ...envConfig.thresholds },
    performance: { ...baseConfig.performance, ...envConfig.performance },
    paths: { ...baseConfig.paths, ...envConfig.paths },
    testPatterns: { ...baseConfig.testPatterns, ...envConfig.testPatterns },
    integration: { ...baseConfig.integration, ...envConfig.integration },
    ui: { ...baseConfig.ui, ...envConfig.ui }
  };
}

module.exports.getCurrentConfig = getCurrentConfig;