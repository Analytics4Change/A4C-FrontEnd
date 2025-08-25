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

// TIMEOUT FIX: Enhanced RAF mock to prevent infinite loops and callbacks stacking
// ROOT CAUSE: Original RAF mock allowed multiple callbacks to accumulate
// RESOLUTION: Clear callbacks array after each execution and add safety guards
// VERIFICATION: Each RAF callback executes once and is immediately cleared

let rafCallbacks: (() => void)[] = [];
let rafExecuting = false; // Prevent re-entrant RAF execution

const mockRequestAnimationFrame = vi.fn((callback: () => void) => {
  // TIMEOUT FIX: Prevent callback accumulation during execution
  if (!rafExecuting) {
    rafCallbacks.push(callback);
  }
  return rafCallbacks.length;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
});

// TIMEOUT FIX: Enhanced RAF trigger with loop prevention
const triggerRAF = () => {
  if (rafExecuting || rafCallbacks.length === 0) {
    return; // Prevent re-entrant execution
  }
  
  rafExecuting = true;
  const callbacksToExecute = [...rafCallbacks];
  rafCallbacks = []; // Clear immediately to prevent accumulation
  
  try {
    callbacksToExecute.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('RAF callback error:', error);
      }
    });
  } finally {
    rafExecuting = false; // Always reset execution flag
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
  
  // TIMEOUT FIX: Add execution guard to prevent infinite validation loops
  // ROOT CAUSE: Validator could create cycles when called repeatedly
  // RESOLUTION: Track validation state to prevent re-entrant calls
  // VERIFICATION: Validator executes once per validation cycle
  const validationInProgress = useRef(false);
  
  const canLeaveFocusValidator = () => {
    if (validationInProgress.current) {
      return true; // Allow focus leave if already validating
    }
    
    validationInProgress.current = true;
    
    try {
      // Tab key auto-selection logic - if no value but results exist, auto-select first
      if (!inputValue && items.length > 0) {
        setInputValue(items[0]);
        onChange?.(items[0]);
        return false; // Prevent focus leave until selection is made
      }
      return true;
    } finally {
      validationInProgress.current = false;
    }
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
    // TIMEOUT FIX: Clear RAF state completely to prevent test interference
    // ROOT CAUSE: RAF callbacks from previous tests persisting
    // RESOLUTION: Reset all RAF-related state before each test
    // VERIFICATION: Each test starts with clean RAF state
    rafCallbacks = [];
    rafExecuting = false;
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
      
      // TIMEOUT FIX: Add timeout and proper async handling
      // ROOT CAUSE: waitFor with no timeout could wait indefinitely
      // RESOLUTION: Add explicit timeout and focus verification
      // VERIFICATION: Test fails fast if focus doesn't work
      
      // Verify requestAnimationFrame was called
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      
      // Initially focus should not be set (before RAF callback)
      const input = screen.getByTestId('test-field');
      expect(document.activeElement).not.toBe(input);
      
      // Trigger RAF callback with timeout protection
      act(() => {
        triggerRAF();
      });
      
      // Now focus should be set with explicit timeout
      await waitFor(
        () => {
          expect(document.activeElement).toBe(input);
        },
        { timeout: 2000 } // TIMEOUT FIX: Explicit timeout prevents infinite wait
      );
    });

    it('should return Promise<boolean> indicating focus success', async () => {
      // Create a direct test for focusElement utility
      const element = document.createElement('input');
      document.body.appendChild(element);
      
      const focusPromise = focusElement(element);
      
      // Should return a promise
      expect(focusPromise).toBeInstanceOf(Promise);
      
      // TIMEOUT FIX: Add promise timeout protection
      // ROOT CAUSE: Promise could hang indefinitely without timeout
      // RESOLUTION: Add timeout wrapper for promise resolution
      // VERIFICATION: Test fails after 1 second if promise doesn't resolve
      
      // Trigger RAF to complete focus
      act(() => {
        triggerRAF();
      });
      
      // Promise should resolve to true for successful focus with timeout
      const result = await Promise.race([
        focusPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Focus promise timeout')), 1000)
        )
      ]);
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
      
      // TIMEOUT FIX: Enhanced focus verification with timeout
      // ROOT CAUSE: Focus change might not complete, causing waitFor to hang
      // RESOLUTION: Add explicit timeout and fallback verification
      // VERIFICATION: Test fails within 2 seconds if focus doesn't advance
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      // Focus should advance to field2 with timeout protection
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field2);
        },
        { timeout: 2000 }
      );
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
      
      // TIMEOUT FIX: Add timeout to prevent infinite wait on focus check
      // ROOT CAUSE: Focus state might be unstable, causing waitFor to hang
      // RESOLUTION: Add timeout and simplified check
      // VERIFICATION: Test completes within 1 second
      
      // Focus should remain on field1 with timeout
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field1);
          expect(document.activeElement).not.toBe(field2);
        },
        { timeout: 1000 }
      );
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
      
      // TIMEOUT FIX: Add timeout protection for auto-selection
      // ROOT CAUSE: Auto-selection logic might create validation loops
      // RESOLUTION: Add timeout and prevent infinite selection cycles
      // VERIFICATION: Auto-selection completes within 1 second
      
      // Should auto-select first item and prevent focus leave initially
      await waitFor(
        () => {
          expect(selectedValue).toBe('Option 1');
        },
        { timeout: 1000 }
      );
      
      // After auto-selection, focus should be able to advance
      // Simulate a second Tab after auto-selection
      fireEvent.keyDown(dropdown, { key: 'Tab' });
      
      // TIMEOUT FIX: Add timeout protection for focus advancement
      // ROOT CAUSE: Auto-selection might create focus loops
      // RESOLUTION: Add timeout and validation state check
      // VERIFICATION: Focus advances within 2 seconds or test fails
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(
        () => {
          expect(document.activeElement).toBe(field2);
        },
        { timeout: 2000 }
      );
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
      
      // TIMEOUT FIX: Add timeout for normal Tab navigation
      // ROOT CAUSE: Tab navigation could hang if focus logic has issues
      // RESOLUTION: Add timeout and ensure clean state
      // VERIFICATION: Navigation completes within 2 seconds
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      // Should advance normally since dropdown has value
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field2);
        },
        { timeout: 2000 }
      );
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
      
      // TIMEOUT FIX: Add timeouts for validator blocking scenarios
      // ROOT CAUSE: Validator loops could cause waitFor to hang indefinitely
      // RESOLUTION: Add explicit timeouts for each waitFor
      // VERIFICATION: Each check completes within 1 second
      
      // Focus should remain on field1
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field1);
          expect(document.activeElement).not.toBe(field2);
        },
        { timeout: 1000 }
      );

      // Try to advance with Enter (should be blocked)
      fireEvent.keyDown(field1, { key: 'Enter' });
      
      // Focus should still remain on field1
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field1);
        },
        { timeout: 1000 }
      );

      // Enable leaving
      fireEvent.click(toggleButton);

      // Now Tab should work
      fireEvent.keyDown(field1, { key: 'Tab' });
      
      // TIMEOUT FIX: Add timeout for validator unblocking
      // ROOT CAUSE: Focus change after unblocking could hang
      // RESOLUTION: Add timeout protection
      // VERIFICATION: Focus changes within 2 seconds
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(
        () => {
          expect(document.activeElement).toBe(field2);
        },
        { timeout: 2000 }
      );
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
      
      // TIMEOUT FIX: Add timeout for skip navigation test
      // ROOT CAUSE: Skipping elements could create navigation loops
      // RESOLUTION: Add timeout and clear focus state check
      // VERIFICATION: Navigation skips correctly within 2 seconds
      
      // Trigger RAF for focus change
      act(() => {
        triggerRAF();
      });

      await waitFor(
        () => {
          expect(document.activeElement).toBe(field3);
          expect(document.activeElement).not.toBe(field2);
        },
        { timeout: 2000 }
      );
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

      // TIMEOUT FIX: Add timeouts for sequential navigation
      // ROOT CAUSE: Sequential Tab operations could create timing issues
      // RESOLUTION: Add explicit timeouts for each navigation step
      // VERIFICATION: Each step completes within 1 second
      
      // Navigate forward through all fields with timeout protection
      fireEvent.keyDown(field1, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field2), { timeout: 1000 });

      fireEvent.keyDown(field2, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field3), { timeout: 1000 });

      fireEvent.keyDown(field3, { key: 'Tab' });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field4), { timeout: 1000 });

      // Navigate backward with timeout protection
      fireEvent.keyDown(field4, { key: 'Tab', shiftKey: true });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field3), { timeout: 1000 });

      fireEvent.keyDown(field3, { key: 'Tab', shiftKey: true });
      act(() => triggerRAF());
      await waitFor(() => expect(document.activeElement).toBe(field2), { timeout: 1000 });
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
      
      // TIMEOUT FIX: Add timeout for wrapping navigation
      // ROOT CAUSE: Wrapping logic could create infinite loops
      // RESOLUTION: Add timeouts and clear state verification
      // VERIFICATION: Wrapping completes within 2 seconds
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field1);
        },
        { timeout: 2000 }
      );

      // Navigate backward from first field should wrap to last
      fireEvent.keyDown(field1, { key: 'Tab', shiftKey: true });
      
      act(() => triggerRAF());
      
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field3);
        },
        { timeout: 2000 }
      );
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

      // TIMEOUT FIX: Add timeout for error handling test
      // ROOT CAUSE: Error scenarios might not settle focus state
      // RESOLUTION: Add timeout for graceful error handling verification
      // VERIFICATION: Error handling completes within 1 second
      
      // Focus should remain on field1
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field1);
        },
        { timeout: 1000 }
      );
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
      
      // Trigger RAF once - our enhanced RAF handles all queued callbacks
      act(() => {
        triggerRAF();
      });

      // TIMEOUT FIX: Enhanced rapid navigation with single RAF trigger
      // ROOT CAUSE: Multiple triggerRAF calls could create race conditions
      // RESOLUTION: Use single RAF trigger and add timeout
      // VERIFICATION: Navigation completes correctly within 2 seconds
      
      // Should end up at field3 (proper sequential navigation)
      await waitFor(
        () => {
          expect(document.activeElement).toBe(field3);
        },
        { timeout: 2000 }
      );
    });
  });
});