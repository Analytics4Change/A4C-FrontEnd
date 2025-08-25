/**
 * Basic Test for Isolation Framework
 * 
 * Simple validation test to ensure the isolation framework works correctly
 */

import { describe, test, expect } from 'vitest';
import { runInIsolation, getIsolationStats, resetIsolationStats } from './isolation.js';

describe('Basic Isolation Framework Test', () => {
  test('basic isolated test execution', async () => {
    resetIsolationStats();
    
    const result = await runInIsolation('basic-test', ({ document, window }) => {
      // Simple test in isolated context
      document.body.innerHTML = '<div id="test">Hello Isolation!</div>';
      
      const element = document.getElementById('test');
      return {
        success: true,
        content: element ? element.textContent : null,
        bodyChildren: document.body.children.length
      };
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe('Hello Isolation!');
    expect(result.bodyChildren).toBe(1);
    
    // Check isolation stats
    const stats = getIsolationStats();
    expect(stats.totalTests).toBeGreaterThan(0);
    expect(stats.created).toBeGreaterThan(0);
  });

  test('memory isolation between tests', async () => {
    // First test sets global variable
    await runInIsolation('isolation-test-1', ({ document, window }) => {
      window.testVariable = 'first-test';
      document.body.setAttribute('data-test', 'first');
    });

    // Second test should not see the variable
    await runInIsolation('isolation-test-2', ({ document, window }) => {
      expect(window.testVariable).toBeUndefined();
      expect(document.body.getAttribute('data-test')).toBeNull();
      
      // Set different values
      window.testVariable = 'second-test';
      document.body.setAttribute('data-test', 'second');
    });

    // Third test should still be isolated
    await runInIsolation('isolation-test-3', ({ document, window }) => {
      expect(window.testVariable).toBeUndefined();
      expect(document.body.getAttribute('data-test')).toBeNull();
    });
  });
});