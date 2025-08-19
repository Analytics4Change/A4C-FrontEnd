/**
 * Mouse Navigation Tests
 * Tests for mouse navigation functionality in FocusManagerContext
 */

import React, { useRef } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { FocusManagerProvider } from './FocusManagerContext';
import { 
  useFocusManager, 
  useFocusable, 
  useMouseNavigation,
  useStepIndicator 
} from './useFocusManager';
import { NavigationMode } from './types';

// Test component with mouse navigation
function TestComponent({ 
  id, 
  allowDirectJump = false,
  showInStepper = false,
  stepLabel = ''
}: { 
  id: string;
  allowDirectJump?: boolean;
  showInStepper?: boolean;
  stepLabel?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { registerElement, unregisterElement } = useFocusManager();
  const mouseNav = useMouseNavigation(id, { allowDirectJump });

  React.useEffect(() => {
    registerElement({
      id,
      ref,
      type: 'button' as any,
      scopeId: 'default',
      mouseNavigation: {
        allowDirectJump,
        enableClickNavigation: true
      },
      visualIndicator: showInStepper ? {
        showInStepper,
        stepLabel
      } : undefined
    });
    
    return () => unregisterElement(id);
  }, [id, allowDirectJump, showInStepper, stepLabel, registerElement, unregisterElement]);

  return (
    <button 
      ref={ref}
      data-testid={id}
      {...mouseNav}
    >
      {id}
    </button>
  );
}

// Test component for navigation mode display
function NavigationModeDisplay() {
  const { getNavigationMode } = useFocusManager();
  const mode = getNavigationMode();
  
  return <div data-testid="nav-mode">{mode}</div>;
}

// Test component for step indicator
function TestStepIndicator() {
  const { steps, onStepClick } = useStepIndicator();
  
  return (
    <div data-testid="step-indicator">
      {steps.map(step => (
        <button
          key={step.id}
          data-testid={`step-${step.id}`}
          data-status={step.status}
          disabled={!step.isClickable}
          onClick={(e) => onStepClick(step.id, e)}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}

describe('Mouse Navigation', () => {
  describe('Navigation Mode Detection', () => {
    it('should start in keyboard mode by default', () => {
      render(
        <FocusManagerProvider>
          <NavigationModeDisplay />
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('nav-mode')).toHaveTextContent('keyboard');
    });

    it('should switch to hybrid mode on mouse movement', async () => {
      render(
        <FocusManagerProvider>
          <NavigationModeDisplay />
        </FocusManagerProvider>
      );
      
      // Simulate mouse movement
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-mode')).toHaveTextContent('hybrid');
      });
    });

    it('should switch to hybrid mode when clicking an element', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="button1" />
          <NavigationModeDisplay />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('button1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-mode')).toHaveTextContent('hybrid');
      });
    });

    it('should switch from mouse to hybrid on keyboard interaction', async () => {
      const { container } = render(
        <FocusManagerProvider>
          <NavigationModeDisplay />
        </FocusManagerProvider>
      );

      // First set to mouse mode by simulating mouse movement
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      
      // Then use keyboard
      fireEvent.keyDown(document, { key: 'Tab' });
      
      await waitFor(() => {
        expect(screen.getByTestId('nav-mode')).toHaveTextContent('hybrid');
      });
    });
  });

  describe('Jump Validation', () => {
    it('should allow direct jump when allowDirectJump is true', async () => {
      const mockFocus = vi.fn();
      
      render(
        <FocusManagerProvider>
          <TestComponent id="button1" />
          <TestComponent id="button2" allowDirectJump={true} />
          <TestComponent id="button3" />
        </FocusManagerProvider>
      );
      
      const button2 = screen.getByTestId('button2');
      expect(button2).toHaveAttribute('data-clickable', 'true');
    });

    it('should prevent jump when previous required elements are not visited', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="button1" />
          <TestComponent id="button2" />
          <TestComponent id="button3" />
        </FocusManagerProvider>
      );
      
      const button3 = screen.getByTestId('button3');
      expect(button3).toHaveAttribute('data-clickable', 'false');
    });

    it('should record mouse interactions in history', async () => {
      const TestHistoryComponent = () => {
        const { state } = useFocusManager();
        return (
          <div data-testid="interaction-count">
            {state.mouseInteractionHistory.length}
          </div>
        );
      };

      render(
        <FocusManagerProvider>
          <TestComponent id="button1" allowDirectJump={true} />
          <TestComponent id="button2" allowDirectJump={true} />
          <TestHistoryComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('button1'));
      fireEvent.click(screen.getByTestId('button2'));
      
      await waitFor(() => {
        expect(screen.getByTestId('interaction-count')).toHaveTextContent('2');
      });
    });

    it('should limit mouse interaction history to 10 entries', async () => {
      const TestHistoryComponent = () => {
        const { state } = useFocusManager();
        return (
          <div data-testid="interaction-count">
            {state.mouseInteractionHistory.length}
          </div>
        );
      };

      render(
        <FocusManagerProvider>
          <TestComponent id="button1" allowDirectJump={true} />
          <TestHistoryComponent />
        </FocusManagerProvider>
      );
      
      const button = screen.getByTestId('button1');
      
      // Click 15 times
      for (let i = 0; i < 15; i++) {
        fireEvent.click(button);
      }
      
      await waitFor(() => {
        expect(screen.getByTestId('interaction-count')).toHaveTextContent('10');
      });
    });
  });

  describe('Step Indicator Integration', () => {
    it('should show elements marked for step indicator', () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="step1" showInStepper={true} stepLabel="Step 1" />
          <TestComponent id="step2" showInStepper={true} stepLabel="Step 2" />
          <TestComponent id="step3" showInStepper={false} stepLabel="Step 3" />
          <TestStepIndicator />
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('step-step1')).toBeInTheDocument();
      expect(screen.getByTestId('step-step2')).toBeInTheDocument();
      expect(screen.queryByTestId('step-step3')).not.toBeInTheDocument();
    });

    it('should update step status based on visits', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="step1" showInStepper={true} stepLabel="Step 1" allowDirectJump={true} />
          <TestComponent id="step2" showInStepper={true} stepLabel="Step 2" allowDirectJump={true} />
          <TestStepIndicator />
        </FocusManagerProvider>
      );
      
      // Initially all steps should be upcoming
      expect(screen.getByTestId('step-step1')).toHaveAttribute('data-status', 'upcoming');
      expect(screen.getByTestId('step-step2')).toHaveAttribute('data-status', 'upcoming');
      
      // Click on step1
      fireEvent.click(screen.getByTestId('step1'));
      
      // Wait for status update
      await waitFor(() => {
        expect(screen.getByTestId('step-step1')).toHaveAttribute('data-status', 'current');
      });
    });

    it('should handle step click navigation', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="step1" showInStepper={true} stepLabel="Step 1" allowDirectJump={true} />
          <TestComponent id="step2" showInStepper={true} stepLabel="Step 2" allowDirectJump={true} />
          <TestStepIndicator />
          <NavigationModeDisplay />
        </FocusManagerProvider>
      );
      
      // Click on step indicator button
      fireEvent.click(screen.getByTestId('step-step2'));
      
      // Should switch to hybrid mode
      await waitFor(() => {
        expect(screen.getByTestId('nav-mode')).toHaveTextContent('hybrid');
      });
    });

    it('should disable non-clickable steps', () => {
      render(
        <FocusManagerProvider>
          <TestComponent id="step1" showInStepper={true} stepLabel="Step 1" allowDirectJump={false} />
          <TestComponent id="step2" showInStepper={true} stepLabel="Step 2" allowDirectJump={false} />
          <TestStepIndicator />
        </FocusManagerProvider>
      );
      
      // Step 2 should be disabled if step 1 hasn't been visited
      expect(screen.getByTestId('step-step2')).toBeDisabled();
    });
  });

  describe('Mouse Position Tracking', () => {
    it('should track mouse position', async () => {
      const TestPositionComponent = () => {
        const { state } = useFocusManager();
        return (
          <div data-testid="mouse-position">
            {state.lastMousePosition.x},{state.lastMousePosition.y}
          </div>
        );
      };

      render(
        <FocusManagerProvider>
          <TestPositionComponent />
        </FocusManagerProvider>
      );
      
      // Initial position should be 0,0
      expect(screen.getByTestId('mouse-position')).toHaveTextContent('0,0');
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150, clientY: 200 });
      
      await waitFor(() => {
        expect(screen.getByTestId('mouse-position')).toHaveTextContent('150,200');
      });
    });

    it('should only update position on significant movement', async () => {
      const TestPositionComponent = () => {
        const { state } = useFocusManager();
        return (
          <div data-testid="mouse-position">
            {state.lastMousePosition.x},{state.lastMousePosition.y}
          </div>
        );
      };

      render(
        <FocusManagerProvider>
          <TestPositionComponent />
        </FocusManagerProvider>
      );
      
      // Move mouse significantly
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(screen.getByTestId('mouse-position')).toHaveTextContent('100,100');
      });
      
      // Move mouse slightly (less than 5 pixels)
      fireEvent.mouseMove(document, { clientX: 102, clientY: 101 });
      
      // Position should not update
      expect(screen.getByTestId('mouse-position')).toHaveTextContent('100,100');
    });
  });

  describe('Click Handler Integration', () => {
    it('should call custom click handler when provided', async () => {
      const customHandler = vi.fn();
      
      const TestComponentWithHandler = () => {
        const ref = useRef<HTMLButtonElement>(null);
        const { registerElement, unregisterElement } = useFocusManager();
        
        React.useEffect(() => {
          registerElement({
            id: 'button-with-handler',
            ref,
            type: 'button' as any,
            scopeId: 'default',
            mouseNavigation: {
              clickHandler: customHandler,
              allowDirectJump: true
            }
          });
          
          return () => unregisterElement('button-with-handler');
        }, [registerElement, unregisterElement]);
        
        const mouseNav = useMouseNavigation('button-with-handler', { allowDirectJump: true });
        
        return (
          <button ref={ref} data-testid="button-with-handler" {...mouseNav}>
            Click Me
          </button>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestComponentWithHandler />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('button-with-handler'));
      
      await waitFor(() => {
        expect(customHandler).toHaveBeenCalled();
      });
    });

    it('should handle click advances behavior', async () => {
      const TestComponentWithAdvance = ({ id }: { id: string }) => {
        const ref = useRef<HTMLButtonElement>(null);
        const { registerElement, unregisterElement, state } = useFocusManager();
        
        React.useEffect(() => {
          registerElement({
            id,
            ref,
            type: 'button' as any,
            scopeId: 'default',
            tabIndex: parseInt(id.replace('button', '')),
            mouseNavigation: {
              clickAdvancesBehavior: 'next',
              allowDirectJump: true
            }
          });
          
          return () => unregisterElement(id);
        }, [id, registerElement, unregisterElement]);
        
        const mouseNav = useMouseNavigation(id, { 
          allowDirectJump: true,
          clickAdvancesBehavior: 'next'
        });
        
        return (
          <button 
            ref={ref} 
            data-testid={id}
            data-focused={state.currentFocusId === id}
            {...mouseNav}
          >
            {id}
          </button>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestComponentWithAdvance id="button1" />
          <TestComponentWithAdvance id="button2" />
          <TestComponentWithAdvance id="button3" />
        </FocusManagerProvider>
      );
      
      // Click on button1
      fireEvent.click(screen.getByTestId('button1'));
      
      // Should advance to button2 after a delay
      await waitFor(() => {
        expect(screen.getByTestId('button2')).toHaveAttribute('data-focused', 'true');
      }, { timeout: 100 });
    });
  });
});