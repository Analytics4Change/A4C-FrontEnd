/**
 * Focus Flow Configuration Types
 * 
 * These types define the structure for declarative focus flow configuration.
 * Focus flows determine the navigation order and branching logic for forms.
 * 
 * @module focusFlow.types
 */

/**
 * Represents a complete focus flow configuration
 */
export interface FocusFlow {
  /** Unique identifier for the flow */
  id: string;
  
  /** Human-readable name for the flow */
  name: string;
  
  /** Ordered list of nodes in the flow */
  nodes: FocusFlowNode[];
  
  /** Optional branching conditions */
  branches?: Record<string, FocusBranch>;
  
  /** Optional validator functions */
  validators?: Record<string, () => boolean | Promise<boolean>>;
  
  /** Optional metadata for the flow */
  metadata?: Record<string, any>;
}

/**
 * Represents a single node in the focus flow
 */
export interface FocusFlowNode {
  /** Unique identifier for the node (should match element ID) */
  id: string;
  
  /** Order in the flow (1-based) */
  order: number;
  
  /** Whether this field is required */
  required: boolean;
  
  /** Optional condition to skip this node (references validator key) */
  skipIf?: string;
  
  /** Optional label for display purposes */
  label?: string;
  
  /** Optional description for accessibility */
  description?: string;
  
  /** Optional type hint for the field */
  type?: 'input' | 'button' | 'select' | 'checkbox' | 'radio' | 'modal' | 'custom';
  
  /** Optional validation to run before leaving this node */
  validateOnLeave?: string;
  
  /** Optional auto-advance behavior */
  autoAdvance?: boolean;
  
  /** Optional metadata for the node */
  metadata?: Record<string, any>;
}

/**
 * Represents a branching condition in the flow
 */
export interface FocusBranch {
  /** The validator function to evaluate */
  condition: string;
  
  /** Node ID to navigate to if condition is true */
  truePath: string;
  
  /** Node ID to navigate to if condition is false */
  falsePath: string;
  
  /** Optional description of the branch logic */
  description?: string;
}

/**
 * Options for flow configuration
 */
export interface FocusFlowOptions {
  /** Whether to allow jumping between non-adjacent nodes */
  allowJumping?: boolean;
  
  /** Whether to enable mouse navigation */
  mouseNavigation?: boolean;
  
  /** Whether to show step indicators */
  showStepIndicator?: boolean;
  
  /** Whether to validate on every navigation */
  validateOnNavigate?: boolean;
  
  /** Whether to auto-save progress */
  autoSave?: boolean;
  
  /** Debounce delay for auto-save (ms) */
  autoSaveDelay?: number;
}

/**
 * Flow state for tracking progress
 */
export interface FocusFlowState {
  /** Current flow ID */
  flowId: string;
  
  /** Current node ID */
  currentNodeId: string;
  
  /** Current node index */
  currentIndex: number;
  
  /** Visited nodes */
  visitedNodes: Set<string>;
  
  /** Completed nodes */
  completedNodes: Set<string>;
  
  /** Skipped nodes */
  skippedNodes: Set<string>;
  
  /** Whether the flow is complete */
  isComplete: boolean;
  
  /** Validation errors by node ID */
  errors: Record<string, string>;
}

/**
 * Flow navigation result
 */
export interface FlowNavigationResult {
  /** Whether navigation was successful */
  success: boolean;
  
  /** Next node ID if successful */
  nextNodeId?: string;
  
  /** Error message if failed */
  error?: string;
  
  /** Whether the flow is complete */
  isComplete?: boolean;
}

/**
 * Validator function type
 */
export type ValidatorFunction = () => boolean | Promise<boolean>;

/**
 * Flow event types
 */
export type FlowEventType = 
  | 'flow:start'
  | 'flow:complete'
  | 'flow:navigate'
  | 'flow:validate'
  | 'flow:error'
  | 'node:enter'
  | 'node:leave'
  | 'node:skip'
  | 'node:complete';

/**
 * Flow event handler
 */
export interface FlowEventHandler {
  (event: {
    type: FlowEventType;
    flowId: string;
    nodeId?: string;
    data?: any;
  }): void;
}