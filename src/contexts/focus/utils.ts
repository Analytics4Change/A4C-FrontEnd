/**
 * Focus Management Utility Functions
 * Helper functions for focus operations
 */

import { 
  FocusableElement, 
  FocusScope, 
  FocusNavigationOptions,
  FocusableType,
  FocusValidator,
  FocusHistoryEntry,
  FocusChangeReason
} from './types';

/**
 * Default focusable selectors for finding focusable elements in DOM
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="textbox"]',
  '[role="menuitem"]'
].join(', ');

/**
 * Check if an element is visible and can receive focus
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  if (style.opacity === '0' && style.pointerEvents === 'none') {
    return false;
  }
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  return true;
}

/**
 * Check if an element is within a specific container
 */
export function isElementInContainer(element: HTMLElement, container: HTMLElement): boolean {
  return container.contains(element);
}

/**
 * Get the focusable type from an HTML element
 */
export function getFocusableType(element: HTMLElement): FocusableType {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  
  if (tagName === 'input') return FocusableType.INPUT;
  if (tagName === 'select') return FocusableType.SELECT;
  if (tagName === 'textarea') return FocusableType.TEXTAREA;
  if (tagName === 'button' || role === 'button') return FocusableType.BUTTON;
  if (tagName === 'a' || role === 'link') return FocusableType.LINK;
  if (role === 'combobox') return FocusableType.COMBOBOX;
  
  return FocusableType.CUSTOM;
}

/**
 * Find all focusable elements within a container
 */
export function findFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
  return elements.filter(el => isElementVisible(el) && !el.hasAttribute('aria-hidden'));
}

/**
 * Sort elements by their tab index and DOM position
 */
export function sortByTabIndex(elements: FocusableElement[]): FocusableElement[] {
  return elements.sort((a, b) => {
    const tabIndexA = a.tabIndex ?? 0;
    const tabIndexB = b.tabIndex ?? 0;
    
    // Elements with positive tabIndex come first, sorted by value
    if (tabIndexA > 0 && tabIndexB > 0) {
      return tabIndexA - tabIndexB;
    }
    
    // Elements with positive tabIndex come before those with 0 or undefined
    if (tabIndexA > 0) return -1;
    if (tabIndexB > 0) return 1;
    
    // For elements with same tabIndex, maintain registration order
    return a.registeredAt - b.registeredAt;
  });
}

/**
 * Filter elements by scope
 */
export function filterElementsByScope(
  elements: Map<string, FocusableElement>,
  scopeId: string
): FocusableElement[] {
  const filtered: FocusableElement[] = [];
  
  elements.forEach(element => {
    if (element.scopeId === scopeId && element.canFocus !== false) {
      filtered.push(element);
    }
  });
  
  return sortByTabIndex(filtered);
}

/**
 * Apply navigation options to filter elements
 */
export function applyNavigationOptions(
  elements: FocusableElement[],
  options?: FocusNavigationOptions
): FocusableElement[] {
  if (!options) return elements;
  
  let filtered = [...elements];
  
  // Filter out elements that should be skipped
  if (!options.includeDisabled) {
    filtered = filtered.filter(el => !el.skipInNavigation);
  }
  
  // Filter by type
  if (options.typeFilter && options.typeFilter.length > 0) {
    filtered = filtered.filter(el => options.typeFilter!.includes(el.type));
  }
  
  // Apply custom filter
  if (options.customFilter) {
    filtered = filtered.filter(options.customFilter);
  }
  
  return filtered;
}

/**
 * Validate element before focusing
 * Supports both synchronous and asynchronous validators
 */
export async function validateElement(
  element: FocusableElement,
  skipValidation?: boolean
): Promise<boolean> {
  if (skipValidation || !element.validator) {
    return true;
  }
  
  try {
    const result = element.validator();
    // Handle both sync and async validators
    return await Promise.resolve(result);
  } catch (error) {
    console.error(`Validation failed for element ${element.id}:`, error);
    return false;
  }
}

/**
 * Validate element synchronously if possible
 * Falls back to Promise for async validators
 */
export function validateElementSync(
  element: FocusableElement,
  skipValidation?: boolean
): boolean | Promise<boolean> {
  if (skipValidation || !element.validator) {
    return true;
  }
  
  try {
    const result = element.validator();
    // If result is a Promise, return it as-is
    if (result && typeof (result as any).then === 'function') {
      return result as Promise<boolean>;
    }
    return result as boolean;
  } catch (error) {
    console.error(`Validation failed for element ${element.id}:`, error);
    return false;
  }
}

/**
 * Focus an HTML element with optional scroll behavior
 * Uses requestAnimationFrame to ensure DOM is ready and returns Promise indicating success
 */
export function focusElement(
  element: HTMLElement,
  behavior: 'smooth' | 'instant' = 'instant'
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Check if element can receive focus
      if (!isElementVisible(element)) {
        resolve(false);
        return;
      }
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        try {
          // Focus the element
          element.focus();
          
          // Scroll into view if needed
          if (behavior === 'smooth') {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Check if focus was successful
          const success = document.activeElement === element;
          resolve(success);
        } catch (error) {
          console.error('Failed to focus element:', error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Failed to focus element:', error);
      resolve(false);
    }
  });
}

/**
 * Get the next element index with wrapping support
 */
export function getNextIndex(
  currentIndex: number,
  totalElements: number,
  wrap: boolean = true
): number {
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= totalElements) {
    return wrap ? 0 : currentIndex;
  }
  
  return nextIndex;
}

/**
 * Get the previous element index with wrapping support
 */
export function getPreviousIndex(
  currentIndex: number,
  totalElements: number,
  wrap: boolean = true
): number {
  const previousIndex = currentIndex - 1;
  
  if (previousIndex < 0) {
    return wrap ? totalElements - 1 : currentIndex;
  }
  
  return previousIndex;
}

/**
 * Create a focus history entry
 */
export function createHistoryEntry(
  elementId: string,
  scopeId: string,
  reason: FocusChangeReason,
  previousElementId?: string,
  context?: Record<string, any>
): FocusHistoryEntry {
  return {
    elementId,
    scopeId,
    reason,
    timestamp: Date.now(),
    previousElementId,
    context
  };
}

/**
 * Find parent scope
 */
export function findParentScope(
  scopes: FocusScope[],
  scopeId: string
): FocusScope | undefined {
  const currentScope = scopes.find(s => s.id === scopeId);
  if (!currentScope?.parentId) return undefined;
  
  return scopes.find(s => s.id === currentScope.parentId);
}

/**
 * Get all child scopes
 */
export function getChildScopes(
  scopes: FocusScope[],
  parentId: string
): FocusScope[] {
  return scopes.filter(s => s.parentId === parentId);
}

/**
 * Check if a scope is modal type
 */
export function isModalScope(scope: FocusScope): boolean {
  return scope.type === 'modal';
}

/**
 * Generate unique scope ID
 */
export function generateScopeId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique element ID
 */
export function generateElementId(type: string): string {
  return `element_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the input element within a container (for complex components)
 */
export function getInputElement(container: HTMLElement): HTMLElement | null {
  // Try to find the actual input element within the container
  const input = container.querySelector<HTMLElement>(
    'input, select, textarea, [role="combobox"], [role="textbox"]'
  );
  
  return input || container;
}

/**
 * Check if an element is a dropdown trigger
 */
export function isDropdownTrigger(element: HTMLElement): boolean {
  const role = element.getAttribute('role');
  const ariaExpanded = element.getAttribute('aria-expanded');
  const ariaHaspopup = element.getAttribute('aria-haspopup');
  
  return (
    role === 'combobox' ||
    ariaHaspopup === 'true' ||
    ariaHaspopup === 'listbox' ||
    ariaHaspopup === 'menu' ||
    ariaExpanded !== null
  );
}

/**
 * Trigger dropdown open if element is a dropdown
 */
export function openDropdownIfNeeded(element: HTMLElement): void {
  if (isDropdownTrigger(element)) {
    // Simulate click to open dropdown
    element.click();
    
    // Also try to trigger with keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}

/**
 * Debug logger for focus operations
 */
export function debugLog(debug: boolean, message: string, data?: any): void {
  if (!debug) return;
  
  const timestamp = new Date().toISOString();
  console.log(`[FocusManager ${timestamp}] ${message}`, data || '');
}

/**
 * Check if focus is within a specific scope
 */
export function isFocusWithinScope(scopeId: string, elements: Map<string, FocusableElement>): boolean {
  const activeElement = document.activeElement as HTMLElement;
  if (!activeElement) return false;
  
  // Check if any registered element in the scope contains the active element
  for (const element of elements.values()) {
    if (element.scopeId === scopeId && element.ref.current?.contains(activeElement)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Restore focus to a specific element safely
 */
export async function restoreFocus(elementId: string, elements: Map<string, FocusableElement>): Promise<boolean> {
  const element = elements.get(elementId);
  if (!element?.ref.current) return false;
  
  try {
    const inputElement = getInputElement(element.ref.current);
    if (inputElement) {
      return await focusElement(inputElement);
    }
    return false;
  } catch (error) {
    console.error(`Failed to restore focus to element ${elementId}:`, error);
    return false;
  }
}

/**
 * Promise-based delay utility to replace setTimeout in async functions
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}