import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';
import { focusTestHelper } from './utils/focus-test-helper';

// Store cleanup function
let cleanupFocus: (() => void) | null = null;

// Global test setup
beforeEach(() => {
  // Setup enhanced focus mocks for each test
  cleanupFocus = focusTestHelper.setupFocusMocks();
  
  // Clear all other mocks
  vi.clearAllMocks();
});

// Global test cleanup
afterEach(() => {
  // Cleanup focus mocks after each test
  if (cleanupFocus) {
    cleanupFocus();
    cleanupFocus = null;
  }
});