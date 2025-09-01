import { useReducer, useMemo, useCallback } from 'react';
import { useDropdownBlur } from './useDropdownBlur';

/**
 * Dropdown state for a single field
 */
export type DropdownState = 'closed' | 'opening' | 'open' | 'closing';

/**
 * Action types for dropdown state transitions
 */
type DropdownAction = 
  | { type: 'OPEN'; field: string }
  | { type: 'CLOSE'; field: string }
  | { type: 'TOGGLE'; field: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_STATE'; field: string; state: DropdownState };

/**
 * State shape for all managed dropdowns
 */
type DropdownStates = Record<string, DropdownState>;

/**
 * Handlers for a single dropdown field
 */
export interface DropdownHandlers {
  open: () => void;
  close: () => void;
  toggle: () => void;
  blur: (e: React.FocusEvent) => void;
  isOpen: boolean;
  state: DropdownState;
}

/**
 * Configuration for the dropdown manager
 */
export interface DropdownManagerConfig {
  /** Allow multiple dropdowns to be open simultaneously */
  allowMultiple?: boolean;
  /** Callback when any dropdown opens */
  onOpen?: (field: string) => void;
  /** Callback when any dropdown closes */
  onClose?: (field: string) => void;
  /** Transition duration for animations */
  transitionDuration?: number;
}

/**
 * Reducer for dropdown state management
 */
function dropdownReducer(
  state: DropdownStates, 
  action: DropdownAction,
  config: DropdownManagerConfig
): DropdownStates {
  switch (action.type) {
    case 'OPEN': {
      const newState = { ...state };
      
      // Close other dropdowns if not allowing multiple
      if (!config.allowMultiple) {
        Object.keys(newState).forEach(field => {
          if (field !== action.field && newState[field] === 'open') {
            newState[field] = 'closing';
          }
        });
      }
      
      newState[action.field] = 'opening';
      
      // Transition to open after animation
      if (config.transitionDuration) {
        setTimeout(() => {
          newState[action.field] = 'open';
        }, config.transitionDuration);
      } else {
        newState[action.field] = 'open';
      }
      
      config.onOpen?.(action.field);
      return newState;
    }
    
    case 'CLOSE': {
      if (state[action.field] === 'closed') return state;
      
      const newState = { ...state };
      newState[action.field] = 'closing';
      
      // Transition to closed after animation
      if (config.transitionDuration) {
        setTimeout(() => {
          newState[action.field] = 'closed';
        }, config.transitionDuration);
      } else {
        newState[action.field] = 'closed';
      }
      
      config.onClose?.(action.field);
      return newState;
    }
    
    case 'TOGGLE': {
      const currentState = state[action.field] || 'closed';
      const nextAction: DropdownAction = 
        currentState === 'closed' || currentState === 'closing'
          ? { type: 'OPEN', field: action.field }
          : { type: 'CLOSE', field: action.field };
      return dropdownReducer(state, nextAction, config);
    }
    
    case 'CLOSE_ALL': {
      const newState = { ...state };
      Object.keys(newState).forEach(field => {
        if (newState[field] === 'open' || newState[field] === 'opening') {
          newState[field] = 'closed';
          config.onClose?.(field);
        }
      });
      return newState;
    }
    
    case 'SET_STATE': {
      return { ...state, [action.field]: action.state };
    }
    
    default:
      return state;
  }
}

/**
 * Hook for managing multiple dropdown states in a form
 * 
 * @param fields - Array of field names to manage dropdowns for
 * @param config - Configuration options
 * @returns Object with dropdown states and handlers for each field
 * 
 * @example
 * ```tsx
 * const { states, handlers, closeAll } = useDropdownManager(
 *   ['category', 'formType', 'unit'],
 *   { allowMultiple: false }
 * );
 * 
 * // Use in component
 * <Input
 *   onFocus={handlers.category.open}
 *   onBlur={handlers.category.blur}
 * />
 * {handlers.category.isOpen && <Dropdown />}
 * ```
 */
export function useDropdownManager(
  fields: string[],
  config: DropdownManagerConfig = {}
): {
  states: DropdownStates;
  handlers: Record<string, DropdownHandlers>;
  closeAll: () => void;
  openField: (field: string) => void;
  closeField: (field: string) => void;
} {
  // Initialize state for all fields
  const initialState = useMemo(
    () => fields.reduce<DropdownStates>((acc, field) => ({ ...acc, [field]: 'closed' }), {}),
    [fields]
  );
  
  // Create reducer with config closure
  const reducerWithConfig = useCallback(
    (state: DropdownStates, action: DropdownAction) => 
      dropdownReducer(state, action, config),
    [config]
  );
  
  const [states, dispatch] = useReducer(reducerWithConfig, initialState);
  
  // Create handlers for each field
  const handlers = useMemo(() => {
    const handlersObj: Record<string, DropdownHandlers> = {};
    
    fields.forEach(field => {
      const state = states[field] || 'closed';
      const isOpen = state === 'open' || state === 'opening';
      
      handlersObj[field] = {
        open: () => dispatch({ type: 'OPEN', field }),
        close: () => dispatch({ type: 'CLOSE', field }),
        toggle: () => dispatch({ type: 'TOGGLE', field }),
        blur: useDropdownBlur(() => dispatch({ type: 'CLOSE', field })),
        isOpen,
        state
      };
    });
    
    return handlersObj;
  }, [fields, states]);
  
  // Global actions
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), []);
  const openField = useCallback((field: string) => dispatch({ type: 'OPEN', field }), []);
  const closeField = useCallback((field: string) => dispatch({ type: 'CLOSE', field }), []);
  
  return {
    states,
    handlers,
    closeAll,
    openField,
    closeField
  };
}

/**
 * Hook for managing a single dropdown state
 * 
 * @param config - Configuration options
 * @returns Dropdown state and handlers
 * 
 * @example
 * ```tsx
 * const dropdown = useSingleDropdown();
 * 
 * <Input onFocus={dropdown.open} onBlur={dropdown.blur} />
 * {dropdown.isOpen && <Dropdown />}
 * ```
 */
export function useSingleDropdown(config: Omit<DropdownManagerConfig, 'allowMultiple'> = {}) {
  const { handlers } = useDropdownManager(['default'], config);
  return handlers.default;
}