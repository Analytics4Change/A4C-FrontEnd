/**
 * FlowStepIndicator Component
 * 
 * A StepIndicator that automatically integrates with useFocusFlow hook
 * to provide real-time navigation feedback and clickable step progression.
 * 
 * @module FlowStepIndicator
 */

import React, { useEffect, useMemo } from 'react';
import { StepIndicator, StepIndicatorProps } from './StepIndicator';
import { useStepIndicator } from '../../hooks/useStepIndicator';
import { FocusFlow, FocusFlowState } from '../../config/types/focusFlow.types';

/**
 * Props for FlowStepIndicator
 */
export interface FlowStepIndicatorProps extends Omit<StepIndicatorProps, 'steps' | 'onStepClick'> {
  /** Focus flow configuration */
  flow: FocusFlow;
  
  /** Current flow state from useFocusFlow */
  flowState: FocusFlowState;
  
  /** Callback to navigate to a specific node */
  onNavigateToNode?: (nodeId: string) => Promise<any>;
  
  /** Whether to allow jumping to visited steps */
  allowJumpToVisited?: boolean;
  
  /** Whether to show progress percentage */
  showProgress?: boolean;
  
  /** Custom progress render */
  renderProgress?: (percentage: number) => React.ReactNode;
  
  /** Whether to show step numbers */
  showStepNumbers?: boolean;
  
  /** Whether to highlight errors */
  showErrors?: boolean;
}

/**
 * FlowStepIndicator Component
 * 
 * Provides automatic integration between StepIndicator and FocusFlow
 */
export const FlowStepIndicator: React.FC<FlowStepIndicatorProps> = ({
  flow,
  flowState,
  onNavigateToNode,
  allowJumpToVisited = true,
  showProgress = false,
  renderProgress,
  showStepNumbers = true,
  showErrors = true,
  ...stepIndicatorProps
}) => {
  // Use the step indicator hook
  const {
    steps,
    handleStepClick,
    getProgressPercentage,
    getCurrentStepIndex
  } = useStepIndicator({
    flow,
    flowState,
    allowJumpToVisited,
    onStepClick: async (stepId) => {
      if (onNavigateToNode) {
        await onNavigateToNode(stepId);
      }
    }
  });
  
  // Enhanced steps with error information
  const enhancedSteps = useMemo(() => {
    return steps.map((step, index) => {
      // Add error information if available
      const hasError = showErrors && flowState.errors[step.id];
      
      return {
        ...step,
        label: showStepNumbers ? `${index + 1}. ${step.label}` : step.label,
        description: hasError ? flowState.errors[step.id] : step.description,
        // Override status if there's an error
        status: hasError ? ('error' as any) : step.status
      };
    });
  }, [steps, flowState.errors, showErrors, showStepNumbers]);
  
  // Calculate progress
  const progress = useMemo(() => getProgressPercentage(), [getProgressPercentage]);
  
  // Log current state in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[FlowStepIndicator] State update:', {
        currentNode: flowState.currentNodeId,
        currentIndex: getCurrentStepIndex(),
        progress: `${progress}%`,
        completed: Array.from(flowState.completedNodes),
        skipped: Array.from(flowState.skippedNodes)
      });
    }
  }, [flowState, getCurrentStepIndex, progress]);
  
  return (
    <div className="flow-step-indicator-container">
      {/* Progress Bar */}
      {showProgress && (
        <div className="flow-progress mb-4">
          {renderProgress ? (
            renderProgress(progress)
          ) : (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress: ${progress}%`}
              />
            </div>
          )}
          <div className="text-sm text-gray-600 mt-1 text-center">
            {progress}% Complete
          </div>
        </div>
      )}
      
      {/* Step Indicator */}
      <StepIndicator
        {...stepIndicatorProps}
        steps={enhancedSteps}
        onStepClick={handleStepClick}
      />
      
      {/* Flow Status */}
      {flowState.isComplete && (
        <div className="flow-complete-message mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
          <svg className="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Flow Completed Successfully!
        </div>
      )}
    </div>
  );
};

/**
 * Compact version with minimal UI
 */
export const CompactFlowStepIndicator: React.FC<FlowStepIndicatorProps> = (props) => {
  return (
    <FlowStepIndicator
      {...props}
      size="small"
      showDescriptions={false}
      showProgress={false}
      showStepNumbers={false}
    />
  );
};

/**
 * Vertical version for sidebars
 */
export const VerticalFlowStepIndicator: React.FC<FlowStepIndicatorProps> = (props) => {
  return (
    <FlowStepIndicator
      {...props}
      orientation="vertical"
      showProgress={true}
    />
  );
};

/**
 * Progress-only indicator
 */
export const FlowProgressBar: React.FC<Pick<FlowStepIndicatorProps, 'flow' | 'flowState'>> = ({
  flow,
  flowState
}) => {
  const { getProgressPercentage, steps } = useStepIndicator({
    flow,
    flowState
  });
  
  const progress = getProgressPercentage();
  const currentStep = steps.find(s => s.status === 'current');
  
  return (
    <div className="flow-progress-bar">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {steps.findIndex(s => s === currentStep) + 1} of {steps.length}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {currentStep && (
        <div className="mt-2 text-sm font-medium text-gray-700">
          Current: {currentStep.label}
        </div>
      )}
    </div>
  );
};

export default FlowStepIndicator;