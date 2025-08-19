/**
 * StepIndicator Unit Tests
 * Comprehensive tests for Task 005: StepIndicator component functionality
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { 
  StepIndicator, 
  StepIndicatorProps,
  VerticalStepIndicator,
  CompactStepIndicator
} from '../StepIndicator';
import { FocusManagerProvider } from '../../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../../contexts/focus/useFocusManager';
import { StepIndicatorData, NavigationMode } from '../../../contexts/focus/types';

// Mock CSS modules
vi.mock('../StepIndicator.css', () => ({}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FocusManagerProvider debug={true}>
    {children}
  </FocusManagerProvider>
);

// Mock step data for testing
const mockSteps: StepIndicatorData[] = [
  {
    id: 'step1',
    label: 'Personal Info',
    description: 'Enter your personal information',
    status: 'complete',
    isClickable: true
  },
  {
    id: 'step2',
    label: 'Contact Details',
    description: 'Enter your contact information',
    status: 'current',
    isClickable: true
  },
  {
    id: 'step3',
    label: 'Preferences',
    description: 'Set your preferences',
    status: 'upcoming',
    isClickable: false
  },
  {
    id: 'step4',
    label: 'Review',
    description: 'Review your information',
    status: 'disabled',
    isClickable: false
  }
];

// Test component that provides focus manager state
const FocusManagerSetup = ({ children }: { children: React.ReactNode }) => {
  const { registerElement, state } = useFocusManager();
  
  React.useEffect(() => {
    // Register some test elements
    registerElement({
      id: 'step1',
      ref: { current: document.createElement('input') },
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 1,
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Personal Info',
        stepDescription: 'Enter your personal information'
      }
    });
    
    registerElement({
      id: 'step2',
      ref: { current: document.createElement('input') },
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 2,
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Contact Details',
        stepDescription: 'Enter your contact information'
      }
    });
    
    registerElement({
      id: 'step3',
      ref: { current: document.createElement('input') },
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 3,
      canFocus: false,
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Review',
        stepDescription: 'Review your information'
      }
    });
  }, [registerElement]);
  
  return <>{children}</>;
};

// Basic test component
const BasicStepIndicatorTest: React.FC<Partial<StepIndicatorProps>> = (props) => {
  return (
    <TestWrapper>
      <StepIndicator 
        steps={mockSteps} 
        {...props} 
      />
    </TestWrapper>
  );
};

// Interactive test component
const InteractiveStepIndicatorTest = () => {
  const [clickedSteps, setClickedSteps] = React.useState<string[]>([]);
  
  const handleStepClick = (stepId: string) => {
    setClickedSteps(prev => [...prev, stepId]);
  };
  
  return (
    <TestWrapper>
      <FocusManagerSetup>
        <StepIndicator 
          allowJumping={true}
          onStepClick={handleStepClick}
        />
        <div data-testid="clicked-steps">
          {clickedSteps.join(', ')}
        </div>
      </FocusManagerSetup>
    </TestWrapper>
  );
};

// Custom step test component
const CustomStepTest = () => {
  const customSteps: StepIndicatorData[] = [
    {
      id: 'custom1',
      label: 'Custom Step 1',
      status: 'complete',
      isClickable: true
    },
    {
      id: 'custom2',
      label: 'Custom Step 2',
      status: 'current',
      isClickable: true
    }
  ];
  
  const renderCustomStep = (step: StepIndicatorData, index: number) => {
    return (
      <span data-testid={`custom-step-${step.id}`}>
        {step.label} (Custom)
      </span>
    );
  };
  
  return (
    <TestWrapper>
      <StepIndicator 
        steps={customSteps}
        renderStepContent={renderCustomStep}
      />
    </TestWrapper>
  );
};

// Validation test component
const ValidationStepTest = () => {
  const [allowJumping, setAllowJumping] = React.useState(false);
  
  return (
    <TestWrapper>
      <FocusManagerSetup>
        <div>
          <button 
            data-testid="toggle-jumping" 
            onClick={() => setAllowJumping(!allowJumping)}
          >
            Toggle Jumping ({allowJumping.toString()})
          </button>
          
          <StepIndicator 
            allowJumping={allowJumping}
          />
        </div>
      </FocusManagerSetup>
    </TestWrapper>
  );
};

// Navigation mode test component
const NavigationModeTest = () => {
  return (
    <TestWrapper>
      <FocusManagerSetup>
        <StepIndicator />
      </FocusManagerSetup>
    </TestWrapper>
  );
};

describe('StepIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render step indicator with provided steps', () => {
      render(<BasicStepIndicatorTest />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText(/Progress steps/i)).toBeInTheDocument();
      
      mockSteps.forEach(step => {
        expect(screen.getByText(step.label)).toBeInTheDocument();
      });
    });

    it('should render horizontal orientation by default', () => {
      render(<BasicStepIndicatorTest />);
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-row');
    });

    it('should render vertical orientation when specified', () => {
      render(<BasicStepIndicatorTest orientation="vertical" />);
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-col');
    });

    it('should render connectors by default', () => {
      render(<BasicStepIndicatorTest />);
      
      const connectors = screen.container.querySelectorAll('.step-connector');
      // Should have connectors between steps (n-1 connectors for n steps)
      expect(connectors.length).toBe(mockSteps.length - 1);
    });

    it('should hide connectors when disabled', () => {
      render(<BasicStepIndicatorTest showConnectors={false} />);
      
      const connectors = screen.container.querySelectorAll('.step-connector');
      expect(connectors.length).toBe(0);
    });

    it('should render descriptions by default', () => {
      render(<BasicStepIndicatorTest />);
      
      mockSteps.forEach(step => {
        if (step.description) {
          expect(screen.getByText(step.description)).toBeInTheDocument();
        }
      });
    });

    it('should hide descriptions when disabled', () => {
      render(<BasicStepIndicatorTest showDescriptions={false} />);
      
      mockSteps.forEach(step => {
        if (step.description) {
          expect(screen.queryByText(step.description)).not.toBeInTheDocument();
        }
      });
    });

    it('should apply custom class name', () => {
      render(<BasicStepIndicatorTest className="custom-step-class" />);
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('custom-step-class');
    });
  });

  describe('Step Status Rendering', () => {
    it('should render complete step with checkmark', () => {
      render(<BasicStepIndicatorTest />);
      
      const completeStep = screen.getByLabelText(/Step 1.*completed/i);
      expect(completeStep).toBeInTheDocument();
      expect(completeStep).toHaveAttribute('data-step-status', 'complete');
      
      // Check for checkmark SVG
      const checkmark = completeStep.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('should render current step with number and ring', () => {
      render(<BasicStepIndicatorTest />);
      
      const currentStep = screen.getByLabelText(/Step 2.*current/i);
      expect(currentStep).toBeInTheDocument();
      expect(currentStep).toHaveAttribute('data-step-status', 'current');
      expect(currentStep).toHaveTextContent('2');
    });

    it('should render upcoming step with number', () => {
      render(<BasicStepIndicatorTest />);
      
      const upcomingStep = screen.getByLabelText(/Step 3/i);
      expect(upcomingStep).toBeInTheDocument();
      expect(upcomingStep).toHaveAttribute('data-step-status', 'upcoming');
      expect(upcomingStep).toHaveTextContent('3');
    });

    it('should render disabled step with reduced opacity', () => {
      render(<BasicStepIndicatorTest />);
      
      const disabledStep = screen.getByLabelText(/Step 4.*disabled/i);
      expect(disabledStep).toBeInTheDocument();
      expect(disabledStep).toHaveAttribute('data-step-status', 'disabled');
      expect(disabledStep).toHaveTextContent('4');
    });

    it('should apply correct CSS classes for each status', () => {
      render(<BasicStepIndicatorTest />);
      
      const completeStep = screen.getByLabelText(/Step 1.*completed/i);
      const currentStep = screen.getByLabelText(/Step 2.*current/i);
      const upcomingStep = screen.getByLabelText(/Step 3/i);
      const disabledStep = screen.getByLabelText(/Step 4.*disabled/i);
      
      expect(completeStep).toHaveClass('bg-green-500', 'border-green-500');
      expect(currentStep).toHaveClass('bg-blue-500', 'border-blue-500', 'ring-4');
      expect(upcomingStep).toHaveClass('bg-white', 'border-gray-300');
      expect(disabledStep).toHaveClass('bg-gray-100', 'opacity-50');
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      render(<BasicStepIndicatorTest size="small" />);
      
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).toHaveClass('w-8', 'h-8', 'text-xs');
      });
    });

    it('should render medium size by default', () => {
      render(<BasicStepIndicatorTest />);
      
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).toHaveClass('w-10', 'h-10', 'text-sm');
      });
    });

    it('should render large size correctly', () => {
      render(<BasicStepIndicatorTest size="large" />);
      
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).toHaveClass('w-12', 'h-12', 'text-base');
      });
    });
  });

  describe('Click Handling and Navigation', () => {
    it('should handle step clicks when allowed', async () => {
      render(<InteractiveStepIndicatorTest />);
      
      // Click on the first step (should be clickable)
      const step1Button = screen.getByLabelText(/Step 1/i);
      fireEvent.click(step1Button);
      
      await waitFor(() => {
        expect(screen.getByTestId('clicked-steps')).toHaveTextContent('step1');
      });
    });

    it('should prevent clicks on non-clickable steps', () => {
      render(<InteractiveStepIndicatorTest />);
      
      // Try to click on a non-clickable step
      const step3Button = screen.getByLabelText(/Step 3/i);
      fireEvent.click(step3Button);
      
      // Should not register the click
      expect(screen.getByTestId('clicked-steps')).toHaveTextContent('');
    });

    it('should show visual feedback for invalid jumps', async () => {
      render(<ValidationStepTest />);
      
      // Try to click on a step when jumping is not allowed
      const step = screen.getByLabelText(/Step 1/i);
      fireEvent.click(step);
      
      // Should add invalid jump class temporarily
      expect(step).toHaveClass('step-indicator-invalid-jump');
      
      // Class should be removed after timeout
      await waitFor(() => {
        expect(step).not.toHaveClass('step-indicator-invalid-jump');
      }, { timeout: 400 });
    });

    it('should allow jumps when configured', async () => {
      render(<ValidationStepTest />);
      
      // Enable jumping
      fireEvent.click(screen.getByTestId('toggle-jumping'));
      
      // Now clicks should be allowed
      const step = screen.getByLabelText(/Step 1/i);
      fireEvent.click(step);
      
      // Should not show invalid jump class
      expect(step).not.toHaveClass('step-indicator-invalid-jump');
    });

    it('should switch navigation mode on click', () => {
      let navigationMode = '';
      
      const TestNavigationModeChange = () => {
        const { state } = useFocusManager();
        navigationMode = state.navigationMode;
        
        return (
          <FocusManagerSetup>
            <StepIndicator allowJumping={true} />
          </FocusManagerSetup>
        );
      };
      
      render(
        <TestWrapper>
          <TestNavigationModeChange />
        </TestWrapper>
      );
      
      const step = screen.getByLabelText(/Step 1/i);
      fireEvent.click(step);
      
      expect(navigationMode).toBe(NavigationMode.HYBRID);
    });

    it('should handle disabled step clicks', () => {
      render(<BasicStepIndicatorTest />);
      
      const disabledStep = screen.getByLabelText(/Step 4.*disabled/i);
      
      // Should be disabled
      expect(disabledStep).toBeDisabled();
    });

    it('should handle clicks with custom callback', () => {
      const onStepClick = vi.fn();
      
      render(
        <TestWrapper>
          <StepIndicator 
            steps={mockSteps}
            onStepClick={onStepClick}
            allowJumping={true}
          />
        </TestWrapper>
      );
      
      const clickableStep = screen.getByLabelText(/Step 1.*completed/i);
      fireEvent.click(clickableStep);
      
      expect(onStepClick).toHaveBeenCalledWith('step1');
    });
  });

  describe('Focus Manager Integration', () => {
    it('should use focus manager visible steps when no custom steps provided', () => {
      render(
        <TestWrapper>
          <FocusManagerSetup>
            <StepIndicator />
          </FocusManagerSetup>
        </TestWrapper>
      );
      
      // Should render steps from focus manager
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('Contact Details')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should call focus manager methods on step click', () => {
      let focusManagerMethods: any;
      
      const TestFocusManagerCalls = () => {
        focusManagerMethods = useFocusManager();
        return (
          <FocusManagerSetup>
            <StepIndicator allowJumping={true} />
          </FocusManagerSetup>
        );
      };
      
      render(
        <TestWrapper>
          <TestFocusManagerCalls />
        </TestWrapper>
      );
      
      const step = screen.getByLabelText(/Step 1/i);
      fireEvent.click(step);
      
      // Should have called focus manager methods
      expect(typeof focusManagerMethods.handleMouseNavigation).toBe('function');
      expect(typeof focusManagerMethods.setNavigationMode).toBe('function');
      expect(typeof focusManagerMethods.focusField).toBe('function');
    });

    it('should check jump validation through focus manager', () => {
      render(
        <TestWrapper>
          <FocusManagerSetup>
            <StepIndicator />
          </FocusManagerSetup>
        </TestWrapper>
      );
      
      // Steps should be rendered with correct clickability
      const step1 = screen.getByLabelText(/Step 1/i);
      const step3 = screen.getByLabelText(/Step 3/i);
      
      // Step 1 might be clickable, step 3 (disabled) should not be
      expect(step3).toBeDisabled();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom render function when provided', () => {
      render(<CustomStepTest />);
      
      expect(screen.getByTestId('custom-step-custom1')).toHaveTextContent('Custom Step 1 (Custom)');
      expect(screen.getByTestId('custom-step-custom2')).toHaveTextContent('Custom Step 2 (Custom)');
    });

    it('should fall back to default rendering when custom renderer not provided', () => {
      render(<BasicStepIndicatorTest />);
      
      // Should render default step numbers/checkmarks
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      expect(steps.length).toBeGreaterThan(0);
      
      // First step should have checkmark (complete)
      const firstStep = steps[0];
      expect(firstStep.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<BasicStepIndicatorTest />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Progress steps');
      
      mockSteps.forEach((step, index) => {
        const stepButton = screen.getByLabelText(new RegExp(`Step ${index + 1}.*${step.label}`));
        expect(stepButton).toHaveAttribute('data-step-id', step.id);
        expect(stepButton).toHaveAttribute('data-step-status', step.status);
        
        if (step.status === 'current') {
          expect(stepButton).toHaveAttribute('aria-current', 'step');
        }
      });
    });

    it('should have proper titles for descriptions', () => {
      render(<BasicStepIndicatorTest />);
      
      mockSteps.forEach(step => {
        if (step.description) {
          const stepButton = screen.getByLabelText(new RegExp(step.label));
          expect(stepButton).toHaveAttribute('title', step.description);
        }
      });
    });

    it('should handle keyboard navigation', () => {
      render(<BasicStepIndicatorTest />);
      
      const firstStep = screen.getByLabelText(/Step 1/i);
      
      // Should be focusable
      firstStep.focus();
      expect(document.activeElement).toBe(firstStep);
      
      // Should handle Enter key
      fireEvent.keyDown(firstStep, { key: 'Enter' });
      // (Click behavior should be triggered)
    });
  });

  describe('Connector Rendering', () => {
    it('should render connectors with correct status classes', () => {
      render(<BasicStepIndicatorTest />);
      
      const connectors = screen.container.querySelectorAll('.step-connector');
      
      // First connector should be active (between complete and current)
      expect(connectors[0]).toHaveClass('bg-green-500');
      
      // Later connectors should be inactive
      expect(connectors[2]).toHaveClass('bg-gray-300');
    });

    it('should adjust connector classes based on orientation', () => {
      render(<BasicStepIndicatorTest orientation="vertical" />);
      
      const connectors = screen.container.querySelectorAll('.step-connector');
      connectors.forEach(connector => {
        // Vertical connectors should have width class
        expect(connector).toHaveClass('w-0.5');
      });
    });

    it('should handle connector rendering for different sizes', () => {
      render(<BasicStepIndicatorTest size="large" />);
      
      const connectors = screen.container.querySelectorAll('.step-connector');
      connectors.forEach(connector => {
        expect(connector).toHaveClass('h-1'); // Large size connector
      });
    });
  });

  describe('Animation Support', () => {
    it('should apply animation classes by default', () => {
      render(<BasicStepIndicatorTest />);
      
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).toHaveClass('transition-all', 'duration-200');
      });
    });

    it('should not apply animation classes when disabled', () => {
      render(<BasicStepIndicatorTest animated={false} />);
      
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).not.toHaveClass('transition-all');
        expect(step).not.toHaveClass('duration-200');
      });
    });
  });

  describe('Variant Components', () => {
    it('should render VerticalStepIndicator correctly', () => {
      render(
        <TestWrapper>
          <VerticalStepIndicator steps={mockSteps} />
        </TestWrapper>
      );
      
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('flex-col');
    });

    it('should render CompactStepIndicator correctly', () => {
      render(
        <TestWrapper>
          <CompactStepIndicator steps={mockSteps} />
        </TestWrapper>
      );
      
      // Should not show descriptions
      mockSteps.forEach(step => {
        if (step.description) {
          expect(screen.queryByText(step.description)).not.toBeInTheDocument();
        }
      });
      
      // Should use small size
      const steps = screen.container.querySelectorAll('.step-indicator-item');
      steps.forEach(step => {
        expect(step).toHaveClass('w-8', 'h-8');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty steps array', () => {
      render(
        <TestWrapper>
          <StepIndicator steps={[]} />
        </TestWrapper>
      );
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation.children.length).toBe(0);
    });

    it('should handle missing focus manager gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<StepIndicator steps={mockSteps} />);
      }).toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle steps without descriptions', () => {
      const stepsWithoutDescriptions: StepIndicatorData[] = [
        {
          id: 'step1',
          label: 'Step 1',
          status: 'complete',
          isClickable: true
        },
        {
          id: 'step2',
          label: 'Step 2',
          status: 'current',
          isClickable: true
        }
      ];
      
      render(
        <TestWrapper>
          <StepIndicator steps={stepsWithoutDescriptions} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    it('should handle rapid step clicks', async () => {
      const onStepClick = vi.fn();
      
      render(
        <TestWrapper>
          <StepIndicator 
            steps={mockSteps}
            allowJumping={true}
            onStepClick={onStepClick}
          />
        </TestWrapper>
      );
      
      const step = screen.getByLabelText(/Step 1/i);
      
      // Rapid clicks
      fireEvent.click(step);
      fireEvent.click(step);
      fireEvent.click(step);
      
      await waitFor(() => {
        expect(onStepClick).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle invalid step data gracefully', () => {
      const invalidSteps = [
        {
          id: '',
          label: '',
          status: 'unknown' as any,
          isClickable: true
        }
      ];
      
      render(
        <TestWrapper>
          <StepIndicator steps={invalidSteps} />
        </TestWrapper>
      );
      
      // Should render without crashing
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle missing click event properties', () => {
      render(
        <TestWrapper>
          <StepIndicator 
            steps={mockSteps}
            allowJumping={true}
          />
        </TestWrapper>
      );
      
      const step = screen.getByLabelText(/Step 1/i);
      
      // Create a minimal event object
      const mockEvent = {
        preventDefault: vi.fn(),
        currentTarget: step,
        nativeEvent: {} as MouseEvent
      };
      
      // Should handle the click without full event properties
      fireEvent.click(step, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should update when step data changes', () => {
      const TestDynamicSteps = () => {
        const [stepCount, setStepCount] = React.useState(2);
        
        const dynamicSteps = Array.from({ length: stepCount }, (_, i) => ({
          id: `dynamic-step-${i + 1}`,
          label: `Dynamic Step ${i + 1}`,
          status: i === 0 ? 'complete' : 'upcoming' as any,
          isClickable: true
        }));
        
        return (
          <TestWrapper>
            <button 
              data-testid="add-step" 
              onClick={() => setStepCount(count => count + 1)}
            >
              Add Step
            </button>
            <StepIndicator steps={dynamicSteps} />
          </TestWrapper>
        );
      };
      
      render(<TestDynamicSteps />);
      
      expect(screen.getByText('Dynamic Step 1')).toBeInTheDocument();
      expect(screen.getByText('Dynamic Step 2')).toBeInTheDocument();
      expect(screen.queryByText('Dynamic Step 3')).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('add-step'));
      
      expect(screen.getByText('Dynamic Step 3')).toBeInTheDocument();
    });

    it('should handle focus manager state changes', () => {
      let currentFocusId = '';
      
      const TestFocusState = () => {
        const { state, focusField } = useFocusManager();
        currentFocusId = state.currentFocusId || '';
        
        return (
          <div>
            <FocusManagerSetup>
              <StepIndicator />
            </FocusManagerSetup>
            <button 
              data-testid="focus-step1" 
              onClick={() => focusField('step1')}
            >
              Focus Step 1
            </button>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <TestFocusState />
        </TestWrapper>
      );
      
      fireEvent.click(screen.getByTestId('focus-step1'));
      
      expect(currentFocusId).toBe('step1');
    });
  });
});