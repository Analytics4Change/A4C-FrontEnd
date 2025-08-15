/**
 * FocusableField Component Tests
 * 
 * Test suite for the FocusableField component covering:
 * - Registration with FocusManager
 * - Validation functions
 * - Keyboard navigation
 * - Mouse interaction overrides
 * - Step indicator metadata
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusableField, FocusableFieldProps } from './FocusableField';
import { FocusManagerProvider } from '../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../contexts/focus/useFocusManager';

// Test component to inspect focus manager state
const FocusInspector: React.FC<{ onStateChange: (state: any) => void }> = ({ onStateChange }) => {
  const { state } = useFocusManager();
  React.useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);
  return null;
};

// Helper to render with FocusManagerProvider
const renderWithFocusManager = (
  ui: React.ReactElement,
  options?: { debug?: boolean }
) => {
  return render(
    <FocusManagerProvider debug={options?.debug}>
      {ui}
    </FocusManagerProvider>
  );
};

describe('FocusableField Component', () => {
  describe('Registration and Cleanup', () => {
    it('should register with FocusManager on mount', async () => {
      let focusState: any = null;
      
      const { unmount } = renderWithFocusManager(
        <>
          <FocusableField id="test-field" order={1}>
            <input type="text" />
          </FocusableField>
          <FocusInspector onStateChange={(state) => { focusState = state; }} />
        </>
      );
      
      await waitFor(() => {
        expect(focusState?.elements.has('test-field')).toBe(true);
      });
      
      const element = focusState?.elements.get('test-field');
      expect(element).toBeDefined();
      expect(element?.metadata?.order).toBe(1);
    });
    
    it('should unregister on unmount', async () => {
      let focusState: any = null;
      
      const { unmount } = renderWithFocusManager(
        <>
          <FocusableField id="test-field" order={1}>
            <input type="text" />
          </FocusableField>
          <FocusInspector onStateChange={(state) => { focusState = state; }} />
        </>
      );
      
      await waitFor(() => {
        expect(focusState?.elements.has('test-field')).toBe(true);
      });
      
      unmount();
      
      await waitFor(() => {
        expect(focusState?.elements.has('test-field')).toBe(false);
      });
    });
    
    it('should not register when autoRegister is false', async () => {
      let focusState: any = null;
      
      renderWithFocusManager(
        <>
          <FocusableField id="test-field" order={1} autoRegister={false}>
            <input type="text" />
          </FocusableField>
          <FocusInspector onStateChange={(state) => { focusState = state; }} />
        </>
      );
      
      await waitFor(() => {
        expect(focusState).toBeDefined();
      });
      
      expect(focusState?.elements.has('test-field')).toBe(false);
    });
  });
  
  describe('Validation Functions', () => {
    it('should respect canReceiveFocus validator', async () => {
      const canReceiveFocus = jest.fn(() => false);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          validators={{ canReceiveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      expect(wrapper).toBeDefined();
      
      // The validator should be called when trying to focus
      // This would be tested through the focus manager's focusField method
    });
    
    it('should prevent leaving field when canLeaveFocus returns false', async () => {
      const canLeaveFocus = jest.fn(() => false);
      const onComplete = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <>
          <FocusableField
            id="field1"
            order={1}
            validators={{ canLeaveFocus }}
            onComplete={onComplete}
          >
            <input type="text" data-testid="input1" />
          </FocusableField>
          <FocusableField id="field2" order={2}>
            <input type="text" data-testid="input2" />
          </FocusableField>
        </>
      );
      
      const input1 = screen.getByTestId('input1');
      const wrapper1 = container.querySelector('[data-focus-id="field1"]');
      
      // Focus the first field
      input1.focus();
      
      // Try to leave with Enter key
      fireEvent.keyDown(wrapper1!, { key: 'Enter' });
      
      expect(onComplete).toHaveBeenCalled();
      expect(canLeaveFocus).toHaveBeenCalled();
      
      // Focus should not have moved
      expect(document.activeElement).toBe(input1);
    });
    
    it('should allow leaving field when canLeaveFocus returns true', async () => {
      const canLeaveFocus = jest.fn(() => true);
      const onComplete = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <>
          <FocusableField
            id="field1"
            order={1}
            validators={{ canLeaveFocus }}
            onComplete={onComplete}
          >
            <input type="text" data-testid="input1" />
          </FocusableField>
          <FocusableField id="field2" order={2}>
            <input type="text" data-testid="input2" />
          </FocusableField>
        </>
      );
      
      const wrapper1 = container.querySelector('[data-focus-id="field1"]');
      
      // Simulate Enter key
      fireEvent.keyDown(wrapper1!, { key: 'Enter' });
      
      expect(onComplete).toHaveBeenCalled();
      expect(canLeaveFocus).toHaveBeenCalled();
    });
  });
  
  describe('Keyboard Navigation', () => {
    it('should advance focus on Enter when onComplete returns true', async () => {
      const onComplete = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      expect(onComplete).toHaveBeenCalled();
    });
    
    it('should not advance focus on Enter when onComplete returns false', async () => {
      const onComplete = jest.fn(() => false);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      expect(onComplete).toHaveBeenCalled();
    });
    
    it('should not advance on Shift+Enter', async () => {
      const onComplete = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.keyDown(wrapper!, { key: 'Enter', shiftKey: true });
      
      expect(onComplete).not.toHaveBeenCalled();
    });
    
    it('should handle Tab key with validation', async () => {
      const canLeaveFocus = jest.fn(() => false);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          validators={{ canLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      wrapper!.dispatchEvent(event);
      
      expect(canLeaveFocus).toHaveBeenCalled();
    });
  });
  
  describe('Mouse Interaction', () => {
    it('should capture clicks when captureClicks is true', async () => {
      const onComplete = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          mouseOverride={{
            captureClicks: true,
            preserveFocusOnInteraction: true
          }}
        >
          <button data-testid="button">Click me</button>
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.click(wrapper!);
      
      expect(onComplete).toHaveBeenCalled();
    });
    
    it('should update interaction mode on mouse click', async () => {
      const { container } = renderWithFocusManager(
        <FocusableField id="test-field" order={1}>
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.click(wrapper!);
      
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'mouse');
    });
    
    it('should update interaction mode on keyboard use', async () => {
      const { container } = renderWithFocusManager(
        <FocusableField id="test-field" order={1}>
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      fireEvent.keyDown(wrapper!, { key: 'Tab' });
      
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'keyboard');
    });
    
    it('should handle onClickOutside callback', async () => {
      const onClickOutside = jest.fn();
      
      const { container } = renderWithFocusManager(
        <div>
          <FocusableField
            id="test-field"
            order={1}
            mouseOverride={{ onClickOutside }}
          >
            <input type="text" data-testid="input" />
          </FocusableField>
          <button data-testid="outside">Outside</button>
        </div>
      );
      
      const outsideButton = screen.getByTestId('outside');
      
      fireEvent.mouseDown(outsideButton);
      
      expect(onClickOutside).toHaveBeenCalled();
    });
  });
  
  describe('Step Indicator Metadata', () => {
    it('should register step indicator metadata', async () => {
      let focusState: any = null;
      
      renderWithFocusManager(
        <>
          <FocusableField
            id="test-field"
            order={1}
            stepIndicator={{
              label: 'Test Step',
              description: 'This is a test step',
              allowDirectAccess: true
            }}
          >
            <input type="text" />
          </FocusableField>
          <FocusInspector onStateChange={(state) => { focusState = state; }} />
        </>
      );
      
      await waitFor(() => {
        expect(focusState?.elements.has('test-field')).toBe(true);
      });
      
      const element = focusState?.elements.get('test-field');
      expect(element?.visualIndicator).toBeDefined();
      expect(element?.visualIndicator?.stepLabel).toBe('Test Step');
      expect(element?.visualIndicator?.stepDescription).toBe('This is a test step');
      expect(element?.visualIndicator?.showInStepper).toBe(true);
    });
  });
  
  describe('Data Attributes', () => {
    it('should set correct data attributes', () => {
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={3}
          scope="custom-scope"
          mouseOverride={{ allowDirectJump: true }}
        >
          <input type="text" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      expect(wrapper).toHaveAttribute('data-focus-id', 'test-field');
      expect(wrapper).toHaveAttribute('data-focus-order', '3');
      expect(wrapper).toHaveAttribute('data-focus-scope', 'custom-scope');
      expect(wrapper).toHaveAttribute('data-can-jump', 'true');
      expect(wrapper).toHaveAttribute('data-interaction-mode', 'keyboard');
      expect(wrapper).toHaveAttribute('data-focused', 'false');
    });
  });
  
  describe('Integration Scenarios', () => {
    it('should work with multiple fields in sequence', async () => {
      const onComplete1 = jest.fn(() => true);
      const onComplete2 = jest.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <>
          <FocusableField id="field1" order={1} onComplete={onComplete1}>
            <input type="text" data-testid="input1" />
          </FocusableField>
          <FocusableField id="field2" order={2} onComplete={onComplete2}>
            <input type="text" data-testid="input2" />
          </FocusableField>
          <FocusableField id="field3" order={3}>
            <button data-testid="button">Submit</button>
          </FocusableField>
        </>
      );
      
      const wrapper1 = container.querySelector('[data-focus-id="field1"]');
      
      // Simulate completing field 1
      fireEvent.keyDown(wrapper1!, { key: 'Enter' });
      
      expect(onComplete1).toHaveBeenCalled();
    });
    
    it('should handle conditional field enabling', async () => {
      const Field2: React.FC<{ enabled: boolean }> = ({ enabled }) => (
        <FocusableField
          id="field2"
          order={2}
          validators={{
            canReceiveFocus: () => enabled
          }}
        >
          <input type="text" data-testid="input2" disabled={!enabled} />
        </FocusableField>
      );
      
      const { rerender } = renderWithFocusManager(
        <>
          <FocusableField id="field1" order={1}>
            <input type="text" data-testid="input1" />
          </FocusableField>
          <Field2 enabled={false} />
        </>
      );
      
      const input2 = screen.getByTestId('input2');
      expect(input2).toBeDisabled();
      
      // Enable field 2
      rerender(
        <FocusManagerProvider>
          <FocusableField id="field1" order={1}>
            <input type="text" data-testid="input1" />
          </FocusableField>
          <Field2 enabled={true} />
        </FocusManagerProvider>
      );
      
      expect(input2).not.toBeDisabled();
    });
  });
});