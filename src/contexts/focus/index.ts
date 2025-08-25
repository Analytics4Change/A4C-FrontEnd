/**
 * Focus Management System
 * Export all focus management components, hooks, and types
 */

// Main context and provider
export { FocusManagerContext, FocusManagerProvider } from './FocusManagerContext';

// Hooks
export {
  useFocusManager,
  useFocusable,
  useModalFocus,
  useFocusNavigation,
  useFocusHistory,
  useFocusScope,
  useFocusDebug,
  useFocusValidation,
  useFocusTrap,
  useMouseNavigation,
  useStepIndicator
} from './useFocusManager';

// Types
export type {
  FocusManagerState,
  FocusManagerContextValue,
  FocusManagerProviderProps,
  FocusableElement,
  FocusScope,
  FocusNavigationOptions,
  FocusHistoryEntry,
  ModalStackEntry,
  FocusValidator,
  MouseInteraction,
  MouseNavigationConfig,
  VisualIndicatorConfig,
  StepIndicatorData
} from './types';

export {
  FocusableType,
  FocusChangeReason,
  NavigationMode
} from './types';

// Utility functions (for advanced usage)
export {
  FOCUSABLE_SELECTORS,
  isElementVisible,
  isElementInContainer,
  getFocusableType,
  findFocusableElements,
  sortByTabIndex,
  filterElementsByScope,
  applyNavigationOptions,
  validateElement,
  focusElement,
  getNextIndex,
  getPreviousIndex,
  createHistoryEntry,
  findParentScope,
  getChildScopes,
  isModalScope,
  generateScopeId,
  generateElementId,
  getInputElement,
  debugLog,
  isFocusWithinScope,
  restoreFocus
} from './utils';