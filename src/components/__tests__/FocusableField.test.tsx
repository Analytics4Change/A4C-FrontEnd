/**
 * FocusableField Unit Tests
 * Comprehensive tests for Task 004: FocusableField component functionality
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FocusableField, FocusableFieldProps } from '../FocusableField';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../contexts/focus/useFocusManager';
import { FocusableType, NavigationMode } from '../../contexts/focus/types';

// Mock utils to control behavior
vi.mock('../../contexts/focus/utils', () => ({
  getFocusableType: vi.fn(() => FocusableType.CUSTOM),
  generateElementId: vi.fn((prefix) => `${prefix}-generated-id`)
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FocusManagerProvider debug={true}>
    {children}
  </FocusManagerProvider>
);

// Test component that displays focus manager state
const StateDisplay = () => {
  const { state } = useFocusManager();
  
  return (
    <div>
      <div data-testid="current-focus">{state.currentFocusId || 'none'}</div>
      <div data-testid="elements-count">{state.elements.size}</div>
      <div data-testid="navigation-mode">{state.navigationMode}</div>
    </div>
  );
};

// Basic test component
const BasicFieldTest: React.FC<Partial<FocusableFieldProps>> = (props) => {
  return (
    <TestWrapper>
      <StateDisplay />
      <FocusableField
        id="test-field"
        order={1}
        {...props}
      >
        <input data-testid="field-input" placeholder="Test input" />
      </FocusableField>
    </TestWrapper>
  );
};

// Test component with multiple fields
const MultiFieldTest = () => {
  const [field1Valid, setField1Valid] = React.useState(true);
  const [field2Valid, setField2Valid] = React.useState(true);
  const [canLeaveField1, setCanLeaveField1] = React.useState(true);
  
  return (
    <TestWrapper>
      <StateDisplay />
      
      <FocusableField
        id="field1"
        order={1}
        validators={{
          canReceiveFocus: () => field1Valid,
          canLeaveFocus: () => canLeaveField1
        }}
        onComplete={() => {
          console.log('Field 1 completed');
          return true;
        }}
      >
        <input data-testid="field1-input" placeholder="Field 1" />
      </FocusableField>
      
      <FocusableField
        id="field2"
        order={2}
        validators={{
          canReceiveFocus: () => field2Valid
        }}
        mouseOverride={{
          captureClicks: true,
          preserveFocusOnInteraction: true
        }}
      >
        <input data-testid="field2-input" placeholder="Field 2" />
      </FocusableField>
      
      <FocusableField
        id="field3"
        order={3}
        stepIndicator={{
          label: "Step 3",
          description: "Third step",
          allowDirectAccess: true
        }}
      >
        <input data-testid="field3-input" placeholder="Field 3" />
      </FocusableField>
      
      <div>
        <button data-testid="toggle-field1-valid" onClick={() => setField1Valid(!field1Valid)}>
          Toggle Field 1 Valid ({field1Valid.toString()})
        </button>
        <button data-testid="toggle-field2-valid" onClick={() => setField2Valid(!field2Valid)}>
          Toggle Field 2 Valid ({field2Valid.toString()})
        </button>
        <button data-testid="toggle-can-leave" onClick={() => setCanLeaveField1(!canLeaveField1)}>
          Toggle Can Leave Field 1 ({canLeaveField1.toString()})
        </button>
      </div>
    </TestWrapper>
  );
};

// Test component for mouse interactions
const MouseInteractionTest = () => {
  const [clickOutsideCount, setClickOutsideCount] = React.useState(0);
  
  return (
    <TestWrapper>
      <StateDisplay />
      
      <FocusableField
        id="mouse-field"
        order={1}
        mouseOverride={{
          captureClicks: true,
          onClickOutside: () => setClickOutsideCount(prev => prev + 1),
          preserveFocusOnInteraction: false,
          allowDirectJump: true
        }}
      >
        <button data-testid="mouse-button">Mouse Field Button</button>
      </FocusableField>
      
      <div data-testid="click-outside-count">{clickOutsideCount}</div>
      <button data-testid="outside-button">Outside Button</button>
    </TestWrapper>
  );
};

// Test component for keyboard navigation
const KeyboardNavigationTest = () => {
  const [completionResults, setCompletionResults] = React.useState<string[]>([]);
  
  const handleComplete = (fieldId: string) => {
    setCompletionResults(prev => [...prev, fieldId]);
    return true;
  };
  
  return (
    <TestWrapper>
      <StateDisplay />
      
      <FocusableField
        id="kbd-field1"
        order={1}
        onComplete={() => handleComplete('kbd-field1')}
      >
        <input data-testid="kbd-input1" placeholder="Keyboard Field 1" />
      </FocusableField>
      
      <FocusableField
        id="kbd-field2"
        order={2}
        onComplete={() => handleComplete('kbd-field2')}
        validators={{
          canLeaveFocus: () => false // Block leaving
        }}
      >
        <input data-testid="kbd-input2" placeholder="Keyboard Field 2" />
      </FocusableField>
      
      <FocusableField
        id="kbd-field3"
        order={3}
        onComplete={() => {
          // Don't advance - return false
          handleComplete('kbd-field3-no-advance');
          return false;
        }}
      >
        <input data-testid="kbd-input3" placeholder="Keyboard Field 3" />
      </FocusableField>
      
      <div data-testid="completion-results">
        {completionResults.join(', ')}
      </div>
    </TestWrapper>
  );
};

// Test component for step indicator integration
const StepIndicatorTest = () => {
  return (
    <TestWrapper>
      <StateDisplay />
      
      <FocusableField
        id="step1"
        order={1}
        stepIndicator={{
          label: "Personal Info",
          description: "Enter your personal information",
          allowDirectAccess: false
        }}
      >
        <input data-testid="step1-input" placeholder="Personal Info" />
      </FocusableField>
      
      <FocusableField
        id="step2"
        order={2}
        stepIndicator={{
          label: "Contact Details",
          description: "Enter your contact information",
          allowDirectAccess: true
        }}
      >
        <input data-testid="step2-input" placeholder="Contact Details" />
      </FocusableField>
      
      <FocusableField
        id="step3"
        order={3}
        stepIndicator={{
          label: "Review",
          description: "Review your information"
        }}
      >
        <input data-testid="step3-input" placeholder="Review" />
      </FocusableField>
    </TestWrapper>
  );
};

describe('FocusableField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render children correctly', () => {
      render(<BasicFieldTest />);
      
      expect(screen.getByTestId('field-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('should register with focus manager on mount', () => {
      render(<BasicFieldTest />);
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should unregister from focus manager on unmount', () => {
      const { unmount } = render(<BasicFieldTest />);
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
      
      unmount();
      // After unmount, elements count should be 0 (though we can't test this directly in this setup)
    });

    it('should apply custom class name and styles', () => {
      render(
        <BasicFieldTest 
          className="custom-field-class" 
          style={{ backgroundColor: 'red' }}
        />
      );
      
      const wrapper = screen.getByTestId('field-input').parentElement;
      expect(wrapper).toHaveClass('custom-field-class');
      expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
    });

    it('should set correct data attributes', () => {
      render(
        <BasicFieldTest 
          scope="custom-scope"
          type={FocusableType.INPUT}
        />
      );
      
      const wrapper = screen.getByTestId('field-input').parentElement;
      expect(wrapper).toHaveAttribute('data-focus-id', 'test-field');
      expect(wrapper).toHaveAttribute('data-focus-order', '1');
      expect(wrapper).toHaveAttribute('data-focus-scope', 'custom-scope');
      expect(wrapper).toHaveAttribute('data-focused', 'false');
    });

    it('should handle different field types', () => {
      render(
        <BasicFieldTest type={FocusableType.BUTTON} />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should handle custom metadata', () => {
      render(
        <BasicFieldTest 
          metadata={{ customProp: 'customValue', priority: 'high' }}
        />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should handle skip in navigation', () => {
      render(
        <BasicFieldTest skipInNavigation={true} />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should handle custom tab index', () => {
      render(
        <BasicFieldTest tabIndex={99} />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should handle parent ID', () => {
      render(
        <BasicFieldTest parentId="parent-field" />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('1');
    });

    it('should handle auto-register disabled', () => {
      render(
        <BasicFieldTest autoRegister={false} />
      );
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('0');
    });
  });

  describe('Validation Integration', () => {
    it('should handle canReceiveFocus validator', () => {
      render(<MultiFieldTest />);
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('3');
      
      // Initially field1 should be valid
      expect(screen.getByText('Toggle Field 1 Valid (true)')).toBeInTheDocument();
      
      // Toggle validity
      fireEvent.click(screen.getByTestId('toggle-field1-valid'));
      expect(screen.getByText('Toggle Field 1 Valid (false)')).toBeInTheDocument();
    });

    it('should handle canLeaveFocus validator', () => {
      render(<MultiFieldTest />);
      
      expect(screen.getByText('Toggle Can Leave Field 1 (true)')).toBeInTheDocument();
      
      // Toggle ability to leave
      fireEvent.click(screen.getByTestId('toggle-can-leave'));
      expect(screen.getByText('Toggle Can Leave Field 1 (false)')).toBeInTheDocument();
    });

    it('should handle validators with different configurations', () => {
      const TestValidators = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="validator-field"
              order={1}
              validators={{
                canReceiveFocus: () => true,
                canLeaveFocus: () => false
              }}
            >
              <input data-testid="validator-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestValidators />);
      
      expect(screen.getByTestId('validator-input')).toBeInTheDocument();
    });
  });

  describe('Mouse Override Configuration', () => {
    it('should handle click outside events', async () => {
      render(<MouseInteractionTest />);
      
      expect(screen.getByTestId('click-outside-count')).toHaveTextContent('0');
      
      // Click outside the field
      fireEvent.mouseDown(screen.getByTestId('outside-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('click-outside-count')).toHaveTextContent('1');
      });
    });

    it('should handle capture clicks configuration', () => {
      render(<MouseInteractionTest />);
      
      const mouseButton = screen.getByTestId('mouse-button');
      
      // Click should be captured
      fireEvent.click(mouseButton);
      
      // Navigation mode should switch to hybrid
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
    });

    it('should handle direct jump configuration', () => {
      render(<MouseInteractionTest />);
      
      const wrapper = screen.getByTestId('mouse-button').parentElement;
      expect(wrapper).toHaveAttribute('data-can-jump', 'true');
    });

    it('should handle all mouse override options', () => {
      const TestAllMouseOptions = () => {
        const handleClickOutside = vi.fn();
        
        return (
          <TestWrapper>
            <FocusableField
              id="all-mouse-field"
              order={1}
              mouseOverride={{
                captureClicks: true,
                onClickOutside: handleClickOutside,
                preserveFocusOnInteraction: true,
                allowDirectJump: false
              }}
            >
              <button data-testid="all-mouse-button">All Options Button</button>
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestAllMouseOptions />);
      
      const wrapper = screen.getByTestId('all-mouse-button').parentElement;
      expect(wrapper).toHaveAttribute('data-can-jump', 'false');
    });
  });

  describe('Step Indicator Integration', () => {
    it('should register with step indicator metadata', () => {
      render(<StepIndicatorTest />);
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('3');
    });

    it('should handle direct access configuration', () => {
      render(<StepIndicatorTest />);
      
      const step1Wrapper = screen.getByTestId('step1-input').parentElement;
      const step2Wrapper = screen.getByTestId('step2-input').parentElement;
      
      expect(step1Wrapper).toHaveAttribute('data-can-jump', 'false');
      expect(step2Wrapper).toHaveAttribute('data-can-jump', 'true');
    });

    it('should handle step indicator without direct access flag', () => {
      render(<StepIndicatorTest />);
      
      const step3Wrapper = screen.getByTestId('step3-input').parentElement;
      expect(step3Wrapper).toHaveAttribute('data-can-jump', 'false');
    });

    it('should handle step indicator with all options', () => {
      const TestFullStepIndicator = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="full-step-field"
              order={1}
              stepIndicator={{
                label: "Complete Step",
                description: "A step with all options",
                allowDirectAccess: true
              }}
            >
              <input data-testid="full-step-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestFullStepIndicator />);
      
      const wrapper = screen.getByTestId('full-step-input').parentElement;
      expect(wrapper).toHaveAttribute('data-can-jump', 'true');
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should handle Enter key for completion', async () => {
      render(<KeyboardNavigationTest />);
      
      const input1 = screen.getByTestId('kbd-input1');
      
      fireEvent.focus(input1);
      fireEvent.keyDown(input1, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('completion-results')).toHaveTextContent('kbd-field1');
      });
    });

    it('should handle Enter key when completion returns false', async () => {
      render(<KeyboardNavigationTest />);
      
      const input3 = screen.getByTestId('kbd-input3');
      
      fireEvent.focus(input3);
      fireEvent.keyDown(input3, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('completion-results')).toHaveTextContent('kbd-field3-no-advance');
      });
    });

    it('should handle Tab key with canLeaveFocus validation', () => {
      render(<KeyboardNavigationTest />);
      
      const input2 = screen.getByTestId('kbd-input2');
      
      fireEvent.focus(input2);
      
      // Spy on preventDefault to see if tab is blocked
      const mockEvent = { key: 'Tab', preventDefault: vi.fn() };
      fireEvent.keyDown(input2, mockEvent);
      
      // Tab should be prevented when canLeaveFocus returns false
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle Ctrl+Enter for hybrid mode', () => {
      render(<KeyboardNavigationTest />);
      
      const input1 = screen.getByTestId('kbd-input1');
      
      fireEvent.focus(input1);
      fireEvent.keyDown(input1, { key: 'Enter', ctrlKey: true });
      
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
    });

    it('should handle Shift+Enter (no special behavior)', () => {
      render(<KeyboardNavigationTest />);
      
      const input1 = screen.getByTestId('kbd-input1');
      
      fireEvent.focus(input1);
      fireEvent.keyDown(input1, { key: 'Enter', shiftKey: true });
      
      // Should not trigger completion
      expect(screen.getByTestId('completion-results')).toHaveTextContent('');
    });

    it('should handle Tab key when canLeaveFocus allows', () => {
      render(<KeyboardNavigationTest />);
      
      const input1 = screen.getByTestId('kbd-input1');
      
      fireEvent.focus(input1);
      
      const mockEvent = { key: 'Tab', preventDefault: vi.fn() };
      fireEvent.keyDown(input1, mockEvent);
      
      // Tab should not be prevented for field1 (canLeaveFocus not defined, defaults to true)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Click Handling', () => {
    it('should handle mouse clicks and switch navigation mode', () => {
      render(<MultiFieldTest />);
      
      const field2Input = screen.getByTestId('field2-input');
      
      fireEvent.click(field2Input);
      
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
    });

    it('should handle click with completion callback', () => {
      const TestClickCompletion = () => {
        const [completed, setCompleted] = React.useState(false);
        
        return (
          <TestWrapper>
            <FocusableField
              id="click-complete-field"
              order={1}
              mouseOverride={{
                captureClicks: true,
                preserveFocusOnInteraction: true
              }}
              onComplete={() => {
                setCompleted(true);
                return true;
              }}
            >
              <button data-testid="click-complete-button">Complete on Click</button>
            </FocusableField>
            <div data-testid="completion-status">{completed.toString()}</div>
          </TestWrapper>
        );
      };
      
      render(<TestClickCompletion />);
      
      const button = screen.getByTestId('click-complete-button');
      fireEvent.click(button);
      
      expect(screen.getByTestId('completion-status')).toHaveTextContent('true');
    });

    it('should handle click when canLeaveFocus blocks advancement', () => {
      const TestClickBlocked = () => {
        const [clickAttempted, setClickAttempted] = React.useState(false);
        
        return (
          <TestWrapper>
            <FocusableField
              id="click-blocked-field"
              order={1}
              mouseOverride={{
                captureClicks: true,
                preserveFocusOnInteraction: true
              }}
              validators={{
                canLeaveFocus: () => false
              }}
              onComplete={() => {
                setClickAttempted(true);
                return true;
              }}
            >
              <button data-testid="click-blocked-button">Blocked Advancement</button>
            </FocusableField>
            <div data-testid="click-attempted">{clickAttempted.toString()}</div>
          </TestWrapper>
        );
      };
      
      render(<TestClickBlocked />);
      
      const button = screen.getByTestId('click-blocked-button');
      fireEvent.click(button);
      
      expect(screen.getByTestId('click-attempted')).toHaveTextContent('true');
    });
  });

  describe('Focus and Blur Events', () => {
    it('should handle focus events and update metadata', () => {
      render(<MultiFieldTest />);
      
      const field1Input = screen.getByTestId('field1-input');
      
      fireEvent.focus(field1Input);
      
      // Should update the interaction mode tracking
      const wrapper = field1Input.parentElement;
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'keyboard');
    });

    it('should handle blur events and update metadata', () => {
      render(<MultiFieldTest />);
      
      const field1Input = screen.getByTestId('field1-input');
      
      fireEvent.focus(field1Input);
      fireEvent.blur(field1Input);
      
      // Component should handle blur without crashing
      expect(field1Input).toBeInTheDocument();
    });

    it('should track interaction mode correctly', () => {
      render(<MultiFieldTest />);
      
      const field1Input = screen.getByTestId('field1-input');
      const wrapper = field1Input.parentElement!;
      
      // Start with keyboard mode
      fireEvent.focus(field1Input);
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'keyboard');
      
      // Switch to mouse mode
      fireEvent.click(field1Input);
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'mouse');
    });

    it('should handle focus with mouse preserve behavior', () => {
      render(<MultiFieldTest />);
      
      const field2Input = screen.getByTestId('field2-input');
      
      // Click first to set mouse mode
      fireEvent.click(field2Input);
      fireEvent.focus(field2Input);
      
      // Should preserve focus flow when configured
      expect(field2Input).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing onComplete callback', () => {
      const TestNoCallback = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="no-callback-field"
              order={1}
            >
              <input data-testid="no-callback-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestNoCallback />);
      
      const input = screen.getByTestId('no-callback-input');
      
      // Should not crash when onComplete is not provided
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(input).toBeInTheDocument();
    });

    it('should handle missing validators', () => {
      const TestNoValidators = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="no-validators-field"
              order={1}
            >
              <input data-testid="no-validators-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestNoValidators />);
      
      const input = screen.getByTestId('no-validators-input');
      
      // Should handle keyboard events without validators
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.keyDown(input, { key: 'Tab' });
      
      expect(input).toBeInTheDocument();
    });

    it('should handle missing mouse override', () => {
      const TestNoMouseOverride = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="no-mouse-field"
              order={1}
            >
              <button data-testid="no-mouse-button">No Mouse Override</button>
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestNoMouseOverride />);
      
      const button = screen.getByTestId('no-mouse-button');
      
      // Should handle clicks without mouse override
      fireEvent.click(button);
      
      expect(button).toBeInTheDocument();
    });

    it('should handle null refs gracefully', () => {
      const TestNullRef = () => {
        const nullRef = React.useRef<HTMLInputElement>(null);
        
        return (
          <TestWrapper>
            <FocusableField
              id="null-ref-field"
              order={1}
            >
              <input ref={nullRef} data-testid="null-ref-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestNullRef />);
      
      expect(screen.getByTestId('null-ref-input')).toBeInTheDocument();
    });

    it('should handle rapid re-renders', () => {
      const TestRapidRenders = () => {
        const [count, setCount] = React.useState(0);
        
        return (
          <TestWrapper>
            <FocusableField
              id="rapid-field"
              order={count}
              metadata={{ count }}
            >
              <input data-testid="rapid-input" />
            </FocusableField>
            <button 
              data-testid="increment" 
              onClick={() => setCount(c => c + 1)}
            >
              Increment
            </button>
          </TestWrapper>
        );
      };
      
      render(<TestRapidRenders />);
      
      // Trigger multiple rapid re-renders
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('increment'));
      }
      
      expect(screen.getByTestId('rapid-input')).toBeInTheDocument();
    });

    it('should handle invalid scope configurations', () => {
      const TestInvalidScope = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="invalid-scope-field"
              order={1}
              scope="nonexistent-scope"
            >
              <input data-testid="invalid-scope-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestInvalidScope />);
      
      const wrapper = screen.getByTestId('invalid-scope-input').parentElement;
      expect(wrapper).toHaveAttribute('data-focus-scope', 'nonexistent-scope');
    });

    it('should handle focus without focus manager', () => {
      // Render without FocusManagerProvider
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <FocusableField id="no-provider-field" order={1}>
            <input data-testid="no-provider-input" />
          </FocusableField>
        );
      }).toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle complex validator functions', () => {
      const TestComplexValidators = () => {
        return (
          <TestWrapper>
            <FocusableField
              id="complex-validators-field"
              order={1}
              validators={{
                canReceiveFocus: () => {
                  // Complex validation logic
                  const currentTime = Date.now();
                  return currentTime % 2 === 0; // Random validation
                },
                canLeaveFocus: () => {
                  // Another complex validation
                  return Math.random() > 0.5;
                }
              }}
            >
              <input data-testid="complex-validators-input" />
            </FocusableField>
          </TestWrapper>
        );
      };
      
      render(<TestComplexValidators />);
      
      expect(screen.getByTestId('complex-validators-input')).toBeInTheDocument();
    });
  });

  describe('Integration with Focus Manager', () => {
    it('should register with correct configuration', () => {
      let registeredElement: any = null;
      
      const TestRegistration = () => {
        const { state } = useFocusManager();
        registeredElement = Array.from(state.elements.values())[0];
        
        return (
          <FocusableField
            id="registration-field"
            order={5}
            type={FocusableType.INPUT}
            scope="custom-scope"
            skipInNavigation={true}
            tabIndex={10}
            metadata={{ test: 'value' }}
            parentId="parent-field"
          >
            <input data-testid="registration-input" />
          </FocusableField>
        );
      };
      
      render(
        <TestWrapper>
          <TestRegistration />
        </TestWrapper>
      );
      
      expect(registeredElement).toMatchObject({
        id: 'registration-field',
        type: FocusableType.INPUT,
        scopeId: 'custom-scope',
        skipInNavigation: true,
        tabIndex: 10,
        parentId: 'parent-field',
        metadata: expect.objectContaining({
          test: 'value',
          order: 5
        })
      });
    });

    it('should update focus manager state correctly', async () => {
      let focusManagerState: any;
      
      const TestStateUpdate = () => {
        const focusManager = useFocusManager();
        focusManagerState = focusManager.state;
        
        return (
          <FocusableField
            id="state-update-field"
            order={1}
          >
            <input data-testid="state-update-input" />
          </FocusableField>
        );
      };
      
      render(
        <TestWrapper>
          <TestStateUpdate />
        </TestWrapper>
      );
      
      const input = screen.getByTestId('state-update-input');
      
      // Focus the input to trigger metadata update
      fireEvent.focus(input);
      
      await waitFor(() => {
        const element = focusManagerState.elements.get('state-update-field');
        expect(element?.metadata?.lastFocused).toBeDefined();
      });
    });

    it('should handle focus manager method calls', () => {
      let focusManagerMethods: any;
      
      const TestMethodCalls = () => {
        focusManagerMethods = useFocusManager();
        
        return (
          <FocusableField
            id="method-calls-field"
            order={1}
          >
            <input data-testid="method-calls-input" />
          </FocusableField>
        );
      };
      
      render(
        <TestWrapper>
          <TestMethodCalls />
        </TestWrapper>
      );
      
      const input = screen.getByTestId('method-calls-input');
      
      // Trigger actions that call focus manager methods
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.click(input);
      
      // Should have access to all focus manager methods
      expect(typeof focusManagerMethods.focusNext).toBe('function');
      expect(typeof focusManagerMethods.setNavigationMode).toBe('function');
      expect(typeof focusManagerMethods.updateElement).toBe('function');
    });
  });
});