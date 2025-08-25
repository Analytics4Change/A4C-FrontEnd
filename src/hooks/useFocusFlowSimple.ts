/**
 * Simplified version of useFocusFlow Hook
 * 
 * This version doesn't try to auto-register nodes.
 * Instead, it expects nodes to exist when navigation happens.
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useFocusManager } from '../contexts/focus/useFocusManager';
import { 
  FocusFlow, 
  FocusFlowState,
  FlowNavigationResult,
  FlowEventType,
  FlowEventHandler
} from '../config/types/focusFlow.types';

interface UseFocusFlowOptions {
  autoStart?: boolean;
  onEvent?: FlowEventHandler;
  validateOnNavigate?: boolean;
  restoreFocusOnComplete?: boolean;
}

interface UseFocusFlowReturn {
  state: FocusFlowState;
  navigateNext: () => Promise<FlowNavigationResult>;
  navigatePrevious: () => Promise<FlowNavigationResult>;
  navigateToNode: (nodeId: string) => Promise<FlowNavigationResult>;
  startFlow: () => Promise<void>;
  completeFlow: () => Promise<void>;
  resetFlow: () => void;
  canFocusNode: (nodeId: string) => Promise<boolean>;
  getNextNodeId: (fromNodeId?: string) => string | null;
  getPreviousNodeId: (fromNodeId?: string) => string | null;
  markNodeComplete: (nodeId: string) => void;
  isFlowComplete: () => boolean;
}

export function useFocusFlowSimple(
  flow: FocusFlow,
  options: UseFocusFlowOptions = {}
): UseFocusFlowReturn {
  const {
    autoStart = false,
    onEvent,
    validateOnNavigate = true,
    restoreFocusOnComplete = true
  } = options;

  const { focusField } = useFocusManager();

  const initialFocusRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const startFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<FocusFlowState>({
    flowId: flow.id,
    currentNodeId: '',
    currentIndex: -1,
    visitedNodes: new Set(),
    completedNodes: new Set(),
    skippedNodes: new Set(),
    isComplete: false,
    errors: {}
  });

  const emitEvent = useCallback((
    type: FlowEventType,
    nodeId?: string,
    data?: any
  ) => {
    if (onEvent) {
      onEvent({
        type,
        flowId: flow.id,
        nodeId,
        data
      });
    }
  }, [flow.id, onEvent]);

  const getNextNodeId = useCallback((fromNodeId?: string): string | null => {
    const currentId = fromNodeId || state.currentNodeId;
    if (!currentId) {
      const firstNode = flow.nodes
        .sort((a, b) => a.order - b.order)[0];
      return firstNode?.id || null;
    }

    const currentNode = flow.nodes.find(n => n.id === currentId);
    if (!currentNode) return null;

    const branch = flow.branches?.[currentId];
    if (branch && flow.validators?.[branch.condition]) {
      const condition = flow.validators[branch.condition]();
      const nextId = condition ? branch.truePath : branch.falsePath;
      
      const nextNode = flow.nodes.find(n => n.id === nextId);
      if (nextNode) {
        return nextId;
      }
    }

    const nextNodes = flow.nodes
      .filter(n => n.order > currentNode.order)
      .sort((a, b) => a.order - b.order);

    for (const node of nextNodes) {
      if (node.skipIf && flow.validators?.[node.skipIf]) {
        const shouldSkip = flow.validators[node.skipIf]();
        if (shouldSkip) {
          setState(prev => ({
            ...prev,
            skippedNodes: new Set([...prev.skippedNodes, node.id])
          }));
          continue;
        }
      }
      return node.id;
    }

    return null;
  }, [flow, state.currentNodeId]);

  const getPreviousNodeId = useCallback((fromNodeId?: string): string | null => {
    const currentId = fromNodeId || state.currentNodeId;
    if (!currentId) return null;

    const currentNode = flow.nodes.find(n => n.id === currentId);
    if (!currentNode) return null;

    const previousNodes = flow.nodes
      .filter(n => n.order < currentNode.order && !state.skippedNodes.has(n.id))
      .sort((a, b) => b.order - a.order);

    return previousNodes[0]?.id || null;
  }, [flow, state.currentNodeId, state.skippedNodes]);

  const canFocusNode = useCallback(async (nodeId: string): Promise<boolean> => {
    const node = flow.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    if (node.skipIf && flow.validators?.[node.skipIf]) {
      const shouldSkip = await Promise.resolve(flow.validators[node.skipIf]());
      if (shouldSkip) return false;
    }

    // Check if element exists in DOM
    const element = document.getElementById(nodeId);
    return !!element;
  }, [flow]);

  const navigateNext = useCallback(async (): Promise<FlowNavigationResult> => {
    const currentNode = flow.nodes.find(n => n.id === state.currentNodeId);
    
    if (currentNode?.validateOnLeave && flow.validators?.[currentNode.validateOnLeave]) {
      const isValid = await Promise.resolve(flow.validators[currentNode.validateOnLeave]());
      if (!isValid) {
        return {
          success: false,
          error: `Validation failed for ${currentNode.label || currentNode.id}`
        };
      }
    }

    const nextId = getNextNodeId();
    if (!nextId) {
      await completeFlow();
      return {
        success: true,
        isComplete: true
      };
    }

    const canFocus = await canFocusNode(nextId);
    if (!canFocus) {
      const followingId = getNextNodeId(nextId);
      if (followingId) {
        return navigateToNode(followingId);
      }
      return {
        success: false,
        error: `Cannot focus node: ${nextId}`
      };
    }

    // Try to focus the element directly
    const element = document.getElementById(nextId);
    if (element) {
      // Find the first focusable element within the node
      const focusableElement = element.querySelector('input, select, button, textarea') as HTMLElement || element;
      focusableElement.focus();
      
      const nextNode = flow.nodes.find(n => n.id === nextId)!;
      setState(prev => ({
        ...prev,
        currentNodeId: nextId,
        currentIndex: nextNode.order,
        visitedNodes: new Set([...prev.visitedNodes, nextId])
      }));
      
      emitEvent('node:enter', nextId);
      emitEvent('flow:navigate', nextId, { direction: 'forward' });
      
      return {
        success: true,
        nextNodeId: nextId
      };
    }

    return {
      success: false,
      error: `Failed to focus node: ${nextId}`
    };
  }, [state.currentNodeId, flow, getNextNodeId, canFocusNode, emitEvent]); // eslint-disable-line

  const navigatePrevious = useCallback(async (): Promise<FlowNavigationResult> => {
    const previousId = getPreviousNodeId();
    if (!previousId) {
      return {
        success: false,
        error: 'No previous node available'
      };
    }

    const element = document.getElementById(previousId);
    if (element) {
      const focusableElement = element.querySelector('input, select, button, textarea') as HTMLElement || element;
      focusableElement.focus();
      
      const previousNode = flow.nodes.find(n => n.id === previousId)!;
      setState(prev => ({
        ...prev,
        currentNodeId: previousId,
        currentIndex: previousNode.order,
        visitedNodes: new Set([...prev.visitedNodes, previousId])
      }));
      
      emitEvent('node:enter', previousId);
      emitEvent('flow:navigate', previousId, { direction: 'backward' });
      
      return {
        success: true,
        nextNodeId: previousId
      };
    }

    return {
      success: false,
      error: `Failed to focus node: ${previousId}`
    };
  }, [getPreviousNodeId, flow, emitEvent]);

  const navigateToNode = useCallback(async (nodeId: string): Promise<FlowNavigationResult> => {
    const node = flow.nodes.find(n => n.id === nodeId);
    if (!node) {
      return {
        success: false,
        error: `Node not found: ${nodeId}`
      };
    }

    const canFocus = await canFocusNode(nodeId);
    if (!canFocus) {
      return {
        success: false,
        error: `Cannot focus node: ${nodeId}`
      };
    }

    const element = document.getElementById(nodeId);
    if (element) {
      const focusableElement = element.querySelector('input, select, button, textarea') as HTMLElement || element;
      focusableElement.focus();
      
      setState(prev => ({
        ...prev,
        currentNodeId: nodeId,
        currentIndex: node.order,
        visitedNodes: new Set([...prev.visitedNodes, nodeId])
      }));
      
      emitEvent('node:enter', nodeId);
      emitEvent('flow:navigate', nodeId, { direction: 'jump' });
      
      return {
        success: true,
        nextNodeId: nodeId
      };
    }

    return {
      success: false,
      error: `Failed to focus node: ${nodeId}`
    };
  }, [flow, canFocusNode, emitEvent]);

  const startFlow = useCallback(async (): Promise<void> => {
    // Prevent double-invocation from React StrictMode
    if (isInitializedRef.current) {
      console.log('Flow already initialized, skipping startFlow');
      return;
    }

    isInitializedRef.current = true;
    initialFocusRef.current = document.activeElement?.id || null;
    
    setState({
      flowId: flow.id,
      currentNodeId: '',
      currentIndex: -1,
      visitedNodes: new Set(),
      completedNodes: new Set(),
      skippedNodes: new Set(),
      isComplete: false,
      errors: {}
    });
    
    emitEvent('flow:start');
    
    const firstNodeId = getNextNodeId('');
    if (firstNodeId) {
      await navigateToNode(firstNodeId);
    }
  }, [flow.id, getNextNodeId, navigateToNode, emitEvent]);

  const completeFlow = useCallback(async (): Promise<void> => {
    setState(prev => ({
      ...prev,
      isComplete: true
    }));
    
    emitEvent('flow:complete', undefined, {
      visitedNodes: Array.from(state.visitedNodes),
      completedNodes: Array.from(state.completedNodes),
      skippedNodes: Array.from(state.skippedNodes)
    });
    
    if (restoreFocusOnComplete && initialFocusRef.current) {
      const element = document.getElementById(initialFocusRef.current);
      if (element) {
        (element as HTMLElement).focus();
      }
    }
  }, [state.visitedNodes, state.completedNodes, state.skippedNodes, restoreFocusOnComplete, emitEvent]);

  const resetFlow = useCallback((): void => {
    isInitializedRef.current = false;
    setState({
      flowId: flow.id,
      currentNodeId: '',
      currentIndex: -1,
      visitedNodes: new Set(),
      completedNodes: new Set(),
      skippedNodes: new Set(),
      isComplete: false,
      errors: {}
    });
  }, [flow.id]);

  const markNodeComplete = useCallback((nodeId: string): void => {
    setState(prev => ({
      ...prev,
      completedNodes: new Set([...prev.completedNodes, nodeId])
    }));
    emitEvent('node:complete', nodeId);
  }, [emitEvent]);

  const isFlowComplete = useCallback((): boolean => {
    const requiredNodes = flow.nodes.filter(n => n.required && !state.skippedNodes.has(n.id));
    return requiredNodes.every(n => state.completedNodes.has(n.id));
  }, [flow.nodes, state.completedNodes, state.skippedNodes]);

  // Start flow automatically if configured
  useEffect(() => {
    if (autoStart && !state.currentNodeId && !state.isComplete && !isInitializedRef.current) {
      // Clear any pending timeout
      if (startFlowTimeoutRef.current) {
        clearTimeout(startFlowTimeoutRef.current);
      }
      
      // Use timeout to debounce multiple calls from StrictMode
      startFlowTimeoutRef.current = setTimeout(() => {
        if (!isInitializedRef.current) {
          startFlow();
        }
      }, 0);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (startFlowTimeoutRef.current) {
        clearTimeout(startFlowTimeoutRef.current);
      }
    };
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset initialization flag on unmount
  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  return {
    state,
    navigateNext,
    navigatePrevious,
    navigateToNode,
    startFlow,
    completeFlow,
    resetFlow,
    canFocusNode,
    getNextNodeId,
    getPreviousNodeId,
    markNodeComplete,
    isFlowComplete
  };
}