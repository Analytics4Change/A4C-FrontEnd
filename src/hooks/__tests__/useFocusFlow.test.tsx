/**
 * Tests for useFocusFlow Hook
 * 
 * Validates the focus flow management functionality including:
 * - Flow registration and initialization
 * - Navigation (next, previous, jump)
 * - Branching logic
 * - Skip conditions
 * - Validation
 * - Event handling
 * - State management
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFocusFlow } from '../useFocusFlow';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { FocusFlow } from '../../config/types/focusFlow.types';

// Mock the FocusManager context
vi.mock('../../contexts/focus/useFocusManager', () => ({
  useFocusManager: () => ({
    registerElement: vi.fn(),
    unregisterElement: vi.fn(),
    focusField: vi.fn().mockResolvedValue(true),
    getElementsInScope: vi.fn().mockReturnValue([]),
    canFocusElement: vi.fn().mockReturnValue(true),
    getCurrentScope: vi.fn().mockReturnValue({ id: 'test-scope' })
  })
}));

describe('useFocusFlow', () => {
  // Sample flow configuration for testing
  const mockFlow: FocusFlow = {
    id: 'test-flow',
    name: 'Test Flow',
    nodes: [
      {
        id: 'field1',
        order: 1,
        required: true,
        label: 'Field 1',
        type: 'input'
      },
      {
        id: 'field2',
        order: 2,
        required: true,
        label: 'Field 2',
        type: 'input',
        skipIf: 'shouldSkipField2'
      },
      {
        id: 'field3',
        order: 3,
        required: false,
        label: 'Field 3',
        type: 'select',
        validateOnLeave: 'validateField3'
      },
      {
        id: 'field4',
        order: 4,
        required: true,
        label: 'Field 4',
        type: 'button'
      }
    ],
    branches: {
      'field1': {
        condition: 'checkBranch',
        truePath: 'field3',
        falsePath: 'field2'
      }
    },
    validators: {
      shouldSkipField2: vi.fn().mockReturnValue(false),
      validateField3: vi.fn().mockReturnValue(true),
      checkBranch: vi.fn().mockReturnValue(false)
    }
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FocusManagerProvider>{children}</FocusManagerProvider>
  );

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock DOM elements
    document.body.innerHTML = `
      <input id="field1" />
      <input id="field2" />
      <select id="field3"><option>Test</option></select>
      <button id="field4">Submit</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      expect(result.current.state).toMatchObject({
        flowId: 'test-flow',
        currentNodeId: '',
        currentIndex: -1,
        isComplete: false,
        visitedNodes: new Set(),
        completedNodes: new Set(),
        skippedNodes: new Set()
      });
    });

    it('should auto-register nodes when autoRegister is true', () => {
      const registerElement = vi.fn();
      vi.mocked(require('../../contexts/focus/useFocusManager').useFocusManager).mockReturnValue({
        registerElement,
        unregisterElement: vi.fn(),
        focusField: vi.fn(),
        getElementsInScope: vi.fn(),
        canFocusElement: vi.fn(),
        getCurrentScope: vi.fn()
      });

      renderHook(() => useFocusFlow(mockFlow, { autoRegister: true }), { wrapper });

      expect(registerElement).toHaveBeenCalledTimes(4); // 4 nodes in the flow
    });

    it('should not auto-register nodes when autoRegister is false', () => {
      const registerElement = vi.fn();
      vi.mocked(require('../../contexts/focus/useFocusManager').useFocusManager).mockReturnValue({
        registerElement,
        unregisterElement: vi.fn(),
        focusField: vi.fn(),
        getElementsInScope: vi.fn(),
        canFocusElement: vi.fn(),
        getCurrentScope: vi.fn()
      });

      renderHook(() => useFocusFlow(mockFlow, { autoRegister: false }), { wrapper });

      expect(registerElement).not.toHaveBeenCalled();
    });
  });

  describe('Flow Navigation', () => {
    it('should start flow and focus first node', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
      });

      await waitFor(() => {
        expect(result.current.state.currentNodeId).toBe('field1');
        expect(result.current.state.currentIndex).toBe(1);
      });
    });

    it('should navigate to next node', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
      });

      await act(async () => {
        const navResult = await result.current.navigateNext();
        expect(navResult.success).toBe(true);
      });

      expect(result.current.state.currentNodeId).toBe('field2');
    });

    it('should navigate to previous node', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
        await result.current.navigateNext();
        await result.current.navigateNext();
      });

      await act(async () => {
        const navResult = await result.current.navigatePrevious();
        expect(navResult.success).toBe(true);
      });

      expect(result.current.state.currentNodeId).toBe('field2');
    });

    it('should navigate to specific node', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
      });

      await act(async () => {
        const navResult = await result.current.navigateToNode('field3');
        expect(navResult.success).toBe(true);
      });

      expect(result.current.state.currentNodeId).toBe('field3');
    });
  });

  describe('Skip Conditions', () => {
    it('should skip nodes when skip condition is true', async () => {
      const flowWithSkip = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          shouldSkipField2: vi.fn().mockReturnValue(true)
        }
      };

      const { result } = renderHook(() => useFocusFlow(flowWithSkip), { wrapper });

      await act(async () => {
        await result.current.startFlow();
      });

      const nextId = result.current.getNextNodeId('field1');
      expect(nextId).toBe('field3'); // Should skip field2
    });

    it('should track skipped nodes in state', async () => {
      const flowWithSkip = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          shouldSkipField2: vi.fn().mockReturnValue(true)
        }
      };

      const { result } = renderHook(() => useFocusFlow(flowWithSkip), { wrapper });

      await act(async () => {
        await result.current.startFlow();
        await result.current.navigateNext();
      });

      expect(result.current.state.skippedNodes.has('field2')).toBe(true);
    });
  });

  describe('Branching Logic', () => {
    it('should follow true path when branch condition is true', () => {
      const flowWithBranch = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          checkBranch: vi.fn().mockReturnValue(true)
        }
      };

      const { result } = renderHook(() => useFocusFlow(flowWithBranch), { wrapper });

      const nextId = result.current.getNextNodeId('field1');
      expect(nextId).toBe('field3'); // True path
    });

    it('should follow false path when branch condition is false', () => {
      const flowWithBranch = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          checkBranch: vi.fn().mockReturnValue(false)
        }
      };

      const { result } = renderHook(() => useFocusFlow(flowWithBranch), { wrapper });

      const nextId = result.current.getNextNodeId('field1');
      expect(nextId).toBe('field2'); // False path
    });
  });

  describe('Validation', () => {
    it('should validate on leave when validateOnLeave is set', async () => {
      const validateField3 = vi.fn().mockResolvedValue(false);
      const flowWithValidation = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          validateField3
        }
      };

      const { result } = renderHook(
        () => useFocusFlow(flowWithValidation, { validateOnNavigate: true }),
        { wrapper }
      );

      await act(async () => {
        await result.current.navigateToNode('field3');
      });

      await act(async () => {
        const navResult = await result.current.navigateNext();
        expect(navResult.success).toBe(false);
        expect(navResult.error).toContain('Validation failed');
      });

      expect(validateField3).toHaveBeenCalled();
    });

    it('should not validate when validateOnNavigate is false', async () => {
      const validateField3 = vi.fn().mockResolvedValue(false);
      const flowWithValidation = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          validateField3
        }
      };

      const { result } = renderHook(
        () => useFocusFlow(flowWithValidation, { validateOnNavigate: false }),
        { wrapper }
      );

      await act(async () => {
        await result.current.navigateToNode('field3');
      });

      await act(async () => {
        const navResult = await result.current.navigateNext();
        expect(navResult.success).toBe(true);
      });

      expect(validateField3).not.toHaveBeenCalled();
    });
  });

  describe('Flow Completion', () => {
    it('should mark flow as complete when reaching end', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
        // Navigate through all nodes
        await result.current.navigateNext(); // field2
        await result.current.navigateNext(); // field3
        await result.current.navigateNext(); // field4
        await result.current.navigateNext(); // End of flow
      });

      expect(result.current.state.isComplete).toBe(true);
    });

    it('should check if flow is complete based on required nodes', () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      act(() => {
        result.current.markNodeComplete('field1');
        result.current.markNodeComplete('field2');
        result.current.markNodeComplete('field4'); // All required nodes
      });

      expect(result.current.isFlowComplete()).toBe(true);
    });

    it('should not be complete if required nodes are missing', () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      act(() => {
        result.current.markNodeComplete('field1');
        result.current.markNodeComplete('field3'); // Optional node
      });

      expect(result.current.isFlowComplete()).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should emit flow:start event when starting flow', async () => {
      const onEvent = vi.fn();
      const { result } = renderHook(
        () => useFocusFlow(mockFlow, { onEvent }),
        { wrapper }
      );

      await act(async () => {
        await result.current.startFlow();
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flow:start',
          flowId: 'test-flow'
        })
      );
    });

    it('should emit node:enter event when entering node', async () => {
      const onEvent = vi.fn();
      const { result } = renderHook(
        () => useFocusFlow(mockFlow, { onEvent }),
        { wrapper }
      );

      await act(async () => {
        await result.current.navigateToNode('field2');
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'node:enter',
          nodeId: 'field2'
        })
      );
    });

    it('should emit flow:complete event when completing flow', async () => {
      const onEvent = vi.fn();
      const { result } = renderHook(
        () => useFocusFlow(mockFlow, { onEvent }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeFlow();
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flow:complete',
          flowId: 'test-flow'
        })
      );
    });
  });

  describe('State Management', () => {
    it('should track visited nodes', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
        await result.current.navigateNext();
        await result.current.navigateNext();
      });

      expect(result.current.state.visitedNodes.has('field1')).toBe(true);
      expect(result.current.state.visitedNodes.has('field2')).toBe(true);
      expect(result.current.state.visitedNodes.has('field3')).toBe(true);
    });

    it('should reset flow state', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      await act(async () => {
        await result.current.startFlow();
        await result.current.navigateNext();
      });

      act(() => {
        result.current.resetFlow();
      });

      expect(result.current.state).toMatchObject({
        currentNodeId: '',
        currentIndex: -1,
        visitedNodes: new Set(),
        completedNodes: new Set(),
        isComplete: false
      });
    });

    it('should store errors for failed validations', async () => {
      const flowWithValidation = {
        ...mockFlow,
        validators: {
          ...mockFlow.validators,
          validateField3: vi.fn().mockResolvedValue(false)
        }
      };

      const { result } = renderHook(
        () => useFocusFlow(flowWithValidation, { validateOnNavigate: true }),
        { wrapper }
      );

      await act(async () => {
        await result.current.navigateToNode('field3');
        await result.current.navigateNext();
      });

      expect(result.current.state.errors['field3']).toContain('Validation failed');
    });
  });

  describe('Helper Methods', () => {
    it('should get next node ID correctly', () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      expect(result.current.getNextNodeId('field1')).toBe('field2');
      expect(result.current.getNextNodeId('field2')).toBe('field3');
      expect(result.current.getNextNodeId('field3')).toBe('field4');
      expect(result.current.getNextNodeId('field4')).toBe(null);
    });

    it('should get previous node ID correctly', () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      expect(result.current.getPreviousNodeId('field4')).toBe('field3');
      expect(result.current.getPreviousNodeId('field3')).toBe('field2');
      expect(result.current.getPreviousNodeId('field2')).toBe('field1');
      expect(result.current.getPreviousNodeId('field1')).toBe(null);
    });

    it('should check if node can be focused', async () => {
      const { result } = renderHook(() => useFocusFlow(mockFlow), { wrapper });

      const canFocus = await result.current.canFocusNode('field1');
      expect(canFocus).toBe(true);

      const cannotFocus = await result.current.canFocusNode('non-existent');
      expect(cannotFocus).toBe(false);
    });
  });
});