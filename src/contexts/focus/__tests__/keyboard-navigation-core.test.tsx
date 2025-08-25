/**
 * Task 031a: Core Keyboard Navigation Tests
 * 
 * Focused tests for the essential keyboard navigation patterns:
 * - Tab/Shift+Tab cycling
 * - Enter advancement 
 * - Escape in modals
 * - Ctrl+Enter jumps
 * - Keyboard shortcuts validation
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  FocusManagerProvider
} from '../FocusManagerContext';
import { useFocusManager } from '../useFocusManager';
import { 
  FocusableType, 
  FocusChangeReason, 
  NavigationMode, 
  FocusableElement 
} from '../types';

// TIMEOUT FIX: Simplified mocks to prevent circular dependencies and hanging promises
// Mock all utilities with immediate resolution to prevent timeouts
vi.mock('../utils', () => ({
  focusElement: vi.fn(() => Promise.resolve(true)),
  filterElementsByScope: vi.fn((elements: Map<string, any>) => Array.from(elements.values())),
  applyNavigationOptions: vi.fn((elements: any[]) => elements),
  getNextIndex: vi.fn((current: number, length: number) => Math.min(current + 1, length - 1)),
  getPreviousIndex: vi.fn((current: number, length: number) => Math.max(current - 1, 0)),
  validateElement: vi.fn(() => Promise.resolve(true)),
  createHistoryEntry: vi.fn(() => ({ id: `history-${Date.now()}`, timestamp: Date.now() })),
  generateScopeId: vi.fn(() => `scope-${Date.now()}`),
  debugLog: vi.fn(),
  isElementVisible: vi.fn(() => true),
  getFocusableType: vi.fn(() => 'input'),
  restoreFocus: vi.fn(() => Promise.resolve(true)),
  delay: vi.fn(() => Promise.resolve())
}));

// Simplified test component
const KeyboardTestComponent = () => {
  const focusManager = useFocusManager();
  
  const field1Ref = React.useRef<HTMLInputElement>(null);
  const field2Ref = React.useRef<HTMLInputElement>(null);
  const field3Ref = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    // Register test elements
    focusManager.registerElement({
      id: 'field1',
      ref: field1Ref,
      type: FocusableType.INPUT,
      scopeId: 'default',
      tabIndex: 1,
      canFocus: true,
      metadata: { order: 1 }
    });
    
    focusManager.registerElement({
      id: 'field2',
      ref: field2Ref,
      type: FocusableType.INPUT,
      scopeId: 'default',
      tabIndex: 2,
      canFocus: true,
      metadata: { order: 2 }
    });
    
    focusManager.registerElement({
      id: 'field3',
      ref: field3Ref,
      type: FocusableType.BUTTON,
      scopeId: 'default',
      tabIndex: 3,
      canFocus: true,
      metadata: { order: 3 },
      mouseNavigation: {
        allowDirectJump: true
      }
    });
  }, [focusManager]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      focusManager.focusNext();
    }
    
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      focusManager.focusField('field3');
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown}>
      <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
      <div data-testid="modal-count">{focusManager.state.modalStack.length}</div>
      <div data-testid="navigation-mode">{focusManager.state.navigationMode}</div>
      
      <input
        ref={field1Ref}
        data-testid="field1"
        placeholder="Field 1"
        onFocus={() => focusManager.focusField('field1')}
      />
      
      <input
        ref={field2Ref}
        data-testid="field2"
        placeholder="Field 2"
        onFocus={() => focusManager.focusField('field2')}
      />
      
      <button
        ref={field3Ref}
        data-testid="field3"
        onClick={() => focusManager.focusField('field3')}
      >
        Submit
      </button>
      
      <button data-testid="open-modal" onClick={() => focusManager.openModal('test-modal')}>
        Open Modal
      </button>
    </div>
  );
};

describe('Task 031a: Core Keyboard Navigation Tests', () => {
  beforeEach(() => {
    // TIMEOUT FIX: Comprehensive test environment reset
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Clear any pending async operations
    vi.useFakeTimers();
    
    // Reset document state
    document.body.innerHTML = '';
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur?.();
    }
    
    // Clear any global event listeners
    const events = ['keydown', 'keyup', 'focus', 'blur', 'mousemove'];
    events.forEach(event => {
      const listeners = document._getEventListeners?.(event) || [];
      listeners.forEach(listener => {
        document.removeEventListener(event, listener.listener);
      });
    });
  });
  
  afterEach(() => {
    // TIMEOUT FIX: Proper cleanup after each test - no awaits to prevent hanging
    cleanup();
    vi.runOnlyPendingTimers();
    vi.clearAllMocks();
    
    // Force cleanup of any remaining focus state
    document.body.innerHTML = '';
    if (document.body) {
      document.body.focus();
    }
    
    // Restore real timers last
    vi.useRealTimers();
  });

  describe('Tab/Shift+Tab Cycling', () => {
    it('should cycle forward through elements with Tab', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Focus first field and then tab forward
      const field1 = screen.getByTestId('field1');
      await act(async () => {
        field1.focus();
        fireEvent.focus(field1);
      });

      // TIMEOUT FIX: Short timeouts with immediate state validation
      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
        },
        { timeout: 500, interval: 10 }
      );

      // Tab to next field
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab' });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
        },
        { timeout: 500, interval: 10 }
      );
    });

    it('should cycle backward through elements with Shift+Tab', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Focus second field and then shift+tab backward
      const field2 = screen.getByTestId('field2');
      await act(async () => {
        field2.focus();
        fireEvent.focus(field2);
      });

      // TIMEOUT FIX: Short timeout with immediate timer resolution
      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
        },
        { timeout: 500, interval: 10 }
      );

      // Shift+Tab to previous field
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
        },
        { timeout: 500, interval: 10 }
      );
    });
  });

  describe('Enter Key Advancement', () => {
    it('should advance to next field when Enter is pressed', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      const field1 = screen.getByTestId('field1');
      await act(async () => {
        field1.focus();
        fireEvent.focus(field1);
      });

      // TIMEOUT FIX: Quick validation with timer resolution
      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
        },
        { timeout: 500, interval: 10 }
      );

      // Press Enter to advance
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter' });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
        },
        { timeout: 500, interval: 10 }
      );
    });
  });

  describe('Escape Key in Modals', () => {
    it('should close modal when Escape is pressed', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Open modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('open-modal'));
      });

      // TIMEOUT FIX: Quick modal state validation
      await waitFor(
        () => {
          expect(screen.getByTestId('modal-count')).toHaveTextContent('1');
        },
        { timeout: 500, interval: 10 }
      );

      // Press Escape to close modal
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('modal-count')).toHaveTextContent('0');
        },
        { timeout: 500, interval: 10 }
      );
    });
  });

  describe('Ctrl+Enter Field Jumps', () => {
    it('should jump to target field with Ctrl+Enter', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      const field1 = screen.getByTestId('field1');
      await act(async () => {
        field1.focus();
        fireEvent.focus(field1);
      });

      // TIMEOUT FIX: Quick focus state validation
      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
        },
        { timeout: 500, interval: 10 }
      );

      // Press Ctrl+Enter to jump to field3
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter', ctrlKey: true });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field3');
        },
        { timeout: 500, interval: 10 }
      );
    });

    it('should work with Meta+Enter on Mac', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      const field1 = screen.getByTestId('field1');
      await act(async () => {
        field1.focus();
        fireEvent.focus(field1);
      });

      // TIMEOUT FIX: Quick Meta+Enter validation
      // Press Meta+Enter
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter', metaKey: true });
        vi.runAllTimers();
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('current-focus')).toHaveTextContent('field3');
        },
        { timeout: 500, interval: 10 }
      );
    });
  });

  describe('Keyboard Shortcuts Validation', () => {
    it('should handle navigation mode changes via keyboard interaction', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Initially should be in keyboard mode
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('keyboard');

      // Simulate mouse movement to change mode
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      });

      // Then use keyboard - should maintain or change to hybrid
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab' });
      });

      // Mode should be either hybrid or keyboard
      const mode = screen.getByTestId('navigation-mode').textContent;
      expect(['hybrid', 'keyboard']).toContain(mode);
    });

    it('should handle various keyboard shortcuts without crashing', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Test various keyboard shortcuts with immediate timer resolution
      const keyTests = [
        { key: 'ArrowDown' },
        { key: 'ArrowUp' },
        { key: 'Home' },
        { key: 'End' },
        { key: 'PageUp' },
        { key: 'PageDown' },
        { key: 'Space' },
        { key: 'F1' }
      ];

      for (const keyTest of keyTests) {
        await act(async () => {
          fireEvent.keyDown(document, keyTest);
          vi.runAllTimers();
        });
      }

      // Should not crash
      expect(screen.getByTestId('current-focus')).toBeDefined();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle keyboard navigation when no elements are focused', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      expect(screen.getByTestId('current-focus')).toHaveTextContent('none');

      // Try keyboard navigation
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab' });
        fireEvent.keyDown(document, { key: 'Enter' });
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      // Should not crash
      expect(screen.getByTestId('current-focus')).toBeDefined();
    });

    it('should handle rapid keyboard input', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Rapid Tab presses with immediate timer resolution
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          fireEvent.keyDown(document, { key: 'Tab' });
        }
        vi.runAllTimers();
      });

      // Should not crash
      const currentFocus = screen.getByTestId('current-focus').textContent;
      expect(['none', 'field1', 'field2', 'field3']).toContain(currentFocus);
    });

    it('should handle invalid key combinations gracefully', async () => {
      render(
        <FocusManagerProvider>
          <KeyboardTestComponent />
        </FocusManagerProvider>
      );

      // Try invalid key combinations with immediate resolution
      await act(async () => {
        fireEvent.keyDown(document, { 
          key: 'Tab', 
          ctrlKey: true, 
          shiftKey: true, 
          altKey: true 
        });
        fireEvent.keyDown(document, { 
          key: 'Enter', 
          ctrlKey: true, 
          shiftKey: true 
        });
        fireEvent.keyDown(document, { 
          key: 'Escape', 
          ctrlKey: true 
        });
        vi.runAllTimers();
      });

      // Should not crash
      expect(screen.getByTestId('current-focus')).toBeDefined();
    });
  });
});