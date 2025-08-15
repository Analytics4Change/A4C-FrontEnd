/**
 * StepIndicator Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StepIndicator, VerticalStepIndicator, CompactStepIndicator } from './StepIndicator';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../contexts/focus/useFocusManager';
import { StepIndicatorData } from '../../contexts/focus/types';
import { FocusableField } from '../FocusableField';

// Mock the useFocusManager hook
jest.mock('../../contexts/focus/useFocusManager');

describe('StepIndicator Component', () => {
  const mockSteps: StepIndicatorData[] = [
    {
      id: 'step-1',
      label: 'Step 1',
      description: 'First step',
      status: 'complete',
      isClickable: true
    },
    {
      id: 'step-2',
      label: 'Step 2',
      description: 'Second step',
      status: 'current',
      isClickable: true
    },
    {
      id: 'step-3',
      label: 'Step 3',
      description: 'Third step',
      status: 'upcoming',
      isClickable: false
    },
    {
      id: 'step-4',
      label: 'Step 4',
      description: 'Fourth step',
      status: 'disabled',
      isClickable: false
    }
  ];
  
  const mockFocusManager = {
    getVisibleSteps: jest.fn(() => mockSteps),
    handleMouseNavigation: jest.fn(),
    canJumpToNode: jest.fn((id) => mockSteps.find(s => s.id === id)?.isClickable || false),
    setNavigationMode: jest.fn(),
    focusField: jest.fn(),
    state: {
      currentFocusId: 'step-2',
      navigationMode: 'keyboard'
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useFocusManager as jest.Mock).mockReturnValue(mockFocusManager);
  });
  
  describe('Basic Rendering', () => {
    it('should render all steps with correct labels', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
      expect(screen.getByText('Step 4')).toBeInTheDocument();
    });
    
    it('should render descriptions when showDescriptions is true', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} showDescriptions={true} />
        </FocusManagerProvider>
      );
      
      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
      expect(screen.getByText('Third step')).toBeInTheDocument();
      expect(screen.getByText('Fourth step')).toBeInTheDocument();
    });
    
    it('should not render descriptions when showDescriptions is false', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} showDescriptions={false} />
        </FocusManagerProvider>
      );
      
      expect(screen.queryByText('First step')).not.toBeInTheDocument();
      expect(screen.queryByText('Second step')).not.toBeInTheDocument();
    });
    
    it('should use steps from focus manager when no custom steps provided', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator />
        </FocusManagerProvider>
      );
      
      expect(mockFocusManager.getVisibleSteps).toHaveBeenCalled();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });
  
  describe('Status Rendering', () => {
    it('should apply correct classes for complete status', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const completeStep = screen.getByRole('button', { name: /Step 1.*completed/i });
      expect(completeStep).toHaveClass('bg-green-500');
      expect(completeStep).toHaveAttribute('data-step-status', 'complete');
    });
    
    it('should apply correct classes for current status', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const currentStep = screen.getByRole('button', { name: /Step 2.*current/i });
      expect(currentStep).toHaveClass('bg-blue-500');
      expect(currentStep).toHaveClass('ring-4');
      expect(currentStep).toHaveAttribute('aria-current', 'step');
      expect(currentStep).toHaveAttribute('data-step-status', 'current');
    });
    
    it('should apply correct classes for upcoming status', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const upcomingStep = screen.getByRole('button', { name: /Step 3/i });
      expect(upcomingStep).toHaveClass('bg-white');
      expect(upcomingStep).toHaveAttribute('data-step-status', 'upcoming');
    });
    
    it('should apply correct classes for disabled status', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const disabledStep = screen.getByRole('button', { name: /Step 4.*disabled/i });
      expect(disabledStep).toHaveClass('bg-gray-100');
      expect(disabledStep).toHaveClass('opacity-50');
      expect(disabledStep).toHaveAttribute('disabled');
      expect(disabledStep).toHaveAttribute('data-step-status', 'disabled');
    });
  });
  
  describe('Click Navigation', () => {
    it('should handle clicks on clickable steps', () => {
      const onStepClick = jest.fn();
      
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} onStepClick={onStepClick} />
        </FocusManagerProvider>
      );
      
      const clickableStep = screen.getByRole('button', { name: /Step 1/i });
      fireEvent.click(clickableStep);
      
      expect(mockFocusManager.setNavigationMode).toHaveBeenCalledWith('hybrid');
      expect(mockFocusManager.handleMouseNavigation).toHaveBeenCalled();
      expect(mockFocusManager.focusField).toHaveBeenCalledWith('step-1');
      expect(onStepClick).toHaveBeenCalledWith('step-1');
    });
    
    it('should prevent navigation to non-clickable steps', () => {
      const onStepClick = jest.fn();
      
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} onStepClick={onStepClick} />
        </FocusManagerProvider>
      );
      
      const nonClickableStep = screen.getByRole('button', { name: /Step 3/i });
      fireEvent.click(nonClickableStep);
      
      expect(mockFocusManager.handleMouseNavigation).not.toHaveBeenCalled();
      expect(mockFocusManager.focusField).not.toHaveBeenCalled();
      expect(onStepClick).not.toHaveBeenCalled();
    });
    
    it('should allow jumping when allowJumping is true', () => {
      const onStepClick = jest.fn();
      
      render(
        <FocusManagerProvider>
          <StepIndicator 
            steps={mockSteps} 
            allowJumping={true}
            onStepClick={onStepClick} 
          />
        </FocusManagerProvider>
      );
      
      const upcomingStep = screen.getByRole('button', { name: /Step 3/i });
      fireEvent.click(upcomingStep);
      
      // Should navigate even though isClickable is false
      expect(mockFocusManager.handleMouseNavigation).toHaveBeenCalledWith('step-3', expect.any(Object));
      expect(mockFocusManager.focusField).toHaveBeenCalledWith('step-3');
      expect(onStepClick).toHaveBeenCalledWith('step-3');
    });
    
    it('should add invalid jump animation class when jump is not allowed', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} allowJumping={false} />
        </FocusManagerProvider>
      );
      
      const nonClickableStep = screen.getByRole('button', { name: /Step 3/i });
      fireEvent.click(nonClickableStep);
      
      expect(nonClickableStep).toHaveClass('step-indicator-invalid-jump');
      
      // Class should be removed after animation
      waitFor(() => {
        expect(nonClickableStep).not.toHaveClass('step-indicator-invalid-jump');
      }, { timeout: 400 });
    });
  });
  
  describe('Orientation', () => {
    it('should render horizontally by default', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-row');
    });
    
    it('should render vertically when orientation is vertical', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} orientation="vertical" />
        </FocusManagerProvider>
      );
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-col');
    });
    
    it('should use VerticalStepIndicator variant', () => {
      render(
        <FocusManagerProvider>
          <VerticalStepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-col');
    });
  });
  
  describe('Connectors', () => {
    it('should render connectors by default', () => {
      const { container } = render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const connectors = container.querySelectorAll('.step-connector');
      expect(connectors).toHaveLength(3); // 4 steps = 3 connectors
    });
    
    it('should not render connectors when showConnectors is false', () => {
      const { container } = render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} showConnectors={false} />
        </FocusManagerProvider>
      );
      
      const connectors = container.querySelectorAll('.step-connector');
      expect(connectors).toHaveLength(0);
    });
    
    it('should style connectors based on step status', () => {
      const { container } = render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const connectors = container.querySelectorAll('.step-connector');
      expect(connectors[0]).toHaveClass('bg-green-500'); // After complete step
      expect(connectors[1]).toHaveClass('bg-gray-300'); // After current step
    });
  });
  
  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} size="small" />
        </FocusManagerProvider>
      );
      
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).toHaveClass('w-8', 'h-8', 'text-xs');
    });
    
    it('should apply medium size classes by default', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).toHaveClass('w-10', 'h-10', 'text-sm');
    });
    
    it('should apply large size classes', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} size="large" />
        </FocusManagerProvider>
      );
      
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).toHaveClass('w-12', 'h-12', 'text-base');
    });
    
    it('should use CompactStepIndicator variant', () => {
      render(
        <FocusManagerProvider>
          <CompactStepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      expect(screen.queryByText('First step')).not.toBeInTheDocument();
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).toHaveClass('w-8', 'h-8', 'text-xs');
    });
  });
  
  describe('Custom Rendering', () => {
    it('should use custom renderStepContent function', () => {
      const renderStepContent = jest.fn((step, index) => `Custom ${index}`);
      
      render(
        <FocusManagerProvider>
          <StepIndicator 
            steps={mockSteps}
            renderStepContent={renderStepContent}
          />
        </FocusManagerProvider>
      );
      
      expect(renderStepContent).toHaveBeenCalledTimes(4);
      expect(screen.getByText('Custom 0')).toBeInTheDocument();
      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
      expect(screen.getByText('Custom 3')).toBeInTheDocument();
    });
    
    it('should render checkmark icon for completed steps by default', () => {
      const { container } = render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const completeStep = screen.getByRole('button', { name: /Step 1/i });
      const svg = completeStep.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
    
    it('should render step numbers for non-completed steps', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const currentStep = screen.getByRole('button', { name: /Step 2/i });
      expect(within(currentStep).getByText('2')).toBeInTheDocument();
      
      const upcomingStep = screen.getByRole('button', { name: /Step 3/i });
      expect(within(upcomingStep).getByText('3')).toBeInTheDocument();
    });
  });
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Progress steps');
      
      const currentStep = screen.getByRole('button', { name: /Step 2/i });
      expect(currentStep).toHaveAttribute('aria-current', 'step');
      
      const completeStep = screen.getByRole('button', { name: /Step 1.*completed/i });
      expect(completeStep).toHaveAttribute('aria-label', expect.stringContaining('completed'));
      
      const disabledStep = screen.getByRole('button', { name: /Step 4.*disabled/i });
      expect(disabledStep).toHaveAttribute('aria-label', expect.stringContaining('disabled'));
    });
    
    it('should mark connectors as aria-hidden', () => {
      const { container } = render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const connectors = container.querySelectorAll('.step-connector');
      connectors.forEach(connector => {
        expect(connector).toHaveAttribute('aria-hidden', 'true');
      });
    });
    
    it('should have proper keyboard navigation', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} />
        </FocusManagerProvider>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button, index) => {
        if (mockSteps[index].status === 'disabled') {
          expect(button).toHaveAttribute('disabled');
        } else {
          expect(button).not.toHaveAttribute('disabled');
        }
      });
    });
  });
  
  describe('Integration with FocusableField', () => {
    it('should work with FocusableField components', async () => {
      const TestForm = () => {
        return (
          <FocusManagerProvider>
            <StepIndicator />
            <FocusableField
              id="field-1"
              order={1}
              stepIndicator={{
                label: 'Field 1',
                description: 'First field',
                allowDirectAccess: true
              }}
            >
              <input type="text" />
            </FocusableField>
            <FocusableField
              id="field-2"
              order={2}
              stepIndicator={{
                label: 'Field 2',
                description: 'Second field',
                allowDirectAccess: false
              }}
            >
              <input type="text" />
            </FocusableField>
          </FocusManagerProvider>
        );
      };
      
      render(<TestForm />);
      
      // Should call getVisibleSteps to get field metadata
      expect(mockFocusManager.getVisibleSteps).toHaveBeenCalled();
    });
  });
  
  describe('Animation', () => {
    it('should include transition classes when animated is true', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} animated={true} />
        </FocusManagerProvider>
      );
      
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).toHaveClass('transition-all', 'duration-200');
    });
    
    it('should not include transition classes when animated is false', () => {
      render(
        <FocusManagerProvider>
          <StepIndicator steps={mockSteps} animated={false} />
        </FocusManagerProvider>
      );
      
      const step = screen.getByRole('button', { name: /Step 1/i });
      expect(step).not.toHaveClass('transition-all');
    });
  });
});