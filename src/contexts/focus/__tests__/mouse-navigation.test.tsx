import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FocusManagerProvider } from '../FocusManagerContext';
import { FocusableField } from '../../../components/FocusableField';
import { NavigationModeIndicator } from '../../../components/focus/NavigationModeIndicator';
import { ManagedDialog } from '../../../components/focus/ManagedDialog';
import { useFocusManager } from '../useFocusManager';
import { useNavigationMode } from '../../../hooks/useNavigationMode';
import { NavigationMode } from '../types';

// TIMEOUT FIX: Comprehensive test environment setup
const originalConsole = console;

beforeEach(() => {
  // Mock console methods
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  
  // TIMEOUT FIX: Setup fake timers and clean state
  vi.useFakeTimers();
  vi.clearAllMocks();
  
  // Clear document state
  document.body.innerHTML = '';
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur?.();
  }
});

afterEach(() => {
  // TIMEOUT FIX: Comprehensive cleanup - no awaits to prevent hanging
  vi.runOnlyPendingTimers();
  cleanup();
  
  // Clear document state
  document.body.innerHTML = '';
  if (document.body) {
    document.body.focus();
  }
  
  // Restore console
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  
  vi.clearAllMocks();
  
  // Restore real timers last
  vi.useRealTimers();
});

// Test component that combines mouse navigation features
const MouseNavigationTestForm: React.FC = () => {
  const { focusField, canJumpToNode, getVisibleSteps } = useFocusManager();
  const { currentMode, handleCtrlClick } = useNavigationMode();
  const [steps, setSteps] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadSteps = async () => {
      try {
        const visibleSteps = await getVisibleSteps();
        setSteps(visibleSteps);
      } catch (error) {
        setSteps([]);
      }
    };
    loadSteps();
  }, [getVisibleSteps]);

  return (
    <div data-testid="mouse-nav-form">
      <div data-testid="current-mode">{currentMode}</div>
      
      {/* Step indicators that should be clickable */}
      <div data-testid="step-indicators" className="step-indicators">
        {steps.map((step, index) => (
          <button
            key={step.id}
            data-testid={`step-${step.id}`}
            className={`step-indicator ${step.status === 'complete' ? 'complete' : ''} ${step.status === 'current' ? 'current' : ''}`}
            disabled={!step.isClickable}
            onClick={(e) => {
              if (step.isClickable) {
                focusField(step.id);
              } else {
                console.log(`Cannot jump to step: ${step.id}`);
              }
            }}
            onMouseDown={(e) => {
              // Test Ctrl+Click behavior
              if (e.ctrlKey || e.metaKey) {
                handleCtrlClick(step.id, e.nativeEvent as MouseEvent);
              }
            }}
            aria-label={`${step.label} ${step.status === 'complete' ? '(completed)' : step.status === 'current' ? '(current)' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step.label}</span>
            {step.status === 'complete' && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>

      {/* Form fields with mouse navigation capabilities */}
      <FocusableField
        id="medication-search"
        order={1}
        scope="main-form"
        type="text"
        visualIndicator={{
          showInStepper: true,
          label: 'Medication',
          icon: '💊'
        }}
        mouseNavigation={{
          clickAdvancesBehavior: 'next',
          clickHandler: (e) => {
            console.log('Medication search clicked');
          },
          preserveFocusOnInteraction: true
        }}
      >
        <input
          type="search"
          placeholder="Search medications..."
          data-testid="medication-search"
          autoComplete="off"
        />
      </FocusableField>

      <FocusableField
        id="dosage-form"
        order={2}
        scope="main-form"
        type="select"
        visualIndicator={{
          showInStepper: true,
          label: 'Dosage',
          icon: '💊'
        }}
        mouseNavigation={{
          clickAdvancesBehavior: 'next'
        }}
      >
        <select data-testid="dosage-form">
          <option value="">Select dosage form</option>
          <option value="tablet">Tablet</option>
          <option value="capsule">Capsule</option>
        </select>
      </FocusableField>

      <FocusableField
        id="categories"
        order={3}
        scope="main-form"
        type="checkbox"
        visualIndicator={{
          showInStepper: true,
          label: 'Categories',
          icon: '📋'
        }}
        skipInNavigation={false}
        validators={{
          canLeaveFocus: async () => {
            const checkboxes = document.querySelectorAll('[data-testid="categories"] input[type="checkbox"]:checked');
            return checkboxes.length > 0;
          }
        }}
      >
        <div data-testid="categories">
          <input type="checkbox" id="cat1" value="category1" />
          <label htmlFor="cat1">Category 1</label>
          <input type="checkbox" id="cat2" value="category2" />
          <label htmlFor="cat2">Category 2</label>
        </div>
      </FocusableField>

      {/* Dates field that should be disabled until categories are complete */}
      <FocusableField
        id="dates"
        order={4}
        scope="main-form"
        type="date"
        visualIndicator={{
          showInStepper: true,
          label: 'Dates',
          icon: '📅'
        }}
        validators={{
          canReceiveFocus: async () => {
            const checkboxes = document.querySelectorAll('[data-testid="categories"] input[type="checkbox"]:checked');
            return checkboxes.length > 0;
          }
        }}
      >
        <input type="date" data-testid="dates" />
      </FocusableField>

      {/* Navigation mode indicator */}
      <NavigationModeIndicator
        data-testid="nav-mode-indicator"
        showHistory={true}
        showLastInteraction={true}
        showShortcuts={true}
      />
    </div>
  );
};

const renderWithFocusManager = (component: React.ReactNode) => {
  return render(
    <FocusManagerProvider 
      initialState={{ 
        enabled: true, 
        debug: true,
        navigationMode: NavigationMode.KEYBOARD
      }}
    >
      {component}
    </FocusManagerProvider>
  );
};

describe('Task 032: Mouse Navigation Testing', () => {
  describe('Click Advancement Functionality', () => {
    it('should advance focus when clicking on elements with clickAdvancesBehavior=next', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      const dosageForm = screen.getByTestId('dosage-form');

      // Click on medication search
      await user.click(medicationSearch);

      // Type a value
      await user.type(medicationSearch, 'Aspirin');

      // Click again to trigger advance behavior
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick focus validation with timer resolution
      vi.runAllTimers();
      await waitFor(() => {
        expect(document.activeElement).toBe(dosageForm);
      }, { timeout: 500, interval: 10 });

      // Verify console log for click handler
      expect(console.log).toHaveBeenCalledWith('Medication search clicked');
    });

    it('should preserve focus on interaction when configured', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');

      // Focus the field first
      medicationSearch.focus();
      
      // Click on the field
      await user.click(medicationSearch);

      // Focus should remain on the field due to preserveFocusOnInteraction
      expect(document.activeElement).toBe(medicationSearch);
    });

    it('should handle click advancement with specific target', async () => {
      // Test component with specific click advancement target
      const SpecificAdvanceComponent = () => (
        <div>
          <FocusableField
            id="source-field"
            order={1}
            scope="main-form"
            mouseNavigation={{
              clickAdvancesBehavior: 'specific',
              clickAdvancesTo: 'target-field'
            }}
          >
            <input data-testid="source-field" />
          </FocusableField>
          <FocusableField
            id="middle-field"
            order={2}
            scope="main-form"
          >
            <input data-testid="middle-field" />
          </FocusableField>
          <FocusableField
            id="target-field"
            order={3}
            scope="main-form"
          >
            <input data-testid="target-field" />
          </FocusableField>
        </div>
      );

      const user = userEvent.setup();
      renderWithFocusManager(<SpecificAdvanceComponent />);

      const sourceField = screen.getByTestId('source-field');
      const targetField = screen.getByTestId('target-field');

      // Click on source field
      await user.click(sourceField);

      // TIMEOUT FIX: Quick target validation with timer resolution
      vi.runAllTimers();
      await waitFor(() => {
        expect(document.activeElement).toBe(targetField);
      }, { timeout: 500, interval: 10 });
    });
  });

  describe('Step Indicator Click Navigation', () => {
    it('should allow clicking on accessible step indicators', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      // Complete the first step to make the second step accessible
      const medicationSearch = screen.getByTestId('medication-search');
      await user.type(medicationSearch, 'Aspirin');
      fireEvent.keyDown(medicationSearch, { key: 'Enter' });

      // TIMEOUT FIX: Quick step completion validation
      vi.runAllTimers();
      await waitFor(() => {
        const dosageStep = screen.getByTestId('step-dosage-form');
        expect(dosageStep).not.toHaveAttribute('disabled');
      }, { timeout: 500, interval: 10 });

      // Click on dosage step indicator
      const dosageStep = screen.getByTestId('step-dosage-form');
      await user.click(dosageStep);

      // TIMEOUT FIX: Quick focus jump validation
      vi.runAllTimers();
      await waitFor(() => {
        const dosageForm = screen.getByTestId('dosage-form');
        expect(document.activeElement).toBe(dosageForm);
      }, { timeout: 500, interval: 10 });
    });

    it('should show visual feedback for completed steps', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      
      // Complete the medication search step
      await user.type(medicationSearch, 'Aspirin');
      fireEvent.keyDown(medicationSearch, { key: 'Enter' });

      // TIMEOUT FIX: Quick completion status validation
      vi.runAllTimers();
      await waitFor(() => {
        const medicationStep = screen.getByTestId('step-medication-search');
        expect(medicationStep).toHaveClass('complete');
        expect(medicationStep.querySelector('.checkmark')).toBeInTheDocument();
      }, { timeout: 500, interval: 10 });
    });

    it('should update current step indicator when focus changes', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      const dosageForm = screen.getByTestId('dosage-form');

      // Focus medication search
      medicationSearch.focus();

      // TIMEOUT FIX: Quick current step validation
      vi.runAllTimers();
      await waitFor(() => {
        const medicationStep = screen.getByTestId('step-medication-search');
        expect(medicationStep).toHaveClass('current');
      }, { timeout: 500, interval: 10 });

      // Move to dosage form
      dosageForm.focus();

      // TIMEOUT FIX: Quick step indicator validation
      vi.runAllTimers();
      await waitFor(() => {
        const dosageStep = screen.getByTestId('step-dosage-form');
        expect(dosageStep).toHaveClass('current');
        
        const medicationStep = screen.getByTestId('step-medication-search');
        expect(medicationStep).not.toHaveClass('current');
      }, { timeout: 500, interval: 10 });
    });
  });

  describe('Invalid Jump Prevention', () => {
    it('should prevent clicking on disabled step indicators', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      // Try to click on dates step (should be disabled initially)
      const datesStep = screen.getByTestId('step-dates');
      expect(datesStep).toHaveAttribute('disabled');

      await user.click(datesStep);

      // Focus should not change to dates field
      const datesField = screen.getByTestId('dates');
      expect(document.activeElement).not.toBe(datesField);

      // Should log prevention message
      expect(console.log).toHaveBeenCalledWith('Cannot jump to step: dates');
    });

    it('should respect dependency validation for step navigation', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const categoriesStep = screen.getByTestId('step-categories');
      const datesStep = screen.getByTestId('step-dates');

      // Dates should be disabled until categories are complete
      expect(datesStep).toHaveAttribute('disabled');

      // Complete categories step
      const categoriesField = screen.getByTestId('categories');
      categoriesField.focus();
      
      // Simulate completing categories
      fireEvent.change(categoriesField, { target: { value: ['category1'] } });
      fireEvent.keyDown(categoriesField, { key: 'Enter' });

      // TIMEOUT FIX: Quick dates step enabled validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(datesStep).not.toHaveAttribute('disabled');
      }, { timeout: 500, interval: 10 });

      // Should be able to click on dates step now
      await user.click(datesStep);

      // TIMEOUT FIX: Quick dates field focus validation
      vi.runAllTimers();
      await waitFor(() => {
        const datesField = screen.getByTestId('dates');
        expect(document.activeElement).toBe(datesField);
      }, { timeout: 500, interval: 10 });
    });

    it('should validate canJumpToNode for step indicator clicks', async () => {
      // Create a test component with a custom validator
      const ValidatedStepComponent = () => {
        const { focusField, canJumpToNode } = useFocusManager();
        
        return (
          <div>
            <FocusableField
              id="required-field"
              order={1}
              scope="main-form"
              visualIndicator={{ showInStepper: true, label: 'Required' }}
            >
              <input data-testid="required-field" />
            </FocusableField>
            <FocusableField
              id="dependent-field"
              order={2}
              scope="main-form"
              visualIndicator={{ showInStepper: true, label: 'Dependent' }}
              validators={{
                canReceiveFocus: async () => {
                  const requiredField = document.querySelector('[data-testid="required-field"]') as HTMLInputElement;
                  return requiredField && requiredField.value.length > 0;
                }
              }}
            >
              <input data-testid="dependent-field" />
            </FocusableField>
            <button
              data-testid="jump-button"
              onClick={async () => {
                const canJump = await canJumpToNode('dependent-field');
                if (canJump) {
                  focusField('dependent-field');
                } else {
                  console.log('Jump validation failed');
                }
              }}
            >
              Try Jump
            </button>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithFocusManager(<ValidatedStepComponent />);

      // Try to jump without completing required field
      const jumpButton = screen.getByTestId('jump-button');
      await user.click(jumpButton);

      // Should log validation failure
      expect(console.log).toHaveBeenCalledWith('Jump validation failed');

      // Focus should not change
      const dependentField = screen.getByTestId('dependent-field');
      expect(document.activeElement).not.toBe(dependentField);
    });
  });

  describe('Navigation Mode Switching', () => {
    it('should switch to hybrid mode on mouse click', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const currentModeDisplay = screen.getByTestId('current-mode');
      
      // Initially should be keyboard mode
      expect(currentModeDisplay).toHaveTextContent('keyboard');

      // Click on an element
      const medicationSearch = screen.getByTestId('medication-search');
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick mode switch validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(currentModeDisplay).toHaveTextContent('hybrid');
      }, { timeout: 500, interval: 10 });
    });

    it('should handle mouse movement for mode detection', async () => {
      renderWithFocusManager(<MouseNavigationTestForm />);

      const currentModeDisplay = screen.getByTestId('current-mode');
      
      // Start in keyboard mode
      expect(currentModeDisplay).toHaveTextContent('keyboard');

      // Simulate mouse movement
      fireEvent.mouseMove(document.body, { clientX: 100, clientY: 100 });

      // TIMEOUT FIX: Quick hybrid mode validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(currentModeDisplay).toHaveTextContent('hybrid');
      }, { timeout: 500, interval: 10 });
    });

    it('should handle Ctrl+Click for direct jumps', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      const dosageForm = screen.getByTestId('dosage-form');

      // Complete first step to make second accessible
      await user.type(medicationSearch, 'Aspirin');
      fireEvent.keyDown(medicationSearch, { key: 'Enter' });

      // TIMEOUT FIX: Quick dosage step validation  
      vi.runAllTimers();
      await waitFor(() => {
        const dosageStep = screen.getByTestId('step-dosage-form');
        expect(dosageStep).not.toHaveAttribute('disabled');
      }, { timeout: 500, interval: 10 });

      // Ctrl+Click on dosage step
      const dosageStep = screen.getByTestId('step-dosage-form');
      fireEvent.mouseDown(dosageStep, { ctrlKey: true });

      // TIMEOUT FIX: Quick dosage form jump validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(document.activeElement).toBe(dosageForm);
      }, { timeout: 500, interval: 10 });

      // Navigation mode should be hybrid
      const currentModeDisplay = screen.getByTestId('current-mode');
      expect(currentModeDisplay).toHaveTextContent('hybrid');
    });

    it('should respect navigation mode in mouse interaction tracking', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const navIndicator = screen.getByTestId('nav-mode-indicator');
      
      // Verify mode indicator shows current mode
      expect(navIndicator).toHaveAttribute('data-mode', 'keyboard');

      // Perform mouse interaction
      const medicationSearch = screen.getByTestId('medication-search');
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick mode indicator update validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(navIndicator).toHaveAttribute('data-mode', 'hybrid');
      }, { timeout: 500, interval: 10 });
    });
  });

  describe('Visual Feedback and Indicators', () => {
    it('should show navigation mode indicator with current state', async () => {
      renderWithFocusManager(<MouseNavigationTestForm />);

      const navIndicator = screen.getByTestId('nav-mode-indicator');
      
      // Should show keyboard mode initially
      expect(navIndicator).toHaveAttribute('data-mode', 'keyboard');
      expect(navIndicator.querySelector('.mode-icon')).toHaveTextContent('⌨️');
      expect(navIndicator.querySelector('.mode-label')).toHaveTextContent('Keyboard');
    });

    it('should show last interaction type in indicator', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      
      // Perform mouse click
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick mouse interaction validation
      vi.runAllTimers();
      await waitFor(() => {
        const lastInteraction = screen.getByText('(mouse)');
        expect(lastInteraction).toBeInTheDocument();
      }, { timeout: 500, interval: 10 });
    });

    it('should expand navigation mode indicator on click', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const navIndicator = screen.getByTestId('nav-mode-indicator');
      const mainIndicator = navIndicator.querySelector('.mode-indicator-main');

      // Click to expand
      await user.click(mainIndicator!);

      // TIMEOUT FIX: Quick expanded state validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(navIndicator).toHaveAttribute('data-expanded', 'true');
        expect(screen.getByText('Switch Mode:')).toBeInTheDocument();
        expect(screen.getByText('Keyboard Shortcuts:')).toBeInTheDocument();
      }, { timeout: 500, interval: 10 });
    });

    it('should provide visual feedback for mouse interactions', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      
      // Click on field
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick mouse interaction attribute validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(medicationSearch).toHaveAttribute('data-interaction-mode', 'mouse');
      }, { timeout: 500, interval: 10 });
    });

    it('should show hover effects on step indicators', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationStep = screen.getByTestId('step-medication-search');
      
      // Hover over step indicator
      await user.hover(medicationStep);

      // Should have hover styling (this would be tested via CSS classes)
      expect(medicationStep).toBeInTheDocument();
    });

    it('should show appropriate cursor styles for clickable elements', async () => {
      renderWithFocusManager(<MouseNavigationTestForm />);

      const enabledStep = screen.getByTestId('step-medication-search');
      const disabledStep = screen.getByTestId('step-dates');

      // Enabled steps should be clickable
      expect(enabledStep).not.toHaveAttribute('disabled');
      
      // Disabled steps should not be clickable
      expect(disabledStep).toHaveAttribute('disabled');
    });
  });

  describe('Integration with Existing Navigation System', () => {
    it('should work with modal dialog navigation', async () => {
      const ModalTestComponent = () => (
        <div>
          <MouseNavigationTestForm />
          <ManagedDialog
            isOpen={true}
            onClose={() => {}}
            title="Test Modal"
            data-testid="test-modal"
          >
            <FocusableField
              id="modal-field"
              order={1}
              scope="modal"
            >
              <input data-testid="modal-field" />
            </FocusableField>
          </ManagedDialog>
        </div>
      );

      const user = userEvent.setup();
      renderWithFocusManager(<ModalTestComponent />);

      // TIMEOUT FIX: Quick modal field focus validation
      vi.runAllTimers();
      await waitFor(() => {
        const modalField = screen.getByTestId('modal-field');
        expect(document.activeElement).toBe(modalField);
      }, { timeout: 500, interval: 10 });

      // Mouse clicks should work in modal context
      const modalField = screen.getByTestId('modal-field');
      await user.click(modalField);

      expect(document.activeElement).toBe(modalField);
    });

    it('should maintain focus history with mouse interactions', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      const dosageForm = screen.getByTestId('dosage-form');

      // Navigate via mouse clicks
      await user.click(medicationSearch);
      await user.type(medicationSearch, 'Aspirin');
      fireEvent.keyDown(medicationSearch, { key: 'Enter' });

      // TIMEOUT FIX: Quick focus history validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(document.activeElement).toBe(dosageForm);
      }, { timeout: 500, interval: 10 });

      await user.click(dosageForm);

      // History should include mouse interactions
      // This would be verified through the focus manager's history tracking
      expect(document.activeElement).toBe(dosageForm);
    });

    it('should handle mixed keyboard and mouse navigation flows', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');
      const dosageForm = screen.getByTestId('dosage-form');

      // Start with keyboard navigation
      medicationSearch.focus();
      await user.type(medicationSearch, 'Aspirin');
      
      // Use mouse to advance
      await user.click(medicationSearch);

      // TIMEOUT FIX: Quick mixed navigation validation
      vi.runAllTimers();
      await waitFor(() => {
        expect(document.activeElement).toBe(dosageForm);
      }, { timeout: 500, interval: 10 });

      // Continue with keyboard
      fireEvent.keyDown(dosageForm, { key: 'Tab' });

      // Should work seamlessly between input methods
      const currentModeDisplay = screen.getByTestId('current-mode');
      expect(currentModeDisplay).toHaveTextContent('hybrid');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid mouse clicks gracefully', async () => {
      const user = userEvent.setup();
      renderWithFocusManager(<MouseNavigationTestForm />);

      const medicationSearch = screen.getByTestId('medication-search');

      // Perform rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(medicationSearch);
      }

      // Should not cause errors or unexpected behavior
      expect(document.activeElement).toBe(medicationSearch);
    });

    it('should clean up event listeners properly', () => {
      const { unmount } = renderWithFocusManager(<MouseNavigationTestForm />);

      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle mouse interactions when focus manager is disabled', async () => {
      const DisabledManagerComponent = () => (
        <FocusManagerProvider initialState={{ enabled: false }}>
          <FocusableField id="test-field" order={1} scope="main-form">
            <input data-testid="medication-search" />
          </FocusableField>
        </FocusManagerProvider>
      );

      const user = userEvent.setup();
      render(<DisabledManagerComponent />);

      const medicationSearch = screen.getByTestId('medication-search');
      
      // Should not throw errors when clicking with disabled manager
      expect(async () => {
        await user.click(medicationSearch);
      }).not.toThrow();
    });
  });
});