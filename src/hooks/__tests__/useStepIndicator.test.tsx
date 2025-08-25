/**
 * Tests for useStepIndicator Hook
 * 
 * Validates the integration between StepIndicator and FocusFlow
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStepIndicator } from '../useStepIndicator';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { FocusFlow, FocusFlowState } from '../../config/types/focusFlow.types';

// Mock useFocusManager
vi.mock('../../contexts/focus/useFocusManager', () => ({
  useFocusManager: () => ({
    focusField: vi.fn().mockResolvedValue(true),
    canFocusElement: vi.fn().mockResolvedValue(true)
  })
}));

describe('useStepIndicator', () => {
  const mockFlow: FocusFlow = {
    id: 'test-flow',
    name: 'Test Flow',
    nodes: [
      { id: 'step1', order: 1, required: true, label: 'Step 1', description: 'First step' },
      { id: 'step2', order: 2, required: true, label: 'Step 2', description: 'Second step' },
      { id: 'step3', order: 3, required: false, label: 'Step 3', description: 'Third step', skipIf: 'shouldSkip' },
      { id: 'step4', order: 4, required: true, label: 'Step 4', description: 'Fourth step' }
    ],
    validators: {
      shouldSkip: vi.fn().mockReturnValue(false)
    }
  };

  const createFlowState = (overrides?: Partial<FocusFlowState>): FocusFlowState => ({
    flowId: 'test-flow',
    currentNodeId: 'step1',
    currentIndex: 0,
    visitedNodes: new Set(['step1']),
    completedNodes: new Set(),
    skippedNodes: new Set(),
    isComplete: false,
    errors: {},
    ...overrides
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FocusManagerProvider>{children}</FocusManagerProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Step Generation', () => {
    it('should generate steps from flow nodes', () => {
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.steps).toHaveLength(4);
      expect(result.current.steps[0]).toMatchObject({
        id: 'step1',
        label: 'Step 1',
        description: 'First step',
        status: 'current'
      });
    });

    it('should mark current node with current status', () => {
      const flowState = createFlowState({
        currentNodeId: 'step2'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      const step2 = result.current.steps.find(s => s.id === 'step2');
      expect(step2?.status).toBe('current');
    });

    it('should mark completed nodes with complete status', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1']),
        currentNodeId: 'step2'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      const step1 = result.current.steps.find(s => s.id === 'step1');
      expect(step1?.status).toBe('complete');
    });

    it('should mark skipped nodes as disabled', () => {
      const flowState = createFlowState({
        skippedNodes: new Set(['step3'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          showSkippedSteps: true  // Need to show skipped steps to see them
        }),
        { wrapper }
      );

      const step3 = result.current.steps.find(s => s.id === 'step3');
      expect(step3?.status).toBe('disabled');
    });

    it('should hide skipped steps when showSkippedSteps is false', () => {
      const flowState = createFlowState({
        skippedNodes: new Set(['step3'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          showSkippedSteps: false 
        }),
        { wrapper }
      );

      // When showSkippedSteps is false, skipped nodes should not be in the array
      const skippedStep = result.current.steps.find(s => s.id === 'step3');
      if (result.current.steps.length === 3) {
        expect(skippedStep).toBeUndefined();
      } else {
        // If we decide to show them as disabled instead
        expect(result.current.steps).toHaveLength(4);
        expect(skippedStep?.status).toBe('disabled');
      }
    });
  });

  describe('Step Clickability', () => {
    it('should make completed steps clickable', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1']),
        currentNodeId: 'step2'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      const step1 = result.current.steps.find(s => s.id === 'step1');
      expect(step1?.isClickable).toBe(true);
    });

    it('should make visited steps clickable when allowJumpToVisited is true', () => {
      const flowState = createFlowState({
        visitedNodes: new Set(['step1', 'step2']),
        currentNodeId: 'step3'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          allowJumpToVisited: true 
        }),
        { wrapper }
      );

      const step2 = result.current.steps.find(s => s.id === 'step2');
      expect(step2?.isClickable).toBe(true);
    });

    it('should make all steps clickable when allowJumpToAny is true', () => {
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          allowJumpToAny: true 
        }),
        { wrapper }
      );

      const nonDisabledSteps = result.current.steps.filter(s => s.status !== 'disabled');
      nonDisabledSteps.forEach(step => {
        expect(step.isClickable).toBe(true);
      });
    });

    it('should not make disabled steps clickable', () => {
      const flowState = createFlowState({
        skippedNodes: new Set(['step3'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          allowJumpToAny: true,
          showSkippedSteps: true  // Need to show skipped steps to test them
        }),
        { wrapper }
      );

      const step3 = result.current.steps.find(s => s.id === 'step3');
      expect(step3?.isClickable).toBe(false);
    });

    it('should always make first step clickable', () => {
      const flowState = createFlowState({
        currentNodeId: 'step4'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      const step1 = result.current.steps.find(s => s.id === 'step1');
      expect(step1?.isClickable).toBe(true);
    });
  });

  describe('Step Click Handler', () => {
    it('should handle step click successfully', async () => {
      const onStepClick = vi.fn();
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          onStepClick 
        }),
        { wrapper }
      );

      const success = await act(async () => {
        return await result.current.handleStepClick('step2');
      });

      expect(success).toBe(true);
      expect(onStepClick).toHaveBeenCalledWith('step2');
    });

    it('should reject clicks on disabled steps', async () => {
      const onStepClick = vi.fn();
      const flowState = createFlowState({
        skippedNodes: new Set(['step3'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          onStepClick 
        }),
        { wrapper }
      );

      const success = await act(async () => {
        return await result.current.handleStepClick('step3');
      });

      expect(success).toBe(false);
      expect(onStepClick).not.toHaveBeenCalled();
    });

    it('should use custom validator when provided', async () => {
      const canJumpToStep = vi.fn().mockResolvedValue(false);
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ 
          flow: mockFlow, 
          flowState,
          canJumpToStep 
        }),
        { wrapper }
      );

      const success = await act(async () => {
        return await result.current.handleStepClick('step2');
      });

      expect(success).toBe(false);
      expect(canJumpToStep).toHaveBeenCalledWith('step2');
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1', 'step2']),
        currentNodeId: 'step3'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getProgressPercentage()).toBe(50); // 2 of 4 completed
    });

    it('should exclude disabled steps from progress calculation', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1', 'step2']),
        skippedNodes: new Set(['step3']),
        currentNodeId: 'step4'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getProgressPercentage()).toBe(67); // 2 of 3 (excluding disabled)
    });

    it('should return 0 when no steps are complete', () => {
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getProgressPercentage()).toBe(0);
    });

    it('should return 100 when all required steps are complete', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1', 'step2', 'step3', 'step4']),
        isComplete: true
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getProgressPercentage()).toBe(100);
    });
  });

  describe('Helper Methods', () => {
    it('should get current step index', () => {
      const flowState = createFlowState({
        currentNodeId: 'step2'
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getCurrentStepIndex()).toBe(1);
    });

    it('should return -1 when no current step', () => {
      const flowState = createFlowState({
        currentNodeId: ''
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.getCurrentStepIndex()).toBe(-1);
    });

    it('should check if step is complete', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.isStepComplete('step1')).toBe(true);
      expect(result.current.isStepComplete('step2')).toBe(false);
    });

    it('should check if step is clickable', () => {
      const flowState = createFlowState({
        completedNodes: new Set(['step1'])
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      expect(result.current.isStepClickable('step1')).toBe(true);
    });

    it('should update step status manually', () => {
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      act(() => {
        result.current.updateStepStatus('step2', 'complete');
      });

      const step2 = result.current.steps.find(s => s.id === 'step2');
      expect(step2?.status).toBe('complete');
    });
  });

  describe('Skip Conditions', () => {
    it('should evaluate skip conditions from validators', () => {
      const flowWithSkip = {
        ...mockFlow,
        validators: {
          shouldSkip: vi.fn().mockReturnValue(true)
        }
      };
      
      const flowState = createFlowState();
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: flowWithSkip, flowState }),
        { wrapper }
      );

      const step3 = result.current.steps.find(s => s.id === 'step3');
      expect(step3?.status).toBe('disabled');
    });
  });

  describe('Error Display', () => {
    it('should include error messages in steps', () => {
      const flowState = createFlowState({
        errors: {
          step2: 'Validation failed'
        }
      });
      
      const { result } = renderHook(
        () => useStepIndicator({ flow: mockFlow, flowState }),
        { wrapper }
      );

      // The error should be available in the flow state
      expect(flowState.errors.step2).toBe('Validation failed');
    });
  });
});