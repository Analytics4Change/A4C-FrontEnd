/**
 * Timer Management Utilities for Memory Leak Prevention
 * 
 * This module provides comprehensive timer cleanup functions to prevent memory leaks
 * from unresolved timers and async operations in test environments. Timer leaks can cause:
 * - Tests continuing to execute after completion
 * - Race conditions between tests
 * - Memory leaks from timer callbacks holding references
 * - Unpredictable test behavior due to delayed execution
 * - CI/CD timeouts from accumulated pending operations
 */

// Track all timers created during tests
let activeTimeouts = new Set();
let activeIntervals = new Set();
let activeAnimationFrames = new Set();
let activeMutationObservers = new Set();
let activeIntersectionObservers = new Set();
let activePendingPromises = new Set();

// Store original timer functions to restore after cleanup
let originalSetTimeout;
let originalClearTimeout;
let originalSetInterval;
let originalClearInterval;
let originalRequestAnimationFrame;
let originalCancelAnimationFrame;

/**
 * Initialize timer tracking
 * Call this before running tests to wrap native timer functions
 * 
 * Memory Leak Prevention:
 * - Wraps native timer functions to track all created timers
 * - Essential for detecting and cleaning up orphaned timers
 * - Prevents timers from previous tests affecting current tests
 * 
 * What happens if skipped:
 * - Cannot track timers created by test code
 * - Timers continue running after tests complete
 * - Memory leaks from timer callback references
 */
export function initializeTimerTracking() {
  // Store original functions if not already stored
  if (!originalSetTimeout) {
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;
    
    if (typeof global.requestAnimationFrame !== 'undefined') {
      originalRequestAnimationFrame = global.requestAnimationFrame;
      originalCancelAnimationFrame = global.cancelAnimationFrame;
    }
  }
  
  // Wrap setTimeout to track all timeouts
  global.setTimeout = function(callback, delay, ...args) {
    const timeoutId = originalSetTimeout.call(this, (...callbackArgs) => {
      // Remove from tracking when timeout executes
      activeTimeouts.delete(timeoutId);
      return callback.apply(this, callbackArgs);
    }, delay, ...args);
    
    // Track the timeout ID for cleanup
    activeTimeouts.add(timeoutId);
    return timeoutId;
  };
  
  // Wrap clearTimeout to remove from tracking
  global.clearTimeout = function(timeoutId) {
    activeTimeouts.delete(timeoutId);
    return originalClearTimeout.call(this, timeoutId);
  };
  
  // Wrap setInterval to track all intervals
  global.setInterval = function(callback, delay, ...args) {
    const intervalId = originalSetInterval.call(this, callback, delay, ...args);
    activeIntervals.add(intervalId);
    return intervalId;
  };
  
  // Wrap clearInterval to remove from tracking
  global.clearInterval = function(intervalId) {
    activeIntervals.delete(intervalId);
    return originalClearInterval.call(this, intervalId);
  };
  
  // Wrap requestAnimationFrame if available
  if (originalRequestAnimationFrame) {
    global.requestAnimationFrame = function(callback) {
      const frameId = originalRequestAnimationFrame.call(this, (...args) => {
        // Remove from tracking when frame executes
        activeAnimationFrames.delete(frameId);
        return callback.apply(this, args);
      });
      
      activeAnimationFrames.add(frameId);
      return frameId;
    };
  }
  
  if (originalCancelAnimationFrame) {
    global.cancelAnimationFrame = function(frameId) {
      activeAnimationFrames.delete(frameId);
      return originalCancelAnimationFrame.call(this, frameId);
    };
  }
}

/**
 * Clear all pending setTimeout calls
 * 
 * Memory Leak Prevention:
 * - Prevents setTimeout callbacks from executing after test completion
 * - Critical for async operations that might modify DOM or state
 * - Stops delayed assertions that could interfere with subsequent tests
 * 
 * What happens if skipped:
 * - setTimeout callbacks continue executing after test ends
 * - Callbacks may reference test objects preventing garbage collection
 * - Race conditions with subsequent tests
 * - Unexpected DOM modifications during unrelated tests
 */
export function clearAllTimeouts() {
  try {
    // Clear all tracked setTimeout calls
    activeTimeouts.forEach(timeoutId => {
      if (timeoutId !== null && timeoutId !== undefined) {
        originalClearTimeout(timeoutId);
      }
    });
    
    // Clear the tracking set
    activeTimeouts.clear();
    
    // Also clear any untracked timeouts by clearing a range of IDs
    // This catches timeouts created before tracking was initialized
    // Note: This is a brute-force approach but necessary for complete cleanup
    const maxTimeoutId = 10000; // Reasonable upper bound for timeout IDs
    for (let i = 1; i <= maxTimeoutId; i++) {
      try {
        originalClearTimeout(i);
      } catch (e) {
        // Ignore errors for non-existent timeouts
      }
    }
    
  } catch (error) {
    console.warn('Error during timeout cleanup:', error);
  }
}

/**
 * Clear all pending setInterval calls
 * 
 * Memory Leak Prevention:
 * - Prevents intervals from continuing to execute between tests
 * - Critical for polling operations, animations, and periodic updates
 * - Stops continuous execution that can consume CPU and memory
 * 
 * What happens if skipped:
 * - setInterval callbacks continue running indefinitely
 * - Accumulating intervals consume increasing CPU resources
 * - Memory leaks from interval callbacks holding references
 * - Interference with subsequent test timing
 */
export function clearAllIntervals() {
  try {
    // Clear all tracked setInterval calls
    activeIntervals.forEach(intervalId => {
      if (intervalId !== null && intervalId !== undefined) {
        originalClearInterval(intervalId);
      }
    });
    
    // Clear the tracking set
    activeIntervals.clear();
    
    // Clear any untracked intervals using brute-force approach
    const maxIntervalId = 10000; // Reasonable upper bound for interval IDs
    for (let i = 1; i <= maxIntervalId; i++) {
      try {
        originalClearInterval(i);
      } catch (e) {
        // Ignore errors for non-existent intervals
      }
    }
    
  } catch (error) {
    console.warn('Error during interval cleanup:', error);
  }
}

/**
 * Cancel all pending requestAnimationFrame calls
 * 
 * Memory Leak Prevention:
 * - Prevents animation frames from executing after test completion
 * - Critical for smooth animations and DOM update scheduling
 * - Stops visual updates that might interfere with subsequent tests
 * 
 * What happens if skipped:
 * - Animation frames continue executing after test ends
 * - Visual updates may modify DOM unexpectedly
 * - Performance degradation from accumulated frame callbacks
 * - Timing issues in animation-dependent tests
 */
export function cancelAllAnimationFrames() {
  try {
    if (originalCancelAnimationFrame) {
      // Cancel all tracked animation frames
      activeAnimationFrames.forEach(frameId => {
        if (frameId !== null && frameId !== undefined) {
          originalCancelAnimationFrame(frameId);
        }
      });
      
      // Clear the tracking set
      activeAnimationFrames.clear();
    }
    
  } catch (error) {
    console.warn('Error during animation frame cleanup:', error);
  }
}

/**
 * Handle Promise cleanup for async operations
 * 
 * Memory Leak Prevention:
 * - Tracks promises created during tests
 * - Prevents unresolved promises from holding references
 * - Critical for fetch requests, async component loading, etc.
 * 
 * What happens if skipped:
 * - Unresolved promises hold references to test objects
 * - Async operations continue after test completion
 * - Memory leaks from promise callback chains
 * - Unpredictable timing in subsequent tests
 */
export function cleanupPendingPromises() {
  try {
    // Cancel any tracked AbortController instances
    activePendingPromises.forEach(promise => {
      if (promise && typeof promise.abort === 'function') {
        try {
          promise.abort();
        } catch (e) {
          // Some promises might not support abortion
        }
      }
    });
    
    // Clear the tracking set
    activePendingPromises.clear();
    
    // Force garbage collection of promise references if available
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    // Clear any global promise references
    if (typeof global !== 'undefined') {
      delete global.__testPromises;
      delete global.__pendingRequests;
    }
    
  } catch (error) {
    console.warn('Error during promise cleanup:', error);
  }
}

/**
 * Reset fake timers if using vi.useFakeTimers()
 * 
 * Memory Leak Prevention:
 * - Ensures fake timers are properly reset between tests
 * - Prevents timer mocking from affecting subsequent tests
 * - Critical for tests that manipulate time
 * 
 * What happens if skipped:
 * - Fake timer state persists between tests
 * - Time-dependent assertions become unreliable
 * - Mock timer callbacks may execute at wrong times
 */
export function resetFakeTimers() {
  try {
    // Handle Vitest fake timers
    if (typeof vi !== 'undefined' && vi.useRealTimers) {
      vi.useRealTimers();
      vi.clearAllTimers?.();
    }
    
    // Handle Jest fake timers (for compatibility)
    if (typeof jest !== 'undefined' && jest.useRealTimers) {
      jest.useRealTimers();
      jest.clearAllTimers?.();
    }
    
    // Handle Sinon fake timers (for compatibility)
    if (typeof global !== 'undefined' && global.clock) {
      if (typeof global.clock.restore === 'function') {
        global.clock.restore();
      }
      delete global.clock;
    }
    
  } catch (error) {
    console.warn('Error during fake timer reset:', error);
  }
}

/**
 * Clean up MutationObserver instances
 * 
 * Memory Leak Prevention:
 * - MutationObservers continue watching DOM changes after test completion
 * - Observer callbacks can hold references preventing garbage collection
 * - Critical for components that watch for DOM mutations
 * 
 * What happens if skipped:
 * - Observers continue monitoring DOM changes
 * - Observer callbacks execute during unrelated tests
 * - Memory leaks from callback references
 * - Performance degradation from unnecessary observation
 */
export function cleanupObservers() {
  try {
    // Disconnect all tracked MutationObservers
    activeMutationObservers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    activeMutationObservers.clear();
    
    // Disconnect all tracked IntersectionObservers
    activeIntersectionObservers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    activeIntersectionObservers.clear();
    
    // Clear any global observer references
    if (typeof global !== 'undefined') {
      delete global.__testObservers;
    }
    
  } catch (error) {
    console.warn('Error during observer cleanup:', error);
  }
}

/**
 * Restore original timer functions
 * 
 * Memory Leak Prevention:
 * - Restores native timer functions after test completion
 * - Prevents wrapped functions from accumulating memory overhead
 * - Essential for proper test isolation
 */
export function restoreOriginalTimers() {
  try {
    if (originalSetTimeout) {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
      
      if (originalRequestAnimationFrame) {
        global.requestAnimationFrame = originalRequestAnimationFrame;
        global.cancelAnimationFrame = originalCancelAnimationFrame;
      }
    }
  } catch (error) {
    console.warn('Error during timer function restoration:', error);
  }
}

/**
 * Comprehensive timer cleanup function that runs all cleanup operations
 * 
 * This is the main function to call in test teardown
 * Runs all timer cleanup operations in the correct order
 */
export function performComprehensiveTimerCleanup() {
  // Reset fake timers first to avoid conflicts
  resetFakeTimers();
  
  // Clear all active timers
  clearAllTimeouts();
  clearAllIntervals();
  cancelAllAnimationFrames();
  
  // Clean up async operations
  cleanupPendingPromises();
  cleanupObservers();
  
  // Note: We don't restore original timers here as they should persist
  // across tests within the same test suite for tracking purposes
}

/**
 * Track a MutationObserver for cleanup
 * Use this in tests when you create MutationObserver instances
 */
export function trackMutationObserver(observer) {
  if (observer && typeof observer.disconnect === 'function') {
    activeMutationObservers.add(observer);
  }
  return observer;
}

/**
 * Track an IntersectionObserver for cleanup
 * Use this in tests when you create IntersectionObserver instances
 */
export function trackIntersectionObserver(observer) {
  if (observer && typeof observer.disconnect === 'function') {
    activeIntersectionObservers.add(observer);
  }
  return observer;
}

/**
 * Track a Promise for cleanup (if it supports abortion)
 * Use this in tests when you create cancelable promises or fetch requests
 */
export function trackPromise(promise) {
  if (promise && (typeof promise.abort === 'function' || promise.cancel)) {
    activePendingPromises.add(promise);
  }
  return promise;
}

/**
 * Create an AbortController and track it for cleanup
 * Use this for fetch requests and other cancelable operations
 */
export function createTrackedAbortController() {
  const controller = new AbortController();
  trackPromise(controller);
  return controller;
}

/**
 * Get statistics about currently active timers and async operations
 * Useful for debugging memory leaks in tests
 */
export function getTimerStatistics() {
  return {
    activeTimeouts: activeTimeouts.size,
    activeIntervals: activeIntervals.size,
    activeAnimationFrames: activeAnimationFrames.size,
    activeMutationObservers: activeMutationObservers.size,
    activeIntersectionObservers: activeIntersectionObservers.size,
    activePendingPromises: activePendingPromises.size
  };
}

/**
 * Force cleanup of specific timer types
 * Use these functions when you need granular control over cleanup
 */
export const specificCleanup = {
  timeouts: clearAllTimeouts,
  intervals: clearAllIntervals,
  animationFrames: cancelAllAnimationFrames,
  promises: cleanupPendingPromises,
  observers: cleanupObservers,
  fakeTimers: resetFakeTimers
};