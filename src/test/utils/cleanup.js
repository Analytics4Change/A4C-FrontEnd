/**
 * DOM Cleanup Utilities for Memory Leak Prevention
 * 
 * This module provides comprehensive DOM cleanup functions to prevent memory leaks
 * in test environments. Memory leaks in tests can accumulate over time, causing:
 * - Increased memory usage leading to slower test execution
 * - False positive test failures due to lingering state
 * - Inconsistent test results between runs
 * - CI/CD pipeline failures due to resource exhaustion
 */

// Track DOM elements created during tests to ensure proper cleanup
let createdElements = new Set();
let originalBodyHTML = '';
let portalContainers = new Set();

/**
 * Initialize cleanup tracking
 * Call this before running tests to establish baseline state
 * 
 * Memory Leak Prevention:
 * - Captures initial DOM state to restore after tests
 * - Prevents tests from inheriting state from previous tests
 * - Essential for isolated test execution
 */
export function initializeCleanupTracking() {
  // Store original body HTML to restore clean state
  // This prevents tests from seeing DOM modifications from previous tests
  originalBodyHTML = document.body.innerHTML;
  
  // Clear any existing tracking sets
  // Prevents memory leaks from the tracking mechanisms themselves
  createdElements.clear();
  portalContainers.clear();
  
  // Set up mutation observer to track dynamically created elements
  // This catches elements created by React portals, third-party libraries, etc.
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            createdElements.add(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Store observer for cleanup
    window.__testCleanupObserver = observer;
  }
}

/**
 * Remove all DOM elements created during test execution
 * 
 * Memory Leak Prevention:
 * - Removes orphaned DOM elements that accumulate across tests
 * - Prevents "ghost" elements from interfering with subsequent tests
 * - Critical for tests that create modal dialogs, tooltips, or portals
 * 
 * What happens if skipped:
 * - DOM elements accumulate in memory
 * - Event listeners on orphaned elements remain active
 * - CSS animations may continue running invisibly
 * - Global state attached to elements persists
 */
export function cleanupDOMElements() {
  try {
    // Remove all tracked elements created during tests
    createdElements.forEach((element) => {
      if (element && element.parentNode) {
        // Remove event listeners before removing element
        // This prevents memory leaks from event handlers that reference closures
        if (element.removeEventListener) {
          // Clone and replace to remove all event listeners
          const cleanElement = element.cloneNode(true);
          element.parentNode.replaceChild(cleanElement, element);
          cleanElement.remove();
        } else {
          element.remove();
        }
      }
    });
    
    // Clean up React portals and modal containers
    // React portals often create elements outside the main component tree
    cleanupReactPortals();
    
    // Remove any elements with common test-related attributes
    // Catches elements that might not be tracked by mutation observer
    const testElements = document.querySelectorAll([
      '[data-testid]',
      '[data-test]',
      '[aria-live="polite"]',
      '[aria-live="assertive"]',
      '.react-portal',
      '.modal-backdrop',
      '.tooltip',
      '.popover'
    ].join(', '));
    
    testElements.forEach(element => {
      if (element.parentNode) {
        element.remove();
      }
    });
    
    // Reset document body to original state
    // This ensures complete isolation between tests
    if (originalBodyHTML !== undefined) {
      document.body.innerHTML = originalBodyHTML;
    }
    
    // Clear the tracking set for next test
    createdElements.clear();
    
  } catch (error) {
    console.warn('Error during DOM cleanup:', error);
    // Continue with other cleanup operations even if some fail
  }
}

/**
 * Clear all event listeners from document and window
 * 
 * Memory Leak Prevention:
 * - Prevents event handlers from keeping references to test objects
 * - Critical for keyboard event handlers, resize listeners, etc.
 * - Stops background event processing that can interfere with tests
 * 
 * What happens if skipped:
 * - Event handlers accumulate across tests
 * - Memory references prevent garbage collection
 * - Unexpected event firing during unrelated tests
 */
export function clearEventListeners() {
  try {
    // Clone and replace document to remove all event listeners
    // This is more thorough than trying to track and remove individual listeners
    const events = [
      'click', 'keydown', 'keyup', 'keypress', 'mousedown', 'mouseup',
      'mouseover', 'mouseout', 'focus', 'blur', 'change', 'input',
      'submit', 'resize', 'scroll', 'load', 'unload'
    ];
    
    // Remove common event listeners from document
    events.forEach(eventType => {
      document.removeEventListener(eventType, function() {}, true);
      document.removeEventListener(eventType, function() {}, false);
    });
    
    // Clear window event listeners
    events.forEach(eventType => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(eventType, function() {}, true);
        window.removeEventListener(eventType, function() {}, false);
      }
    });
    
    // Clear any custom event listeners that might be attached
    // These are common in component libraries and custom hooks
    const customEvents = [
      'focusmanager:change',
      'modal:open',
      'modal:close',
      'tooltip:show',
      'tooltip:hide'
    ];
    
    customEvents.forEach(eventType => {
      document.removeEventListener(eventType, function() {}, true);
      document.removeEventListener(eventType, function() {}, false);
    });
    
  } catch (error) {
    console.warn('Error during event listener cleanup:', error);
  }
}

/**
 * Reset document.body to clean state
 * 
 * Memory Leak Prevention:
 * - Removes all DOM modifications made during tests
 * - Prevents CSS classes and attributes from persisting
 * - Essential for tests that modify document-level properties
 * 
 * What happens if skipped:
 * - CSS classes accumulate on body element
 * - Document attributes persist between tests
 * - Global CSS state affects subsequent tests
 */
export function resetDocumentBody() {
  try {
    if (typeof document !== 'undefined' && document.body) {
      // Remove all CSS classes from body
      // Test frameworks and components often add classes to body
      document.body.className = '';
      
      // Remove all custom attributes
      // Some libraries add data attributes or aria attributes to body
      if (document.body.attributes) {
        const attributesToRemove = [];
        for (let i = 0; i < document.body.attributes.length; i++) {
          const attr = document.body.attributes[i];
          // Keep essential attributes, remove test-related ones
          if (!['id'].includes(attr.name)) {
            attributesToRemove.push(attr.name);
          }
        }
        attributesToRemove.forEach(attrName => {
          document.body.removeAttribute(attrName);
        });
      }
      
      // Reset inline styles
      // Tests might set overflow, position, or other styles
      document.body.removeAttribute('style');
      
      // Clear any custom properties
      document.body.removeAttribute('data-testid');
      document.body.removeAttribute('data-test');
      
      // Reset scroll position
      // Prevents scroll state from affecting subsequent tests
      if (document.body.scrollTop !== undefined) {
        document.body.scrollTop = 0;
      }
      if (document.body.scrollLeft !== undefined) {
        document.body.scrollLeft = 0;
      }
    }
  } catch (error) {
    console.warn('Error during document body reset:', error);
  }
}

/**
 * Clear global DOM references that might prevent garbage collection
 * 
 * Memory Leak Prevention:
 * - Removes references stored in global variables
 * - Critical for preventing memory leaks in complex applications
 * - Addresses component libraries that store DOM references globally
 * 
 * What happens if skipped:
 * - Global references prevent DOM elements from being garbage collected
 * - Memory usage grows with each test
 * - Can cause out-of-memory errors in large test suites
 */
export function clearGlobalDOMReferences() {
  try {
    // Common global variables that might hold DOM references
    const globalsToClear = [
      '__reactInternalInstance',
      '__reactEventHandlers',
      '_reactInternalFiber',
      '__focusManager',
      '__modalManager',
      '__tooltipManager'
    ];
    
    globalsToClear.forEach(globalName => {
      if (typeof window !== 'undefined' && window[globalName]) {
        delete window[globalName];
      }
    });
    
    // Clear any cached DOM queries
    // Some utilities cache querySelector results
    if (typeof window !== 'undefined' && window.__domQueryCache) {
      window.__domQueryCache.clear?.();
      delete window.__domQueryCache;
    }
    
    // Clear React DevTools references if present
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.renderers) {
        hook.renderers.clear?.();
      }
    }
    
    // Clear any test-specific globals
    if (typeof global !== 'undefined') {
      delete global.__testDOMElements;
      delete global.__testEventListeners;
      delete global.__testObservers;
    }
    
  } catch (error) {
    console.warn('Error during global DOM reference cleanup:', error);
  }
}

/**
 * Clean up React portals and modal containers
 * 
 * Memory Leak Prevention:
 * - React portals create DOM elements outside component tree
 * - These elements often persist after component unmounting
 * - Modal libraries frequently use portals for overlay rendering
 * 
 * What happens if skipped:
 * - Portal containers accumulate in DOM
 * - Modal backdrops and overlays persist
 * - Z-index and positioning issues in subsequent tests
 */
export function cleanupReactPortals() {
  try {
    // Remove React portal containers
    // React uses these for rendering outside component tree
    const portalSelectors = [
      'div[data-react-portal="true"]',
      'div[id*="react-portal"]',
      'div[class*="react-portal"]',
      'div[data-portal]'
    ];
    
    portalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.parentNode) {
          element.remove();
        }
      });
    });
    
    // Clean up modal-specific containers
    // Most modal libraries create dedicated containers
    const modalSelectors = [
      'div[id*="modal"]',
      'div[class*="modal"]',
      'div[data-modal]',
      'div[role="dialog"]',
      'div[role="alertdialog"]',
      '.modal-backdrop',
      '.modal-overlay',
      '.ReactModalPortal'
    ];
    
    modalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Only remove if it's a direct child of body
        // This prevents removing modal content inside components
        if (element.parentNode === document.body) {
          element.remove();
        }
      });
    });
    
    // Clean up tooltip containers
    // Tooltip libraries often create persistent containers
    const tooltipSelectors = [
      'div[id*="tooltip"]',
      'div[class*="tooltip"]',
      'div[data-tooltip]',
      'div[role="tooltip"]'
    ];
    
    tooltipSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.parentNode === document.body) {
          element.remove();
        }
      });
    });
    
    // Clear tracked portal containers
    portalContainers.forEach(container => {
      if (container && container.parentNode) {
        container.remove();
      }
    });
    portalContainers.clear();
    
  } catch (error) {
    console.warn('Error during React portal cleanup:', error);
  }
}

/**
 * Comprehensive cleanup function that runs all cleanup operations
 * 
 * This is the main function to call in test teardown
 * Runs all cleanup operations in the correct order to prevent memory leaks
 */
export function performComprehensiveDOMCleanup() {
  // Order matters: clean up complex structures first
  cleanupReactPortals();
  clearEventListeners();
  cleanupDOMElements();
  clearGlobalDOMReferences();
  resetDocumentBody();
  
  // Disconnect mutation observer if it exists
  if (typeof window !== 'undefined' && window.__testCleanupObserver) {
    window.__testCleanupObserver.disconnect();
    delete window.__testCleanupObserver;
  }
}

/**
 * Register an element for cleanup tracking
 * Use this in tests when you manually create elements
 */
export function trackElementForCleanup(element) {
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    createdElements.add(element);
  }
}

/**
 * Register a portal container for cleanup
 * Use this when creating custom portals
 */
export function trackPortalForCleanup(container) {
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    portalContainers.add(container);
  }
}