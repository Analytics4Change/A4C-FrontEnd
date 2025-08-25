/**
 * Focus Flow Utility Functions
 * 
 * Helper functions for creating, validating, and managing focus flows.
 * 
 * @module focusFlows/utils
 */

import type { 
  FocusFlow, 
  FocusFlowNode, 
  FocusBranch,
  FocusFlowOptions,
  ValidatorFunction 
} from '../types/focusFlow.types';

/**
 * Creates a typed flow configuration with defaults
 * @param config Partial flow configuration
 * @returns Complete flow configuration with defaults
 */
export function createFlowConfiguration(config: Partial<FocusFlow> & { 
  id: string; 
  name: string; 
  nodes: FocusFlowNode[] 
}): FocusFlow {
  return {
    branches: {},
    validators: {},
    metadata: {},
    ...config
  };
}

/**
 * Validates a flow configuration for correctness
 * @param flow The flow to validate
 * @returns Validation result with any errors
 */
export function validateFlow(flow: FocusFlow): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Check for required fields
  if (!flow.id) {
    errors.push('Flow must have an ID');
  }
  
  if (!flow.name) {
    errors.push('Flow must have a name');
  }
  
  if (!flow.nodes || flow.nodes.length === 0) {
    errors.push('Flow must have at least one node');
  }
  
  // Check for unique node IDs
  const nodeIds = new Set<string>();
  const duplicateIds = new Set<string>();
  
  flow.nodes.forEach(node => {
    if (nodeIds.has(node.id)) {
      duplicateIds.add(node.id);
    }
    nodeIds.add(node.id);
  });
  
  if (duplicateIds.size > 0) {
    errors.push(`Duplicate node IDs found: ${Array.from(duplicateIds).join(', ')}`);
  }
  
  // Check for unique order values
  const orders = new Set<number>();
  const duplicateOrders = new Set<number>();
  
  flow.nodes.forEach(node => {
    if (orders.has(node.order)) {
      duplicateOrders.add(node.order);
    }
    orders.add(node.order);
  });
  
  if (duplicateOrders.size > 0) {
    errors.push(`Duplicate order values found: ${Array.from(duplicateOrders).join(', ')}`);
  }
  
  // Validate branch references
  if (flow.branches) {
    Object.entries(flow.branches).forEach(([branchId, branch]) => {
      // Check if branch references existing nodes
      if (!nodeIds.has(branch.truePath)) {
        errors.push(`Branch "${branchId}" references non-existent node: ${branch.truePath}`);
      }
      
      if (!nodeIds.has(branch.falsePath)) {
        errors.push(`Branch "${branchId}" references non-existent node: ${branch.falsePath}`);
      }
      
      // Check if condition references existing validator
      if (flow.validators && !flow.validators[branch.condition]) {
        errors.push(`Branch "${branchId}" references non-existent validator: ${branch.condition}`);
      }
    });
  }
  
  // Validate skip conditions reference existing validators
  flow.nodes.forEach(node => {
    if (node.skipIf && flow.validators && !flow.validators[node.skipIf]) {
      errors.push(`Node "${node.id}" references non-existent skip validator: ${node.skipIf}`);
    }
    
    if (node.validateOnLeave && flow.validators && !flow.validators[node.validateOnLeave]) {
      errors.push(`Node "${node.id}" references non-existent leave validator: ${node.validateOnLeave}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets the next node in the flow based on current position and conditions
 * @param flow The flow configuration
 * @param currentNodeId Current node ID
 * @param evaluateValidators Function to evaluate validators
 * @returns Next node or null if at end
 */
export async function getNextNode(
  flow: FocusFlow,
  currentNodeId: string,
  evaluateValidators?: (validatorName: string) => Promise<boolean>
): Promise<FocusFlowNode | null> {
  const currentIndex = flow.nodes.findIndex(n => n.id === currentNodeId);
  
  if (currentIndex === -1) {
    console.warn(`Current node "${currentNodeId}" not found in flow`);
    return null;
  }
  
  // Check for branch at current node
  const branch = flow.branches?.[currentNodeId];
  if (branch && evaluateValidators) {
    const conditionResult = await evaluateValidators(branch.condition);
    const nextNodeId = conditionResult ? branch.truePath : branch.falsePath;
    return flow.nodes.find(n => n.id === nextNodeId) || null;
  }
  
  // Find next non-skipped node
  for (let i = currentIndex + 1; i < flow.nodes.length; i++) {
    const node = flow.nodes[i];
    
    // Check skip condition
    if (node.skipIf && evaluateValidators) {
      const shouldSkip = await evaluateValidators(node.skipIf);
      if (shouldSkip) {
        continue; // Skip this node
      }
    }
    
    return node;
  }
  
  return null; // End of flow
}

/**
 * Gets the previous node in the flow
 * @param flow The flow configuration
 * @param currentNodeId Current node ID
 * @param evaluateValidators Function to evaluate validators
 * @returns Previous node or null if at start
 */
export async function getPreviousNode(
  flow: FocusFlow,
  currentNodeId: string,
  evaluateValidators?: (validatorName: string) => Promise<boolean>
): Promise<FocusFlowNode | null> {
  const currentIndex = flow.nodes.findIndex(n => n.id === currentNodeId);
  
  if (currentIndex <= 0) {
    return null; // At start or not found
  }
  
  // Find previous non-skipped node
  for (let i = currentIndex - 1; i >= 0; i--) {
    const node = flow.nodes[i];
    
    // Check skip condition
    if (node.skipIf && evaluateValidators) {
      const shouldSkip = await evaluateValidators(node.skipIf);
      if (shouldSkip) {
        continue; // Skip this node
      }
    }
    
    return node;
  }
  
  return null; // Start of flow
}

/**
 * Gets all required nodes in the flow
 * @param flow The flow configuration
 * @returns Array of required nodes
 */
export function getRequiredNodes(flow: FocusFlow): FocusFlowNode[] {
  return flow.nodes.filter(node => node.required);
}

/**
 * Gets all visible nodes (not skipped) in the flow
 * @param flow The flow configuration
 * @param evaluateValidators Function to evaluate validators
 * @returns Array of visible nodes
 */
export async function getVisibleNodes(
  flow: FocusFlow,
  evaluateValidators?: (validatorName: string) => Promise<boolean>
): Promise<FocusFlowNode[]> {
  const visibleNodes: FocusFlowNode[] = [];
  
  for (const node of flow.nodes) {
    if (node.skipIf && evaluateValidators) {
      const shouldSkip = await evaluateValidators(node.skipIf);
      if (shouldSkip) {
        continue;
      }
    }
    visibleNodes.push(node);
  }
  
  return visibleNodes;
}

/**
 * Checks if a flow is complete based on required fields
 * @param flow The flow configuration
 * @param completedNodeIds Set of completed node IDs
 * @param evaluateValidators Function to evaluate validators
 * @returns Whether the flow is complete
 */
export async function isFlowComplete(
  flow: FocusFlow,
  completedNodeIds: Set<string>,
  evaluateValidators?: (validatorName: string) => Promise<boolean>
): Promise<boolean> {
  for (const node of flow.nodes) {
    // Skip if node should be skipped
    if (node.skipIf && evaluateValidators) {
      const shouldSkip = await evaluateValidators(node.skipIf);
      if (shouldSkip) {
        continue;
      }
    }
    
    // Check if required node is completed
    if (node.required && !completedNodeIds.has(node.id)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a validator evaluation function that uses the flow's validators
 * @param flow The flow configuration
 * @returns Validator evaluation function
 */
export function createValidatorEvaluator(flow: FocusFlow) {
  return async (validatorName: string): Promise<boolean> => {
    const validator = flow.validators?.[validatorName];
    
    if (!validator) {
      console.warn(`Validator "${validatorName}" not found in flow`);
      return false;
    }
    
    try {
      const result = validator();
      return result instanceof Promise ? await result : result;
    } catch (error) {
      console.error(`Error evaluating validator "${validatorName}":`, error);
      return false;
    }
  };
}

/**
 * Gets the progress percentage of a flow
 * @param flow The flow configuration
 * @param completedNodeIds Set of completed node IDs
 * @param evaluateValidators Function to evaluate validators
 * @returns Progress percentage (0-100)
 */
export async function getFlowProgress(
  flow: FocusFlow,
  completedNodeIds: Set<string>,
  evaluateValidators?: (validatorName: string) => Promise<boolean>
): Promise<number> {
  const visibleNodes = await getVisibleNodes(flow, evaluateValidators);
  const requiredVisibleNodes = visibleNodes.filter(n => n.required);
  
  if (requiredVisibleNodes.length === 0) {
    return 100; // No required nodes means complete
  }
  
  const completedRequiredNodes = requiredVisibleNodes.filter(n => 
    completedNodeIds.has(n.id)
  );
  
  return Math.round((completedRequiredNodes.length / requiredVisibleNodes.length) * 100);
}