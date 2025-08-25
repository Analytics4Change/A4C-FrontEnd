/**
 * Memory-specific Vitest configuration for leak detection and profiling
 * 
 * This configuration implements Phase 2.2 of the Memory Leak Detection Plan
 * It provides single-threaded execution and memory monitoring for accurate memory tracking
 * 
 * Usage:
 *   MEMORY_PROFILE=true vitest run --config vitest.config.memory.js
 *   MEMORY_PROFILE=true vitest run --config vitest.config.memory.js src/path/to/specific/test.tsx
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Memory configuration options from environment
const MEMORY_CONFIG = {
  enabled: process.env.MEMORY_PROFILE === 'true',
  singleThread: process.env.MEMORY_SINGLE_THREAD !== 'false',
  isolateTests: process.env.MEMORY_ISOLATE !== 'false',
  testTimeout: parseInt(process.env.MEMORY_TEST_TIMEOUT || '60000', 10),
  hookTimeout: parseInt(process.env.MEMORY_HOOK_TIMEOUT || '15000', 10),
  enableGC: process.env.MEMORY_ENABLE_GC !== 'false',
  maxWorkers: parseInt(process.env.MEMORY_MAX_WORKERS || '1', 10),
  coverage: process.env.MEMORY_ENABLE_COVERAGE === 'true'
};

// Log memory configuration for debugging
if (MEMORY_CONFIG.enabled) {
  console.log('[MEMORY-CONFIG] Memory profiling enabled with configuration:', MEMORY_CONFIG);
}

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Global test configuration
    globals: true,
    environment: 'jsdom',
    
    // Setup files - include memory instrumentation when enabled
    setupFiles: MEMORY_CONFIG.enabled ? [
      './src/test/setup.ts',
      './src/test/vitest.setup.memory.js'
    ] : ['./src/test/setup.ts'],
    
    // Timeouts for memory-intensive operations
    testTimeout: MEMORY_CONFIG.testTimeout,
    hookTimeout: MEMORY_CONFIG.hookTimeout,
    
    // Pool configuration for memory tracking
    pool: 'threads',
    poolOptions: {
      threads: {
        // Single-threaded execution for accurate memory tracking
        singleThread: MEMORY_CONFIG.singleThread,
        
        // Isolate tests to prevent cross-test memory pollution
        isolate: MEMORY_CONFIG.isolateTests,
        
        // Limit workers to reduce memory overhead
        maxWorkers: MEMORY_CONFIG.maxWorkers,
        minWorkers: 1,
        
        // Use shared memory for better memory tracking
        useAtomics: true
      }
    },
    
    // Environment configuration for memory profiling
    env: {
      // Pass through memory-related environment variables
      MEMORY_PROFILE: process.env.MEMORY_PROFILE || 'false',
      MEMORY_THRESHOLD_HEAP: process.env.MEMORY_THRESHOLD_HEAP || '300',
      MEMORY_THRESHOLD_RSS: process.env.MEMORY_THRESHOLD_RSS || '800',
      MEMORY_THRESHOLD_EXTERNAL: process.env.MEMORY_THRESHOLD_EXTERNAL || '100',
      MEMORY_THRESHOLD_GROWTH: process.env.MEMORY_THRESHOLD_GROWTH || '0.1',
      MEMORY_TEST_WARNING_THRESHOLD: process.env.MEMORY_TEST_WARNING_THRESHOLD || '50',
      MEMORY_ENABLE_GC: process.env.MEMORY_ENABLE_GC || 'true',
      MEMORY_ENABLE_SNAPSHOTS: process.env.MEMORY_ENABLE_SNAPSHOTS || 'false',
      MEMORY_LOG_LEVEL: process.env.MEMORY_LOG_LEVEL || 'warn',
      MEMORY_REPORT_PATH: process.env.MEMORY_REPORT_PATH || './memory-reports',
      MEMORY_GC_ITERATIONS: process.env.MEMORY_GC_ITERATIONS || '3',
      
      // Force Node.js flags for memory tracking
      NODE_OPTIONS: [
        process.env.NODE_OPTIONS,
        MEMORY_CONFIG.enableGC ? '--expose-gc' : '',
        '--max-old-space-size=4096',
        '--max-semi-space-size=256'
      ].filter(Boolean).join(' ')
    },
    
    // Reporters for memory analysis
    reporter: MEMORY_CONFIG.enabled ? [
      'verbose',
      'json'
    ] : ['default'],
    
    // Output configuration
    outputFile: MEMORY_CONFIG.enabled ? {
      json: './memory-reports/vitest-results.json'
    } : undefined,
    
    // Coverage configuration (disabled by default for memory testing)
    coverage: MEMORY_CONFIG.coverage ? {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'html'],
      reportsDirectory: './memory-reports/coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/test/**',
        '**/tests/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    } : {
      enabled: false
    },
    
    // Sequence configuration for consistent test ordering
    sequence: {
      shuffle: false,
      concurrent: false,
      hooks: 'stack'
    },
    
    // Retry configuration - disabled for memory testing
    retry: 0,
    
    // Bail on first failure for memory issues
    bail: process.env.MEMORY_BAIL_ON_FAILURE === 'true' ? 1 : undefined,
    
    // File-related configurations
    includeSource: [],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    
    // Watch mode disabled for memory profiling
    watch: false,
    
    // Other optimizations for memory testing
    css: false,
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: []
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@test': path.resolve(process.cwd(), './src/test')
    }
  },
  
  // Esbuild configuration for faster builds
  esbuild: {
    target: 'node14',
    format: 'esm'
  },
  
  // Define global constants for memory testing
  define: {
    __MEMORY_PROFILE_MODE__: JSON.stringify(MEMORY_CONFIG.enabled),
    __TEST_TIMEOUT__: JSON.stringify(MEMORY_CONFIG.testTimeout)
  }
});

// Log additional information for debugging
if (MEMORY_CONFIG.enabled) {
  console.log('[MEMORY-CONFIG] Memory profiling configuration applied');
  console.log('[MEMORY-CONFIG] Run tests with: MEMORY_PROFILE=true vitest run --config vitest.config.memory.js');
  console.log('[MEMORY-CONFIG] Memory reports will be saved to: ./memory-reports/');
  
  // Check for required Node.js flags
  if (!MEMORY_CONFIG.enableGC) {
    console.warn('[MEMORY-CONFIG] WARNING: Garbage collection disabled. Memory tracking may be less accurate.');
  }
  
  if (process.env.NODE_OPTIONS && !process.env.NODE_OPTIONS.includes('--expose-gc')) {
    console.warn('[MEMORY-CONFIG] WARNING: --expose-gc flag not detected in NODE_OPTIONS. This may affect memory measurements.');
  }
}