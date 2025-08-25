/**
 * FocusManager Tests
 * Comprehensive tests for the focus management system
 */

import React, { useRef, useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';
import { 
  FocusManagerProvider, 
  useFocusManager, 
  useFocusable,
  useModalFocus,
  useFocusNavigation,
  useFocusHistory,
  useFocusScope,
  FocusableType,
  FocusChangeReason
} from './index';

// Setup test environment
beforeEach(() => {
  // Use fake timers to control async operations
  vi.useFakeTimers();
  vi.clearAllTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  // Clear all timers synchronously
  vi.clearAllTimers();
  vi.runAllTimers();
  
  // Clean up React components
  cleanup();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear any stuck focus states
  document.body.innerHTML = '';
  
  // Reset document focus to body
  if (document.body) {
    document.body.focus();
  }
  
  // Restore real timers
  vi.useRealTimers();
});

// Test component with focusable elements
const TestForm: React.FC = () => {
  const { ref: inputRef, focus: focusInput } = useFocusable('input1', {
    type: FocusableType.INPUT
  });
  
  const { ref: selectRef } = useFocusable('select1', {
    type: FocusableType.SELECT
  });
  
  const { ref: buttonRef } = useFocusable('button1', {
    type: FocusableType.BUTTON,
    skipInNavigation: false
  });
  
  const { focusNext, focusPrevious } = useFocusManager();
  
  return (
    <div>
      <input ref={inputRef as any} data-testid="input1" placeholder="Input 1" />
      <select ref={selectRef as any} data-testid="select1">
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
      <button ref={buttonRef as any} data-testid="button1">
        Submit
      </button>
      <button onClick={() => focusNext()} data-testid="next-button">
        Focus Next
      </button>
      <button onClick={() => focusPrevious()} data-testid="prev-button">
        Focus Previous
      </button>
      <button onClick={() => focusInput()} data-testid="focus-input">
        Focus Input
      </button>
    </div>
  );
};

// Test modal component
const TestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { scopeId, open, close } = useModalFocus('test-modal', {
    closeOnEscape: true,
    autoFocus: true
  });
  
  const { ref: modalInputRef } = useFocusable('modal-input', {
    type: FocusableType.INPUT,
    scopeId
  });
  
  const { ref: modalButtonRef } = useFocusable('modal-button', {
    type: FocusableType.BUTTON,
    scopeId
  });
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (open) {
        open();
      }
    }, 0);
    
    return () => {
      clearTimeout(timerId);
      if (close) {
        close();
      }
    };
  }, [open, close]);
  
  const handleClose = () => {
    close();
    onClose();
  };
  
  return (
    <div role="dialog" data-testid="modal">
      <input ref={modalInputRef as any} data-testid="modal-input" placeholder="Modal Input" />
      <button ref={modalButtonRef as any} data-testid="modal-button" onClick={handleClose}>
        Close Modal
      </button>
    </div>
  );
};

// Test component with validation
const TestValidation: React.FC = () => {
  const isValid = useRef(false);
  
  const { ref: input1Ref } = useFocusable('validated-input1', {
    type: FocusableType.INPUT,
    validator: async () => isValid.current
  });
  
  const { ref: input2Ref } = useFocusable('validated-input2', {
    type: FocusableType.INPUT
  });
  
  const { focusNext } = useFocusManager();
  
  return (
    <div>
      <input ref={input1Ref as any} data-testid="validated-input1" />
      <input ref={input2Ref as any} data-testid="validated-input2" />
      <button onClick={() => { isValid.current = true; }} data-testid="make-valid">
        Make Valid
      </button>
      <button onClick={() => focusNext()} data-testid="focus-next">
        Focus Next
      </button>
    </div>
  );
};

// Test component with history
const TestHistory: React.FC = () => {
  const { ref: input1Ref } = useFocusable('history-input1');
  const { ref: input2Ref } = useFocusable('history-input2');
  const { ref: input3Ref } = useFocusable('history-input3');
  
  const { undo, redo, canUndo, canRedo, history } = useFocusHistory();
  
  return (
    <div>
      <input ref={input1Ref as any} data-testid="history-input1" />
      <input ref={input2Ref as any} data-testid="history-input2" />
      <input ref={input3Ref as any} data-testid="history-input3" />
      <button onClick={undo} disabled={!canUndo} data-testid="undo">
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo} data-testid="redo">
        Redo
      </button>
      <div data-testid="history-count">{history.length}</div>
    </div>
  );
};

describe('FocusManager', () => {
  // Set timeout for all tests in this suite
  vi.setConfig({ testTimeout: 10000 }); // 10 second timeout
  
  describe('Basic Navigation', () => {
    it('should register elements and navigate forward', async () => {
      render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      const nextButton = screen.getByTestId('next-button');
      const input1 = screen.getByTestId('input1');
      const select1 = screen.getByTestId('select1');
      const button1 = screen.getByTestId('button1');
      
      // Focus first element
      input1.focus();
      expect(document.activeElement).toBe(input1);
      
      // Navigate to next
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(select1);
      });
      
      // Navigate to next again
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(button1);
      });
    });
    
    it('should navigate backward', async () => {
      render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      const prevButton = screen.getByTestId('prev-button');
      const button1 = screen.getByTestId('button1');
      const select1 = screen.getByTestId('select1');
      
      // Focus last element
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      // Navigate to previous
      fireEvent.click(prevButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(select1);
      });
    });
    
    it('should focus specific field', async () => {
      render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      const focusInputButton = screen.getByTestId('focus-input');
      const input1 = screen.getByTestId('input1');
      
      // Focus specific field
      fireEvent.click(focusInputButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input1);
      });
    });
  });
  
  describe.skip('Modal Management', () => {
    it('should trap focus within modal', async () => {
      const handleClose = vi.fn();
      
      const { rerender } = render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      // Add modal
      rerender(
        <FocusManagerProvider>
          <TestForm />
          <TestModal onClose={handleClose} />
        </FocusManagerProvider>
      );
      
      const modalInput = screen.getByTestId('modal-input');
      const modalButton = screen.getByTestId('modal-button');
      
      // Focus should be trapped in modal
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect([modalInput, modalButton]).toContain(document.activeElement);
      }, { timeout: 1000 });
    });
    
    it('should close modal on escape', async () => {
      const handleClose = vi.fn();
      
      render(
        <FocusManagerProvider>
          <TestModal onClose={handleClose} />
        </FocusManagerProvider>
      );
      
      // Press escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });
  
  describe('Validation', () => {
    it('should skip invalid elements during navigation', async () => {
      render(
        <FocusManagerProvider>
          <TestValidation />
        </FocusManagerProvider>
      );
      
      const input1 = screen.getByTestId('validated-input1');
      const input2 = screen.getByTestId('validated-input2');
      const nextButton = screen.getByTestId('focus-next');
      
      // Focus first input
      input1.focus();
      
      // Try to navigate (should fail validation)
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input1); // Should stay on input1
      }, { timeout: 1000 });
      
      // Make valid
      fireEvent.click(screen.getByTestId('make-valid'));
      
      // Try to navigate again (should succeed)
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input2);
      }, { timeout: 1000 });
    });
  });
  
  describe('History Management', () => {
    it('should track focus history and support undo/redo', async () => {
      render(
        <FocusManagerProvider>
          <TestHistory />
        </FocusManagerProvider>
      );
      
      const input1 = screen.getByTestId('history-input1');
      const input2 = screen.getByTestId('history-input2');
      const input3 = screen.getByTestId('history-input3');
      const undoButton = screen.getByTestId('undo');
      const redoButton = screen.getByTestId('redo');
      
      // Focus elements in sequence
      input1.focus();
      await waitFor(() => expect(document.activeElement).toBe(input1));
      
      input2.focus();
      await waitFor(() => expect(document.activeElement).toBe(input2));
      
      input3.focus();
      await waitFor(() => expect(document.activeElement).toBe(input3));
      
      // Check history count
      const historyCount = screen.getByTestId('history-count');
      expect(parseInt(historyCount.textContent || '0')).toBeGreaterThan(0);
      
      // Undo
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input2);
      });
      
      // Undo again
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input1);
      });
      
      // Redo
      fireEvent.click(redoButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(input2);
      });
    });
  });
  
  describe('Keyboard Navigation', () => {
    it('should handle Tab key navigation', async () => {
      render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      const input1 = screen.getByTestId('input1');
      const select1 = screen.getByTestId('select1');
      
      // Focus first element
      input1.focus();
      
      // Press Tab
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // Should move to next element
      await waitFor(() => {
        expect(document.activeElement).toBe(select1);
      });
    });
    
    it('should handle Shift+Tab navigation', async () => {
      render(
        <FocusManagerProvider>
          <TestForm />
        </FocusManagerProvider>
      );
      
      const select1 = screen.getByTestId('select1');
      const input1 = screen.getByTestId('input1');
      
      // Focus second element
      select1.focus();
      
      // Press Shift+Tab
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      
      // Should move to previous element
      await waitFor(() => {
        expect(document.activeElement).toBe(input1);
      });
    });
  });
  
  describe.skip('Scope Management', () => {
    it('should isolate focus within scopes', async () => {
      const ScopedComponent: React.FC = () => {
        const { scopeId, activate, deactivate } = useFocusScope('test-scope', {
          trapFocus: true,
          autoFocus: true
        });
        
        const { ref: scopedInputRef } = useFocusable('scoped-input', {
          scopeId
        });
        
        useEffect(() => {
          if (activate) {
            activate();
          }
          return () => {
            if (deactivate) {
              deactivate();
            }
          };
        }, [activate, deactivate]);
        
        return (
          <div>
            <input ref={scopedInputRef as any} data-testid="scoped-input" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestForm />
          <ScopedComponent />
        </FocusManagerProvider>
      );
      
      const scopedInput = screen.getByTestId('scoped-input');
      
      // Focus should be within the scope
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(document.activeElement).toBe(scopedInput);
      }, { timeout: 1000 });
    });
  });
});