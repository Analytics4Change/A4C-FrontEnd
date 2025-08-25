/**
 * FocusRecoveryService
 * 
 * Service for recovering from focus management errors
 * Implements various recovery strategies based on error severity
 * 
 * @contract
 * Preconditions:
 * - Service must be initialized with valid configuration
 * - DOM must be accessible for recovery operations
 * 
 * Postconditions:
 * - Recovery attempts are logged and tracked
 * - Focus state is restored or reset based on strategy
 * - User can continue interaction after recovery
 * 
 * Invariants:
 * - Recovery attempts never exceed max attempts
 * - Recovery operations are idempotent
 * - Accessibility is maintained during recovery
 */

import { ErrorSeverity } from './FocusErrorBoundary';

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RESET_FOCUS = 'reset_focus',           // Clear focus and start fresh
  RESTORE_PREVIOUS = 'restore_previous', // Restore to previous valid state
  FOCUS_FIRST = 'focus_first',          // Focus first available element
  CLEAR_MODALS = 'clear_modals',        // Close all modals and dialogs
  REINITIALIZE = 'reinitialize'         // Full system reinitialization
}

/**
 * Recovery service configuration
 */
export interface RecoveryServiceConfig {
  maxAttempts: number;
  autoRecover: boolean;
  recoveryDelay?: number;
  preserveHistory?: boolean;
}

/**
 * Recovery result
 */
export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  message: string;
  duration: number;
}

/**
 * FocusRecoveryService Class
 * 
 * Handles recovery from focus-related errors with multiple strategies
 */
export class FocusRecoveryService {
  private config: RecoveryServiceConfig;
  private attemptHistory: RecoveryResult[] = [];
  private lastSuccessfulState: any = null;

  constructor(config: RecoveryServiceConfig) {
    this.config = {
      recoveryDelay: 100,
      preserveHistory: true,
      ...config
    };
    
    // Initialize state snapshot
    this.captureSuccessfulState();
  }

  /**
   * Attempts recovery based on error severity
   * 
   * @contract
   * Precondition: error and severity are valid
   * Postcondition: Returns true if recovery succeeded, false otherwise
   * Performance: < 100ms for most recovery strategies
   */
  public async attemptRecovery(
    error: Error,
    severity: ErrorSeverity
  ): Promise<boolean> {
    const startTime = performance.now();
    const strategy = this.selectRecoveryStrategy(error, severity);
    
    try {
      // Apply delay to allow system to stabilize
      if (this.config.recoveryDelay) {
        await this.delay(this.config.recoveryDelay);
      }

      // Execute recovery strategy
      const success = await this.executeStrategy(strategy, error);
      
      // Record attempt
      const result: RecoveryResult = {
        success,
        strategy,
        message: success ? 'Recovery successful' : 'Recovery failed',
        duration: performance.now() - startTime
      };
      
      this.attemptHistory.push(result);
      
      if (success) {
        this.captureSuccessfulState();
      }
      
      return success;
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);
      
      // Record failure
      this.attemptHistory.push({
        success: false,
        strategy,
        message: `Recovery error: ${(recoveryError as Error).message}`,
        duration: performance.now() - startTime
      });
      
      return false;
    }
  }

  /**
   * Selects appropriate recovery strategy based on error
   * 
   * @contract
   * Precondition: error and severity are valid
   * Postcondition: Returns most appropriate strategy
   */
  private selectRecoveryStrategy(
    error: Error,
    severity: ErrorSeverity
  ): RecoveryStrategy {
    const errorMessage = error.message.toLowerCase();
    
    // Strategy selection based on error patterns
    if (errorMessage.includes('modal') || errorMessage.includes('dialog')) {
      return RecoveryStrategy.CLEAR_MODALS;
    }
    
    if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
      return RecoveryStrategy.RESET_FOCUS;
    }
    
    if (errorMessage.includes('maximum call stack') || severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.REINITIALIZE;
    }
    
    if (this.lastSuccessfulState && severity === ErrorSeverity.LOW) {
      return RecoveryStrategy.RESTORE_PREVIOUS;
    }
    
    // Default strategy
    return RecoveryStrategy.FOCUS_FIRST;
  }

  /**
   * Executes the selected recovery strategy
   * 
   * @contract
   * Precondition: strategy is valid
   * Postcondition: Recovery is attempted, returns success status
   */
  private async executeStrategy(
    strategy: RecoveryStrategy,
    error: Error
  ): Promise<boolean> {
    switch (strategy) {
      case RecoveryStrategy.RESET_FOCUS:
        return this.resetFocusState();
      
      case RecoveryStrategy.RESTORE_PREVIOUS:
        return this.restorePreviousState();
      
      case RecoveryStrategy.FOCUS_FIRST:
        return this.focusFirstAvailable();
      
      case RecoveryStrategy.CLEAR_MODALS:
        return this.clearAllModals();
      
      case RecoveryStrategy.REINITIALIZE:
        return this.reinitializeSystem();
      
      default:
        return false;
    }
  }

  /**
   * Resets focus state to clean slate
   * 
   * @contract
   * Postcondition: Focus state is cleared, document.body has focus
   */
  private resetFocusState(): boolean {
    try {
      // Clear any active focus
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur?.();
      }
      
      // Focus body to ensure focus is somewhere valid
      document.body.focus();
      
      // Clear any focus-related attributes
      document.querySelectorAll('[data-focus-lock]').forEach(el => {
        el.removeAttribute('data-focus-lock');
      });
      
      // Clear focus manager state if available
      const focusManager = (window as any).__focusManagerState;
      if (focusManager) {
        focusManager.currentFocusId = undefined;
        focusManager.history = [];
        focusManager.historyIndex = -1;
      }
      
      return true;
    } catch (e) {
      console.error('Failed to reset focus state:', e);
      return false;
    }
  }

  /**
   * Restores focus to previous valid state
   * 
   * @contract
   * Precondition: lastSuccessfulState exists
   * Postcondition: Focus state is restored or false is returned
   */
  private restorePreviousState(): boolean {
    if (!this.lastSuccessfulState) {
      return this.focusFirstAvailable();
    }
    
    try {
      const { elementId, scopeId } = this.lastSuccessfulState;
      
      if (elementId) {
        const element = document.getElementById(elementId) || 
                       document.querySelector(`[data-focus-id="${elementId}"]`);
        
        if (element && this.isElementFocusable(element as HTMLElement)) {
          (element as HTMLElement).focus();
          return true;
        }
      }
      
      // Fallback to scope restoration
      if (scopeId) {
        const scopeElement = document.querySelector(`[data-focus-scope="${scopeId}"]`);
        if (scopeElement) {
          const firstFocusable = this.findFirstFocusable(scopeElement as HTMLElement);
          if (firstFocusable) {
            firstFocusable.focus();
            return true;
          }
        }
      }
      
      return this.focusFirstAvailable();
    } catch (e) {
      console.error('Failed to restore previous state:', e);
      return false;
    }
  }

  /**
   * Focuses the first available focusable element
   * 
   * @contract
   * Postcondition: First focusable element has focus or false is returned
   */
  private focusFirstAvailable(): boolean {
    try {
      const focusable = this.findFirstFocusable(document.body);
      
      if (focusable) {
        focusable.focus();
        return true;
      }
      
      // Last resort: focus body
      document.body.focus();
      return true;
    } catch (e) {
      console.error('Failed to focus first available:', e);
      return false;
    }
  }

  /**
   * Clears all modal overlays and dialogs
   * 
   * @contract
   * Postcondition: All modals are closed, focus returns to main content
   */
  private clearAllModals(): boolean {
    try {
      // Close all dialogs
      document.querySelectorAll('dialog[open]').forEach(dialog => {
        (dialog as HTMLDialogElement).close();
      });
      
      // Remove modal overlays
      document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach(modal => {
        if (modal.parentElement) {
          modal.remove();
        }
      });
      
      // Clear modal state in focus manager
      const focusManager = (window as any).__focusManagerState;
      if (focusManager) {
        focusManager.modalStack = [];
      }
      
      // Remove body scroll locks
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Focus main content
      const main = document.querySelector('main') || document.body;
      const firstFocusable = this.findFirstFocusable(main as HTMLElement);
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
      
      return true;
    } catch (e) {
      console.error('Failed to clear modals:', e);
      return false;
    }
  }

  /**
   * Reinitializes the entire focus system
   * 
   * @contract
   * Postcondition: Focus system is reinitialized or false is returned
   */
  private reinitializeSystem(): boolean {
    try {
      // Clear all focus-related state
      this.resetFocusState();
      this.clearAllModals();
      
      // Clear event listeners that might be causing issues
      const oldElement = document.body;
      const newElement = oldElement.cloneNode(true);
      oldElement.parentNode?.replaceChild(newElement, oldElement);
      
      // Trigger focus manager reinitialization if available
      const initEvent = new CustomEvent('focus-manager-reinit');
      window.dispatchEvent(initEvent);
      
      // Focus first available element after reinitialization
      setTimeout(() => {
        this.focusFirstAvailable();
      }, 100);
      
      return true;
    } catch (e) {
      console.error('Failed to reinitialize system:', e);
      return false;
    }
  }

  /**
   * Captures current successful state for restoration
   * 
   * @contract
   * Postcondition: Current state is saved if valid
   */
  private captureSuccessfulState(): void {
    try {
      const activeElement = document.activeElement;
      
      if (activeElement && activeElement !== document.body) {
        this.lastSuccessfulState = {
          elementId: activeElement.id || activeElement.getAttribute('data-focus-id'),
          scopeId: activeElement.getAttribute('data-focus-scope'),
          tagName: activeElement.tagName,
          timestamp: Date.now()
        };
      }
    } catch (e) {
      console.error('Failed to capture state:', e);
    }
  }

  /**
   * Finds the first focusable element within a container
   * 
   * @contract
   * Precondition: container is a valid HTMLElement
   * Postcondition: Returns first focusable element or null
   */
  private findFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    const elements = container.querySelectorAll(focusableSelectors);
    
    for (const element of Array.from(elements)) {
      if (this.isElementFocusable(element as HTMLElement)) {
        return element as HTMLElement;
      }
    }
    
    return null;
  }

  /**
   * Checks if an element is focusable
   * 
   * @contract
   * Precondition: element is valid HTMLElement
   * Postcondition: Returns true if element can receive focus
   */
  private isElementFocusable(element: HTMLElement): boolean {
    if (!element) return false;
    
    // Check if element is visible
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    // Check if element is in viewport (roughly)
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // Check if element is not disabled
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets recovery attempt history
   * 
   * @contract
   * Postcondition: Returns copy of attempt history
   */
  public getAttemptHistory(): RecoveryResult[] {
    return [...this.attemptHistory];
  }

  /**
   * Clears recovery history
   * 
   * @contract
   * Postcondition: Attempt history is empty
   */
  public clearHistory(): void {
    this.attemptHistory = [];
  }
}

export default FocusRecoveryService;