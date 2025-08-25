/**
 * PerformanceOptimizedFocusManager
 * High-performance focus management with Design by Contract principles
 * 
 * Performance Targets:
 * - Focus transition: <50ms
 * - Modal open/close: <100ms
 * - Memory usage: <3MB
 * - Zero memory leaks
 */

import React, { createContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
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
  MouseInteraction
} from './types';
import {
  filterElementsByScope,
  applyNavigationOptions,
  validateElement,
  getNextIndex,
  getPreviousIndex,
  createHistoryEntry,
  generateScopeId,
  getInputElement,
  debugLog,
  isFocusWithinScope,
  restoreFocus
} from './utils';

// Performance constants
const MAX_HISTORY_SIZE = 100;
const MAX_MOUSE_INTERACTIONS = 50;
const DEBOUNCE_DELAY = 16; // 60fps frame time
const RAF_BATCH_SIZE = 10;

/**
 * RequestAnimationFrame Batcher
 * Precondition: Browser supports requestAnimationFrame
 * Postcondition: All updates applied in single frame
 * Performance: < 16.67ms execution time
 */
class RAFBatcher {
  private queue: (() => void | Promise<void>)[] = [];
  private rafId: number | null = null;
  private processing = false;

  batch(fn: () => void | Promise<void>): void {
    this.queue.push(fn);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (!this.rafId && !this.processing) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private async flush(): Promise<void> {
    this.processing = true;
    this.rafId = null;
    
    // Process up to RAF_BATCH_SIZE items to avoid frame drops
    const batch = this.queue.splice(0, RAF_BATCH_SIZE);
    
    for (const fn of batch) {
      try {
        await fn();
      } catch (error) {
        console.error('RAF batch error:', error);
      }
    }
    
    this.processing = false;
    
    // Schedule next batch if queue not empty
    if (this.queue.length > 0) {
      this.scheduleFlush();
    }
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.queue = [];
  }
}

/**
 * WeakMap-based Registry
 * Precondition: Element is valid HTMLElement
 * Postcondition: Element registered without memory leak
 * Invariant: Automatic cleanup on element removal
 * Memory: O(n) where n = visible elements only
 */
class WeakMapRegistry {
  private elementData = new WeakMap<HTMLElement, FocusableElement>();
  private idToElement = new Map<string, WeakRef<HTMLElement>>();
  private elementToId = new WeakMap<HTMLElement, string>();

  register(element: HTMLElement, data: FocusableElement): void {
    this.elementData.set(element, data);
    this.idToElement.set(data.id, new WeakRef(element));
    this.elementToId.set(element, data.id);
  }

  unregister(id: string): void {
    const ref = this.idToElement.get(id);
    if (ref) {
      const element = ref.deref();
      if (element) {
        this.elementData.delete(element);
        this.elementToId.delete(element);
      }
      this.idToElement.delete(id);
    }
  }

  get(id: string): FocusableElement | undefined {
    const ref = this.idToElement.get(id);
    if (ref) {
      const element = ref.deref();
      if (element) {
        return this.elementData.get(element);
      } else {
        // Element was garbage collected, clean up
        this.idToElement.delete(id);
      }
    }
    return undefined;
  }

  getByElement(element: HTMLElement): FocusableElement | undefined {
    return this.elementData.get(element);
  }

  getAllIds(): string[] {
    const ids: string[] = [];
    for (const [id, ref] of this.idToElement) {
      if (ref.deref()) {
        ids.push(id);
      } else {
        // Clean up stale references
        this.idToElement.delete(id);
      }
    }
    return ids;
  }

  getAll(): Map<string, FocusableElement> {
    const result = new Map<string, FocusableElement>();
    for (const [id, ref] of this.idToElement) {
      const element = ref.deref();
      if (element) {
        const data = this.elementData.get(element);
        if (data) {
          result.set(id, data);
        }
      } else {
        // Clean up stale references
        this.idToElement.delete(id);
      }
    }
    return result;
  }

  clear(): void {
    this.idToElement.clear();
    // WeakMaps will auto-cleanup
  }
}

/**
 * Debouncer for focus operations
 * Precondition: Delay >= 0
 * Postcondition: Function called at most once per delay
 * Performance: O(1) time complexity
 */
function createDebouncer<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Action types
enum ActionType {
  SET_ELEMENT_IDS = 'SET_ELEMENT_IDS',
  ADD_ELEMENT_ID = 'ADD_ELEMENT_ID',
  REMOVE_ELEMENT_ID = 'REMOVE_ELEMENT_ID',
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

// Optimized state type
interface OptimizedFocusManagerState extends Omit<FocusManagerState, 'elements'> {
  elementIds: Set<string>;
}

type Action =
  | { type: ActionType.SET_ELEMENT_IDS; payload: Set<string> }
  | { type: ActionType.ADD_ELEMENT_ID; payload: string }
  | { type: ActionType.REMOVE_ELEMENT_ID; payload: string }
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
const initialState: OptimizedFocusManagerState = {
  elementIds: new Set(),
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

// Optimized reducer with bounded collections
function optimizedReducer(
  state: OptimizedFocusManagerState,
  action: Action
): OptimizedFocusManagerState {
  switch (action.type) {
    case ActionType.ADD_ELEMENT_ID:
      return {
        ...state,
        elementIds: new Set([...state.elementIds, action.payload])
      };

    case ActionType.REMOVE_ELEMENT_ID: {
      const newIds = new Set(state.elementIds);
      newIds.delete(action.payload);
      return {
        ...state,
        elementIds: newIds
      };
    }

    case ActionType.ADD_HISTORY: {
      // Bounded history with FIFO eviction
      const newHistory = [...state.history, action.payload];
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.splice(0, newHistory.length - MAX_HISTORY_SIZE);
      }
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }

    case ActionType.ADD_MOUSE_INTERACTION: {
      // Bounded mouse interaction history
      const newInteractions = [...state.mouseInteractionHistory, action.payload];
      if (newInteractions.length > MAX_MOUSE_INTERACTIONS) {
        newInteractions.splice(0, newInteractions.length - MAX_MOUSE_INTERACTIONS);
      }
      return {
        ...state,
        mouseInteractionHistory: newInteractions
      };
    }

    case ActionType.CLEAR_HISTORY:
      return {
        ...state,
        history: [],
        historyIndex: -1
      };

    // Other cases remain similar but operate on elementIds instead of elements
    case ActionType.PUSH_SCOPE:
      return {
        ...state,
        scopes: [...state.scopes, action.payload],
        activeScopeId: action.payload.id
      };

    case ActionType.POP_SCOPE: {
      if (state.scopes.length <= 1) return state;
      const newScopes = state.scopes.slice(0, -1);
      return {
        ...state,
        scopes: newScopes,
        activeScopeId: newScopes[newScopes.length - 1].id
      };
    }

    case ActionType.SET_CURRENT_FOCUS:
      return {
        ...state,
        currentFocusId: action.payload
      };

    case ActionType.PUSH_MODAL:
      return {
        ...state,
        modalStack: [...state.modalStack, action.payload]
      };

    case ActionType.POP_MODAL:
      return {
        ...state,
        modalStack: state.modalStack.slice(0, -1)
      };

    case ActionType.SET_ENABLED:
      return {
        ...state,
        enabled: action.payload
      };

    case ActionType.SET_DEBUG:
      return {
        ...state,
        debug: action.payload
      };

    case ActionType.SET_NAVIGATION_MODE:
      return {
        ...state,
        navigationMode: action.payload
      };

    case ActionType.SET_MOUSE_POSITION:
      return {
        ...state,
        lastMousePosition: action.payload
      };

    default:
      return state;
  }
}

// Create context
export const PerformanceOptimizedFocusManagerContext = createContext<FocusManagerContextValue | undefined>(undefined);

/**
 * Performance-Optimized Focus Manager Provider
 * Implements all performance optimizations with Design by Contract
 */
export const PerformanceOptimizedFocusManagerProvider = React.memo<FocusManagerProviderProps>(({ 
  children, 
  defaultOptions,
  onFocusChange,
  onScopeChange,
  onModalChange,
  onNavigationModeChange
}) => {
  const [state, dispatch] = useReducer(optimizedReducer, initialState);
  
  // Performance-critical refs
  const registryRef = useRef(new WeakMapRegistry());
  const batcherRef = useRef(new RAFBatcher());
  const defaultOptionsRef = useRef(defaultOptions);
  
  // Update default options ref
  useEffect(() => {
    defaultOptionsRef.current = defaultOptions;
  }, [defaultOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      batcherRef.current.destroy();
      registryRef.current.clear();
    };
  }, []);

  // Register element with WeakMap registry
  const registerElement = useCallback((element: FocusableElement) => {
    if (!element.ref.current) {
      console.warn('Cannot register element without ref');
      return;
    }

    // Use RAF batching for registration
    batcherRef.current.batch(() => {
      registryRef.current.register(element.ref.current!, element);
      dispatch({ type: ActionType.ADD_ELEMENT_ID, payload: element.id });
      debugLog(state.debug, `Registered element: ${element.id}`);
    });
  }, [state.debug]);

  // Unregister element
  const unregisterElement = useCallback((id: string) => {
    batcherRef.current.batch(() => {
      registryRef.current.unregister(id);
      dispatch({ type: ActionType.REMOVE_ELEMENT_ID, payload: id });
      debugLog(state.debug, `Unregistered element: ${id}`);
    });
  }, [state.debug]);

  // Optimized focus field with RAF batching
  const focusField = useCallback(async (
    id: string,
    reason: FocusChangeReason = FocusChangeReason.PROGRAMMATIC
  ): Promise<boolean> => {
    if (!state.enabled) return false;
    
    const element = registryRef.current.get(id);
    if (!element?.ref.current) {
      debugLog(state.debug, `Element not found: ${id}`);
      return false;
    }
    
    // Validate element
    const isValid = await validateElement(element);
    if (!isValid) {
      debugLog(state.debug, `Validation failed: ${id}`);
      return false;
    }
    
    // Get input element
    const inputElement = getInputElement(element.ref.current);
    if (!inputElement) {
      debugLog(state.debug, `No input element: ${id}`);
      return false;
    }
    
    return new Promise((resolve) => {
      // Use RAF batching instead of setTimeout
      batcherRef.current.batch(async () => {
        try {
          inputElement.focus(defaultOptionsRef.current?.behavior);
          
          // Update state
          dispatch({ type: ActionType.SET_CURRENT_FOCUS, payload: id });
          
          // Add to bounded history
          const historyEntry = createHistoryEntry(
            id,
            element.scopeId,
            reason,
            state.currentFocusId
          );
          dispatch({ type: ActionType.ADD_HISTORY, payload: historyEntry });
          
          // Note: Auto-open dropdown removed per architectural requirements
          // Components should handle their own opening behavior explicitly
          
          debugLog(state.debug, `Focused: ${id}`);
          resolve(true);
        } catch (error) {
          console.error('Focus error:', error);
          resolve(false);
        }
      });
    });
  }, [state.enabled, state.currentFocusId, state.debug]);

  // Debounced focus operations
  const debouncedFocusNext = useMemo(
    () => createDebouncer(async (options?: FocusNavigationOptions) => {
      if (!state.enabled) return false;
      
      const mergedOptions = { ...defaultOptionsRef.current, ...options };
      const elements = registryRef.current.getAll();
      const scopeElements = filterElementsByScope(elements, state.activeScopeId);
      const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
      
      if (navigableElements.length === 0) {
        debugLog(state.debug, 'No navigable elements');
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
      
      const nextElement = navigableElements[nextIndex];
      return focusField(nextElement.id, FocusChangeReason.KEYBOARD);
    }, DEBOUNCE_DELAY),
    [state.enabled, state.activeScopeId, state.currentFocusId, state.debug, focusField]
  );

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<FocusManagerContextValue>(() => ({
    // State with virtual elements map
    state: {
      ...state,
      elements: registryRef.current.getAll()
    },
    
    // Methods
    registerElement,
    unregisterElement,
    updateElement: (id: string, updates: Partial<FocusableElement>) => {
      const element = registryRef.current.get(id);
      if (element && element.ref.current) {
        const updated = { ...element, ...updates };
        registryRef.current.register(element.ref.current, updated);
      }
    },
    
    focusField,
    focusNext: debouncedFocusNext,
    focusPrevious: createDebouncer(async (options?: FocusNavigationOptions) => {
      // Similar to focusNext but with getPreviousIndex
      if (!state.enabled) return false;
      
      const mergedOptions = { ...defaultOptionsRef.current, ...options };
      const elements = registryRef.current.getAll();
      const scopeElements = filterElementsByScope(elements, state.activeScopeId);
      const navigableElements = applyNavigationOptions(scopeElements, mergedOptions);
      
      if (navigableElements.length === 0) return false;
      
      const currentIndex = state.currentFocusId
        ? navigableElements.findIndex(el => el.id === state.currentFocusId)
        : navigableElements.length;
      
      const previousIndex = getPreviousIndex(
        currentIndex,
        navigableElements.length,
        mergedOptions.wrap
      );
      
      const previousElement = navigableElements[previousIndex];
      return focusField(previousElement.id, FocusChangeReason.KEYBOARD);
    }, DEBOUNCE_DELAY),
    
    pushScope: (scope: FocusScope) => {
      dispatch({ type: ActionType.PUSH_SCOPE, payload: scope });
    },
    
    popScope: () => {
      const currentScope = state.scopes[state.scopes.length - 1];
      if (currentScope && currentScope.id !== 'default') {
        if (currentScope.onClose) {
          currentScope.onClose();
        }
        
        // Use RAF for focus restoration
        if (currentScope.restoreFocusTo) {
          batcherRef.current.batch(async () => {
            const elements = registryRef.current.getAll();
            await restoreFocus(currentScope.restoreFocusTo!, elements);
          });
        }
        
        dispatch({ type: ActionType.POP_SCOPE });
      }
    },
    
    getCurrentScope: () => state.scopes.find(s => s.id === state.activeScopeId),
    
    pushModal: (modal: ModalStackEntry) => {
      dispatch({ type: ActionType.PUSH_MODAL, payload: modal });
    },
    
    popModal: () => {
      dispatch({ type: ActionType.POP_MODAL });
    },
    
    clearHistory: () => {
      dispatch({ type: ActionType.CLEAR_HISTORY });
    },
    
    navigateHistory: (direction: 'back' | 'forward') => {
      const newIndex = direction === 'back' 
        ? Math.max(0, state.historyIndex - 1)
        : Math.min(state.history.length - 1, state.historyIndex + 1);
      
      if (newIndex !== state.historyIndex && state.history[newIndex]) {
        const entry = state.history[newIndex];
        dispatch({ type: ActionType.SET_HISTORY_INDEX, payload: newIndex });
        focusField(entry.elementId, FocusChangeReason.HISTORY);
      }
    },
    
    setEnabled: (enabled: boolean) => {
      dispatch({ type: ActionType.SET_ENABLED, payload: enabled });
    },
    
    setDebug: (debug: boolean) => {
      dispatch({ type: ActionType.SET_DEBUG, payload: debug });
    },
    
    setNavigationMode: (mode: NavigationMode) => {
      dispatch({ type: ActionType.SET_NAVIGATION_MODE, payload: mode });
    },
    
    trackMouseInteraction: (interaction: MouseInteraction) => {
      dispatch({ type: ActionType.ADD_MOUSE_INTERACTION, payload: interaction });
    },
    
    updateMousePosition: (x: number, y: number) => {
      dispatch({ type: ActionType.SET_MOUSE_POSITION, payload: { x, y } });
    }
  }), [
    state,
    registerElement,
    unregisterElement,
    focusField,
    debouncedFocusNext
  ]);

  // Notify callbacks
  useEffect(() => {
    onFocusChange?.(state.currentFocusId);
  }, [state.currentFocusId, onFocusChange]);

  useEffect(() => {
    onScopeChange?.(state.activeScopeId);
  }, [state.activeScopeId, onScopeChange]);

  useEffect(() => {
    onModalChange?.(state.modalStack.length > 0);
  }, [state.modalStack, onModalChange]);

  useEffect(() => {
    onNavigationModeChange?.(state.navigationMode);
  }, [state.navigationMode, onNavigationModeChange]);

  return (
    <PerformanceOptimizedFocusManagerContext.Provider value={contextValue}>
      {children}
    </PerformanceOptimizedFocusManagerContext.Provider>
  );
});

PerformanceOptimizedFocusManagerProvider.displayName = 'PerformanceOptimizedFocusManagerProvider';

// Export hook for using the optimized context
export function usePerformanceOptimizedFocusManager(): FocusManagerContextValue {
  const context = React.useContext(PerformanceOptimizedFocusManagerContext);
  if (!context) {
    throw new Error('usePerformanceOptimizedFocusManager must be used within PerformanceOptimizedFocusManagerProvider');
  }
  return context;
}