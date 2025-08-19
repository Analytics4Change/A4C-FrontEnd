/**
 * Focus Advancement Test Suite
 * 
 * Comprehensive tests for focus advancement behavior including:
 * - Enter/Tab key advancement
 * - requestAnimationFrame timing validation
 * - Validator blocking scenarios
 * - Tab key auto-selection logic
 * - Field-to-field navigation
 */

import React, { useRef, useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FocusManagerProvider } from '../FocusManagerContext';
import { useFocusManager } from '../useFocusManager';
import { FocusableField } from '../../../components/FocusableField';
import { focusElement } from '../utils';
import { FocusChangeReason, FocusableType } from '../types';

// Mock requestAnimationFrame for testing
let rafCallback: (() => void) | null = null;
const mockRequestAnimationFrame = vi.fn((callback: () => void) => {
  rafCallback = callback;
  return 1;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
});

// Helper to trigger requestAnimationFrame callback
const triggerRAF = () => {
  if (rafCallback) {
    rafCallback();
    rafCallback = null;
  }
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FocusManagerProvider debug={true}>
    {children}
  </FocusManagerProvider>
);

// Simple test field component
const TestField: React.FC<{
  id: string;
  order: number;
  canReceiveFocus?: () => boolean;
  canLeaveFocus?: () => boolean;
  onComplete?: () => boolean;
  value?: string;
  onChange?: (value: string) => void;
}> = ({ 
  id, 
  order, 
  canReceiveFocus, 
  canLeaveFocus, 
  onComplete,
  value = '',
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <FocusableField
      id={id}
      order={order}
      validators={{
        canReceiveFocus,
        canLeaveFocus
      }}
      onComplete={onComplete}
    >
      <input
        ref={inputRef}
        data-testid={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Field ${id}`}
      />
    </FocusableField>
  );
};

// Dropdown test component with auto-selection
const TestDropdown: React.FC<{
  id: string;
  order: number;
  items: string[];
  value?: string;
  onChange?: (value: string) => void;
}> = ({ id, order, items, value = '', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  
  const canLeaveFocusValidator = () => {
    // Tab key auto-selection logic - if no value but results exist, auto-select first
    if (!inputValue && items.length > 0) {
      setInputValue(items[0]);
      onChange?.(items[0]);
      return false; // Prevent focus leave until selection is made
    }
    return true;
  };
  
  return (
    <FocusableField
      id={id}
      order={order}
      validators={{
        canLeaveFocus: canLeaveFocusValidator
      }}
    >
      <div>
        <input
          data-testid={id}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Dropdown ${id}`}
        />
        {isOpen && items.length > 0 && (
          <ul data-testid={`${id}-options`}>
            {items.map((item, index) => (
              <li
                key={index}
                data-testid={`${id}-option-${index}`}
                onClick={() => {
                  setInputValue(item);
                  onChange?.(item);
                  setIsOpen(false);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FocusableField>
  );
};

describe('Focus Advancement System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rafCallback = null;
  });

  describe('requestAnimationFrame Integration', () => {
    it('should use requestAnimationFrame when focusing elements', async () => {
      const TestComponent = () => {
        const { focusField } = useFocusManager();
        const elementRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={elementRef} data-testid="test-input" />
            <button
              data-testid="focus-button"
              onClick={() => focusField('test-field')}
            >
              Focus
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestField id="test-field" order={1} />
          <TestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('focus-button');
      
      // Click to trigger focus
      fireEvent.click(button);
      
      // Verify requestAnimationFrame was called
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      
      // Initially focus should not be set (before RAF callback)
      const input = screen.getByTestId('test-field');
      expect(document.activeElement).not.toBe(input);
      
      // Trigger RAF callback
      act(() => {
        triggerRAF();
      });
      
      // Now focus should be set
      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    it('should return Promise<boolean> indicating focus success', async () => {
      // Create a direct test for focusElement utility
      const element = document.createElement('input');
      document.body.appendChild(element);
      
      const focusPromise = focusElement(element);
      
      // Should return a promise
      expect(focusPromise).toBeInstanceOf(Promise);
      
      // Trigger RAF to complete focus
      act(() => {
        triggerRAF();
      });
      
      // Promise should resolve to true for successful focus
      const result = await focusPromise;
      expect(result).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should handle focus failure gracefully', async () => {
      // Create an element that cannot receive focus
      const element = document.createElement('div');
      element.style.display = 'none';
      document.body.appendChild(element);
      
      const focusPromise = focusElement(element);
      
      // Trigger RAF
      act(() => {
        triggerRAF();
      });
      
      // Promise should resolve to false for failed focus
      const result = await focusPromise;
      expect(result).toBe(false);
      
      document.body.removeChild(element);
    });
  });

  describe('Enter Key Focus Advancement', () => {
    it('should advance focus on Enter key when field is complete', async () => {
      const TestForm = () => {
        const [field1Value, setField1Value] = useState('');
        const [field2Value, setField2Value] = useState('');
        
        return (
          <div>
            <TestField
              id="field1"
              order={1}
              value={field1Value}
              onChange={setField1Value}
              onComplete={() => field1Value.length > 0}
            />
            <TestField
              id="field2"
              order={2}
              value={field2Value}
              onChange={setField2Value}
            />
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');

      // Focus first field
      fireEvent.focus(field1);
      
      // Type some text to make field "complete"
      fireEvent.change(field1, { target: { value: 'test' } });
      
      // Press Enter
      fireEvent.keyDown(field1, { key: 'Enter' });
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      // Focus should advance to field2
      await waitFor(() => {
        expect(document.activeElement).toBe(field2);
      });
    });

    it('should not advance focus on Enter when field is incomplete', async () => {
      const TestForm = () => {
        const [field1Value, setField1Value] = useState('');
        
        return (
          <div>
            <TestField
              id="field1"
              order={1}
              value={field1Value}
              onChange={setField1Value}
              onComplete={() => field1Value.length > 3} // Requires more than 3 characters
            />
            <TestField id="field2" order={2} />
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');

      // Focus first field
      fireEvent.focus(field1);
      
      // Type insufficient text
      fireEvent.change(field1, { target: { value: 'ab' } }); // Only 2 characters
      
      // Press Enter
      fireEvent.keyDown(field1, { key: 'Enter' });
      
      // Focus should remain on field1
      await waitFor(() => {
        expect(document.activeElement).toBe(field1);
        expect(document.activeElement).not.toBe(field2);
      });
    });
  });

  describe('Tab Key Auto-Selection Logic', () => {
    it('should auto-select first item on Tab when value is empty and results exist', async () => {
      const items = ['Option 1', 'Option 2', 'Option 3'];
      let selectedValue = '';
      
      const TestForm = () => (
        <div>
          <TestDropdown
            id="dropdown1"
            order={1}
            items={items}
            value={selectedValue}
            onChange={(value) => { selectedValue = value; }}
          />
          <TestField id="field2" order={2} />
        </div>
      );

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const dropdown = screen.getByTestId('dropdown1');
      const field2 = screen.getByTestId('field2');

      // Focus dropdown
      fireEvent.focus(dropdown);
      
      // Verify options are shown
      await waitFor(() => {
        expect(screen.getByTestId('dropdown1-options')).toBeInTheDocument();
      });

      // Press Tab with empty value
      fireEvent.keyDown(dropdown, { key: 'Tab' });
      
      // Should auto-select first item and prevent focus leave initially
      await waitFor(() => {
        expect(selectedValue).toBe('Option 1');
      });
      
      // After auto-selection, focus should be able to advance
      // Simulate a second Tab after auto-selection
      fireEvent.keyDown(dropdown, { key: 'Tab' });
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(() => {
        expect(document.activeElement).toBe(field2);
      });
    });

    it('should allow normal Tab navigation when dropdown has value', async () => {
      const items = ['Option 1', 'Option 2', 'Option 3'];
      
      const TestForm = () => {
        const [value, setValue] = useState('Option 1');
        
        return (
          <div>
            <TestDropdown
              id="dropdown1"
              order={1}
              items={items}
              value={value}
              onChange={setValue}
            />
            <TestField id="field2" order={2} />
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const dropdown = screen.getByTestId('dropdown1');
      const field2 = screen.getByTestId('field2');

      // Focus dropdown (already has value)
      fireEvent.focus(dropdown);

      // Press Tab
      fireEvent.keyDown(dropdown, { key: 'Tab' });
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      // Should advance normally since dropdown has value
      await waitFor(() => {
        expect(document.activeElement).toBe(field2);
      });
    });
  });

  describe('Validator Blocking Scenarios', () => {
    it('should block focus advancement when canLeaveFocus returns false', async () => {
      const TestForm = () => {
        const [canLeave, setCanLeave] = useState(false);
        
        return (
          <div>
            <TestField
              id="field1"
              order={1}
              canLeaveFocus={() => canLeave}
              onComplete={() => true}
            />
            <TestField id="field2" order={2} />
            <button
              data-testid="toggle-can-leave"
              onClick={() => setCanLeave(!canLeave)}
            >
              Toggle Can Leave
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');
      const toggleButton = screen.getByTestId('toggle-can-leave');

      // Focus first field
      fireEvent.focus(field1);

      // Try to advance with Tab (should be blocked)
      fireEvent.keyDown(field1, { key: 'Tab' });
      
      // Focus should remain on field1
      await waitFor(() => {
        expect(document.activeElement).toBe(field1);
        expect(document.activeElement).not.toBe(field2);
      });

      // Try to advance with Enter (should be blocked)
      fireEvent.keyDown(field1, { key: 'Enter' });
      
      // Focus should still remain on field1
      await waitFor(() => {
        expect(document.activeElement).toBe(field1);
      });

      // Enable leaving
      fireEvent.click(toggleButton);

      // Now Tab should work
      fireEvent.keyDown(field1, { key: 'Tab' });
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(() => {
        expect(document.activeElement).toBe(field2);
      });
    });

    it('should block focus when canReceiveFocus returns false', async () => {
      const TestForm = () => {
        const [canReceive, setCanReceive] = useState(false);
        
        return (
          <div>
            <TestField id="field1" order={1} />
            <TestField
              id="field2"
              order={2}
              canReceiveFocus={() => canReceive}
            />
            <TestField id="field3" order={3} />
            <button
              data-testid="toggle-can-receive"
              onClick={() => setCanReceive(!canReceive)}
            >
              Toggle Can Receive
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestForm />
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');
      const field3 = screen.getByTestId('field3');

      // Focus first field
      fireEvent.focus(field1);

      // Try to advance (should skip field2 and go to field3)
      fireEvent.keyDown(field1, { key: 'Tab' });
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(() => {
        expect(document.activeElement).toBe(field3);
        expect(document.activeElement).not.toBe(field2);
      });
    });
  });

  describe('Field-to-Field Navigation', () => {
    it('should navigate through multiple fields in correct order', async () => {
      render(
        <TestWrapper>
          <div>
            <TestField id="field1" order={1} />
            <TestField id="field2" order={2} />
            <TestField id="field3" order={3} />
            <TestField id="field4" order={4} />
          </div>
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field2 = screen.getByTestId('field2');
      const field3 = screen.getByTestId('field3');
      const field4 = screen.getByTestId('field4');

      // Start at field1
      fireEvent.focus(field1);
      expect(document.activeElement).toBe(field1);

      // Navigate forward through all fields
      fireEvent.keyDown(field1, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field2));

      fireEvent.keyDown(field2, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field3));

      fireEvent.keyDown(field3, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field4));

      // Navigate backward
      fireEvent.keyDown(field4, { key: 'Tab', shiftKey: true });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field3));

      fireEvent.keyDown(field3, { key: 'Tab', shiftKey: true });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field2));
    });

    it('should handle wrapping navigation correctly', async () => {
      render(
        <TestWrapper>
          <div>
            <TestField id="field1" order={1} />
            <TestField id="field2" order={2} />
            <TestField id="field3" order={3} />
          </div>
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field3 = screen.getByTestId('field3');

      // Navigate from last field should wrap to first
      fireEvent.focus(field3);
      fireEvent.keyDown(field3, { key: 'Tab' });
      
      act(() => triggerRAF());
      
      await waitFor(() => {
        expect(document.activeElement).toBe(field1);
      });

      // Navigate backward from first field should wrap to last
      fireEvent.keyDown(field1, { key: 'Tab', shiftKey: true });
      
      act(() => triggerRAF());
      
      await waitFor(() => {
        expect(document.activeElement).toBe(field3);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing elements gracefully', async () => {
      const TestComponent = () => {
        const { focusField } = useFocusManager();
        
        return (
          <div>
            <TestField id="field1" order={1} />
            <button
              data-testid="focus-missing"
              onClick={() => focusField('missing-field')}
            >
              Focus Missing Field
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('focus-missing');
      const field1 = screen.getByTestId('field1');

      // Focus field1 first
      fireEvent.focus(field1);
      expect(document.activeElement).toBe(field1);

      // Try to focus missing field (should not crash and maintain current focus)
      fireEvent.click(button);
      
      act(() => triggerRAF());

      // Focus should remain on field1
      await waitFor(() => {
        expect(document.activeElement).toBe(field1);
      });
    });

    it('should handle rapid navigation without race conditions', async () => {
      render(
        <TestWrapper>
          <div>
            <TestField id="field1" order={1} />
            <TestField id="field2" order={2} />
            <TestField id="field3" order={3} />
          </div>
        </TestWrapper>
      );

      const field1 = screen.getByTestId('field1');
      const field3 = screen.getByTestId('field3');

      // Focus field1
      fireEvent.focus(field1);

      // Rapidly press Tab multiple times
      fireEvent.keyDown(field1, { key: 'Tab' });
      fireEvent.keyDown(field1, { key: 'Tab' });
      fireEvent.keyDown(field1, { key: 'Tab' });
      
      // Trigger all RAF callbacks
      act(() => {
        triggerRAF();
        triggerRAF();
        triggerRAF();
      });

      // Should end up at field3 (proper sequential navigation)
      await waitFor(() => {
        expect(document.activeElement).toBe(field3);
      });
    });
  });
});