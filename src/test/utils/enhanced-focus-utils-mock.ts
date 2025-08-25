/**
 * Enhanced mocks for focus utilities to fix async and timing issues
 * Based on TASK_017a_REMEDIATION_PLAN.md infrastructure improvements
 */

import { vi } from 'vitest';
import { FocusableElement, FocusChangeReason } from '@/contexts/focus/types';

// Create a mock function that can be both sync and async
const createMockValidator = () => {
  const mock = vi.fn(() => Promise.resolve(true));
  mock.sync = vi.fn(() => true);
  return mock;
};

// Enhanced delay mock with proper promise handling
export const delay = vi.fn(() => Promise.resolve());

// Debounce mock that executes immediately in tests
export const debounce = vi.fn((fn: Function) => fn);

// Throttle mock that executes immediately in tests
export const throttle = vi.fn((fn: Function) => fn);

// Enhanced validateElement mock with proper async handling
export const validateElement = vi.fn(async (element: FocusableElement, skipValidation?: boolean) => {
  if (skipValidation || !element.validator) {
    return true;
  }
  
  try {
    const result = element.validator();
    return await Promise.resolve(result);
  } catch (error) {
    return false;
  }
});

// Enhanced focusElement mock with RAF handling
export const focusElement = vi.fn((element: HTMLElement, behavior?: 'smooth' | 'instant') => {
  return new Promise<boolean>((resolve) => {
    // Use RAF mock from global setup
    requestAnimationFrame(() => {
      try {
        if (element && typeof element.focus === 'function') {
          element.focus();
          // Allow a small delay for focus events to process
          setTimeout(() => {
            resolve(document.activeElement === element);
          }, 5);
        } else {
          resolve(false);
        }
      } catch (error) {
        resolve(false);
      }
    });
  });
});

// Enhanced filterElementsByScope with proper sorting
export const filterElementsByScope = vi.fn((elements: Map<string, FocusableElement>, scopeId: string) => {
  const elementsArray = Array.from(elements.values());
  return elementsArray
    .filter(el => el.scopeId === scopeId && el.canFocus !== false)
    .sort((a, b) => {
      const tabIndexA = a.tabIndex || 0;
      const tabIndexB = b.tabIndex || 0;
      
      if (tabIndexA !== tabIndexB) {
        return tabIndexA - tabIndexB;
      }
      
      // Fallback to registration order
      return a.registeredAt - b.registeredAt;
    });
});

// Navigation options mock
export const applyNavigationOptions = vi.fn((elements: FocusableElement[]) => elements);

// Index calculation mocks
export const getNextIndex = vi.fn((current: number, length: number, wrap: boolean = true) => {
  const next = current + 1;
  return next >= length ? (wrap ? 0 : current) : next;
});

export const getPreviousIndex = vi.fn((current: number, length: number, wrap: boolean = true) => {
  const prev = current - 1;
  return prev < 0 ? (wrap ? length - 1 : current) : prev;
});

// History entry creation mock
export const createHistoryEntry = vi.fn((id: string, scope: string, reason: FocusChangeReason, prev?: string) => ({
  elementId: id,
  scopeId: scope,
  reason,
  timestamp: Date.now(),
  previousElementId: prev
}));

// Scope ID generation mock
export const generateScopeId = vi.fn(() => 'generated-id');

// Input element getter mock
export const getInputElement = vi.fn((el: HTMLElement) => el);

// Dropdown handling mock
export const openDropdownIfNeeded = vi.fn();

// Debug logging mock
export const debugLog = vi.fn();

// Focus scope checking mock
export const isFocusWithinScope = vi.fn(() => true);

// Focus restoration mock with proper async handling
export const restoreFocus = vi.fn(async (elementId: string, elements: Map<string, FocusableElement>) => {
  const element = elements.get(elementId);
  if (!element?.ref.current) return false;
  
  try {
    const inputElement = getInputElement(element.ref.current);
    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus();
      return document.activeElement === inputElement;
    }
    return false;
  } catch (error) {
    return false;
  }
});

// Additional mocks for timing and visual indicator support
export const isElementVisible = vi.fn(() => true);
export const isElementInContainer = vi.fn(() => true);
export const getFocusableType = vi.fn(() => 'input');
export const findFocusableElements = vi.fn(() => []);
export const sortByTabIndex = vi.fn((elements) => elements);
export const validateElementSync = vi.fn(() => true);
export const findParentScope = vi.fn();
export const getChildScopes = vi.fn(() => []);
export const isModalScope = vi.fn(() => false);
export const generateElementId = vi.fn(() => 'generated-element-id');
export const isDropdownTrigger = vi.fn(() => false);

// Export all mocks as a single object for easy replacement
export const mockUtils = {
  delay,
  debounce,
  throttle,
  validateElement,
  focusElement,
  filterElementsByScope,
  applyNavigationOptions,
  getNextIndex,
  getPreviousIndex,
  createHistoryEntry,
  generateScopeId,
  getInputElement,
  openDropdownIfNeeded,
  debugLog,
  isFocusWithinScope,
  restoreFocus,
  isElementVisible,
  isElementInContainer,
  getFocusableType,
  findFocusableElements,
  sortByTabIndex,
  validateElementSync,
  findParentScope,
  getChildScopes,
  isModalScope,
  generateElementId,
  isDropdownTrigger
};