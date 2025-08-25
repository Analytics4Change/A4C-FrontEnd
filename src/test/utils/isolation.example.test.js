/**
 * Example Test File - Test Isolation Framework Usage
 * 
 * This file demonstrates how to use the Test Isolation Framework
 * for memory-safe testing with complete DOM and scope isolation.
 * 
 * Run this test to verify the isolation framework is working correctly:
 * npm test -- isolation.example.test.js
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { 
  runInIsolation, 
  createIsolatedEnvironment, 
  cleanupIsolation,
  isolatedTestSuite,
  getIsolationStats,
  resetIsolationStats
} from './isolation.js';

describe('Test Isolation Framework Examples', () => {
  beforeAll(() => {
    // Reset stats for clean measurement
    resetIsolationStats();
    console.log('Starting isolation framework examples...');
  });

  afterAll(() => {
    // Display final isolation statistics
    const stats = getIsolationStats();
    console.log('Isolation Framework Stats:', stats);
  });

  test('Basic isolated test execution', async () => {
    // This test runs in its own iframe with completely isolated DOM
    const result = await runInIsolation('basic-test', ({ document, window }) => {
      // This code runs in an isolated iframe context
      document.body.innerHTML = '<div id="test-element">Hello Isolation!</div>';
      
      const element = document.getElementById('test-element');
      expect(element).toBeTruthy();
      expect(element.textContent).toBe('Hello Isolation!');
      
      // Return a value to demonstrate result passing
      return { success: true, elementCount: document.querySelectorAll('*').length };
    });

    expect(result.success).toBe(true);
    expect(result.elementCount).toBeGreaterThan(0);
  });

  test('Isolated test with async operations', async () => {
    // Demonstrate isolation with promises and async operations
    const result = await runInIsolation('async-test', async ({ document, window }) => {
      // Create a promise that resolves after a delay
      const delayedOperation = new Promise((resolve) => {
        setTimeout(() => {
          document.body.innerHTML = '<p>Async content loaded</p>';
          resolve('Operation completed');
        }, 100);
      });

      const message = await delayedOperation;
      const content = document.querySelector('p').textContent;
      
      return { message, content };
    });

    expect(result.message).toBe('Operation completed');
    expect(result.content).toBe('Async content loaded');
  });

  test('Isolated test with event listeners', async () => {
    // Demonstrate that event listeners are automatically cleaned up
    await runInIsolation('event-test', ({ document, window }) => {
      let clickCount = 0;
      
      // Create button and add event listener
      const button = document.createElement('button');
      button.textContent = 'Click me';
      button.addEventListener('click', () => {
        clickCount++;
      });
      
      document.body.appendChild(button);
      
      // Simulate clicks
      button.click();
      button.click();
      
      expect(clickCount).toBe(2);
      
      // Event listeners will be automatically cleaned up when iframe is destroyed
    });
  });

  test('Isolated test with custom test utilities', async () => {
    // Demonstrate injecting test utilities into isolated context
    const config = {
      testUtils: {
        // Custom helper functions available in isolated context
        createElement: (tag, content) => {
          const element = document.createElement(tag);
          element.textContent = content;
          return element;
        },
        randomId: () => `test-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    await runInIsolation('utility-test', ({ document, window }) => {
      // Use injected utility functions
      const heading = window.createElement('h1', 'Test Heading');
      const uniqueId = window.randomId();
      
      heading.id = uniqueId;
      document.body.appendChild(heading);
      
      const foundElement = document.getElementById(uniqueId);
      expect(foundElement).toBeTruthy();
      expect(foundElement.textContent).toBe('Test Heading');
    }, config);
  });

  test('Memory isolation verification', async () => {
    // This test verifies that changes in one isolated test
    // don't affect another isolated test
    
    // First test: modify global state
    await runInIsolation('memory-test-1', ({ document, window }) => {
      window.globalTestVariable = 'value-from-test-1';
      document.body.setAttribute('data-test', 'first-test');
    });

    // Second test: check that global state is clean
    await runInIsolation('memory-test-2', ({ document, window }) => {
      // These should be undefined/clean in new isolated context
      expect(window.globalTestVariable).toBeUndefined();
      expect(document.body.getAttribute('data-test')).toBeNull();
      
      // Set different values to verify isolation
      window.globalTestVariable = 'value-from-test-2';
      document.body.setAttribute('data-test', 'second-test');
    });

    // Third test: verify complete isolation
    await runInIsolation('memory-test-3', ({ document, window }) => {
      expect(window.globalTestVariable).toBeUndefined();
      expect(document.body.getAttribute('data-test')).toBeNull();
    });
  });

  test('Manual isolation environment management', async () => {
    // Demonstrate manual creation and cleanup of isolation environment
    const isolation = await createIsolatedEnvironment({
      enableConsoleProxy: true,
      baseHTML: '<!DOCTYPE html><html><body><h1>Custom Environment</h1></body></html>'
    });

    try {
      // Use the isolation context
      const heading = isolation.document.querySelector('h1');
      expect(heading.textContent).toBe('Custom Environment');
      
      // Add more content
      const paragraph = isolation.document.createElement('p');
      paragraph.textContent = 'Added in manual test';
      isolation.document.body.appendChild(paragraph);
      
      expect(isolation.document.querySelectorAll('p')).toHaveLength(1);
      
    } finally {
      // Always cleanup manually created environments
      await cleanupIsolation(isolation);
    }
  });

  test('Error handling in isolated context', async () => {
    // Demonstrate proper error handling and propagation
    await expect(
      runInIsolation('error-test', ({ document, window }) => {
        // This error should be properly caught and propagated
        throw new Error('Test error from isolated context');
      })
    ).rejects.toThrow('Test error from isolated context');
  });

  test('Timeout handling', async () => {
    // Test with very short timeout to demonstrate timeout handling
    await expect(
      runInIsolation('timeout-test', async ({ document, window }) => {
        // This will timeout if timeout is very short
        await new Promise(resolve => setTimeout(resolve, 1000));
      }, { timeout: 500 })
    ).rejects.toThrow('timeout');
  });

  describe('Isolated Test Suite Example', () => {
    test('Using isolatedTestSuite helper', async () => {
      // Demonstrate the high-level test suite wrapper
      await isolatedTestSuite('Example Suite', 
        {
          testUtils: {
            createTestElement: (text) => {
              const div = document.createElement('div');
              div.className = 'test-element';
              div.textContent = text;
              return div;
            }
          }
        },
        async (isolatedTest) => {
          await isolatedTest('suite-test-1', ({ document, window }) => {
            const element = window.createTestElement('Suite Test 1');
            document.body.appendChild(element);
            expect(element.className).toBe('test-element');
          });

          await isolatedTest('suite-test-2', ({ document, window }) => {
            const element = window.createTestElement('Suite Test 2');
            document.body.appendChild(element);
            expect(element.textContent).toBe('Suite Test 2');
          });

          await isolatedTest('suite-test-3', ({ document, window }) => {
            // Verify isolation: no elements from previous tests
            const existingElements = document.querySelectorAll('.test-element');
            expect(existingElements.length).toBe(0);
            
            const element = window.createTestElement('Suite Test 3');
            document.body.appendChild(element);
            expect(document.querySelectorAll('.test-element').length).toBe(1);
          });
        }
      );
    });
  });

  describe('Performance and Memory Monitoring', () => {
    test('Monitor isolation statistics', async () => {
      const initialStats = getIsolationStats();
      
      // Run several isolated tests
      for (let i = 0; i < 5; i++) {
        await runInIsolation(`performance-test-${i}`, ({ document, window }) => {
          // Create some DOM elements to test cleanup
          for (let j = 0; j < 10; j++) {
            const div = document.createElement('div');
            div.textContent = `Element ${j}`;
            document.body.appendChild(div);
          }
        });
      }
      
      const finalStats = getIsolationStats();
      
      // Verify statistics tracking
      expect(finalStats.totalTests).toBeGreaterThan(initialStats.totalTests);
      expect(finalStats.created).toBeGreaterThan(initialStats.created);
      expect(finalStats.destroyed).toBeGreaterThan(initialStats.destroyed);
      
      // Memory efficiency should be high (most environments cleaned up)
      expect(finalStats.memoryEfficiency).toBeGreaterThan(80);
      
      console.log('Performance test stats:', finalStats);
    });
  });

  describe('Real-world Component Testing Example', () => {
    test('Isolated component rendering and interaction', async () => {
      await runInIsolation('component-test', ({ document, window }) => {
        // Simulate a simple component test
        // Create a modal component structure
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-backdrop">
            <div class="modal-content">
              <h2>Test Modal</h2>
              <p>Modal content</p>
              <button class="close-btn">Close</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        // Add event handlers
        const closeBtn = modal.querySelector('.close-btn');
        let modalClosed = false;

        closeBtn.addEventListener('click', () => {
          modal.remove();
          modalClosed = true;
        });

        // Test initial state
        expect(document.querySelector('.modal')).toBeTruthy();
        expect(modalClosed).toBe(false);

        // Simulate close interaction
        closeBtn.click();

        // Test final state
        expect(document.querySelector('.modal')).toBeFalsy();
        expect(modalClosed).toBe(true);
      });

      // Verify no modal remains in subsequent test
      await runInIsolation('cleanup-verification', ({ document, window }) => {
        expect(document.querySelector('.modal')).toBeFalsy();
        expect(document.body.innerHTML).toBe('');
      });
    });
  });
});