/**
 * Focus Test Helper
 * 
 * Provides enhanced focus management mocking for jsdom environment.
 * Resolves the "Cannot set property focus of [object HTMLElement] which has only a getter" error
 * by implementing a comprehensive focus/blur simulation system.
 * 
 * @module test/utils/focus-test-helper
 */

export interface FocusTestHelperOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Track focus history */
  trackHistory?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
}

/**
 * Enhanced focus management for testing
 * 
 * Contract:
 * - Precondition: DOM is initialized
 * - Postcondition: All focusable elements have working focus/blur methods
 * - Postcondition: document.activeElement is properly tracked
 * - Invariant: Focus state remains consistent across operations
 * - Performance: < 5ms setup time per test
 */
export class FocusTestHelper {
  private activeElement: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private observers: MutationObserver[] = [];
  private options: Required<FocusTestHelperOptions>;
  private originalActiveElement: any;
  private originalFocus: Map<Element, Function> = new Map();
  private originalBlur: Map<Element, Function> = new Map();

  constructor(options: FocusTestHelperOptions = {}) {
    this.options = {
      debug: false,
      trackHistory: true,
      maxHistorySize: 100,
      ...options
    };
  }

  /**
   * Setup focus mocks for testing environment
   * 
   * @returns Cleanup function to restore original behavior
   */
  setupFocusMocks(): () => void {
    this.debug('Setting up focus mocks');
    
    // Save original document.activeElement descriptor
    this.originalActiveElement = Object.getOwnPropertyDescriptor(document, 'activeElement');
    
    // Track active element state
    let activeElementInternal: HTMLElement | null = document.body;
    this.activeElement = activeElementInternal;
    
    // Override document.activeElement
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => {
        return activeElementInternal || document.body;
      }
    });
    
    // Create enhanced focus implementation
    const focusImpl = function(this: HTMLElement) {
      // Skip if already focused
      if (activeElementInternal === this) {
        return;
      }
      
      // Check if element is focusable
      // In test environment, be more lenient about disconnected elements
      if (!this.isConnected && process.env.NODE_ENV !== 'test') {
        console.warn('Cannot focus disconnected element');
        return;
      }
      
      const previousElement = activeElementInternal;
      
      // Blur previous element
      if (previousElement && previousElement !== document.body && previousElement !== this) {
        const blurEvent = new FocusEvent('blur', {
          bubbles: false,
          cancelable: true,
          relatedTarget: this
        });
        previousElement.dispatchEvent(blurEvent);
        
        const focusoutEvent = new FocusEvent('focusout', {
          bubbles: true,
          cancelable: true,
          relatedTarget: this
        });
        previousElement.dispatchEvent(focusoutEvent);
      }
      
      // Update active element
      activeElementInternal = this;
      
      // Dispatch focus events
      const focusEvent = new FocusEvent('focus', {
        bubbles: false,
        cancelable: true,
        relatedTarget: previousElement
      });
      this.dispatchEvent(focusEvent);
      
      const focusinEvent = new FocusEvent('focusin', {
        bubbles: true,
        cancelable: true,
        relatedTarget: previousElement
      });
      this.dispatchEvent(focusinEvent);
    };
    
    // Create enhanced blur implementation
    const blurImpl = function(this: HTMLElement) {
      if (activeElementInternal !== this) {
        return;
      }
      
      const previousElement = activeElementInternal;
      activeElementInternal = document.body;
      
      // Dispatch blur events
      const blurEvent = new FocusEvent('blur', {
        bubbles: false,
        cancelable: true,
        relatedTarget: document.body
      });
      this.dispatchEvent(blurEvent);
      
      const focusoutEvent = new FocusEvent('focusout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: document.body
      });
      this.dispatchEvent(focusoutEvent);
      
      // Focus body
      if (document.body) {
        const bodyFocusEvent = new FocusEvent('focus', {
          bubbles: false,
          cancelable: true,
          relatedTarget: previousElement
        });
        document.body.dispatchEvent(bodyFocusEvent);
      }
    };
    
    // Apply focus/blur to element
    const applyToElement = (element: any) => {
      // Skip if not an element or already processed
      if (!element || typeof element !== 'object' || !('focus' in element)) {
        return;
      }
      
      // Save original methods if they exist
      if (element.focus && !this.originalFocus.has(element)) {
        this.originalFocus.set(element, element.focus);
      }
      if (element.blur && !this.originalBlur.has(element)) {
        this.originalBlur.set(element, element.blur);
      }
      
      // Apply new implementations
      try {
        Object.defineProperty(element, 'focus', {
          configurable: true,
          writable: true,
          value: focusImpl
        });
        
        Object.defineProperty(element, 'blur', {
          configurable: true,
          writable: true,
          value: blurImpl
        });
      } catch (error) {
        // Some elements might not allow property redefinition
        this.debug(`Could not apply focus mock to element: ${error}`);
      }
    };
    
    // Apply to all existing focusable elements
    const focusableSelectors = [
      'input',
      'button', 
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'iframe',
      'object',
      'embed',
      'audio[controls]',
      'video[controls]',
      'area[href]',
      'details > summary:first-of-type'
    ].join(', ');
    
    const elements = document.querySelectorAll(focusableSelectors);
    elements.forEach(applyToElement);
    
    // Apply to document.body
    applyToElement(document.body);
    
    // Monitor DOM mutations for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            applyToElement(node);
            
            // Check children
            const element = node as Element;
            const children = element.querySelectorAll(focusableSelectors);
            children.forEach(applyToElement);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.observers.push(observer);
    
    // Return cleanup function
    return () => this.cleanup();
  }

  /**
   * Clean up all mocks and observers
   */
  private cleanup(): void {
    this.debug('Cleaning up focus mocks');
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Restore original focus/blur methods
    this.originalFocus.forEach((original, element) => {
      try {
        Object.defineProperty(element, 'focus', {
          configurable: true,
          writable: true,
          value: original
        });
      } catch (e) {
        // Element might be removed from DOM
      }
    });
    
    this.originalBlur.forEach((original, element) => {
      try {
        Object.defineProperty(element, 'blur', {
          configurable: true,
          writable: true,
          value: original
        });
      } catch (e) {
        // Element might be removed from DOM
      }
    });
    
    // Clear maps
    this.originalFocus.clear();
    this.originalBlur.clear();
    
    // Restore original document.activeElement
    if (this.originalActiveElement) {
      Object.defineProperty(document, 'activeElement', this.originalActiveElement);
    }
    
    // Clear history
    this.focusHistory = [];
    this.activeElement = null;
  }

  /**
   * Get the currently focused element
   */
  getActiveElement(): HTMLElement | null {
    return document.activeElement as HTMLElement;
  }

  /**
   * Get focus history
   */
  getFocusHistory(): ReadonlyArray<HTMLElement> {
    return [...this.focusHistory];
  }

  /**
   * Clear focus history
   */
  clearHistory(): void {
    this.focusHistory = [];
  }

  /**
   * Add element to focus history
   */
  private addToHistory(element: HTMLElement): void {
    if (!this.options.trackHistory) return;
    
    this.focusHistory.push(element);
    
    // Trim history if too large
    if (this.focusHistory.length > this.options.maxHistorySize) {
      this.focusHistory = this.focusHistory.slice(-this.options.maxHistorySize);
    }
  }

  /**
   * Debug logging
   */
  private debug(message: string): void {
    if (this.options.debug) {
      console.log(`[FocusTestHelper] ${message}`);
    }
  }

  /**
   * Simulate Tab key navigation
   */
  simulateTab(shiftKey = false): void {
    const activeElement = document.activeElement;
    if (!activeElement) return;
    
    const focusableSelectors = [
      'input:not([disabled])',
      'button:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"]):not([disabled])'
    ].join(', ');
    
    const focusables = Array.from(document.querySelectorAll(focusableSelectors))
      .filter(el => {
        const element = el as HTMLElement;
        return element.offsetParent !== null; // visible
      }) as HTMLElement[];
    
    const currentIndex = focusables.indexOf(activeElement as HTMLElement);
    if (currentIndex === -1) return;
    
    let nextIndex: number;
    if (shiftKey) {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = focusables.length - 1;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= focusables.length) nextIndex = 0;
    }
    
    focusables[nextIndex]?.focus();
  }

  /**
   * Check if element is focusable
   */
  isFocusable(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    
    // Check if disabled
    if (element.hasAttribute('disabled')) return false;
    
    // Check tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex === '-1') return false;
    
    // Check if visible
    if (element.offsetParent === null) return false;
    
    // Check element type
    const focusableTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A', 'AREA'];
    if (focusableTags.includes(element.tagName)) return true;
    
    // Has explicit tabindex
    if (tabindex && !isNaN(parseInt(tabindex))) return true;
    
    // Contenteditable
    if (element.contentEditable === 'true') return true;
    
    return false;
  }
}

// Singleton instance for convenience
export const focusTestHelper = new FocusTestHelper();

// Export utility functions
export const setupFocusMocks = () => focusTestHelper.setupFocusMocks();
export const getActiveElement = () => focusTestHelper.getActiveElement();
export const getFocusHistory = () => focusTestHelper.getFocusHistory();
export const simulateTab = (shiftKey = false) => focusTestHelper.simulateTab(shiftKey);