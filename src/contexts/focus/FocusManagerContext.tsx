/**
 * FocusManagerContext
 * Core context for managing focus across the application
 */

import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  FocusManagerState,
  FocusManagerContextValue,
  FocusManagerProviderProps,
  FocusableElement,
  FocusScope,
  FocusNavigationOptions,
  FocusChangeReason,
  FocusHistoryEntry,
  ModalStackEntry,
  NavigationMode,
  MouseInteraction,
  StepIndicatorData
} from './types';
import {
  filterElementsByScope,
  applyNavigationOptions,
  validateElement,
  focusElement,
  getNextIndex,
  getPreviousIndex,
  createHistoryEntry,
  generateScopeId,
  getInputElement,
  openDropdownIfNeeded,
  debugLog,
  isFocusWithinScope,
  restoreFocus
} from './utils';

// Action types for the reducer
enum ActionType {
  REGISTER_ELEMENT = 'REGISTER_ELEMENT',
  UNREGISTER_ELEMENT = 'UNREGISTER_ELEMENT',
  UPDATE_ELEMENT = 'UPDATE_ELEMENT',
  PUSH_SCOPE = 'PUSH_SCOPE',
  POP_SCOPE = 'POP_SCOPE',
  SET_CURRENT_FOCUS = 'SET_CURRENT_FOCUS',
  ADD_HISTORY = 'ADD_HISTORY',
  SET_HISTORY_INDEX = 'SET_HISTORY_INDEX',
  PUSH_MODAL = 'PUSH_MODAL',
  POP_MODAL = 'POP_MODAL',
  SET_ENABLED = 'SET_ENABLED',
  SET_DEBUG = 'SET_DEBUG',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  SET_NAVIGATION_MODE = 'SET_NAVIGATION_MODE',
  ADD_MOUSE_INTERACTION = 'ADD_MOUSE_INTERACTION',
  SET_MOUSE_POSITION = 'SET_MOUSE_POSITION'
}

type Action =
  | { type: ActionType.REGISTER_ELEMENT; payload: FocusableElement }
  | { type: ActionType.UNREGISTER_ELEMENT; payload: string }
  | { type: ActionType.UPDATE_ELEMENT; payload: { id: string; updates: Partial<FocusableElement> } }
  | { type: ActionType.PUSH_SCOPE; payload: FocusScope }
  | { type: ActionType.POP_SCOPE }
  | { type: ActionType.SET_CURRENT_FOCUS; payload: string | undefined }
  | { type: ActionType.ADD_HISTORY; payload: FocusHistoryEntry }
  | { type: ActionType.SET_HISTORY_INDEX; payload: number }
  | { type: ActionType.PUSH_MODAL; payload: ModalStackEntry }
  | { type: ActionType.POP_MODAL }
  | { type: ActionType.SET_ENABLED; payload: boolean }
  | { type: ActionType.SET_DEBUG; payload: boolean }
  | { type: ActionType.CLEAR_HISTORY }
  | { type: ActionType.SET_NAVIGATION_MODE; payload: NavigationMode }
  | { type: ActionType.ADD_MOUSE_INTERACTION; payload: MouseInteraction }
  | { type: ActionType.SET_MOUSE_POSITION; payload: { x: number; y: number } };

// Initial state
const initialState: FocusManagerState = {
  elements: new Map(),
  scopes: [{ 
    id: 'default', 
    type: 'default', 
    trapFocus: false, 
    autoFocus: false, 
    createdAt: Date.now() 
  }],
  activeScopeId: 'default',
  currentFocusId: undefined,
  history: [],
  historyIndex: -1,
  modalStack: [],
  enabled: true,
  debug: false,
  navigationMode: NavigationMode.KEYBOARD,
  mouseInteractionHistory: [],
  lastMousePosition: { x: 0, y: 0 }
};

// Reducer function
function focusManagerReducer(state: FocusManagerState, action: Action): FocusManagerState {
  switch (action.type) {
    case ActionType.REGISTER_ELEMENT: {
      const newElements = new Map(state.elements);
      newElements.set(action.payload.id, action.payload);
      return { ...state, elements: newElements };
    }
    
    case ActionType.UNREGISTER_ELEMENT: {
      const newElements = new Map(state.elements);
      newElements.delete(action.payload);
      return { ...state, elements: newElements };
    }
    
    case ActionType.UPDATE_ELEMENT: {
      const { id, updates } = action.payload;
      const element = state.elements.get(id);
      if (!element) return state;
      
      const newElements = new Map(state.elements);
      newElements.set(id, { ...element, ...updates });
      return { ...state, elements: newElements };
    }
    
    case ActionType.PUSH_SCOPE: {
      return {
        ...state,
        scopes: [...state.scopes, action.payload],
        activeScopeId: action.payload.id
      };
    }
    
    case ActionType.POP_SCOPE: {
      if (state.scopes.length <= 1) return state;
      
      const newScopes = state.scopes.slice(0, -1);
      const newActiveScopeId = newScopes[newScopes.length - 1].id;
      
      return {
        ...state,
        scopes: newScopes,
        activeScopeId: newActiveScopeId
      };
    }
    
    case ActionType.SET_CURRENT_FOCUS: {
      return { ...state, currentFocusId: action.payload };
    }
    
    case ActionType.ADD_HISTORY: {
      const { maxHistorySize = 50 } = {};
      let newHistory = [...state.history.slice(0, state.historyIndex + 1), action.payload];
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory = newHistory.slice(-maxHistorySize);
      }
      
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }
    
    case ActionType.SET_HISTORY_INDEX: {
      return { ...state, historyIndex: action.payload };
    }
    
    case ActionType.PUSH_MODAL: {
      return {
        ...state,
        modalStack: [...state.modalStack, action.payload]
      };
    }
    
    case ActionType.POP_MODAL: {
      if (state.modalStack.length === 0) return state;
      
      return {
        ...state,
        modalStack: state.modalStack.slice(0, -1)
      };
    }
    
    case ActionType.SET_ENABLED: {
      return { ...state, enabled: action.payload };
    }
    
    case ActionType.SET_DEBUG: {
      return { ...state, debug: action.payload };
    }
    
    case ActionType.CLEAR_HISTORY: {
      return { ...state, history: [], historyIndex: -1 };
    }
    
    case ActionType.SET_NAVIGATION_MODE: {
      return { ...state, navigationMode: action.payload };
    }
    
    case ActionType.ADD_MOUSE_INTERACTION: {
      const maxInteractionHistory = 10;
      let newHistory = [...state.mouseInteractionHistory, action.payload];
      
      // Keep only last N interactions
      if (newHistory.length > maxInteractionHistory) {
        newHistory = newHistory.slice(-maxInteractionHistory);
      }
      
      return { ...state, mouseInteractionHistory: newHistory };
    }
    
    case ActionType.SET_MOUSE_POSITION: {
      return { ...state, lastMousePosition: action.payload };
    }
    
    default:
      return state;
  }
}

// Create the context
export const FocusManagerContext = createContext<FocusManagerContextValue | null>(null);

// Provider component
export function FocusManagerProvider({
  children,
  debug = false,
  enabled = true,
  maxHistorySize = 50,
  defaultOptions
}: FocusManagerProviderProps) {
  const [state, dispatch] = useReducer(focusManagerReducer, {
    ...initialState,
    debug,
    enabled
  });
  
  const defaultOptionsRef = useRef(defaultOptions);
  defaultOptionsRef.current = defaultOptions;
  
  // Register element
  const registerElement = useCallback((element: Omit<FocusableElement, 'registeredAt'>) => {
    const fullElement: FocusableElement = {
      ...element,
      registeredAt: Date.now(),
      canFocus: element.canFocus !== false,
      scopeId: element.scopeId || state.activeScopeId
    };
    
    dispatch({ type: ActionType.REGISTER_ELEMENT, payload: fullElement });
    debugLog(state.debug, `Registered element: ${element.id}`, fullElement);
  }, [state.activeScopeId, state.debug]);
  
  // Unregister element
  const unregisterElement = useCallback((id: string) => {
    dispatch({ type: ActionType.UNREGISTER_ELEMENT, payload: id });
    debugLog(state.debug, `Unregistered element: ${id}`);
  }, [state.debug]);
  
  // Update element
  const updateElement = useCallback((id: string, updates: Partial<FocusableElement>) => {
    dispatch({ type: ActionType.UPDATE_ELEMENT, payload: { id, updates } });
    debugLog(state.debug, `Updated element: ${id}`, updates);
  }, [state.debug]);
  
  // Push scope
  const pushScope = useCallback((scope: Omit<FocusScope, 'createdAt'>) => {
    const fullScope: FocusScope = {
      ...scope,
      createdAt: Date.now()
    };
    
    dispatch({ type: ActionType.PUSH_SCOPE, payload: fullScope });
    debugLog(state.debug, `Pushed scope: ${scope.id}`, fullScope);
    
    // Auto-focus first element if requested
    if (scope.autoFocus) {
      setTimeout(() => {
        const elements = filterElementsByScope(state.elements, scope.id);
        if (elements.length > 0 && elements[0].ref.current) {
          focusField(elements[0].id, FocusChangeReason.PROGRAMMATIC);
        }
      }, 50);
    }
  }, [state.debug, state.elements]);
  
  // Pop scope
  const popScope = useCallback(() => {
    const currentScope = state.scopes[state.scopes.length - 1];
    
    if (currentScope && currentScope.id !== 'default') {
      // Handle scope close callback
      if (currentScope.onClose) {
        currentScope.onClose();
      }
      
      // Restore focus if needed
      if (currentScope.restoreFocusTo) {
        setTimeout(() => {
          restoreFocus(currentScope.restoreFocusTo!, state.elements);
        }, 50);
      }
      
      dispatch({ type: ActionType.POP_SCOPE });
      debugLog(state.debug, `Popped scope: ${currentScope.id}`);
    }
  }, [state.scopes, state.elements, state.debug]);
  
  // Get current scope
  const getCurrentScope = useCallback((): FocusScope | undefined => {
    return state.scopes.find(s => s.id === state.activeScopeId);
  }, [state.scopes, state.activeScopeId]);
  
  // Focus specific field
  const focusField = useCallback(async (
    id: string,
    reason: FocusChangeReason = FocusChangeReason.PROGRAMMATIC
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const element = state.elements.get(id);
    if (!element?.ref.current) {
      debugLog(state.debug, `Element not found or no ref: ${id}`);
      return false;
    }
    
    // Validate if needed
    const isValid = await validateElement(element);
    if (!isValid) {
      debugLog(state.debug, `Validation failed for element: ${id}`);
      return false;
    }
    
    // Get the actual input element
    const inputElement = getInputElement(element.ref.current);
    if (!inputElement) {
      debugLog(state.debug, `No input element found for: ${id}`);
      return false;
    }
    
    // Focus the element
    const success = focusElement(inputElement, defaultOptionsRef.current?.behavior);
    
    if (success) {
      // Update state
      dispatch({ type: ActionType.SET_CURRENT_FOCUS, payload: id });
      
      // Add to history
      const historyEntry = createHistoryEntry(
        id,
        element.scopeId,
        reason,
        state.currentFocusId
      );
      dispatch({ type: ActionType.ADD_HISTORY, payload: historyEntry });
      
      // Open dropdown if needed
      if (element.type === 'combobox' || element.type === 'dropdown') {
        setTimeout(() => openDropdownIfNeeded(inputElement), 50);
      }
      
      debugLog(state.debug, `Focused element: ${id}`, { reason, element });
    }
    
    return success;
  }, [state.enabled, state.elements, state.currentFocusId, state.debug]);
  
  // Focus next element
  const focusNext = useCallback(async (
    options?: FocusNavigationOptions
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const mergedOptions = { ...defaultOptionsRef.current, ...options };
    const scopeElements = filterElementsByScope(state.elements, state.activeScopeId);
    const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
    
    if (navigableElements.length === 0) {
      debugLog(state.debug, 'No navigable elements found');
      return false;
    }
    
    const currentIndex = state.currentFocusId
      ? navigableElements.findIndex(el => el.id === state.currentFocusId)
      : -1;
    
    const nextIndex = getNextIndex(
      currentIndex,
      navigableElements.length,
      mergedOptions.wrap
    );
    
    if (nextIndex === currentIndex && !mergedOptions.wrap) {
      debugLog(state.debug, 'Already at last element, wrapping disabled');
      return false;
    }
    
    const nextElement = navigableElements[nextIndex];
    if (!mergedOptions.skipValidation) {
      const isValid = await validateElement(nextElement);
      if (!isValid) {
        // Try next element if validation fails
        return focusNext({ ...mergedOptions, skipValidation: false });
      }
    }
    
    return focusField(nextElement.id, FocusChangeReason.KEYBOARD);
  }, [state.enabled, state.elements, state.activeScopeId, state.currentFocusId, state.debug, focusField]);
  
  // Focus previous element
  const focusPrevious = useCallback(async (
    options?: FocusNavigationOptions
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const mergedOptions = { ...defaultOptionsRef.current, ...options };
    const scopeElements = filterElementsByScope(state.elements, state.activeScopeId);
    const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
    
    if (navigableElements.length === 0) {
      debugLog(state.debug, 'No navigable elements found');
      return false;
    }
    
    const currentIndex = state.currentFocusId
      ? navigableElements.findIndex(el => el.id === state.currentFocusId)
      : navigableElements.length;
    
    const previousIndex = getPreviousIndex(
      currentIndex,
      navigableElements.length,
      mergedOptions.wrap
    );
    
    if (previousIndex === currentIndex && !mergedOptions.wrap) {
      debugLog(state.debug, 'Already at first element, wrapping disabled');
      return false;
    }
    
    const previousElement = navigableElements[previousIndex];
    if (!mergedOptions.skipValidation) {
      const isValid = await validateElement(previousElement);
      if (!isValid) {
        // Try previous element if validation fails
        return focusPrevious({ ...mergedOptions, skipValidation: false });
      }
    }
    
    return focusField(previousElement.id, FocusChangeReason.KEYBOARD);
  }, [state.enabled, state.elements, state.activeScopeId, state.currentFocusId, state.debug, focusField]);
  
  // Focus first element
  const focusFirst = useCallback(async (
    options?: FocusNavigationOptions
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const mergedOptions = { ...defaultOptionsRef.current, ...options };
    const scopeElements = filterElementsByScope(state.elements, state.activeScopeId);
    const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
    
    if (navigableElements.length === 0) {
      debugLog(state.debug, 'No navigable elements found');
      return false;
    }
    
    for (const element of navigableElements) {
      if (!mergedOptions.skipValidation) {
        const isValid = await validateElement(element);
        if (!isValid) continue;
      }
      
      return focusField(element.id, FocusChangeReason.PROGRAMMATIC);
    }
    
    return false;
  }, [state.enabled, state.elements, state.activeScopeId, state.debug, focusField]);
  
  // Focus last element
  const focusLast = useCallback(async (
    options?: FocusNavigationOptions
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const mergedOptions = { ...defaultOptionsRef.current, ...options };
    const scopeElements = filterElementsByScope(state.elements, state.activeScopeId);
    const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
    
    if (navigableElements.length === 0) {
      debugLog(state.debug, 'No navigable elements found');
      return false;
    }
    
    for (let i = navigableElements.length - 1; i >= 0; i--) {
      const element = navigableElements[i];
      if (!mergedOptions.skipValidation) {
        const isValid = await validateElement(element);
        if (!isValid) continue;
      }
      
      return focusField(element.id, FocusChangeReason.PROGRAMMATIC);
    }
    
    return false;
  }, [state.enabled, state.elements, state.activeScopeId, state.debug, focusField]);
  
  // Open modal
  const openModal = useCallback((scopeId: string, options?: ModalStackEntry['options']) => {
    // Create modal scope
    const modalScope: FocusScope = {
      id: scopeId,
      type: 'modal',
      trapFocus: true,
      autoFocus: true,
      restoreFocusTo: state.currentFocusId,
      createdAt: Date.now()
    };
    
    // Push scope
    pushScope(modalScope);
    
    // Add to modal stack
    const modalEntry: ModalStackEntry = {
      scopeId,
      previousFocusId: state.currentFocusId,
      options
    };
    dispatch({ type: ActionType.PUSH_MODAL, payload: modalEntry });
    
    debugLog(state.debug, `Opened modal: ${scopeId}`, modalEntry);
  }, [state.currentFocusId, state.debug, pushScope]);
  
  // Close modal
  const closeModal = useCallback(() => {
    if (state.modalStack.length === 0) return;
    
    const currentModal = state.modalStack[state.modalStack.length - 1];
    
    // Pop scope
    popScope();
    
    // Pop from modal stack
    dispatch({ type: ActionType.POP_MODAL });
    
    // Restore focus
    if (currentModal.previousFocusId) {
      setTimeout(() => {
        restoreFocus(currentModal.previousFocusId!, state.elements);
      }, 50);
    }
    
    debugLog(state.debug, `Closed modal: ${currentModal.scopeId}`);
  }, [state.modalStack, state.elements, state.debug, popScope]);
  
  // Check if modal is open
  const isModalOpen = useCallback((): boolean => {
    return state.modalStack.length > 0;
  }, [state.modalStack]);
  
  // Undo focus
  const undoFocus = useCallback((): boolean => {
    if (state.historyIndex <= 0) return false;
    
    const previousEntry = state.history[state.historyIndex - 1];
    if (!previousEntry) return false;
    
    dispatch({ type: ActionType.SET_HISTORY_INDEX, payload: state.historyIndex - 1 });
    return focusField(previousEntry.elementId, FocusChangeReason.PROGRAMMATIC);
  }, [state.history, state.historyIndex, focusField]);
  
  // Redo focus
  const redoFocus = useCallback((): boolean => {
    if (state.historyIndex >= state.history.length - 1) return false;
    
    const nextEntry = state.history[state.historyIndex + 1];
    if (!nextEntry) return false;
    
    dispatch({ type: ActionType.SET_HISTORY_INDEX, payload: state.historyIndex + 1 });
    return focusField(nextEntry.elementId, FocusChangeReason.PROGRAMMATIC);
  }, [state.history, state.historyIndex, focusField]);
  
  // Clear history
  const clearHistory = useCallback(() => {
    dispatch({ type: ActionType.CLEAR_HISTORY });
    debugLog(state.debug, 'Cleared focus history');
  }, [state.debug]);
  
  // Get history
  const getHistory = useCallback((): FocusHistoryEntry[] => {
    return state.history;
  }, [state.history]);
  
  // Get elements in scope
  const getElementsInScope = useCallback((scopeId?: string): FocusableElement[] => {
    const targetScopeId = scopeId || state.activeScopeId;
    return filterElementsByScope(state.elements, targetScopeId);
  }, [state.elements, state.activeScopeId]);
  
  // Check if element can focus
  const canFocusElement = useCallback((id: string): boolean => {
    const element = state.elements.get(id);
    return element?.canFocus !== false && element?.ref.current !== null;
  }, [state.elements]);
  
  // Set enabled
  const setEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: ActionType.SET_ENABLED, payload: enabled });
    debugLog(state.debug, `Focus management ${enabled ? 'enabled' : 'disabled'}`);
  }, [state.debug]);
  
  // Set debug
  const setDebug = useCallback((debug: boolean) => {
    dispatch({ type: ActionType.SET_DEBUG, payload: debug });
  }, []);
  
  // Set navigation mode
  const setNavigationMode = useCallback((mode: NavigationMode) => {
    dispatch({ type: ActionType.SET_NAVIGATION_MODE, payload: mode });
    debugLog(state.debug, `Navigation mode set to: ${mode}`);
  }, [state.debug]);
  
  // Get navigation mode
  const getNavigationMode = useCallback((): NavigationMode => {
    return state.navigationMode;
  }, [state.navigationMode]);
  
  // Enhanced validation logic for jump navigation
  const canJumpToNode = useCallback((nodeId: string): boolean => {
    const node = state.elements.get(nodeId);
    if (!node) return false;
    
    // Check if node can receive focus
    if (node.canFocus === false) {
      debugLog(state.debug, `Node ${nodeId} cannot receive focus: canFocus is false`);
      return false;
    }
    
    // Check custom validator
    if (node.validator && !node.validator()) {
      debugLog(state.debug, `Node ${nodeId} validator returned false`);
      return false;
    }
    
    // Check mouse navigation settings - allow if explicitly permitted
    if (node.mouseNavigation?.allowDirectJump) {
      debugLog(state.debug, `Node ${nodeId} allows direct jump`);
      return true;
    }
    
    // In hybrid mode, be more permissive
    if (state.navigationMode === NavigationMode.HYBRID) {
      // Allow jumping to visited nodes
      const wasVisited = state.history.some(h => h.elementId === nodeId) ||
                        state.mouseInteractionHistory.some(m => m.elementId === nodeId && m.wasValid);
      if (wasVisited) {
        debugLog(state.debug, `Node ${nodeId} was previously visited, allowing jump in hybrid mode`);
        return true;
      }
    }
    
    // Check if all required previous nodes are complete
    const scopeElements = filterElementsByScope(state.elements, node.scopeId);
    const sortedElements = scopeElements.sort((a, b) => (a.tabIndex || 0) - (b.tabIndex || 0));
    const nodeIndex = sortedElements.findIndex(el => el.id === nodeId);
    
    // Check if previous required elements have been visited
    for (let i = 0; i < nodeIndex; i++) {
      const prevElement = sortedElements[i];
      if (!prevElement.skipInNavigation && prevElement.metadata?.required) {
        const wasVisited = state.history.some(h => h.elementId === prevElement.id) ||
                          state.mouseInteractionHistory.some(m => m.elementId === prevElement.id && m.wasValid);
        if (!wasVisited) {
          debugLog(state.debug, `Cannot jump to ${nodeId}: required element ${prevElement.id} not visited`);
          return false;
        }
      }
    }
    
    return true;
  }, [state.elements, state.history, state.mouseInteractionHistory, state.navigationMode, state.debug]);
  
  // Handle mouse navigation with enhanced validation and feedback
  const handleMouseNavigation = useCallback((nodeId: string, event: MouseEvent) => {
    const node = state.elements.get(nodeId);
    if (!node) {
      debugLog(state.debug, `Node not found for mouse navigation: ${nodeId}`);
      return;
    }
    
    // Check if mouse navigation is allowed
    const canJump = canJumpToNode(nodeId);
    
    // Record interaction in history
    const interaction: MouseInteraction = {
      elementId: nodeId,
      timestamp: Date.now(),
      position: { x: event.clientX, y: event.clientY },
      wasValid: canJump
    };
    dispatch({ type: ActionType.ADD_MOUSE_INTERACTION, payload: interaction });
    
    // Provide visual/auditory feedback for invalid jumps
    if (!canJump && !node.mouseNavigation?.allowDirectJump) {
      debugLog(state.debug, `Direct jump not allowed to: ${nodeId}`);
      
      // Trigger visual feedback for invalid jump attempt
      if (node.ref.current) {
        const element = node.ref.current;
        element.classList.add('focus-invalid-jump');
        setTimeout(() => {
          element.classList.remove('focus-invalid-jump');
        }, 300);
      }
      
      // Dispatch custom event for additional handling
      const invalidJumpEvent = new CustomEvent('focusInvalidJump', {
        detail: { nodeId, reason: 'validation_failed' }
      });
      document.dispatchEvent(invalidJumpEvent);
      
      return;
    }
    
    // Handle navigation based on mode
    if (state.navigationMode === NavigationMode.HYBRID || 
        state.navigationMode === NavigationMode.MOUSE) {
      // Execute focus with mouse-specific behavior
      focusField(nodeId, FocusChangeReason.MOUSE);
      
      // Call custom click handler if provided
      if (node.mouseNavigation?.clickHandler) {
        node.mouseNavigation.clickHandler(event);
      }
      
      // Handle click advances behavior
      if (node.mouseNavigation?.clickAdvancesBehavior === 'next') {
        setTimeout(() => focusNext(), 50);
      } else if (node.mouseNavigation?.clickAdvancesBehavior === 'specific' && 
                 node.mouseNavigation?.clickAdvancesTo) {
        setTimeout(() => focusField(node.mouseNavigation.clickAdvancesTo!, FocusChangeReason.MOUSE), 50);
      }
    }
  }, [state.elements, state.navigationMode, state.debug, canJumpToNode, focusField, focusNext]);
  
  // Get visible steps for step indicator
  const getVisibleSteps = useCallback((): StepIndicatorData[] => {
    const steps: StepIndicatorData[] = [];
    
    state.elements.forEach((element) => {
      if (element.visualIndicator?.showInStepper) {
        const isComplete = state.history.some(h => h.elementId === element.id) ||
                          state.mouseInteractionHistory.some(m => m.elementId === element.id);
        const isCurrent = state.currentFocusId === element.id;
        const canReceiveFocus = element.canFocus !== false && 
                               (!element.validator || element.validator());
        
        let status: StepIndicatorData['status'];
        if (isCurrent) {
          status = 'current';
        } else if (isComplete) {
          status = 'complete';
        } else if (!canReceiveFocus) {
          status = 'disabled';
        } else {
          status = 'upcoming';
        }
        
        steps.push({
          id: element.id,
          label: element.visualIndicator.stepLabel || element.id,
          description: element.visualIndicator.stepDescription,
          status,
          isClickable: canJumpToNode(element.id)
        });
      }
    });
    
    // Sort by tab index or registration order
    return steps.sort((a, b) => {
      const elementA = state.elements.get(a.id);
      const elementB = state.elements.get(b.id);
      const indexA = elementA?.tabIndex || elementA?.registeredAt || 0;
      const indexB = elementB?.tabIndex || elementB?.registeredAt || 0;
      return indexA - indexB;
    });
  }, [state.elements, state.history, state.mouseInteractionHistory, state.currentFocusId, canJumpToNode]);
  
  // Enhanced auto-detection of navigation mode based on user behavior patterns
  useEffect(() => {
    if (!state.enabled) return;
    
    let mouseActivityTimeout: NodeJS.Timeout | null = null;
    let keyboardActivityTimeout: NodeJS.Timeout | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      const moved = Math.abs(e.clientX - state.lastMousePosition.x) > 5 || 
                   Math.abs(e.clientY - state.lastMousePosition.y) > 5;
      
      if (moved) {
        dispatch({ type: ActionType.SET_MOUSE_POSITION, payload: { x: e.clientX, y: e.clientY } });
        
        // Clear keyboard timeout if mouse is being used
        if (keyboardActivityTimeout) {
          clearTimeout(keyboardActivityTimeout);
          keyboardActivityTimeout = null;
        }
        
        // Auto-switch to hybrid mode if currently in keyboard mode
        if (state.navigationMode === NavigationMode.KEYBOARD) {
          setNavigationMode(NavigationMode.HYBRID);
          debugLog(state.debug, 'Switched to HYBRID mode due to mouse movement');
        }
        
        // Set timeout to switch to mouse mode if no keyboard activity
        if (mouseActivityTimeout) clearTimeout(mouseActivityTimeout);
        mouseActivityTimeout = setTimeout(() => {
          if (state.navigationMode === NavigationMode.HYBRID) {
            setNavigationMode(NavigationMode.MOUSE);
            debugLog(state.debug, 'Switched to MOUSE mode due to prolonged mouse-only activity');
          }
        }, 3000); // Switch to mouse mode after 3 seconds of mouse-only activity
      }
    };
    
    const handleKeyboardInteraction = (e: KeyboardEvent) => {
      // Check for navigation keys
      if (['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
        // Clear mouse timeout if keyboard is being used
        if (mouseActivityTimeout) {
          clearTimeout(mouseActivityTimeout);
          mouseActivityTimeout = null;
        }
        
        // Auto-switch to hybrid mode if currently in mouse mode
        if (state.navigationMode === NavigationMode.MOUSE) {
          setNavigationMode(NavigationMode.HYBRID);
          debugLog(state.debug, 'Switched to HYBRID mode due to keyboard interaction');
        }
        
        // Set timeout to switch to keyboard mode if no mouse activity
        if (keyboardActivityTimeout) clearTimeout(keyboardActivityTimeout);
        keyboardActivityTimeout = setTimeout(() => {
          if (state.navigationMode === NavigationMode.HYBRID) {
            setNavigationMode(NavigationMode.KEYBOARD);
            debugLog(state.debug, 'Switched to KEYBOARD mode due to prolonged keyboard-only activity');
          }
        }, 3000); // Switch to keyboard mode after 3 seconds of keyboard-only activity
      }
    };
    
    // Handle mouse clicks as strong indicator of mouse mode
    const handleMouseClick = (e: MouseEvent) => {
      // Record click as strong mouse interaction
      if (state.navigationMode === NavigationMode.KEYBOARD) {
        setNavigationMode(NavigationMode.HYBRID);
        debugLog(state.debug, 'Switched to HYBRID mode due to mouse click');
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyboardInteraction);
    document.addEventListener('click', handleMouseClick);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyboardInteraction);
      document.removeEventListener('click', handleMouseClick);
      if (mouseActivityTimeout) clearTimeout(mouseActivityTimeout);
      if (keyboardActivityTimeout) clearTimeout(keyboardActivityTimeout);
    };
  }, [state.enabled, state.navigationMode, state.lastMousePosition, state.debug, setNavigationMode]);
  
  // Handle keyboard events
  useEffect(() => {
    if (!state.enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentScope = getCurrentScope();
      
      // Handle escape for modals
      if (e.key === 'Escape' && isModalOpen()) {
        const currentModal = state.modalStack[state.modalStack.length - 1];
        if (currentModal?.options?.closeOnEscape !== false) {
          e.preventDefault();
          closeModal();
          return;
        }
      }
      
      // Handle tab navigation
      if (e.key === 'Tab') {
        // Only trap focus if in modal scope
        if (currentScope?.trapFocus) {
          e.preventDefault();
          
          if (e.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.enabled, state.modalStack, getCurrentScope, isModalOpen, closeModal, focusNext, focusPrevious]);
  
  // Context value
  const contextValue: FocusManagerContextValue = {
    state,
    registerElement,
    unregisterElement,
    updateElement,
    pushScope,
    popScope,
    getCurrentScope,
    focusNext,
    focusPrevious,
    focusField,
    focusFirst,
    focusLast,
    openModal,
    closeModal,
    isModalOpen,
    undoFocus,
    redoFocus,
    clearHistory,
    getHistory,
    getElementsInScope,
    canFocusElement,
    setEnabled,
    setDebug,
    handleMouseNavigation,
    setNavigationMode,
    getNavigationMode,
    canJumpToNode,
    getVisibleSteps
  };
  
  return (
    <FocusManagerContext.Provider value={contextValue}>
      {children}
    </FocusManagerContext.Provider>
  );
}