/**
 * Mouse Navigation Tests
 * Tests for Task 002: Mouse Navigation Support
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusManagerProvider } from '../FocusManagerContext';
import { useFocusManager } from '../hooks';
import { NavigationMode, FocusChangeReason } from '../types';

// Test component that uses focus manager
const TestComponent = () => {
  const {
    registerElement,
    unregisterElement,
    focusField,
    handleMouseNavigation,
    setNavigationMode,
    getNavigationMode,
    canJumpToNode,
    getVisibleSteps,
    state
  } = useFocusManager();
  
  const field1Ref = React.useRef<HTMLButtonElement>(null);
  const field2Ref = React.useRef<HTMLButtonElement>(null);
  const field3Ref = React.useRef<HTMLButtonElement>(null);
  const field4Ref = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    // Register elements with different configurations
    registerElement({
      id: 'field1',
      ref: field1Ref,
      type: 'button' as any,
      scopeId: 'default',
      tabIndex: 1,
      mouseNavigation: {
        allowDirectJump: true,
        clickAdvancesBehavior: 'next'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Step 1'
      }
    });
    
    registerElement({
      id: 'field2',
      ref: field2Ref,
      type: 'button' as any,
      scopeId: 'default',
      tabIndex: 2,
      metadata: { required: true },
      mouseNavigation: {
        allowDirectJump: false,
        clickAdvancesBehavior: 'specific',
        clickAdvancesTo: 'field4'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Step 2'
      }
    });
    
    registerElement({
      id: 'field3',
      ref: field3Ref,
      type: 'button' as any,
      scopeId: 'default',
      tabIndex: 3,
      mouseNavigation: {
        allowDirectJump: false
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Step 3'
      }
    });
    
    registerElement({
      id: 'field4',
      ref: field4Ref,
      type: 'button' as any,
      scopeId: 'default',
      tabIndex: 4,
      mouseNavigation: {
        allowDirectJump: true
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Step 4'
      }
    });
    
    return () => {
      unregisterElement('field1');
      unregisterElement('field2');
      unregisterElement('field3');
      unregisterElement('field4');
    };
  }, [registerElement, unregisterElement]);
  
  return (
    <div>
      <div>Navigation Mode: {getNavigationMode()}</div>
      <div>Current Focus: {state.currentFocusId || 'none'}</div>
      <div>Mouse History: {state.mouseInteractionHistory.length} interactions</div>
      
      <button
        ref={field1Ref}
        onClick={(e) => handleMouseNavigation('field1', e.nativeEvent)}
        data-testid="field1"
      >
        Field 1 (Direct Jump Allowed)
      </button>
      
      <button
        ref={field2Ref}
        onClick={(e) => handleMouseNavigation('field2', e.nativeEvent)}
        data-testid="field2"
      >
        Field 2 (Required, No Direct Jump)
      </button>
      
      <button
        ref={field3Ref}
        onClick={(e) => handleMouseNavigation('field3', e.nativeEvent)}
        data-testid="field3"
      >
        Field 3 (No Direct Jump)
      </button>
      
      <button
        ref={field4Ref}
        onClick={(e) => handleMouseNavigation('field4', e.nativeEvent)}
        data-testid="field4"
      >
        Field 4 (Direct Jump Allowed)
      </button>
      
      <div data-testid="can-jump-field3">{canJumpToNode('field3') ? 'Can jump' : 'Cannot jump'}</div>
      
      <div data-testid="visible-steps">
        {getVisibleSteps().map(step => (
          <div key={step.id}>
            {step.label}: {step.status} - {step.isClickable ? 'clickable' : 'not-clickable'}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Mouse Navigation Support', () => {
  it('should detect and switch navigation modes automatically', async () => {
    const { getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Should start in keyboard mode
    expect(getByText('Navigation Mode: keyboard')).toBeInTheDocument();
    
    // Simulate mouse movement
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    
    // Should switch to hybrid mode
    await waitFor(() => {
      expect(getByText('Navigation Mode: hybrid')).toBeInTheDocument();
    });
    
    // Simulate keyboard navigation
    fireEvent.keyDown(document, { key: 'Tab' });
    
    // Should remain in hybrid mode
    expect(getByText('Navigation Mode: hybrid')).toBeInTheDocument();
  });
  
  it('should handle mouse click navigation', async () => {
    const { getByTestId, getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Click on field1 (direct jump allowed)
    fireEvent.click(getByTestId('field1'));
    
    await waitFor(() => {
      expect(getByText('Current Focus: field1')).toBeInTheDocument();
    });
    
    // Check that mouse interaction was recorded
    expect(getByText('Mouse History: 1 interactions')).toBeInTheDocument();
  });
  
  it('should prevent invalid jumps', async () => {
    const { getByTestId, getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Try to jump to field3 (should not be allowed initially)
    expect(getByTestId('can-jump-field3')).toHaveTextContent('Cannot jump');
    
    // Click on field3
    fireEvent.click(getByTestId('field3'));
    
    // Focus should not change
    await waitFor(() => {
      expect(getByText('Current Focus: none')).toBeInTheDocument();
    });
    
    // But interaction should still be recorded
    expect(getByText('Mouse History: 1 interactions')).toBeInTheDocument();
    
    // Now complete required fields in order
    fireEvent.click(getByTestId('field1'));
    await waitFor(() => {
      expect(getByText('Current Focus: field1')).toBeInTheDocument();
    });
    
    fireEvent.click(getByTestId('field2'));
    await waitFor(() => {
      expect(getByText('Current Focus: field2')).toBeInTheDocument();
    });
    
    // Now field3 should be jumpable
    await waitFor(() => {
      expect(getByTestId('can-jump-field3')).toHaveTextContent('Can jump');
    });
  });
  
  it('should apply click advances behavior', async () => {
    const { getByTestId, getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Click field1 which has clickAdvancesBehavior: 'next'
    fireEvent.click(getByTestId('field1'));
    
    // Should focus field1 first
    await waitFor(() => {
      expect(getByText('Current Focus: field1')).toBeInTheDocument();
    });
    
    // Then should advance to field2 after delay
    await waitFor(() => {
      expect(getByText('Current Focus: field2')).toBeInTheDocument();
    }, { timeout: 100 });
  });
  
  it('should handle specific click advance targets', async () => {
    const { getByTestId, getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // First navigate to field1 and field2 to make them valid
    fireEvent.click(getByTestId('field1'));
    await waitFor(() => {
      expect(getByText('Current Focus: field1')).toBeInTheDocument();
    });
    
    // Click field2 which has clickAdvancesTo: 'field4'
    fireEvent.click(getByTestId('field2'));
    
    // Should focus field2 first
    await waitFor(() => {
      expect(getByText('Current Focus: field2')).toBeInTheDocument();
    });
    
    // Then should jump to field4
    await waitFor(() => {
      expect(getByText('Current Focus: field4')).toBeInTheDocument();
    }, { timeout: 100 });
  });
  
  it('should track visible steps correctly', async () => {
    const { getByTestId } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    const stepsContainer = getByTestId('visible-steps');
    
    // Initially all steps should be upcoming except those with allowDirectJump
    expect(stepsContainer).toHaveTextContent('Step 1: upcoming - clickable');
    expect(stepsContainer).toHaveTextContent('Step 2: upcoming - not-clickable');
    expect(stepsContainer).toHaveTextContent('Step 3: upcoming - not-clickable');
    expect(stepsContainer).toHaveTextContent('Step 4: upcoming - clickable');
    
    // Visit field1
    fireEvent.click(getByTestId('field1'));
    
    await waitFor(() => {
      expect(stepsContainer).toHaveTextContent('Step 1: current - clickable');
    });
    
    // Visit field2
    fireEvent.click(getByTestId('field2'));
    
    await waitFor(() => {
      expect(stepsContainer).toHaveTextContent('Step 1: complete - clickable');
      expect(stepsContainer).toHaveTextContent('Step 2: current - clickable');
      expect(stepsContainer).toHaveTextContent('Step 3: upcoming - clickable'); // Now clickable since field2 is visited
    });
  });
  
  it('should add visual feedback for invalid jumps', async () => {
    const { getByTestId } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    const field3 = getByTestId('field3');
    
    // Try to click field3 when not allowed
    fireEvent.click(field3);
    
    // Should have invalid jump class temporarily
    expect(field3).toHaveClass('focus-invalid-jump');
    
    // Class should be removed after animation
    await waitFor(() => {
      expect(field3).not.toHaveClass('focus-invalid-jump');
    }, { timeout: 400 });
  });
  
  it('should dispatch custom event for invalid jumps', async () => {
    const invalidJumpHandler = vi.fn();
    document.addEventListener('focusInvalidJump', invalidJumpHandler);
    
    const { getByTestId } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Try to jump to field3 (not allowed initially)
    fireEvent.click(getByTestId('field3'));
    
    await waitFor(() => {
      expect(invalidJumpHandler).toHaveBeenCalled();
      expect(invalidJumpHandler.mock.calls[0][0].detail).toEqual({
        nodeId: 'field3',
        reason: 'validation_failed'
      });
    });
    
    document.removeEventListener('focusInvalidJump', invalidJumpHandler);
  });
  
  it('should handle hybrid mode correctly', async () => {
    const { getByTestId, getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Start with keyboard navigation
    fireEvent.keyDown(document, { key: 'Tab' });
    
    // Then use mouse
    fireEvent.click(getByTestId('field1'));
    
    await waitFor(() => {
      expect(getByText('Navigation Mode: hybrid')).toBeInTheDocument();
    });
    
    // In hybrid mode, previously visited nodes should be jumpable
    fireEvent.click(getByTestId('field2'));
    await waitFor(() => {
      expect(getByText('Current Focus: field2')).toBeInTheDocument();
    });
    
    // Now field1 should be jumpable even without allowDirectJump
    fireEvent.click(getByTestId('field1'));
    await waitFor(() => {
      expect(getByText('Current Focus: field1')).toBeInTheDocument();
    });
  });
  
  it('should auto-switch between modes based on prolonged activity', async () => {
    jest.useFakeTimers();
    
    const { getByText } = render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    // Start in keyboard mode
    expect(getByText('Navigation Mode: keyboard')).toBeInTheDocument();
    
    // Use mouse for a while
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    
    // Should switch to hybrid immediately
    await waitFor(() => {
      expect(getByText('Navigation Mode: hybrid')).toBeInTheDocument();
    });
    
    // Continue with mouse only for 3+ seconds
    jest.advanceTimersByTime(3100);
    
    // Should switch to mouse mode
    await waitFor(() => {
      expect(getByText('Navigation Mode: mouse')).toBeInTheDocument();
    });
    
    // Now use keyboard
    fireEvent.keyDown(document, { key: 'Tab' });
    
    // Should switch back to hybrid
    await waitFor(() => {
      expect(getByText('Navigation Mode: hybrid')).toBeInTheDocument();
    });
    
    // Continue with keyboard only for 3+ seconds
    jest.advanceTimersByTime(3100);
    
    // Should switch to keyboard mode
    await waitFor(() => {
      expect(getByText('Navigation Mode: keyboard')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
});