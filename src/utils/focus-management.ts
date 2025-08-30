/**
 * Focus management utilities for form navigation
 */

/**
 * Focus selectors for meaningful form inputs
 * Excludes buttons and other non-input elements
 */
const FOCUSABLE_INPUT_SELECTORS = [
  'input:not([disabled]):not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"])',
  'textarea:not([disabled])',
  'select:not([disabled])'
].join(', ');

/**
 * All focusable elements including buttons
 */
const ALL_FOCUSABLE_SELECTORS = [
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])'
].join(', ');

/**
 * Find the next focusable input element after the current element
 * @param currentElement - The currently focused element
 * @param container - Optional container to search within (defaults to document)
 * @returns The next focusable input element or null
 */
export function findNextFocusableInput(
  currentElement: HTMLElement,
  container: HTMLElement | Document = document
): HTMLElement | null {
  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_INPUT_SELECTORS)
  );

  // Filter out elements that are not visible or have tabindex=-1
  const visibleElements = focusableElements.filter(el => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const tabIndex = el.getAttribute('tabindex');
    return isVisible && tabIndex !== '-1';
  });

  // Sort by tabindex (if specified) and document position
  visibleElements.sort((a, b) => {
    const tabIndexA = parseInt(a.getAttribute('tabindex') || '0');
    const tabIndexB = parseInt(b.getAttribute('tabindex') || '0');

    // Both have explicit tabindex
    if (tabIndexA > 0 && tabIndexB > 0) {
      return tabIndexA - tabIndexB;
    }

    // Only A has explicit tabindex
    if (tabIndexA > 0) return -1;
    
    // Only B has explicit tabindex
    if (tabIndexB > 0) return 1;

    // Both have no tabindex or tabindex=0, use document order
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  // Find current element's position
  const currentIndex = visibleElements.indexOf(currentElement);
  
  // Get next element
  if (currentIndex >= 0 && currentIndex < visibleElements.length - 1) {
    return visibleElements[currentIndex + 1];
  }

  // If current element not found or is last, return first element (cycle)
  return visibleElements.length > 0 ? visibleElements[0] : null;
}

/**
 * Focus the next input element in the form
 * @param currentElement - The currently focused element
 * @param container - Optional container to search within
 * @returns Boolean indicating if focus was moved
 */
export function focusNextInput(
  currentElement: HTMLElement,
  container?: HTMLElement | Document
): boolean {
  const nextElement = findNextFocusableInput(currentElement, container);
  
  if (nextElement) {
    nextElement.focus();
    
    // If it's an input with text, select it for easy replacement
    if (nextElement instanceof HTMLInputElement && 
        ['text', 'search', 'tel', 'url', 'email'].includes(nextElement.type)) {
      nextElement.select();
    }
    
    return true;
  }
  
  return false;
}

/**
 * Find the next element with a specific tabIndex value
 * @param targetTabIndex - The tabIndex to find
 * @param container - Optional container to search within
 * @returns The element with the target tabIndex or null
 */
export function findElementByTabIndex(
  targetTabIndex: number,
  container: HTMLElement | Document = document
): HTMLElement | null {
  const selector = `[tabindex="${targetTabIndex}"]`;
  const element = container.querySelector<HTMLElement>(selector);
  
  if (element && !element.hasAttribute('disabled')) {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    return isVisible ? element : null;
  }
  
  return null;
}

/**
 * Focus an element by its tabIndex
 * @param targetTabIndex - The tabIndex of the element to focus
 * @param container - Optional container to search within
 * @returns Boolean indicating if focus was successful
 */
export function focusByTabIndex(
  targetTabIndex: number,
  container?: HTMLElement | Document
): boolean {
  const element = findElementByTabIndex(targetTabIndex, container);
  
  if (element) {
    element.focus();
    
    // If it's an input with text, select it for easy replacement
    if (element instanceof HTMLInputElement && 
        ['text', 'search', 'tel', 'url', 'email'].includes(element.type)) {
      element.select();
    }
    
    return true;
  }
  
  return false;
}