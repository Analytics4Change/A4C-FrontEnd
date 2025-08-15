/**
 * StepIndicator Component
 * 
 * Visual progress indicator that integrates with FocusManagerContext
 * to show navigation steps and allow clickable navigation between them.
 */

import React, { useCallback, useMemo } from 'react';
import { useFocusManager } from '../../contexts/focus/useFocusManager';
import { StepIndicatorData } from '../../contexts/focus/types';

/**
 * Props for the StepIndicator component
 */
export interface StepIndicatorProps {
  /** Custom steps array (if not using focus manager's visible steps) */
  steps?: StepIndicatorData[];
  
  /** Orientation of the indicator */
  orientation?: 'horizontal' | 'vertical';
  
  /** Show connector lines between steps */
  showConnectors?: boolean;
  
  /** Allow jumping to previously visited or valid steps */
  allowJumping?: boolean;
  
  /** Callback when a step is clicked */
  onStepClick?: (stepId: string) => void;
  
  /** Additional CSS class for the container */
  className?: string;
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Show step descriptions */
  showDescriptions?: boolean;
  
  /** Custom render function for step content */
  renderStepContent?: (step: StepIndicatorData, index: number) => React.ReactNode;
  
  /** Animate transitions between steps */
  animated?: boolean;
}

/**
 * StepIndicator Component
 * 
 * Displays a visual progress indicator with clickable steps that integrate
 * with the FocusManagerContext for navigation.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps: customSteps,
  orientation = 'horizontal',
  showConnectors = true,
  allowJumping = false,
  onStepClick,
  className = '',
  size = 'medium',
  showDescriptions = true,
  renderStepContent,
  animated = true
}) => {
  const {
    getVisibleSteps,
    handleMouseNavigation,
    canJumpToNode,
    setNavigationMode,
    focusField
  } = useFocusManager();
  
  // Use custom steps or get from focus manager
  const steps = useMemo(() => {
    return customSteps || getVisibleSteps();
  }, [customSteps, getVisibleSteps]);
  
  /**
   * Handle step click with validation
   */
  const handleStepClick = useCallback((
    step: StepIndicatorData,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    
    // Set navigation mode to hybrid when clicking steps
    setNavigationMode('hybrid' as any);
    
    // Check if jumping is allowed
    const canJump = allowJumping || step.isClickable || canJumpToNode(step.id);
    
    if (!canJump) {
      // Add visual feedback for invalid jump
      const target = event.currentTarget as HTMLElement;
      target.classList.add('step-indicator-invalid-jump');
      setTimeout(() => {
        target.classList.remove('step-indicator-invalid-jump');
      }, 300);
      
      console.log(`[StepIndicator] Cannot jump to step: ${step.id}`);
      return;
    }
    
    // Handle the navigation through focus manager
    handleMouseNavigation(step.id, event.nativeEvent);
    
    // Alternative: Direct focus if handleMouseNavigation is not available
    focusField(step.id);
    
    // Call parent handler if provided
    onStepClick?.(step.id);
  }, [
    allowJumping,
    canJumpToNode,
    handleMouseNavigation,
    setNavigationMode,
    focusField,
    onStepClick
  ]);
  
  /**
   * Get size classes based on size prop
   */
  const getSizeClasses = useCallback(() => {
    switch (size) {
      case 'small':
        return {
          container: 'gap-2',
          step: 'w-8 h-8 text-xs',
          connector: orientation === 'horizontal' ? 'h-0.5 min-w-8' : 'w-0.5 min-h-8',
          label: 'text-xs',
          description: 'text-xs'
        };
      case 'large':
        return {
          container: 'gap-4',
          step: 'w-12 h-12 text-base',
          connector: orientation === 'horizontal' ? 'h-1 min-w-16' : 'w-1 min-h-16',
          label: 'text-base',
          description: 'text-sm'
        };
      default: // medium
        return {
          container: 'gap-3',
          step: 'w-10 h-10 text-sm',
          connector: orientation === 'horizontal' ? 'h-0.5 min-w-12' : 'w-0.5 min-h-12',
          label: 'text-sm',
          description: 'text-xs'
        };
    }
  }, [size, orientation]);
  
  const sizeClasses = getSizeClasses();
  
  /**
   * Get status-based classes for a step
   */
  const getStepClasses = useCallback((step: StepIndicatorData) => {
    const baseClasses = `
      step-indicator-item
      relative flex items-center justify-center
      rounded-full border-2 font-medium
      ${sizeClasses.step}
      ${animated ? 'transition-all duration-200' : ''}
    `;
    
    switch (step.status) {
      case 'complete':
        return `${baseClasses} 
          bg-green-500 border-green-500 text-white
          ${step.isClickable || allowJumping ? 'cursor-pointer hover:bg-green-600' : 'cursor-default'}
        `;
      case 'current':
        return `${baseClasses}
          bg-blue-500 border-blue-500 text-white
          ring-4 ring-blue-200 ring-opacity-50
          cursor-default
        `;
      case 'upcoming':
        return `${baseClasses}
          bg-white border-gray-300 text-gray-500
          ${step.isClickable || allowJumping ? 'cursor-pointer hover:border-gray-400' : 'cursor-not-allowed'}
        `;
      case 'disabled':
        return `${baseClasses}
          bg-gray-100 border-gray-300 text-gray-400
          cursor-not-allowed opacity-50
        `;
      default:
        return baseClasses;
    }
  }, [sizeClasses.step, allowJumping, animated]);
  
  /**
   * Get connector classes based on next step status
   */
  const getConnectorClasses = useCallback((currentStep: StepIndicatorData, nextStep: StepIndicatorData | undefined) => {
    if (!nextStep) return '';
    
    const baseClasses = `
      step-connector
      ${sizeClasses.connector}
      ${animated ? 'transition-all duration-200' : ''}
    `;
    
    // Connector is active if current step is complete or current
    const isActive = currentStep.status === 'complete' || 
                    (currentStep.status === 'current' && nextStep.status === 'complete');
    
    return `${baseClasses} ${isActive ? 'bg-green-500' : 'bg-gray-300'}`;
  }, [sizeClasses.connector, animated]);
  
  /**
   * Render step icon based on status
   */
  const renderStepIcon = useCallback((step: StepIndicatorData, index: number) => {
    if (step.status === 'complete') {
      // Checkmark icon for completed steps
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Step number for other statuses
    return <span>{index + 1}</span>;
  }, []);
  
  /**
   * Container classes based on orientation
   */
  const containerClasses = `
    step-indicator
    flex ${sizeClasses.container}
    ${orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col'}
    ${className}
  `;
  
  return (
    <nav
      className={containerClasses}
      role="navigation"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step Item */}
          <div
            className={`
              step-item-container
              flex ${orientation === 'horizontal' ? 'flex-col' : 'flex-row'}
              items-center ${sizeClasses.container}
            `}
          >
            {/* Step Button */}
            <button
              className={getStepClasses(step)}
              onClick={(e) => handleStepClick(step, e)}
              disabled={step.status === 'disabled' && !allowJumping}
              aria-current={step.status === 'current' ? 'step' : undefined}
              aria-label={`
                Step ${index + 1}: ${step.label}
                ${step.status === 'complete' ? ' (completed)' : ''}
                ${step.status === 'current' ? ' (current)' : ''}
                ${step.status === 'disabled' ? ' (disabled)' : ''}
              `.trim()}
              data-step-id={step.id}
              data-step-status={step.status}
              title={step.description || step.label}
            >
              {renderStepContent ? (
                renderStepContent(step, index)
              ) : (
                renderStepIcon(step, index)
              )}
            </button>
            
            {/* Step Label and Description */}
            <div
              className={`
                step-content
                ${orientation === 'horizontal' ? 'mt-2 text-center' : 'ml-3'}
                ${orientation === 'horizontal' ? 'max-w-24' : ''}
              `}
            >
              <div className={`step-label font-medium ${sizeClasses.label}`}>
                {step.label}
              </div>
              {showDescriptions && step.description && (
                <div className={`step-description text-gray-500 ${sizeClasses.description} mt-1`}>
                  {step.description}
                </div>
              )}
            </div>
          </div>
          
          {/* Connector Line */}
          {showConnectors && index < steps.length - 1 && (
            <div
              className={getConnectorClasses(step, steps[index + 1])}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * Vertical step indicator variant
 */
export const VerticalStepIndicator: React.FC<Omit<StepIndicatorProps, 'orientation'>> = (props) => {
  return <StepIndicator {...props} orientation="vertical" />;
};

/**
 * Compact step indicator (no descriptions)
 */
export const CompactStepIndicator: React.FC<Omit<StepIndicatorProps, 'showDescriptions' | 'size'>> = (props) => {
  return <StepIndicator {...props} showDescriptions={false} size="small" />;
};

/**
 * Default export
 */
export default StepIndicator;