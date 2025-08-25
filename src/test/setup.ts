import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';
import { focusTestHelper } from './utils/focus-test-helper';

// Import comprehensive memory leak prevention utilities
import { 
  initializeCleanupTracking,
  performComprehensiveDOMCleanup 
} from './utils/cleanup.js';
import { 
  initializeTimerTracking,
  performComprehensiveTimerCleanup,
  getTimerStatistics 
} from './utils/timers.js';

// Phase 5.1 - Import memory-safe component testing utilities
import { 
  cleanup as enhancedCleanup,
  cleanupSuspenseAndErrorBoundaries 
} from './utils/component-testing.js';

// Memory profiling support
let memoryProfiler: any = null;
let testStartMemory: any = null;

// Initialize memory profiler if enabled
if (process.env.MEMORY_PROFILE === 'true') {
  try {
    const MemoryProfiler = require('../../scripts/memory-profiler.cjs');
    memoryProfiler = new MemoryProfiler({
      maxHeapUsed: 300 * 1024 * 1024, // 300MB threshold for individual tests
      enableSnapshots: true,
      snapshotDir: './memory-reports/snapshots'
    });
    console.log('📊 Memory profiling enabled for test run');
  } catch (error) {
    console.warn('⚠️  Memory profiler not available:', error.message);
  }
}


// Store cleanup function
let cleanupFocus: (() => void) | null = null;

// Enhanced mock implementations based on TASK_017a_REMEDIATION_PLAN.md
beforeEach(async () => {
  /**
   * PHASE 4.1 - Memory Leak Prevention Setup
   * 
   * Initialize comprehensive tracking systems to prevent memory leaks:
   * - DOM element tracking for complete cleanup
   * - Timer tracking for all async operations
   * - Memory profiling for leak detection
   * 
   * This prevents test isolation issues and accumulating memory usage
   */
  
  // Initialize memory leak prevention utilities
  // These must be called BEFORE any test code runs
  initializeCleanupTracking();
  initializeTimerTracking();
  
  // Memory profiling: capture baseline before each test
  if (memoryProfiler && global.gc) {
    global.gc(); // Force garbage collection for clean baseline
    testStartMemory = process.memoryUsage();
    
    // Get current test name for memory tracking
    const currentTest = expect.getState().currentTestName || 'unknown-test';
    memoryProfiler.captureSample(`${currentTest}-start`);
  }
  
  // Setup enhanced focus mocks for each test
  cleanupFocus = focusTestHelper.setupFocusMocks();
  
  // Mock requestAnimationFrame and cancelAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => {
    return setTimeout(cb, 0) as any;
  });
  global.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
  });
  
  // Mock performance.now for timing tests
  global.performance = global.performance || {};
  global.performance.now = vi.fn(() => Date.now());
  
  // Enhanced HTMLElement focus implementation
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    if (prop === 'focus' && obj instanceof HTMLElement) {
      return originalDefineProperty(obj, prop, {
        ...descriptor,
        configurable: true,
        writable: true
      });
    }
    return originalDefineProperty(obj, prop, descriptor);
  };
  
  // Clear all other mocks
  vi.clearAllMocks();
});

// Global test cleanup
afterEach(() => {
  /**
   * PHASE 4.1 - Comprehensive Memory Leak Prevention Cleanup
   * 
   * This cleanup strategy prevents multiple types of memory leaks:
   * 
   * 1. Timer Leaks: Unresolved setTimeout/setInterval/requestAnimationFrame
   *    - These continue executing after tests end
   *    - Callback references prevent garbage collection
   *    - Can cause race conditions between tests
   * 
   * 2. DOM Element Leaks: Orphaned elements and event listeners
   *    - Elements created during tests persist in memory
   *    - Event listeners maintain references to test objects
   *    - React portals and modals are particularly problematic
   * 
   * 3. Observer Leaks: MutationObserver and IntersectionObserver instances
   *    - Continue watching for changes after test completion
   *    - Callback references prevent garbage collection
   * 
   * 4. Promise Leaks: Unresolved async operations
   *    - Pending fetch requests and async component loading
   *    - Promise chains holding references to test objects
   * 
   * The cleanup order is critical: timers first (may trigger DOM changes),
   * then DOM cleanup, then focus-specific cleanup, finally memory profiling.
   */
  
  // Get timer statistics before cleanup for debugging
  const timerStats = getTimerStatistics();
  if (timerStats.activeTimeouts > 0 || timerStats.activeIntervals > 0 || 
      timerStats.activeAnimationFrames > 0 || timerStats.activePendingPromises > 0) {
    const currentTest = expect.getState().currentTestName || 'unknown-test';
    console.warn(`🧹 Test "${currentTest}" left active async operations:`, timerStats);
  }
  
  // STEP 1: Comprehensive timer and async operation cleanup
  // Must happen first to prevent timers from creating new DOM elements
  performComprehensiveTimerCleanup();
  
  // STEP 2: Complete DOM cleanup including React portals and event listeners
  // Handles all DOM-related memory leaks including complex component libraries
  performComprehensiveDOMCleanup();
  
  // STEP 2.1: Phase 5.1 - Enhanced React component cleanup
  // Memory-safe component testing utilities cleanup
  enhancedCleanup();
  
  // STEP 2.2: Cleanup React 18 concurrent features
  // Suspense and Error boundaries can hold component references
  cleanupSuspenseAndErrorBoundaries();
  
  // STEP 3: Focus-specific cleanup (maintains backward compatibility)
  if (cleanupFocus) {
    cleanupFocus();
    cleanupFocus = null;
  }
  
  // STEP 4: Restore globals (maintains existing behavior)
  if (global.requestAnimationFrame && vi.isMockFunction(global.requestAnimationFrame)) {
    vi.restoreAllMocks();
  }
  
  // STEP 5: Memory profiling and final verification
  // This now works with much cleaner memory state due to comprehensive cleanup above
  if (memoryProfiler && testStartMemory) {
    try {
      if (global.gc) {
        global.gc(); // Force GC before measuring final memory
      }
      
      const testEndMemory = process.memoryUsage();
      const currentTest = expect.getState().currentTestName || 'unknown-test';
      
      const memorySample = memoryProfiler.captureSample(`${currentTest}-end`);
      const leaks = memoryProfiler.detectLeak(memorySample);
      
      // Log memory issues if detected
      if (leaks && leaks.length > 0) {
        console.warn(`⚠️  Memory issues detected in test "${currentTest}":`, leaks);
      }
      
      // The legacy DOM cleanup below is now redundant due to comprehensive cleanup above,
      // but keeping for backward compatibility and as a safety net
      if (typeof document !== 'undefined') {
        // Clear any remaining event listeners by replacing body
        const newBody = document.createElement('body');
        if (document.body && document.body.parentNode) {
          document.body.parentNode.replaceChild(newBody, document.body);
        }
        
        // Clear document fragments and temporary elements
        const tempElements = document.querySelectorAll('[data-testid]');
        tempElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      }
      
      // Reset for next test
      testStartMemory = null;
      
    } catch (error) {
      console.warn('[SETUP] Error during memory profiling cleanup:', error.message);
    }
  }
});

// Export memory profiler for test access
export { memoryProfiler };

// Export cleanup utilities for tests that need granular control
// Use these when you need to clean up specific resources during a test
// or when debugging memory leaks in specific test scenarios

// DOM cleanup utilities
export {
  performComprehensiveDOMCleanup,
  initializeCleanupTracking,
  trackElementForCleanup,
  trackPortalForCleanup
} from './utils/cleanup.js';

// Timer cleanup utilities  
export {
  performComprehensiveTimerCleanup,
  initializeTimerTracking,
  getTimerStatistics,
  trackMutationObserver,
  trackIntersectionObserver,
  trackPromise,
  createTrackedAbortController
} from './utils/timers.js';

// Phase 5.1 - Memory-safe component testing utilities
export {
  render,
  renderWithCleanup,
  renderInIsolation,
  trackComponentLifecycle,
  forceComponentCleanup,
  renderConcurrent,
  detectComponentMemoryLeaks,
  cleanup as enhancedCleanup,
  cleanupSuspenseAndErrorBoundaries
} from './utils/component-testing.js';