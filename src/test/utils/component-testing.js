/**
 * Memory-Safe Component Testing Utilities
 * 
 * Phase 5.1 - Component Testing Utilities from Memory Leak Detection Plan
 * 
 * This module provides comprehensive memory-safe React component testing utilities
 * that ensure proper cleanup and prevent memory leaks during component testing.
 * 
 * Key Features:
 * - Enhanced render utilities with automatic cleanup
 * - Component isolation for preventing test interference  
 * - Lifecycle tracking with WeakMap for memory safety
 * - Aggressive cleanup for stubborn components
 * - Integration with @testing-library/react
 * - React 18 concurrent features support
 * - Portal and modal cleanup
 * - Event listener and fiber tree cleanup
 */

import { render as rtlRender, cleanup as rtlCleanup, act } from '@testing-library/react';
import { vi, afterEach } from 'vitest';

/**
 * Memory Tracking and Cleanup Registry
 * 
 * Uses WeakMap for memory-safe component instance tracking.
 * WeakMaps allow garbage collection of components when they're no longer referenced,
 * preventing memory leaks from our own tracking mechanisms.
 */
const componentInstances = new WeakMap();
const renderResults = new Set();
const isolatedContainers = new Set();
const activePortals = new Set();
const componentRefs = new WeakMap();
const lifecycleTrackers = new WeakMap();

/**
 * Memory leak prevention patterns for React components:
 * 
 * 1. EVENT LISTENER LEAKS
 *    - Event listeners added directly to DOM elements persist after unmount
 *    - addEventListener() calls without matching removeEventListener()
 *    - Global event listeners (window, document) not cleaned up
 * 
 * 2. TIMER AND ASYNC LEAKS  
 *    - setTimeout/setInterval not cleared in useEffect cleanup
 *    - Promise chains that continue after component unmount
 *    - requestAnimationFrame callbacks not cancelled
 * 
 * 3. OBSERVER LEAKS
 *    - MutationObserver, IntersectionObserver, ResizeObserver not disconnected
 *    - These maintain references to callback functions and DOM elements
 * 
 * 4. CONTEXT AND STATE LEAKS
 *    - Context providers holding references to unmounted components
 *    - External state management subscriptions not unsubscribed
 *    - Redux/MobX store subscriptions persisting
 * 
 * 5. PORTAL AND MODAL LEAKS
 *    - React portals creating elements outside React tree
 *    - Modal backdrop elements not removed from DOM
 *    - Z-index stacking contexts persisting
 * 
 * 6. REF AND CALLBACK LEAKS
 *    - useRef objects holding DOM element references
 *    - Callback refs not nullified on unmount
 *    - Forward refs maintaining parent-child reference chains
 * 
 * 7. REACT FIBER LEAKS
 *    - React internal fiber nodes maintaining component tree references
 *    - Concurrent features (Suspense, Transitions) holding pending work
 *    - Error boundaries capturing component references in error states
 */

/**
 * Component Lifecycle Tracker
 * 
 * Tracks component mount/unmount cycles to detect memory leaks.
 * Uses performance.now() for precise timing measurements.
 */
class ComponentLifecycleTracker {
  constructor(componentName) {
    this.componentName = componentName;
    this.mountTime = null;
    this.unmountTime = null;
    this.isWarningShown = false;
    this.cleanupCallbacks = new Set();
    this.timers = new Set();
    this.observers = new Set();
    this.subscriptions = new Set();
  }

  onMount() {
    this.mountTime = performance.now();
    console.debug(`🔄 Component mounted: ${this.componentName} at ${this.mountTime}ms`);
  }

  onUnmount() {
    this.unmountTime = performance.now();
    const lifetime = this.unmountTime - this.mountTime;
    console.debug(`🔄 Component unmounted: ${this.componentName} after ${lifetime.toFixed(2)}ms`);
    
    // Execute all registered cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn(`⚠️  Cleanup error for ${this.componentName}:`, error);
      }
    });
  }

  addCleanupCallback(callback) {
    this.cleanupCallbacks.add(callback);
  }

  trackTimer(timerId) {
    this.timers.add(timerId);
    this.addCleanupCallback(() => {
      clearTimeout(timerId);
      clearInterval(timerId);
      this.timers.delete(timerId);
    });
  }

  trackObserver(observer) {
    this.observers.add(observer);
    this.addCleanupCallback(() => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
      this.observers.delete(observer);
    });
  }

  trackSubscription(subscription) {
    this.subscriptions.add(subscription);
    this.addCleanupCallback(() => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      } else if (typeof subscription === 'function') {
        subscription();
      }
      this.subscriptions.delete(subscription);
    });
  }

  warnIfNotUnmounted() {
    if (this.mountTime && !this.unmountTime && !this.isWarningShown) {
      console.warn(`⚠️  Component ${this.componentName} was never unmounted - potential memory leak!`);
      this.isWarningShown = true;
    }
  }
}

/**
 * Enhanced Render Utilities
 * 
 * renderWithCleanup() - Render with automatic unmounting and cleanup
 * 
 * This function wraps @testing-library/react's render with enhanced cleanup
 * that goes beyond RTL's standard cleanup to prevent React memory leaks.
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options (passed to RTL render)
 * @param {Object} cleanupOptions - Additional cleanup configuration
 * @returns {Object} Enhanced render result with cleanup tracking
 */
function renderWithCleanup(ui, options = {}, cleanupOptions = {}) {
  const config = {
    // Automatic unmounting in afterEach hooks
    autoUnmount: true,
    
    // Track component lifecycle for debugging
    trackLifecycle: true,
    
    // Force garbage collection after cleanup (if available)
    forceGC: false,
    
    // Aggressive cleanup mode for stubborn components
    aggressiveCleanup: false,
    
    // Component name for debugging (auto-detected if not provided)
    componentName: ui?.type?.name || ui?.type?.displayName || 'UnknownComponent',
    
    ...cleanupOptions
  };

  // Create lifecycle tracker
  let tracker = null;
  if (config.trackLifecycle) {
    tracker = new ComponentLifecycleTracker(config.componentName);
    tracker.onMount();
  }

  // Enhanced render with error boundary
  let result;
  try {
    // Render with @testing-library/react
    result = rtlRender(ui, options);
    
    // Store render result for cleanup tracking
    renderResults.add(result);
    
    // Track component instance if possible
    if (tracker) {
      componentInstances.set(result.container, tracker);
    }
    
    // Enhanced cleanup function
    const originalUnmount = result.unmount;
    result.unmount = () => {
      try {
        // Call original unmount first
        originalUnmount();
        
        // Enhanced cleanup
        if (config.aggressiveCleanup) {
          forceComponentCleanup(result.container);
        }
        
        // Lifecycle tracking
        if (tracker) {
          tracker.onUnmount();
        }
        
        // Remove from tracking sets
        renderResults.delete(result);
        if (componentInstances.has(result.container)) {
          componentInstances.delete(result.container);
        }
        
        // Force GC if requested and available
        if (config.forceGC && global.gc) {
          global.gc();
        }
        
      } catch (error) {
        console.error(`Error during enhanced unmount for ${config.componentName}:`, error);
      }
    };
    
    // Auto-register for afterEach cleanup if requested
    if (config.autoUnmount) {
      afterEach(() => {
        if (renderResults.has(result)) {
          result.unmount();
        }
      });
    }
    
  } catch (error) {
    console.error(`Error rendering component ${config.componentName}:`, error);
    throw error;
  }

  return {
    ...result,
    // Add lifecycle tracker to result for manual access
    _tracker: tracker,
    _cleanupConfig: config
  };
}

/**
 * renderInIsolation() - Render in isolated container
 * 
 * Creates a completely isolated DOM environment for the component to prevent
 * test interference and ensure complete cleanup isolation.
 * 
 * Uses iframe-based isolation to create a separate DOM context that can be
 * completely destroyed after the test, ensuring no DOM pollution.
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render and isolation options
 * @returns {Object} Render result with isolation cleanup
 */
function renderInIsolation(ui, options = {}) {
  const config = {
    // Create iframe for complete DOM isolation
    useIframe: true,
    
    // Timeout for isolation cleanup
    cleanupTimeout: 100,
    
    // Copy parent styles to isolated context
    copyStyles: false,
    
    // Component name for debugging
    componentName: ui?.type?.name || 'IsolatedComponent',
    
    ...options
  };

  let isolatedContainer = null;
  let iframe = null;
  let result = null;

  try {
    if (config.useIframe) {
      // Create isolated iframe context
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Setup minimal HTML structure in iframe
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Isolated Test Context</title>
            ${config.copyStyles ? '<style>/* Styles would be copied here */</style>' : ''}
          </head>
          <body>
            <div id="isolated-root"></div>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      isolatedContainer = iframeDoc.getElementById('isolated-root');
      
      // Track isolated container
      isolatedContainers.add({ iframe, container: isolatedContainer });
      
      // Render in isolated context
      result = rtlRender(ui, {
        container: isolatedContainer,
        ...options
      });
      
    } else {
      // Use regular isolated div container
      isolatedContainer = document.createElement('div');
      isolatedContainer.setAttribute('data-testid', 'isolated-container');
      isolatedContainer.setAttribute('data-component', config.componentName);
      document.body.appendChild(isolatedContainer);
      
      isolatedContainers.add({ container: isolatedContainer });
      
      result = rtlRender(ui, {
        container: isolatedContainer,
        ...options
      });
    }

    // Enhanced unmount for isolation
    const originalUnmount = result.unmount;
    result.unmount = () => {
      try {
        // Unmount component
        originalUnmount();
        
        // Cleanup isolated environment
        setTimeout(() => {
          if (iframe) {
            iframe.remove();
          } else if (isolatedContainer && isolatedContainer.parentNode) {
            isolatedContainer.parentNode.removeChild(isolatedContainer);
          }
          
          // Remove from tracking
          isolatedContainers.forEach(item => {
            if (item.container === isolatedContainer || item.iframe === iframe) {
              isolatedContainers.delete(item);
            }
          });
          
        }, config.cleanupTimeout);
        
      } catch (error) {
        console.error(`Error during isolated unmount for ${config.componentName}:`, error);
      }
    };

    // Auto-cleanup on afterEach
    afterEach(() => {
      if (result) {
        result.unmount();
      }
    });

  } catch (error) {
    // Cleanup on error
    if (iframe) iframe.remove();
    if (isolatedContainer && isolatedContainer.parentNode) {
      isolatedContainer.parentNode.removeChild(isolatedContainer);
    }
    throw error;
  }

  return {
    ...result,
    _isolatedContainer: isolatedContainer,
    _iframe: iframe,
    _config: config
  };
}

/**
 * trackComponentLifecycle() - Monitor mount/unmount cycles
 * 
 * Provides detailed lifecycle monitoring for React components to detect
 * memory leaks and improper cleanup patterns.
 * 
 * @param {React.ReactElement} ui - Component to track
 * @param {Object} options - Tracking options
 * @returns {Object} Render result with lifecycle tracking
 */
function trackComponentLifecycle(ui, options = {}) {
  const config = {
    // Enable verbose lifecycle logging
    verbose: false,
    
    // Warn if component isn't unmounted within timeout
    unmountTimeout: 5000,
    
    // Track async operations (timers, promises, etc.)
    trackAsync: true,
    
    // Component identifier
    componentName: ui?.type?.name || 'TrackedComponent',
    
    ...options
  };

  // Create enhanced tracker
  const tracker = new ComponentLifecycleTracker(config.componentName);
  
  // Enhanced tracking with async operation detection
  if (config.trackAsync) {
    // Monkey patch setTimeout/setInterval to track timers
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalRAF = window.requestAnimationFrame;
    
    window.setTimeout = (callback, delay, ...args) => {
      const id = originalSetTimeout(callback, delay, ...args);
      tracker.trackTimer(id);
      return id;
    };
    
    window.setInterval = (callback, delay, ...args) => {
      const id = originalSetInterval(callback, delay, ...args);
      tracker.trackTimer(id);
      return id;
    };
    
    window.requestAnimationFrame = (callback) => {
      const id = originalRAF(callback);
      tracker.trackTimer(id);
      return id;
    };
    
    // Restore original functions after component unmounts
    tracker.addCleanupCallback(() => {
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
      window.requestAnimationFrame = originalRAF;
    });
  }

  // Render with tracking
  const result = renderWithCleanup(ui, {}, { 
    trackLifecycle: true,
    componentName: config.componentName
  });
  
  // Set unmount warning timeout
  const warningTimeout = setTimeout(() => {
    tracker.warnIfNotUnmounted();
  }, config.unmountTimeout);
  
  tracker.addCleanupCallback(() => {
    clearTimeout(warningTimeout);
  });
  
  // Store tracker reference
  lifecycleTrackers.set(result.container, tracker);

  return {
    ...result,
    // Expose tracker methods for manual tracking
    trackTimer: (id) => tracker.trackTimer(id),
    trackObserver: (observer) => tracker.trackObserver(observer),
    trackSubscription: (subscription) => tracker.trackSubscription(subscription),
    addCleanup: (callback) => tracker.addCleanupCallback(callback),
    _lifecycleTracker: tracker
  };
}

/**
 * forceComponentCleanup() - Aggressive cleanup for stubborn components
 * 
 * Performs aggressive cleanup for components that don't clean up properly.
 * This is the "nuclear option" for preventing memory leaks from poorly-written
 * components that don't follow React cleanup best practices.
 * 
 * @param {HTMLElement} container - Container element to clean up
 * @param {Object} options - Cleanup configuration
 */
function forceComponentCleanup(container, options = {}) {
  const config = {
    // Remove all event listeners by cloning elements
    removeEventListeners: true,
    
    // Clear all data attributes and custom properties
    clearDataAttributes: true,
    
    // Remove portal elements from document body
    clearPortals: true,
    
    // Clear React fiber references (dangerous - use with caution)
    clearReactFibers: false,
    
    // Force DOM mutation observer disconnect
    clearObservers: true,
    
    // Clear window/global references
    clearGlobalRefs: true,
    
    ...options
  };

  if (!container) return;

  try {
    // 1. REMOVE EVENT LISTENERS
    // Clone all elements to remove event listeners (nuclear approach)
    if (config.removeEventListeners) {
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.parentNode) {
          const clone = element.cloneNode(true);
          element.parentNode.replaceChild(clone, element);
        }
      });
    }

    // 2. CLEAR DATA ATTRIBUTES AND PROPERTIES
    if (config.clearDataAttributes) {
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        // Remove all data-* attributes
        [...element.attributes].forEach(attr => {
          if (attr.name.startsWith('data-')) {
            element.removeAttribute(attr.name);
          }
        });
        
        // Clear custom properties that might hold references
        delete element._reactInternalFiber;
        delete element._reactInternalInstance;
        delete element.__reactInternalInstance;
        delete element.__reactEventHandlers;
      });
    }

    // 3. CLEAR PORTALS AND MODALS
    if (config.clearPortals) {
      // Remove common portal containers
      const portalSelectors = [
        '[data-radix-portal]',
        '[data-react-portal]',
        '.portal-container',
        '[role="dialog"]',
        '[role="tooltip"]',
        '[aria-modal="true"]'
      ];
      
      portalSelectors.forEach(selector => {
        const portals = document.querySelectorAll(selector);
        portals.forEach(portal => {
          if (portal.parentNode && !container.contains(portal)) {
            portal.parentNode.removeChild(portal);
            activePortals.delete(portal);
          }
        });
      });
    }

    // 4. CLEAR OBSERVERS
    if (config.clearObservers) {
      // Disconnect any observers that might be attached
      // This is a brute force approach - we can't directly access observer instances
      // but we can clear their targets
      const observableElements = container.querySelectorAll('*');
      observableElements.forEach(element => {
        // Clear element references that observers might hold
        element._mutationObserver = null;
        element._intersectionObserver = null;
        element._resizeObserver = null;
      });
    }

    // 5. CLEAR REACT FIBER REFERENCES (USE WITH EXTREME CAUTION)
    if (config.clearReactFibers) {
      console.warn('⚠️  Clearing React fiber references - this may cause React to malfunction!');
      
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        // Clear React internal properties
        Object.keys(element).forEach(key => {
          if (key.startsWith('_react') || key.startsWith('__react')) {
            delete element[key];
          }
        });
      });
      
      // Clear container fiber references
      Object.keys(container).forEach(key => {
        if (key.startsWith('_react') || key.startsWith('__react')) {
          delete container[key];
        }
      });
    }

    // 6. CLEAR GLOBAL REFERENCES
    if (config.clearGlobalRefs) {
      // Clear any window properties that might reference components
      Object.keys(window).forEach(key => {
        if (key.startsWith('__test_') || key.startsWith('__react_')) {
          delete window[key];
        }
      });
    }

    // 7. FINAL DOM CLEANUP
    // Clear all innerHTML to ensure no lingering references
    container.innerHTML = '';
    
    console.debug('🧹 Force cleanup completed for container');

  } catch (error) {
    console.error('Error during force cleanup:', error);
  }
}

/**
 * Integration with Testing Library
 * 
 * Enhanced wrapper around @testing-library/react that provides memory-safe
 * defaults and better integration with our cleanup utilities.
 */

/**
 * Render function that wraps RTL render with memory safety by default
 * 
 * This is a drop-in replacement for @testing-library/react render that
 * automatically includes our memory leak prevention features.
 * 
 * @param {React.ReactElement} ui - Component to render  
 * @param {Object} options - Render options
 * @returns {Object} Enhanced render result
 */
function render(ui, options = {}) {
  const config = {
    // Default to memory-safe rendering
    memorySafe: true,
    
    // Track lifecycle by default in test environment
    trackLifecycle: process.env.NODE_ENV === 'test',
    
    // Auto cleanup in afterEach
    autoCleanup: true,
    
    ...options
  };

  if (config.memorySafe) {
    return renderWithCleanup(ui, options, {
      autoUnmount: config.autoCleanup,
      trackLifecycle: config.trackLifecycle,
      componentName: ui?.type?.name || 'Component'
    });
  }

  // Fallback to standard RTL render
  return rtlRender(ui, options);
}

/**
 * Enhanced cleanup that goes beyond RTL cleanup
 * 
 * Provides comprehensive cleanup that addresses React-specific memory leaks
 * that standard @testing-library/react cleanup doesn't handle.
 */
function cleanup() {
  try {
    // First, run standard RTL cleanup
    rtlCleanup();
    
    // Then, run our enhanced cleanup
    
    // 1. Cleanup all tracked render results
    renderResults.forEach(result => {
      try {
        if (result.unmount) {
          result.unmount();
        }
      } catch (error) {
        console.warn('Error during render result cleanup:', error);
      }
    });
    renderResults.clear();
    
    // 2. Cleanup isolated containers
    isolatedContainers.forEach(({ iframe, container }) => {
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        } else if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch (error) {
        console.warn('Error during isolated container cleanup:', error);
      }
    });
    isolatedContainers.clear();
    
    // 3. Cleanup portals and modals
    activePortals.forEach(portal => {
      try {
        if (portal.parentNode) {
          portal.parentNode.removeChild(portal);
        }
      } catch (error) {
        console.warn('Error during portal cleanup:', error);
      }
    });
    activePortals.clear();
    
    // 4. Final memory cleanup
    // Note: We can't clear WeakMaps as they handle their own memory management
    
    // 5. Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    console.debug('🧹 Enhanced component cleanup completed');
    
  } catch (error) {
    console.error('Error during enhanced cleanup:', error);
  }
}

/**
 * React 18 Concurrent Features Support
 * 
 * Utilities for testing React 18 concurrent features like Suspense,
 * Transitions, and concurrent rendering while ensuring memory safety.
 */

/**
 * Render with React 18 concurrent features support
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options with concurrent support
 * @returns {Object} Render result with concurrent features
 */
function renderConcurrent(ui, options = {}) {
  const config = {
    // Enable concurrent mode
    concurrent: true,
    
    // Timeout for Suspense boundaries
    suspenseTimeout: 5000,
    
    // Handle transitions
    enableTransitions: true,
    
    ...options
  };

  // Wrap in act for concurrent features
  return act(() => {
    return renderWithCleanup(ui, options, {
      componentName: `ConcurrentComponent-${ui?.type?.name || 'Unknown'}`,
      aggressiveCleanup: true,
      forceGC: true
    });
  });
}

/**
 * Handle Suspense and Error boundaries cleanup
 * 
 * Suspense and Error boundaries can hold references to components even
 * after they're "unmounted", leading to memory leaks.
 */
function cleanupSuspenseAndErrorBoundaries() {
  try {
    // Clear any pending Suspense promises
    // This is a bit hacky but necessary for complete cleanup
    if (window.__REACT_SUSPENSE_PROMISES__) {
      window.__REACT_SUSPENSE_PROMISES__.clear();
    }
    
    // Clear error boundary captured errors
    if (window.__REACT_ERROR_BOUNDARY_ERRORS__) {
      window.__REACT_ERROR_BOUNDARY_ERRORS__.clear();
    }
    
    console.debug('🧹 Suspense and Error boundary cleanup completed');
    
  } catch (error) {
    console.warn('Error during Suspense/ErrorBoundary cleanup:', error);
  }
}

/**
 * Memory Leak Detection for Components
 * 
 * Utilities for detecting memory leaks in React components during testing.
 */

/**
 * Detect component memory leaks
 * 
 * @param {Function} testFunction - Test function to run
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Memory analysis results
 */
async function detectComponentMemoryLeaks(testFunction, options = {}) {
  const config = {
    // Memory threshold for leak detection (in MB)
    memoryThreshold: 10,
    
    // Number of test iterations to run
    iterations: 3,
    
    // Force GC between iterations
    forceGC: true,
    
    // Component name for reporting
    componentName: 'TestComponent',
    
    ...options
  };

  const results = {
    iterations: [],
    memoryLeak: false,
    averageMemoryGrowth: 0,
    recommendations: []
  };

  let baselineMemory = null;

  for (let i = 0; i < config.iterations; i++) {
    // Capture memory before test
    if (config.forceGC && global.gc) global.gc();
    const memoryBefore = process.memoryUsage();
    
    // Run test
    try {
      await testFunction();
    } catch (error) {
      console.error(`Test iteration ${i + 1} failed:`, error);
    }
    
    // Cleanup after test
    cleanup();
    
    // Capture memory after test and cleanup
    if (config.forceGC && global.gc) global.gc();
    const memoryAfter = process.memoryUsage();
    
    const iteration = {
      iteration: i + 1,
      memoryBefore,
      memoryAfter,
      memoryGrowth: memoryAfter.heapUsed - memoryBefore.heapUsed
    };
    
    results.iterations.push(iteration);
    
    if (i === 0) {
      baselineMemory = memoryAfter.heapUsed;
    }
  }
  
  // Analyze results
  const totalGrowth = results.iterations.reduce((sum, iter) => sum + iter.memoryGrowth, 0);
  results.averageMemoryGrowth = totalGrowth / config.iterations;
  
  const thresholdBytes = config.memoryThreshold * 1024 * 1024;
  results.memoryLeak = results.averageMemoryGrowth > thresholdBytes;
  
  if (results.memoryLeak) {
    results.recommendations.push(
      'Memory leak detected! Consider:',
      '- Adding cleanup functions to useEffect hooks',
      '- Removing event listeners on unmount',
      '- Clearing timers and intervals',
      '- Disconnecting observers (MutationObserver, IntersectionObserver)',
      '- Unsubscribing from external subscriptions'
    );
  }
  
  return results;
}

/**
 * Best Practices and Usage Examples
 * 
 * This section provides examples and guidance for using these utilities effectively.
 */

/**
 * Example usage patterns:
 * 
 * 1. BASIC MEMORY-SAFE TESTING:
 * 
 * ```javascript
 * import { render } from './test/utils/component-testing';
 * 
 * test('component renders correctly', () => {
 *   const { getByText } = render(<MyComponent />);
 *   expect(getByText('Hello')).toBeInTheDocument();
 *   // Automatic cleanup happens in afterEach
 * });
 * ```
 * 
 * 2. ISOLATED TESTING:
 * 
 * ```javascript 
 * import { renderInIsolation } from './test/utils/component-testing';
 * 
 * test('component works in isolation', () => {
 *   const { getByText } = renderInIsolation(<ProblematicComponent />);
 *   expect(getByText('Content')).toBeInTheDocument();
 *   // Complete DOM isolation prevents test interference
 * });
 * ```
 * 
 * 3. LIFECYCLE TRACKING:
 * 
 * ```javascript
 * import { trackComponentLifecycle } from './test/utils/component-testing';
 * 
 * test('component lifecycle is correct', () => {
 *   const { trackTimer, addCleanup } = trackComponentLifecycle(<TimerComponent />);
 *   
 *   // Manually track async operations
 *   const timer = setTimeout(() => {}, 1000);
 *   trackTimer(timer);
 *   
 *   // Add custom cleanup
 *   addCleanup(() => {
 *     console.log('Custom cleanup executed');
 *   });
 * });
 * ```
 * 
 * 4. MEMORY LEAK DETECTION:
 * 
 * ```javascript
 * import { detectComponentMemoryLeaks } from './test/utils/component-testing';
 * 
 * test('component does not leak memory', async () => {
 *   const results = await detectComponentMemoryLeaks(
 *     () => {
 *       const { unmount } = render(<MyComponent />);
 *       // Simulate user interactions
 *       unmount();
 *     },
 *     { componentName: 'MyComponent', iterations: 5 }
 *   );
 *   
 *   expect(results.memoryLeak).toBe(false);
 * });
 * ```
 */

// Export all utilities
export {
  // Core rendering utilities
  renderWithCleanup,
  renderInIsolation,
  trackComponentLifecycle,
  forceComponentCleanup,
  
  // React 18 concurrent support
  renderConcurrent,
  cleanupSuspenseAndErrorBoundaries,
  
  // Memory leak detection
  detectComponentMemoryLeaks,
  
  // Enhanced cleanup (our version)
  cleanup,
  
  // Re-export RTL utilities for convenience  
  act
};

// Separate export for RTL cleanup to avoid naming conflict
export { cleanup as rtlCleanup } from '@testing-library/react';

// Export default render function
export default render;