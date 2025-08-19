/**
 * Focus Management System Types
 * Core types for the FocusManagerContext system
 */

import { RefObject } from 'react';

/**
 * Types of focusable elements in the system
 */
export enum FocusableType {
  INPUT = 'input',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  BUTTON = 'button',
  LINK = 'link',
  CUSTOM = 'custom',
  MODAL = 'modal',
  DROPDOWN = 'dropdown',
  COMBOBOX = 'combobox'
}

/**
 * Validation function type for conditional focus
 */
export type FocusValidator = () => boolean | Promise<boolean>;

/**
 * Focus change reasons for history tracking
 */
export enum FocusChangeReason {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  PROGRAMMATIC = 'programmatic',
  VALIDATION = 'validation',
  MODAL_OPEN = 'modal_open',
  MODAL_CLOSE = 'modal_close',
  ESCAPE = 'escape'
}

/**
 * Navigation mode for focus management
 */
export enum NavigationMode {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  HYBRID = 'hybrid',
  AUTO = 'auto'
}

/**
 * Mouse interaction entry for pattern detection
 */
export interface MouseInteraction {
  /** Element ID that was clicked */
  elementId: string;
  /** Timestamp of the interaction */
  timestamp: number;
  /** Position of the click */
  position: { x: number; y: number };
  /** Whether it was a valid jump */
  wasValid: boolean;
}

/**
 * Mouse navigation configuration for elements
 */
export interface MouseNavigationConfig {
  /** Enable click navigation for this element */
  enableClickNavigation?: boolean;
  /** Preserve focus on click */
  preserveFocusOnClick?: boolean;
  /** Click behavior */
  clickAdvancesBehavior?: 'next' | 'specific' | 'none';
  /** Specific element ID to advance to when clickAdvancesBehavior is 'specific' */
  clickAdvancesTo?: string;
  /** Custom click handler */
  clickHandler?: (e: MouseEvent) => void;
  /** Allow direct jump to this element */
  allowDirectJump?: boolean;
  /** Preserve keyboard flow when clicked */
  preserveKeyboardFlow?: boolean;
}

/**
 * Visual indicator configuration for step components
 */
export interface VisualIndicatorConfig {
  /** Show in step indicator */
  showInStepper?: boolean;
  /** Step label */
  stepLabel?: string;
  /** Step description */
  stepDescription?: string;
}

/**
 * Step indicator data for visual progress tracking
 */
export interface StepIndicatorData {
  /** Element ID */
  id: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Current status */
  status: 'complete' | 'current' | 'upcoming' | 'disabled';
  /** Whether the step is clickable */
  isClickable: boolean;
}

/**
 * Metadata for a focusable element
 */
export interface FocusableElement {
  /** Unique identifier for the element */
  id: string;
  /** Reference to the DOM element */
  ref: RefObject<HTMLElement>;
  /** Type of focusable element */
  type: FocusableType;
  /** Scope this element belongs to (for modal isolation) */
  scopeId: string;
  /** Optional validation function to check before focusing */
  validator?: FocusValidator;
  /** Whether the element should be skipped during navigation */
  skipInNavigation?: boolean;
  /** Tab index for custom ordering */
  tabIndex?: number;
  /** Whether this element can be focused */
  canFocus?: boolean;
  /** Optional metadata for the element */
  metadata?: Record<string, any>;
  /** Timestamp when registered */
  registeredAt: number;
  /** Parent element ID if nested */
  parentId?: string;
  /** Whether focus can leave this element (for validation) */
  canLeaveFocus?: (target?: string) => boolean | Promise<boolean>;
  /** Whether this element can receive focus from a specific source */
  canReceiveFocus?: (source?: string) => boolean | Promise<boolean>;
  /** Mouse navigation configuration */
  mouseNavigation?: MouseNavigationConfig;
  /** Visual indicator configuration for step progress */
  visualIndicator?: VisualIndicatorConfig;
}

/**
 * Scope for isolating focus (e.g., modals)
 */
export interface FocusScope {
  /** Unique identifier for the scope */
  id: string;
  /** Type of scope */
  type: 'modal' | 'dropdown' | 'menu' | 'default';
  /** Parent scope ID if nested */
  parentId?: string;
  /** Whether focus should be trapped in this scope */
  trapFocus: boolean;
  /** Element ID to restore focus to when scope closes */
  restoreFocusTo?: string;
  /** Whether to auto-focus first element when scope opens */
  autoFocus: boolean;
  /** Timestamp when scope was created */
  createdAt: number;
  /** Optional close handler */
  onClose?: () => void;
}

/**
 * History entry for focus changes
 */
export interface FocusHistoryEntry {
  /** Element ID that was focused */
  elementId: string;
  /** Scope ID where focus occurred */
  scopeId: string;
  /** Reason for focus change */
  reason: FocusChangeReason;
  /** Timestamp of focus change */
  timestamp: number;
  /** Previous element ID */
  previousElementId?: string;
  /** Additional context data */
  context?: Record<string, any>;
}

/**
 * Options for focus navigation
 */
export interface FocusNavigationOptions {
  /** Skip validation checks */
  skipValidation?: boolean;
  /** Wrap around when reaching boundaries */
  wrap?: boolean;
  /** Include disabled elements */
  includeDisabled?: boolean;
  /** Filter by element type */
  typeFilter?: FocusableType[];
  /** Custom filter function */
  customFilter?: (element: FocusableElement) => boolean;
  /** Animation/scroll behavior */
  behavior?: 'smooth' | 'instant';
}

/**
 * Modal stack entry
 */
export interface ModalStackEntry {
  /** Modal scope ID */
  scopeId: string;
  /** Previous focus element ID before modal opened */
  previousFocusId?: string;
  /** Modal-specific options */
  options?: {
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    preventScroll?: boolean;
  };
}

/**
 * Focus Manager State
 */
export interface FocusManagerState {
  /** Registry of all focusable elements */
  elements: Map<string, FocusableElement>;
  /** Stack of focus scopes */
  scopes: FocusScope[];
  /** Currently active scope ID */
  activeScopeId: string;
  /** Currently focused element ID */
  currentFocusId?: string;
  /** Focus history for undo/redo */
  history: FocusHistoryEntry[];
  /** Current position in history for undo/redo */
  historyIndex: number;
  /** Modal stack for nested modals */
  modalStack: ModalStackEntry[];
  /** Whether focus management is enabled */
  enabled: boolean;
  /** Debug mode flag */
  debug: boolean;
  /** Current navigation mode */
  navigationMode: NavigationMode;
  /** Mouse interaction history for pattern detection */
  mouseInteractionHistory: MouseInteraction[];
  /** Last mouse position for movement detection */
  lastMousePosition: { x: number; y: number };
}

/**
 * Focus Manager Context value
 */
export interface FocusManagerContextValue {
  /** Current state */
  state: FocusManagerState;
  
  // Registration methods
  /** Register a focusable element */
  registerElement: (element: Omit<FocusableElement, 'registeredAt'>) => void;
  /** Unregister a focusable element */
  unregisterElement: (id: string) => void;
  /** Update element metadata */
  updateElement: (id: string, updates: Partial<FocusableElement>) => void;
  
  // Scope management
  /** Push a new scope (e.g., open modal) */
  pushScope: (scope: Omit<FocusScope, 'createdAt'>) => void;
  /** Pop the current scope (e.g., close modal) */
  popScope: () => void;
  /** Get current scope */
  getCurrentScope: () => FocusScope | undefined;
  
  // Navigation methods
  /** Focus next element */
  focusNext: (options?: FocusNavigationOptions) => Promise<boolean>;
  /** Focus previous element */
  focusPrevious: (options?: FocusNavigationOptions) => Promise<boolean>;
  /** Focus specific field by ID */
  focusField: (id: string, reason?: FocusChangeReason) => Promise<boolean>;
  /** Focus first element in current scope */
  focusFirst: (options?: FocusNavigationOptions) => Promise<boolean>;
  /** Focus last element in current scope */
  focusLast: (options?: FocusNavigationOptions) => Promise<boolean>;
  
  // Modal management
  /** Open a modal and manage focus */
  openModal: (scopeId: string, options?: ModalStackEntry['options']) => Promise<void>;
  /** Close current modal and restore focus */
  closeModal: () => Promise<void>;
  /** Check if a modal is open */
  isModalOpen: () => boolean;
  
  // History management
  /** Undo last focus change */
  undoFocus: () => Promise<boolean>;
  /** Redo focus change */
  redoFocus: () => Promise<boolean>;
  /** Clear focus history */
  clearHistory: () => void;
  /** Get focus history */
  getHistory: () => FocusHistoryEntry[];
  
  // Utility methods
  /** Get all elements in current scope */
  getElementsInScope: (scopeId?: string) => FocusableElement[];
  /** Check if element can receive focus */
  canFocusElement: (id: string) => boolean;
  /** Enable/disable focus management */
  setEnabled: (enabled: boolean) => void;
  /** Set debug mode */
  setDebug: (debug: boolean) => void;
  
  // Mouse navigation methods
  /** Handle mouse navigation on element click */
  handleMouseNavigation: (nodeId: string, event: MouseEvent) => void;
  /** Set the navigation mode */
  setNavigationMode: (mode: NavigationMode) => void;
  /** Get the current navigation mode */
  getNavigationMode: () => NavigationMode;
  /** Check if direct jump to node is allowed */
  canJumpToNode: (nodeId: string) => Promise<boolean>;
  /** Get visible steps for step indicator */
  getVisibleSteps: () => Promise<StepIndicatorData[]>;
}

/**
 * Provider props
 */
export interface FocusManagerProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Initial debug mode */
  debug?: boolean;
  /** Initial enabled state */
  enabled?: boolean;
  /** Maximum history entries to keep */
  maxHistorySize?: number;
  /** Default focus options */
  defaultOptions?: FocusNavigationOptions;
}