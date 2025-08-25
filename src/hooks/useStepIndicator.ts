/**
 * useStepIndicator Hook
 * 
 * Bridges the StepIndicator component with the useFocusFlow hook,
 * providing real-time step status updates based on flow state.
 * 
 * @module useStepIndicator
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useFocusManager } from '../contexts/focus/useFocusManager';
import { FocusFlow, FocusFlowState, FocusFlowNode } from '../config/types/focusFlow.types';
import { StepIndicatorData } from '../contexts/focus/types';

/**
 * Hook options
 */
interface UseStepIndicatorOptions {
  /** Focus flow configuration */
  flow: FocusFlow;
  
  /** Current flow state from useFocusFlow */
  flowState: FocusFlowState;
  
  /** Whether to allow jumping to any visited step */
  allowJumpToVisited?: boolean;
  
  /** Whether to allow jumping to any step (override all restrictions) */
  allowJumpToAny?: boolean;
  
  /** Custom validator for step jumping */
  canJumpToStep?: (nodeId: string) => boolean | Promise<boolean>;
  
  /** Callback when step is clicked */
  onStepClick?: (nodeId: string) => void;
  
  /** Whether to include skipped nodes in steps */
  showSkippedSteps?: boolean;
}

/**
 * Hook return value
 */
interface UseStepIndicatorReturn {
  /** Steps data for StepIndicator component */
  steps: StepIndicatorData[];
  
  /** Handle step click event */
  handleStepClick: (stepId: string) => Promise<boolean>;
  
  /** Get current step index */
  getCurrentStepIndex: () => number;
  
  /** Get progress percentage */
  getProgressPercentage: () => number;
  
  /** Check if a specific step is complete */
  isStepComplete: (stepId: string) => boolean;
  
  /** Check if a specific step is clickable */
  isStepClickable: (stepId: string) => boolean;
  
  /** Update step status manually */
  updateStepStatus: (stepId: string, status: StepIndicatorData['status']) => void;
}

/**
 * Main hook for connecting StepIndicator with FocusFlow
 */
export function useStepIndicator(options: UseStepIndicatorOptions): UseStepIndicatorReturn {
  const {
    flow,
    flowState,
    allowJumpToVisited = true,
    allowJumpToAny = false,
    canJumpToStep,
    onStepClick,
    showSkippedSteps = false
  } = options;

  const { focusField, canFocusElement } = useFocusManager();
  
  // Local state for manual status overrides
  const [statusOverrides, setStatusOverrides] = useState<Record<string, StepIndicatorData['status']>>({});

  /**
   * Convert flow nodes to step indicator data
   */
  const steps = useMemo((): StepIndicatorData[] => {
    const stepsArray: StepIndicatorData[] = [];
    
    // Process each node in the flow
    flow.nodes.forEach((node) => {
      // Check if node is skipped
      const isSkipped = flowState.skippedNodes.has(node.id);
      
      // Skip if node is skipped and we're not showing skipped steps
      if (!showSkippedSteps && isSkipped) {
        return;
      }
      
      // Determine step status
      let status: StepIndicatorData['status'] = 'upcoming';
      
      // Check for manual override first
      if (statusOverrides[node.id]) {
        status = statusOverrides[node.id];
      }
      // Current node
      else if (flowState.currentNodeId === node.id) {
        status = 'current';
      }
      // Completed node
      else if (flowState.completedNodes.has(node.id)) {
        status = 'complete';
      }
      // Skipped node
      else if (flowState.skippedNodes.has(node.id)) {
        status = 'disabled';
      }
      // Visited but not completed
      else if (flowState.visitedNodes.has(node.id)) {
        // Node was visited but not completed - show as upcoming with visited indicator
        status = 'upcoming';
      }
      // Check if node can receive focus
      else if (node.skipIf && flow.validators?.[node.skipIf]) {
        // Evaluate skip condition
        const shouldSkip = flow.validators[node.skipIf]();
        if (shouldSkip) {
          status = 'disabled';
        }
      }
      
      // Determine if step is clickable
      let isClickable = false;
      
      if (allowJumpToAny) {
        // Allow jumping to any step
        isClickable = status !== 'disabled';
      } else if (allowJumpToVisited && flowState.visitedNodes.has(node.id)) {
        // Allow jumping to visited steps
        isClickable = true;
      } else if (status === 'complete') {
        // Always allow jumping to completed steps
        isClickable = true;
      } else if (node.order === 1) {
        // Always allow jumping to first step
        isClickable = true;
      } else {
        // Check if all previous required nodes are complete
        const previousRequiredNodes = flow.nodes.filter(n => 
          n.order < node.order && 
          n.required && 
          !flowState.skippedNodes.has(n.id)
        );
        isClickable = previousRequiredNodes.every(n => 
          flowState.completedNodes.has(n.id)
        );
      }
      
      // Apply custom validator if provided
      if (canJumpToStep) {
        // Note: This will be evaluated async when clicked
        // For now, we'll use the default clickability
      }
      
      // Create step data
      const stepData: StepIndicatorData = {
        id: node.id,
        label: node.label || node.id,
        description: node.description,
        status,
        isClickable
      };
      
      stepsArray.push(stepData);
    });
    
    // Sort by order
    return stepsArray.sort((a, b) => {
      const nodeA = flow.nodes.find(n => n.id === a.id);
      const nodeB = flow.nodes.find(n => n.id === b.id);
      return (nodeA?.order ?? 0) - (nodeB?.order ?? 0);
    });
  }, [flow, flowState, allowJumpToVisited, allowJumpToAny, showSkippedSteps, statusOverrides, canJumpToStep]);

  /**
   * Handle step click
   */
  const handleStepClick = useCallback(async (stepId: string): Promise<boolean> => {
    // Find the node
    const node = flow.nodes.find(n => n.id === stepId);
    if (!node) {
      console.warn(`[useStepIndicator] Node not found: ${stepId}`);
      return false;
    }
    
    // Check if step is disabled
    if (flowState.skippedNodes.has(stepId)) {
      console.log(`[useStepIndicator] Cannot click disabled step: ${stepId}`);
      return false;
    }
    
    // Apply custom validator if provided
    if (canJumpToStep) {
      const canJump = await Promise.resolve(canJumpToStep(stepId));
      if (!canJump) {
        console.log(`[useStepIndicator] Custom validator prevented jump to: ${stepId}`);
        return false;
      }
    }
    
    // Check if element can receive focus
    const canFocus = await canFocusElement(stepId);
    if (!canFocus) {
      console.log(`[useStepIndicator] Element cannot receive focus: ${stepId}`);
      return false;
    }
    
    // Focus the field
    const focused = await focusField(stepId, 'step-indicator');
    
    if (focused) {
      // Call parent callback
      onStepClick?.(stepId);
      return true;
    }
    
    return false;
  }, [flow, flowState, canJumpToStep, canFocusElement, focusField, onStepClick]);

  /**
   * Get current step index
   */
  const getCurrentStepIndex = useCallback((): number => {
    const currentIndex = steps.findIndex(step => step.id === flowState.currentNodeId);
    return currentIndex >= 0 ? currentIndex : -1;
  }, [steps, flowState.currentNodeId]);

  /**
   * Get progress percentage
   */
  const getProgressPercentage = useCallback((): number => {
    if (steps.length === 0) return 0;
    
    // Check if flow is complete
    if (flowState.isComplete) return 100;
    
    // Count completed steps (excluding disabled)
    const completedCount = steps.filter(step => 
      step.status === 'complete'
    ).length;
    
    // Count total steps (excluding disabled)
    const totalCount = steps.filter(step => 
      step.status !== 'disabled'
    ).length;
    
    if (totalCount === 0) return 0;
    
    return Math.round((completedCount / totalCount) * 100);
  }, [steps, flowState.isComplete]);

  /**
   * Check if a specific step is complete
   */
  const isStepComplete = useCallback((stepId: string): boolean => {
    return flowState.completedNodes.has(stepId);
  }, [flowState.completedNodes]);

  /**
   * Check if a specific step is clickable
   */
  const isStepClickable = useCallback((stepId: string): boolean => {
    const step = steps.find(s => s.id === stepId);
    return step?.isClickable ?? false;
  }, [steps]);

  /**
   * Update step status manually (for UI overrides)
   */
  const updateStepStatus = useCallback((stepId: string, status: StepIndicatorData['status']) => {
    setStatusOverrides(prev => ({
      ...prev,
      [stepId]: status
    }));
  }, []);

  // Log state changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useStepIndicator] Steps updated:', {
        steps: steps.map(s => ({ id: s.id, status: s.status, clickable: s.isClickable })),
        currentNode: flowState.currentNodeId,
        progress: getProgressPercentage()
      });
    }
  }, [steps, flowState.currentNodeId, getProgressPercentage]);

  return {
    steps,
    handleStepClick,
    getCurrentStepIndex,
    getProgressPercentage,
    isStepComplete,
    isStepClickable,
    updateStepStatus
  };
}

/**
 * Hook for using step indicator with automatic flow integration
 * Combines useFocusFlow and useStepIndicator for convenience
 */
export function useFlowWithStepIndicator(
  flow: FocusFlow,
  options?: {
    allowJumpToVisited?: boolean;
    allowJumpToAny?: boolean;
    onStepClick?: (nodeId: string) => void;
  }
) {
  // Import useFocusFlow dynamically to avoid circular dependency
  const { useFocusFlow } = require('./useFocusFlow');
  
  // Get flow state and navigation methods
  const flowResult = useFocusFlow(flow, {
    autoRegister: true,
    autoStart: false
  });
  
  // Get step indicator data
  const stepIndicator = useStepIndicator({
    flow,
    flowState: flowResult.state,
    ...options
  });
  
  // Combined navigation that updates both flow and indicator
  const navigateToStep = useCallback(async (stepId: string) => {
    const result = await flowResult.navigateToNode(stepId);
    if (result.success) {
      await stepIndicator.handleStepClick(stepId);
    }
    return result;
  }, [flowResult, stepIndicator]);
  
  return {
    // Flow methods
    ...flowResult,
    // Step indicator methods
    steps: stepIndicator.steps,
    getCurrentStepIndex: stepIndicator.getCurrentStepIndex,
    getProgressPercentage: stepIndicator.getProgressPercentage,
    isStepComplete: stepIndicator.isStepComplete,
    isStepClickable: stepIndicator.isStepClickable,
    // Combined navigation
    navigateToStep
  };
}