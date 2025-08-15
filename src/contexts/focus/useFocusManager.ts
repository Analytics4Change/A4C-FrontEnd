/**
 * useFocusManager Hook
 * Custom hook for consuming the FocusManagerContext
 */

import React, { useContext, useEffect, useRef, useCallback, useState } from 'react';
import { FocusManagerContext } from './FocusManagerContext';
import {
  FocusableElement,
  FocusableType,
  FocusValidator,
  FocusNavigationOptions,
  FocusChangeReason,
  FocusScope,
  ModalStackEntry,
  NavigationMode
} from './types';
import { getFocusableType, generateElementId } from './utils';

/**
 * Main hook for accessing focus management functionality
 */
export function useFocusManager() {
  const context = useContext(FocusManagerContext);
  
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  
  return context;
}

/**
 * Hook for registering a focusable element
 */
export function useFocusable(
  id?: string,
  options?: {
    type?: FocusableType;
    validator?: FocusValidator;
    skipInNavigation?: boolean;
    tabIndex?: number;
    metadata?: Record<string, any>;
    autoRegister?: boolean;
    scopeId?: string;
  }
) {
  const ref = useRef<HTMLElement>(null);
  const { registerElement, unregisterElement, updateElement, focusField } = useFocusManager();
  const elementIdRef = useRef(id || generateElementId('element'));
  
  // Register element on mount
  useEffect(() => {
    if (options?.autoRegister === false) return;
    
    const element: Omit<FocusableElement, 'registeredAt'> = {
      id: elementIdRef.current,
      ref,
      type: options?.type || (ref.current ? getFocusableType(ref.current) : FocusableType.CUSTOM),
      scopeId: options?.scopeId || 'default',
      validator: options?.validator,
      skipInNavigation: options?.skipInNavigation,
      tabIndex: options?.tabIndex,
      metadata: options?.metadata
    };
    
    registerElement(element);
    
    return () => {
      unregisterElement(elementIdRef.current);
    };
  }, [
    registerElement,
    unregisterElement,
    options?.type,
    options?.validator,
    options?.skipInNavigation,
    options?.tabIndex,
    options?.metadata,
    options?.autoRegister,
    options?.scopeId
  ]);
  
  // Focus this element
  const focus = useCallback((reason?: FocusChangeReason) => {
    return focusField(elementIdRef.current, reason);
  }, [focusField]);
  
  // Update element properties
  const update = useCallback((updates: Partial<FocusableElement>) => {
    updateElement(elementIdRef.current, updates);
  }, [updateElement]);
  
  return {
    ref,
    id: elementIdRef.current,
    focus,
    update
  };
}

/**
 * Hook for managing modal focus
 */
export function useModalFocus(
  modalId?: string,
  options?: {
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    preventScroll?: boolean;
    autoFocus?: boolean;
    restoreFocus?: boolean;
  }
) {
  const { openModal, closeModal, isModalOpen, pushScope, popScope } = useFocusManager();
  const scopeIdRef = useRef(modalId || generateElementId('modal'));
  const isOpenRef = useRef(false);
  
  // Open the modal
  const open = useCallback(() => {
    if (isOpenRef.current) return;
    
    const modalOptions: ModalStackEntry['options'] = {
      closeOnEscape: options?.closeOnEscape !== false,
      closeOnOutsideClick: options?.closeOnOutsideClick,
      preventScroll: options?.preventScroll
    };
    
    openModal(scopeIdRef.current, modalOptions);
    isOpenRef.current = true;
  }, [openModal, options]);
  
  // Close the modal
  const close = useCallback(() => {
    if (!isOpenRef.current) return;
    
    closeModal();
    isOpenRef.current = false;
  }, [closeModal]);
  
  // Check if this modal is open
  const isOpen = useCallback(() => {
    return isOpenRef.current && isModalOpen();
  }, [isModalOpen]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isOpenRef.current) {
        closeModal();
      }
    };
  }, [closeModal]);
  
  return {
    scopeId: scopeIdRef.current,
    open,
    close,
    isOpen
  };
}

/**
 * Hook for keyboard navigation
 */
export function useFocusNavigation(options?: FocusNavigationOptions) {
  const { focusNext, focusPrevious, focusFirst, focusLast } = useFocusManager();
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Tab':
        if (!e.defaultPrevented) {
          if (e.shiftKey) {
            if (focusPrevious(options)) {
              e.preventDefault();
            }
          } else {
            if (focusNext(options)) {
              e.preventDefault();
            }
          }
        }
        break;
      
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          if (focusFirst(options)) {
            e.preventDefault();
          }
        }
        break;
      
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          if (focusLast(options)) {
            e.preventDefault();
          }
        }
        break;
    }
  }, [focusNext, focusPrevious, focusFirst, focusLast, options]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    navigateNext: () => focusNext(options),
    navigatePrevious: () => focusPrevious(options),
    navigateFirst: () => focusFirst(options),
    navigateLast: () => focusLast(options)
  };
}

/**
 * Hook for focus history
 */
export function useFocusHistory() {
  const { undoFocus, redoFocus, clearHistory, getHistory, state } = useFocusManager();
  
  return {
    undo: undoFocus,
    redo: redoFocus,
    clear: clearHistory,
    history: getHistory(),
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    currentIndex: state.historyIndex
  };
}

/**
 * Hook for scope management
 */
export function useFocusScope(
  scopeId?: string,
  options?: {
    trapFocus?: boolean;
    autoFocus?: boolean;
    restoreFocusOnClose?: boolean;
  }
) {
  const { pushScope, popScope, getCurrentScope, getElementsInScope } = useFocusManager();
  const scopeIdRef = useRef(scopeId || generateElementId('scope'));
  const isActiveRef = useRef(false);
  
  // Activate the scope
  const activate = useCallback(() => {
    if (isActiveRef.current) return;
    
    const scope: Omit<FocusScope, 'createdAt'> = {
      id: scopeIdRef.current,
      type: 'default',
      trapFocus: options?.trapFocus || false,
      autoFocus: options?.autoFocus || false,
      restoreFocusTo: options?.restoreFocusOnClose ? document.activeElement?.id : undefined
    };
    
    pushScope(scope);
    isActiveRef.current = true;
  }, [pushScope, options]);
  
  // Deactivate the scope
  const deactivate = useCallback(() => {
    if (!isActiveRef.current) return;
    
    popScope();
    isActiveRef.current = false;
  }, [popScope]);
  
  // Get elements in this scope
  const getElements = useCallback(() => {
    return getElementsInScope(scopeIdRef.current);
  }, [getElementsInScope]);
  
  // Check if this is the current scope
  const isCurrent = useCallback(() => {
    const current = getCurrentScope();
    return current?.id === scopeIdRef.current;
  }, [getCurrentScope]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActiveRef.current) {
        popScope();
      }
    };
  }, [popScope]);
  
  return {
    scopeId: scopeIdRef.current,
    activate,
    deactivate,
    getElements,
    isCurrent,
    isActive: isActiveRef.current
  };
}

/**
 * Hook for debugging focus operations
 */
export function useFocusDebug() {
  const { state, setDebug } = useFocusManager();
  
  useEffect(() => {
    if (state.debug) {
      console.log('[FocusManager] State:', {
        elements: Array.from(state.elements.entries()),
        scopes: state.scopes,
        activeScopeId: state.activeScopeId,
        currentFocusId: state.currentFocusId,
        modalStack: state.modalStack,
        historyLength: state.history.length,
        historyIndex: state.historyIndex
      });
    }
  }, [state]);
  
  return {
    enableDebug: () => setDebug(true),
    disableDebug: () => setDebug(false),
    isDebugEnabled: state.debug,
    state
  };
}

/**
 * Hook for conditional focus validation
 */
export function useFocusValidation(
  validator: FocusValidator,
  deps: React.DependencyList = []
) {
  const validatorRef = useRef(validator);
  
  useEffect(() => {
    validatorRef.current = validator;
  }, deps);
  
  return validatorRef.current;
}

/**
 * Hook for focus trap within a container
 */
export function useFocusTrap(
  enabled: boolean = true,
  options?: {
    initialFocus?: string;
    returnFocus?: boolean;
    escapeDeactivates?: boolean;
  }
) {
  const { pushScope, popScope, focusFirst } = useFocusManager();
  const scopeId = useRef(generateElementId('trap'));
  const previousFocus = useRef<Element | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Store previous focus
    previousFocus.current = document.activeElement;
    
    // Create trap scope
    const scope: Omit<FocusScope, 'createdAt'> = {
      id: scopeId.current,
      type: 'default',
      trapFocus: true,
      autoFocus: true,
      restoreFocusTo: options?.returnFocus ? previousFocus.current?.id : undefined
    };
    
    pushScope(scope);
    
    // Focus initial element or first element
    if (options?.initialFocus) {
      // Focus specific element
      const element = document.getElementById(options.initialFocus);
      element?.focus();
    } else {
      // Focus first element in scope
      setTimeout(() => focusFirst(), 50);
    }
    
    return () => {
      popScope();
      
      // Return focus if requested
      if (options?.returnFocus && previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [enabled, pushScope, popScope, focusFirst, options?.initialFocus, options?.returnFocus]);
  
  return scopeId.current;
}

/**
 * Hook for mouse navigation
 */
export function useMouseNavigation(
  elementId: string,
  options?: {
    allowDirectJump?: boolean;
    clickAdvancesBehavior?: 'next' | 'specific' | 'none';
    preserveKeyboardFlow?: boolean;
  }
) {
  const { handleMouseNavigation, canJumpToNode, setNavigationMode } = useFocusManager();
  const [canJump, setCanJump] = useState(false);
  
  useEffect(() => {
    setCanJump(canJumpToNode(elementId));
  }, [elementId, canJumpToNode]);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Convert React event to native MouseEvent for the context
    const nativeEvent = e.nativeEvent;
    handleMouseNavigation(elementId, nativeEvent);
    
    // Set navigation mode to hybrid on click
    setNavigationMode(NavigationMode.HYBRID);
  }, [elementId, handleMouseNavigation, setNavigationMode]);
  
  return {
    onClick: handleClick,
    canJump,
    isClickable: options?.allowDirectJump || canJump,
    'data-clickable': options?.allowDirectJump || canJump ? 'true' : 'false'
  };
}

/**
 * Hook for step indicator integration
 */
export function useStepIndicator() {
  const { getVisibleSteps, handleMouseNavigation, setNavigationMode, canJumpToNode } = useFocusManager();
  const steps = getVisibleSteps();
  
  const handleStepClick = useCallback((stepId: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    // Set navigation mode to hybrid when clicking steps
    setNavigationMode(NavigationMode.HYBRID);
    
    // Check if jumping is allowed
    if (!canJumpToNode(stepId)) {
      console.log(`Cannot jump to step: ${stepId}`);
      return;
    }
    
    // Handle the mouse navigation
    handleMouseNavigation(stepId, event.nativeEvent);
  }, [handleMouseNavigation, setNavigationMode, canJumpToNode]);
  
  return {
    steps,
    onStepClick: handleStepClick
  };
}