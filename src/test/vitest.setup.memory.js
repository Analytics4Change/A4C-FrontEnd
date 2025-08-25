/**
 * Memory instrumentation setup for Vitest
 * Tracks memory usage before/after each test and integrates with MemoryProfiler
 * 
 * This file implements Phase 2.2 of the Memory Leak Detection Plan
 * Usage: Set MEMORY_PROFILE=true environment variable to enable memory tracking
 */

import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
const MemoryProfiler = require('../../scripts/memory-profiler.cjs');

// Global memory profiler instance
let memoryProfiler = null;
let memorySnapshots = [];
let currentTestName = '';
let testStartMemory = null;

// Memory thresholds (configurable via environment variables)
const MEMORY_THRESHOLDS = {
  heapUsed: parseInt(process.env.MEMORY_THRESHOLD_HEAP || '300', 10) * 1024 * 1024, // 300MB default
  external: parseInt(process.env.MEMORY_THRESHOLD_EXTERNAL || '100', 10) * 1024 * 1024, // 100MB default
  rss: parseInt(process.env.MEMORY_THRESHOLD_RSS || '800', 10) * 1024 * 1024, // 800MB default
  leakGrowthRate: parseFloat(process.env.MEMORY_THRESHOLD_GROWTH || '0.1'), // 10% default
  testWarningThreshold: parseInt(process.env.MEMORY_TEST_WARNING_THRESHOLD || '50', 10) * 1024 * 1024 // 50MB per test
};

// Configuration options
const CONFIG = {
  enableGC: process.env.MEMORY_ENABLE_GC !== 'false',
  enableSnapshots: process.env.MEMORY_ENABLE_SNAPSHOTS === 'true',
  logLevel: process.env.MEMORY_LOG_LEVEL || 'warn', // 'debug', 'info', 'warn', 'error'
  reportPath: process.env.MEMORY_REPORT_PATH || './memory-reports',
  gcIterations: parseInt(process.env.MEMORY_GC_ITERATIONS || '3', 10)
};

/**
 * Log memory-related messages based on configured log level
 */
function logMemory(level, message, data = null) {
  const levels = ['debug', 'info', 'warn', 'error'];
  const configLevel = levels.indexOf(CONFIG.logLevel);
  const messageLevel = levels.indexOf(level);
  
  if (messageLevel >= configLevel) {
    const prefix = `[MEMORY-${level.toUpperCase()}]`;
    if (data) {
      console[level === 'error' ? 'error' : 'log'](prefix, message, data);
    } else {
      console[level === 'error' ? 'error' : 'log'](prefix, message);
    }
  }
}

/**
 * Force garbage collection if available
 */
function forceGarbageCollection() {
  if (CONFIG.enableGC && global.gc) {
    try {
      for (let i = 0; i < CONFIG.gcIterations; i++) {
        global.gc();
      }
      logMemory('debug', 'Garbage collection completed');
      return true;
    } catch (error) {
      logMemory('warn', 'Garbage collection failed:', error.message);
    }
  } else if (CONFIG.enableGC) {
    logMemory('warn', 'Garbage collection requested but not available. Run with --expose-gc flag.');
  }
  return false;
}

/**
 * Capture memory usage and return formatted data
 */
function captureMemory(label) {
  const usage = process.memoryUsage();
  return {
    label,
    timestamp: Date.now(),
    raw: usage,
    formatted: {
      heapUsedMB: (usage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (usage.heapTotal / 1024 / 1024).toFixed(2),
      externalMB: (usage.external / 1024 / 1024).toFixed(2),
      rssMB: (usage.rss / 1024 / 1024).toFixed(2),
      arrayBuffersMB: (usage.arrayBuffers / 1024 / 1024).toFixed(2)
    }
  };
}

/**
 * Calculate memory delta between two snapshots
 */
function calculateMemoryDelta(before, after) {
  if (!before || !after) return null;
  
  return {
    heapUsed: after.raw.heapUsed - before.raw.heapUsed,
    heapTotal: after.raw.heapTotal - before.raw.heapTotal,
    external: after.raw.external - before.raw.external,
    rss: after.raw.rss - before.raw.rss,
    arrayBuffers: after.raw.arrayBuffers - before.raw.arrayBuffers,
    formatted: {
      heapUsedMB: ((after.raw.heapUsed - before.raw.heapUsed) / 1024 / 1024).toFixed(2),
      externalMB: ((after.raw.external - before.raw.external) / 1024 / 1024).toFixed(2),
      rssMB: ((after.raw.rss - before.raw.rss) / 1024 / 1024).toFixed(2)
    }
  };
}

/**
 * Check if memory usage exceeds thresholds
 */
function checkMemoryThresholds(snapshot, delta = null) {
  const warnings = [];
  
  // Check absolute thresholds
  if (snapshot.raw.heapUsed > MEMORY_THRESHOLDS.heapUsed) {
    warnings.push({
      type: 'HEAP_THRESHOLD_EXCEEDED',
      value: snapshot.formatted.heapUsedMB + 'MB',
      threshold: (MEMORY_THRESHOLDS.heapUsed / 1024 / 1024).toFixed(0) + 'MB'
    });
  }
  
  if (snapshot.raw.rss > MEMORY_THRESHOLDS.rss) {
    warnings.push({
      type: 'RSS_THRESHOLD_EXCEEDED',
      value: snapshot.formatted.rssMB + 'MB',
      threshold: (MEMORY_THRESHOLDS.rss / 1024 / 1024).toFixed(0) + 'MB'
    });
  }
  
  if (snapshot.raw.external > MEMORY_THRESHOLDS.external) {
    warnings.push({
      type: 'EXTERNAL_THRESHOLD_EXCEEDED',
      value: snapshot.formatted.externalMB + 'MB',
      threshold: (MEMORY_THRESHOLDS.external / 1024 / 1024).toFixed(0) + 'MB'
    });
  }
  
  // Check delta thresholds (per-test growth)
  if (delta && Math.abs(delta.heapUsed) > MEMORY_THRESHOLDS.testWarningThreshold) {
    warnings.push({
      type: 'TEST_MEMORY_GROWTH',
      value: delta.formatted.heapUsedMB + 'MB',
      threshold: (MEMORY_THRESHOLDS.testWarningThreshold / 1024 / 1024).toFixed(0) + 'MB'
    });
  }
  
  return warnings;
}

/**
 * Get current test name from Vitest context
 */
function getCurrentTestName() {
  try {
    // Try to get test name from Vitest context
    if (globalThis.__vitest_worker__ && globalThis.__vitest_worker__.current) {
      const current = globalThis.__vitest_worker__.current;
      if (current.suite && current.task) {
        return `${current.suite.name} > ${current.task.name}`;
      }
    }
    
    // Fallback to stored current test name
    return currentTestName || 'unknown-test';
  } catch (error) {
    logMemory('debug', 'Failed to get current test name:', error.message);
    return currentTestName || 'unknown-test';
  }
}

// Initialize memory profiler before all tests
beforeAll(() => {
  if (process.env.MEMORY_PROFILE === 'true') {
    logMemory('info', 'Initializing memory profiler with configuration:', {
      thresholds: MEMORY_THRESHOLDS,
      config: CONFIG
    });
    
    // Initialize the memory profiler
    memoryProfiler = new MemoryProfiler({
      maxHeapUsed: MEMORY_THRESHOLDS.heapUsed,
      maxExternal: MEMORY_THRESHOLDS.external,
      maxRss: MEMORY_THRESHOLDS.rss,
      leakGrowthRate: MEMORY_THRESHOLDS.leakGrowthRate,
      enableSnapshots: CONFIG.enableSnapshots,
      snapshotDir: `${CONFIG.reportPath}/snapshots`
    });
    
    // Capture baseline after garbage collection
    forceGarbageCollection();
    memoryProfiler.captureBaseline();
    
    logMemory('info', 'Memory profiler initialized successfully');
  } else {
    logMemory('info', 'Memory profiler disabled (MEMORY_PROFILE not set to true)');
  }
});

// Track memory before each test
beforeEach(() => {
  if (process.env.MEMORY_PROFILE === 'true' && memoryProfiler) {
    // Force garbage collection before test
    forceGarbageCollection();
    
    // Get current test name
    currentTestName = getCurrentTestName();
    
    // Capture memory snapshot before test
    testStartMemory = captureMemory(`before-${currentTestName}`);
    
    logMemory('debug', `Memory snapshot before test "${currentTestName}":`, {
      heap: testStartMemory.formatted.heapUsedMB + 'MB',
      rss: testStartMemory.formatted.rssMB + 'MB'
    });
    
    // Store snapshot
    memorySnapshots.push({
      testName: currentTestName,
      phase: 'before',
      memory: testStartMemory,
      timestamp: Date.now()
    });
  }
});

// Track memory after each test and analyze for leaks
afterEach(async () => {
  if (process.env.MEMORY_PROFILE === 'true' && memoryProfiler) {
    // Clear any test-specific cleanup
    try {
      // Clear DOM if available
      if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
        // Clear any event listeners by cloning and replacing body
        const newBody = document.body.cloneNode(false);
        if (document.body.parentNode) {
          document.body.parentNode.replaceChild(newBody, document.body);
        }
      }
      
      // Clear any timers
      if (typeof vi !== 'undefined' && vi.clearAllTimers) {
        vi.clearAllTimers();
      }
      
      // Clear mocks
      if (typeof vi !== 'undefined' && vi.clearAllMocks) {
        vi.clearAllMocks();
      }
    } catch (error) {
      logMemory('warn', 'Error during test cleanup:', error.message);
    }
    
    // Force garbage collection after cleanup
    forceGarbageCollection();
    
    // Capture memory snapshot after test
    const testEndMemory = captureMemory(`after-${currentTestName}`);
    const memoryDelta = calculateMemoryDelta(testStartMemory, testEndMemory);
    
    // Check for memory issues
    const warnings = checkMemoryThresholds(testEndMemory, memoryDelta);
    
    // Log memory usage for this test
    if (memoryDelta) {
      const growthMB = parseFloat(memoryDelta.formatted.heapUsedMB);
      const logLevel = warnings.length > 0 ? 'warn' : (Math.abs(growthMB) > 10 ? 'info' : 'debug');
      
      logMemory(logLevel, `Memory usage for test "${currentTestName}":`, {
        before: testStartMemory.formatted.heapUsedMB + 'MB',
        after: testEndMemory.formatted.heapUsedMB + 'MB',
        delta: memoryDelta.formatted.heapUsedMB + 'MB',
        warnings: warnings.length
      });
      
      // Log warnings
      if (warnings.length > 0) {
        logMemory('warn', `Memory warnings for test "${currentTestName}":`, warnings);
      }
    }
    
    // Store snapshot and profiler sample
    memorySnapshots.push({
      testName: currentTestName,
      phase: 'after',
      memory: testEndMemory,
      delta: memoryDelta,
      warnings,
      timestamp: Date.now()
    });
    
    // Add sample to memory profiler for comprehensive analysis
    const profilerSample = memoryProfiler.captureSample(currentTestName);
    const leakIssues = await memoryProfiler.detectLeak(profilerSample);
    
    // Log any detected leaks
    if (leakIssues.length > 0) {
      logMemory('error', `Memory leaks detected in test "${currentTestName}":`, leakIssues);
    }
    
    // Reset current test tracking
    currentTestName = '';
    testStartMemory = null;
  }
});

// Generate memory report after all tests
afterAll(async () => {
  if (process.env.MEMORY_PROFILE === 'true' && memoryProfiler) {
    try {
      logMemory('info', 'Generating memory analysis report...');
      
      // Generate comprehensive report from memory profiler
      const profilerReport = await memoryProfiler.generateReport();
      
      // Enhance report with our snapshot data
      const enhancedReport = {
        ...profilerReport,
        testSnapshots: memorySnapshots,
        configuration: {
          thresholds: MEMORY_THRESHOLDS,
          config: CONFIG
        },
        summary: {
          ...profilerReport.summary,
          totalSnapshots: memorySnapshots.length,
          testsWithWarnings: memorySnapshots.filter(s => s.warnings && s.warnings.length > 0).length,
          averageTestGrowth: memorySnapshots
            .filter(s => s.phase === 'after' && s.delta)
            .reduce((sum, s) => sum + s.delta.heapUsed, 0) / 
            memorySnapshots.filter(s => s.phase === 'after' && s.delta).length || 0
        }
      };
      
      // Write detailed memory report
      const fs = await import('fs');
      const path = await import('path');
      
      // Ensure report directory exists
      const reportDir = CONFIG.reportPath;
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Write comprehensive report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, `vitest-memory-report-${timestamp}.json`);
      
      fs.writeFileSync(reportPath, JSON.stringify(enhancedReport, null, 2));
      
      // Write summary log
      const summaryPath = path.join(reportDir, `vitest-memory-summary-${timestamp}.txt`);
      const summaryLines = [
        `Memory Analysis Summary - ${new Date().toISOString()}`,
        `========================================`,
        `Total Tests Analyzed: ${profilerReport.summary.totalTests}`,
        `Tests with Memory Issues: ${profilerReport.summary.suspiciousTestsCount}`,
        `Tests with Warnings: ${enhancedReport.summary.testsWithWarnings}`,
        `Peak Heap Usage: ${profilerReport.summary.maxHeapUsedMB}MB`,
        `Average Heap Usage: ${profilerReport.summary.averageHeapUsedMB}MB`,
        `Snapshots Generated: ${profilerReport.summary.snapshotsGenerated}`,
        '',
        'Top Memory Consuming Tests:',
        ...profilerReport.summary.suspiciousTests.slice(0, 5).map((test, i) => 
          `${i + 1}. ${test.name}: ${test.memoryUsage.heapUsedMB}MB (${test.issues.map(issue => issue.type).join(', ')})`
        ),
        '',
        `Detailed report: ${reportPath}`
      ];
      
      fs.writeFileSync(summaryPath, summaryLines.join('\n'));
      
      // Log final summary
      logMemory('info', 'Memory analysis completed:', {
        totalTests: profilerReport.summary.totalTests,
        memoryIssues: profilerReport.summary.suspiciousTestsCount,
        warnings: enhancedReport.summary.testsWithWarnings,
        peakMemory: profilerReport.summary.maxHeapUsedMB + 'MB',
        reportPath,
        summaryPath
      });
      
    } catch (error) {
      logMemory('error', 'Failed to generate memory report:', error);
    }
  }
});

// Export utilities for programmatic access
export const memoryInstrumentation = {
  getCurrentProfile: () => memoryProfiler,
  getSnapshots: () => [...memorySnapshots],
  getConfiguration: () => ({ ...MEMORY_THRESHOLDS, ...CONFIG }),
  captureMemory,
  forceGarbageCollection
};