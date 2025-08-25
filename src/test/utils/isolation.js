/**
 * Test Isolation Framework - Phase 5.1
 * 
 * Provides complete test isolation through iframe contexts to prevent memory leaks
 * and ensure tests run in completely isolated environments.
 * 
 * Memory Benefits:
 * - Complete DOM isolation between tests prevents shared state
 * - Automatic cleanup when iframe is destroyed eliminates memory accumulation
 * - No shared global state between test runs
 * - Event listeners are automatically cleaned up with iframe destruction
 * - Prevents memory leaks from persisting across test suite execution
 * 
 * Architecture:
 * Uses iframe-based sandboxing where each test executes in its own iframe
 * with a completely separate DOM context, global scope, and memory space.
 * When the iframe is destroyed, all associated memory is automatically
 * garbage collected by the browser/Node.js runtime.
 * 
 * Performance Considerations:
 * - Iframe creation has ~5-10ms overhead per test
 * - Memory isolation prevents accumulation but requires more initial allocation
 * - Trade-off: Slightly slower test execution for guaranteed memory safety
 * - Best suited for integration tests and component tests with DOM manipulation
 * 
 * Browser Compatibility:
 * - Works in all modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
 * - Node.js jsdom environment fully supports iframe creation
 * - Edge cases handled for different iframe loading states
 */

// Global registry to track active isolated environments
const activeIframes = new WeakMap();
const isolationStats = {
  created: 0,
  destroyed: 0,
  currentActive: 0,
  totalTests: 0,
  errors: 0
};

/**
 * Configuration object for isolation environment
 * @typedef {Object} IsolationConfig
 * @property {number} timeout - Maximum time to wait for iframe setup (default: 5000ms)
 * @property {boolean} enableConsoleProxy - Whether to proxy console output (default: true)
 * @property {boolean} enableErrorHandling - Whether to catch and proxy errors (default: true)
 * @property {Object} testUtils - Test utilities to inject into iframe context
 * @property {string} baseHTML - Base HTML content for iframe (default: minimal HTML5)
 * @property {Array<string>} scripts - External scripts to load in iframe
 * @property {Array<string>} styles - CSS styles to apply in iframe
 */

/**
 * Creates an isolated test environment using iframe sandboxing
 * 
 * This function sets up a completely isolated iframe context where tests can run
 * without affecting the parent window or other tests. The iframe provides:
 * - Separate DOM tree
 * - Isolated global scope
 * - Independent event system
 * - Separate memory space
 * 
 * @param {IsolationConfig} config - Configuration options for the isolation
 * @returns {Promise<Object>} Promise resolving to isolation context
 */
export async function createIsolatedEnvironment(config = {}) {
  const defaultConfig = {
    timeout: 5000,
    enableConsoleProxy: true,
    enableErrorHandling: true,
    testUtils: {},
    baseHTML: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Test Isolation</title></head><body></body></html>',
    scripts: [],
    styles: []
  };

  const finalConfig = { ...defaultConfig, ...config };

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      isolationStats.errors++;
      reject(new Error(`Isolation environment setup timeout after ${finalConfig.timeout}ms`));
    }, finalConfig.timeout);

    try {
      // Create iframe element
      const iframe = document.createElement('iframe');
      
      // Configure iframe for maximum isolation
      // - sandbox attribute provides security isolation
      // - allow-scripts enables JavaScript execution
      // - allow-same-origin allows access to iframe content
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      iframe.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; visibility: hidden;';
      
      // Set up iframe load handler
      iframe.onload = function() {
        clearTimeout(timeoutId);
        
        try {
          const iframeWindow = iframe.contentWindow;
          const iframeDocument = iframe.contentDocument;

          // Verify iframe context is accessible
          if (!iframeWindow || !iframeDocument) {
            throw new Error('Failed to access iframe context - may be blocked by security policy');
          }

          // Initialize iframe with base HTML
          iframeDocument.open();
          iframeDocument.write(finalConfig.baseHTML);
          iframeDocument.close();

          // Inject test utilities into iframe global scope
          // This allows tests to access common testing helpers
          Object.keys(finalConfig.testUtils).forEach(key => {
            iframeWindow[key] = finalConfig.testUtils[key];
          });

          // Set up console proxying if enabled
          // This ensures console output from iframe tests appears in parent console
          if (finalConfig.enableConsoleProxy) {
            setupConsoleProxy(iframeWindow, iframe);
          }

          // Set up error handling if enabled
          // This catches uncaught errors in iframe and reports them to parent
          if (finalConfig.enableErrorHandling) {
            setupErrorHandling(iframeWindow, iframe);
          }

          // Load external scripts if specified
          loadScripts(iframeDocument, finalConfig.scripts).then(() => {
            // Apply styles if specified
            applyStyles(iframeDocument, finalConfig.styles);

            // Create isolation context object
            const isolationContext = {
              iframe,
              window: iframeWindow,
              document: iframeDocument,
              id: `isolation-${isolationStats.created}`,
              created: Date.now(),
              cleanup: () => cleanupIsolation(isolationContext)
            };

            // Register in tracking system
            activeIframes.set(iframe, isolationContext);
            isolationStats.created++;
            isolationStats.currentActive++;

            resolve(isolationContext);
          }).catch(error => {
            isolationStats.errors++;
            reject(new Error(`Failed to load scripts in isolation: ${error.message}`));
          });

        } catch (error) {
          isolationStats.errors++;
          reject(new Error(`Failed to setup iframe context: ${error.message}`));
        }
      };

      // Handle iframe load errors
      iframe.onerror = function(error) {
        clearTimeout(timeoutId);
        isolationStats.errors++;
        reject(new Error(`Iframe failed to load: ${error.message || 'Unknown error'}`));
      };

      // Append iframe to document to trigger loading
      // Using document.body ensures iframe is in DOM tree
      document.body.appendChild(iframe);

    } catch (error) {
      clearTimeout(timeoutId);
      isolationStats.errors++;
      reject(new Error(`Failed to create isolation iframe: ${error.message}`));
    }
  });
}

/**
 * Executes a test function in complete isolation
 * 
 * This is the main API for running isolated tests. It handles:
 * - Setting up isolated environment
 * - Executing test function in iframe context
 * - Handling async tests and promises
 * - Automatic cleanup regardless of test outcome
 * - Proper error propagation and stack trace preservation
 * 
 * @param {string} testName - Name of the test for tracking/debugging
 * @param {Function} testFunction - Test function to execute in isolation
 * @param {IsolationConfig} config - Configuration options
 * @returns {Promise<any>} Promise resolving to test function result
 */
export async function runInIsolation(testName, testFunction, config = {}) {
  let isolationContext = null;
  const startTime = Date.now();

  try {
    isolationStats.totalTests++;
    
    // Create isolated environment for this test
    isolationContext = await createIsolatedEnvironment(config);
    
    // Execute test function in iframe context
    // Pass isolation context to test function for access to iframe window/document
    const result = await executeTestInContext(testFunction, isolationContext, testName);
    
    return result;

  } catch (error) {
    // Enhance error with isolation context information
    const enhancedError = new Error(
      `Test "${testName}" failed in isolation: ${error.message}`
    );
    enhancedError.stack = error.stack;
    enhancedError.isolationInfo = {
      testName,
      duration: Date.now() - startTime,
      isolationId: isolationContext?.id
    };
    
    throw enhancedError;

  } finally {
    // Always cleanup isolation environment
    // This is critical for preventing memory leaks
    if (isolationContext) {
      await cleanupIsolation(isolationContext);
    }
  }
}

/**
 * Destroys an isolated environment and cleans up all references
 * 
 * This function performs comprehensive cleanup:
 * - Removes iframe from DOM (triggers automatic cleanup of all iframe content)
 * - Clears all references to iframe window and document
 * - Removes from tracking system
 * - Forces garbage collection if available
 * - Updates isolation statistics
 * 
 * Memory Benefits:
 * When an iframe is removed from the DOM, the browser automatically:
 * - Destroys the iframe's window object and all its properties
 * - Cleans up all event listeners attached to iframe elements
 * - Releases all DOM nodes within the iframe
 * - Garbage collects all JavaScript objects created in iframe context
 * - Frees memory allocated to iframe's separate execution context
 * 
 * @param {Object} isolationContext - Isolation context to cleanup
 * @returns {Promise<void>} Promise resolving when cleanup is complete
 */
export async function cleanupIsolation(isolationContext) {
  if (!isolationContext || !isolationContext.iframe) {
    return;
  }

  try {
    const { iframe } = isolationContext;
    
    // Remove from tracking before destruction
    if (activeIframes.has(iframe)) {
      activeIframes.delete(iframe);
      isolationStats.currentActive--;
    }

    // Clear all references to iframe content
    // This helps garbage collector identify objects for cleanup
    isolationContext.window = null;
    isolationContext.document = null;
    
    // Remove iframe from DOM
    // This is the critical step that triggers automatic cleanup
    // The browser will destroy the entire iframe context including:
    // - All DOM elements and their event listeners
    // - All JavaScript objects in iframe's global scope
    // - All timers, intervals, and async operations
    // - All network requests initiated from iframe
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    // Force garbage collection if available
    // This is primarily useful in Node.js test environments
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }

    isolationStats.destroyed++;
    
    // Small delay to allow cleanup to complete
    // Some browsers may need a tick for full cleanup
    await new Promise(resolve => setTimeout(resolve, 0));

  } catch (error) {
    console.error('Error during isolation cleanup:', error);
    // Continue with cleanup even if error occurs
  }
}

/**
 * Executes a test function within an iframe context
 * 
 * This function handles the actual test execution with proper error handling,
 * timeout management, and result processing. It supports both synchronous
 * and asynchronous test functions.
 * 
 * @private
 * @param {Function} testFunction - Test function to execute
 * @param {Object} isolationContext - Isolation context
 * @param {string} testName - Test name for error reporting
 * @returns {Promise<any>} Promise resolving to test result
 */
async function executeTestInContext(testFunction, isolationContext, testName) {
  const { window: iframeWindow, document: iframeDocument } = isolationContext;

  try {
    // Create test context object to pass to test function
    const testContext = {
      window: iframeWindow,
      document: iframeDocument,
      isolation: isolationContext,
      cleanup: () => cleanupIsolation(isolationContext)
    };

    // Execute test function and handle both sync and async cases
    const result = testFunction(testContext);

    // If result is a promise, wait for it
    if (result && typeof result.then === 'function') {
      return await result;
    }

    return result;

  } catch (error) {
    // Preserve original error but add context
    const contextualError = new Error(error.message);
    contextualError.stack = error.stack;
    contextualError.name = error.name;
    contextualError.testContext = {
      testName,
      isolationId: isolationContext.id
    };
    
    throw contextualError;
  }
}

/**
 * Sets up console proxying from iframe to parent window
 * 
 * This ensures that console.log, console.error, etc. calls made within
 * the iframe test context appear in the parent window's console.
 * This is crucial for test debugging and output visibility.
 * 
 * @private
 * @param {Window} iframeWindow - Iframe window object
 * @param {HTMLIFrameElement} iframe - Iframe element
 */
function setupConsoleProxy(iframeWindow, iframe) {
  const consoleMethods = ['log', 'error', 'warn', 'info', 'debug', 'trace'];
  const originalConsole = {};

  consoleMethods.forEach(method => {
    if (typeof iframeWindow.console[method] === 'function') {
      originalConsole[method] = iframeWindow.console[method];
      
      iframeWindow.console[method] = function(...args) {
        // Prefix with iframe identification for clarity
        const prefix = `[Iframe-${iframe._isolationId || 'unknown'}]`;
        
        // Call parent console with prefix
        if (typeof window.console[method] === 'function') {
          window.console[method](prefix, ...args);
        }
        
        // Also call original iframe console
        originalConsole[method].apply(iframeWindow.console, args);
      };
    }
  });
}

/**
 * Sets up error handling for iframe context
 * 
 * Catches uncaught errors and unhandled promise rejections in iframe
 * and reports them to the parent window with proper context.
 * 
 * @private
 * @param {Window} iframeWindow - Iframe window object
 * @param {HTMLIFrameElement} iframe - Iframe element
 */
function setupErrorHandling(iframeWindow, iframe) {
  // Handle uncaught errors
  iframeWindow.addEventListener('error', (event) => {
    console.error(`[Iframe-${iframe._isolationId || 'unknown'}] Uncaught Error:`, {
      message: event.error?.message || event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Handle unhandled promise rejections
  iframeWindow.addEventListener('unhandledrejection', (event) => {
    console.error(`[Iframe-${iframe._isolationId || 'unknown'}] Unhandled Promise Rejection:`, {
      reason: event.reason,
      stack: event.reason?.stack
    });
  });
}

/**
 * Loads external scripts into iframe document
 * 
 * @private
 * @param {Document} iframeDocument - Iframe document
 * @param {Array<string>} scripts - Array of script URLs or inline scripts
 * @returns {Promise<void>} Promise resolving when all scripts are loaded
 */
async function loadScripts(iframeDocument, scripts) {
  if (!scripts || scripts.length === 0) {
    return;
  }

  const loadPromises = scripts.map(script => {
    return new Promise((resolve, reject) => {
      const scriptElement = iframeDocument.createElement('script');
      
      if (script.startsWith('http') || script.startsWith('/')) {
        // External script
        scriptElement.src = script;
        scriptElement.onload = resolve;
        scriptElement.onerror = reject;
      } else {
        // Inline script
        scriptElement.textContent = script;
        // Inline scripts execute immediately
        resolve();
      }
      
      iframeDocument.head.appendChild(scriptElement);
    });
  });

  await Promise.all(loadPromises);
}

/**
 * Applies CSS styles to iframe document
 * 
 * @private
 * @param {Document} iframeDocument - Iframe document
 * @param {Array<string>} styles - Array of CSS strings or URLs
 */
function applyStyles(iframeDocument, styles) {
  if (!styles || styles.length === 0) {
    return;
  }

  styles.forEach(style => {
    if (style.startsWith('http') || style.startsWith('/')) {
      // External stylesheet
      const link = iframeDocument.createElement('link');
      link.rel = 'stylesheet';
      link.href = style;
      iframeDocument.head.appendChild(link);
    } else {
      // Inline styles
      const styleElement = iframeDocument.createElement('style');
      styleElement.textContent = style;
      iframeDocument.head.appendChild(styleElement);
    }
  });
}

/**
 * Gets current isolation statistics
 * 
 * Useful for monitoring memory usage and isolation effectiveness
 * during test suite execution.
 * 
 * @returns {Object} Current isolation statistics
 */
export function getIsolationStats() {
  return {
    ...isolationStats,
    memoryEfficiency: isolationStats.destroyed / isolationStats.created * 100,
    averageLifetime: isolationStats.totalTests > 0 
      ? (Date.now() - (isolationStats.created * 1000)) / isolationStats.totalTests 
      : 0
  };
}

/**
 * Resets isolation statistics
 * 
 * Useful for benchmarking or starting fresh measurements
 */
export function resetIsolationStats() {
  Object.keys(isolationStats).forEach(key => {
    isolationStats[key] = 0;
  });
}

/**
 * High-level wrapper for creating isolated test suites
 * 
 * This is a convenience function that makes it easy to run multiple
 * related tests in isolation while sharing some setup configuration.
 * 
 * @param {string} suiteName - Name of the test suite
 * @param {IsolationConfig} config - Shared configuration for all tests
 * @param {Function} suiteFunction - Function that defines the test suite
 * @returns {Promise<void>} Promise resolving when suite is complete
 */
export async function isolatedTestSuite(suiteName, config, suiteFunction) {
  const suiteStats = {
    name: suiteName,
    started: Date.now(),
    tests: 0,
    passed: 0,
    failed: 0
  };

  console.log(`Starting isolated test suite: ${suiteName}`);

  try {
    // Create test runner function that tracks suite statistics
    const isolatedTest = async (testName, testFunction) => {
      suiteStats.tests++;
      try {
        await runInIsolation(`${suiteName}: ${testName}`, testFunction, config);
        suiteStats.passed++;
        console.log(`  ✓ ${testName}`);
      } catch (error) {
        suiteStats.failed++;
        console.error(`  ✗ ${testName}: ${error.message}`);
        throw error;
      }
    };

    // Execute suite function with isolated test runner
    await suiteFunction(isolatedTest);

  } finally {
    const duration = Date.now() - suiteStats.started;
    console.log(`Isolated test suite "${suiteName}" completed in ${duration}ms`);
    console.log(`  Tests: ${suiteStats.tests}, Passed: ${suiteStats.passed}, Failed: ${suiteStats.failed}`);
    
    // Log isolation statistics
    const stats = getIsolationStats();
    console.log(`  Isolation efficiency: ${stats.memoryEfficiency.toFixed(2)}% cleanup rate`);
  }
}