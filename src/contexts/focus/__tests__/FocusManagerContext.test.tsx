/**
 * FocusManagerContext Unit Tests
 * Comprehensive tests for Task 001: FocusManagerContext core functionality
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { 
  FocusManagerProvider, 
  FocusManagerContext 
} from '../FocusManagerContext';
import { useFocusManager } from '../useFocusManager';
import { 
  FocusableType, 
  FocusChangeReason, 
  NavigationMode, 
  FocusableElement 
} from '../types';

// Enhanced mocks for utilities based on TASK_017a_REMEDIATION_PLAN.md
vi.mock('../utils', async () => {
  const { mockUtils } = await import('@/test/utils/enhanced-focus-utils-mock');
  return mockUtils;
});

// Test component that uses focus manager
const TestComponent = ({ onStateChange }: { onStateChange?: (state: any) => void }) => {
  const focusManager = useFocusManager();
  const [elements, setElements] = React.useState<string[]>([]);
  
  const field1Ref = React.useRef<HTMLButtonElement>(null);
  const field2Ref = React.useRef<HTMLButtonElement>(null);
  const field3Ref = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange(focusManager.state);
    }
  }, [focusManager.state, onStateChange]);
  
  const registerTestElements = () => {
    const element1: Omit<FocusableElement, 'registeredAt'> = {
      id: 'field1',
      ref: field1Ref,
      type: FocusableType.BUTTON,
      scopeId: 'default',
      tabIndex: 1,
      canFocus: true,
      metadata: { order: 1 }
    };
    
    const element2: Omit<FocusableElement, 'registeredAt'> = {
      id: 'field2',
      ref: field2Ref,
      type: FocusableType.INPUT,
      scopeId: 'default',
      tabIndex: 2,
      canFocus: true,
      metadata: { order: 2, required: true },
      validator: async () => true,
      canReceiveFocus: async () => true,
      canLeaveFocus: async () => true
    };
    
    const element3: Omit<FocusableElement, 'registeredAt'> = {
      id: 'field3',
      ref: field3Ref,
      type: FocusableType.CUSTOM,
      scopeId: 'modal',
      tabIndex: 3,
      canFocus: false,
      metadata: { order: 3 },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Step 3',
        stepDescription: 'Third step'
      }
    };
    
    focusManager.registerElement(element1);
    focusManager.registerElement(element2);
    focusManager.registerElement(element3);
    
    setElements(['field1', 'field2', 'field3']);
  };
  
  const unregisterTestElements = () => {
    focusManager.unregisterElement('field1');
    focusManager.unregisterElement('field2');
    focusManager.unregisterElement('field3');
    setElements([]);
  };
  
  return (
    <div>
      <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
      <div data-testid="navigation-mode">{focusManager.state.navigationMode}</div>
      <div data-testid="elements-count">{focusManager.state.elements.size}</div>
      <div data-testid="scopes-count">{focusManager.state.scopes.length}</div>
      <div data-testid="active-scope">{focusManager.state.activeScopeId}</div>
      <div data-testid="history-count">{focusManager.state.history.length}</div>
      <div data-testid="modal-count">{focusManager.state.modalStack.length}</div>
      <div data-testid="enabled">{focusManager.state.enabled.toString()}</div>
      <div data-testid="debug">{focusManager.state.debug.toString()}</div>
      <div data-testid="mouse-interactions">{focusManager.state.mouseInteractionHistory.length}</div>
      
      <button
        ref={field1Ref}
        data-testid="field1"
        onClick={() => focusManager.focusField('field1')}
      >
        Field 1
      </button>
      
      <button
        ref={field2Ref}
        data-testid="field2"
        onClick={() => focusManager.focusField('field2')}
      >
        Field 2
      </button>
      
      <button
        ref={field3Ref}
        data-testid="field3"
        onClick={() => focusManager.focusField('field3')}
      >
        Field 3
      </button>
      
      <button data-testid="register-elements" onClick={registerTestElements}>
        Register Elements
      </button>
      
      <button data-testid="unregister-elements" onClick={unregisterTestElements}>
        Unregister Elements
      </button>
      
      <button data-testid="focus-next" onClick={() => focusManager.focusNext()}>
        Focus Next
      </button>
      
      <button data-testid="focus-previous" onClick={() => focusManager.focusPrevious()}>
        Focus Previous
      </button>
      
      <button data-testid="focus-first" onClick={() => focusManager.focusFirst()}>
        Focus First
      </button>
      
      <button data-testid="focus-last" onClick={() => focusManager.focusLast()}>
        Focus Last
      </button>
      
      <button data-testid="open-modal" onClick={() => focusManager.openModal('test-modal')}>
        Open Modal
      </button>
      
      <button data-testid="close-modal" onClick={() => focusManager.closeModal()}>
        Close Modal
      </button>
      
      <button data-testid="set-debug" onClick={() => focusManager.setDebug(true)}>
        Enable Debug
      </button>
      
      <button data-testid="set-enabled" onClick={() => focusManager.setEnabled(false)}>
        Disable Manager
      </button>
      
      <button data-testid="clear-history" onClick={() => focusManager.clearHistory()}>
        Clear History
      </button>
      
      <button data-testid="undo-focus" onClick={() => focusManager.undoFocus()}>
        Undo Focus
      </button>
      
      <button data-testid="redo-focus" onClick={() => focusManager.redoFocus()}>
        Redo Focus
      </button>
    </div>
  );
};

describe('FocusManagerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize with default state', () => {
      let capturedState: any;
      
      render(
        <FocusManagerProvider>
          <TestComponent onStateChange={(state) => capturedState = state} />
        </FocusManagerProvider>
      );
      
      expect(capturedState).toMatchObject({
        elements: expect.any(Map),
        scopes: [expect.objectContaining({ id: 'default', type: 'default' })],
        activeScopeId: 'default',
        currentFocusId: undefined,
        history: [],
        historyIndex: -1,
        modalStack: [],
        enabled: true,
        debug: false,
        navigationMode: NavigationMode.KEYBOARD,
        mouseInteractionHistory: [],
        lastMousePosition: { x: 0, y: 0 }
      });
    });

    it('should initialize with custom options', () => {
      let capturedState: any;
      
      render(
        <FocusManagerProvider debug={true} enabled={false} maxHistorySize={100}>
          <TestComponent onStateChange={(state) => capturedState = state} />
        </FocusManagerProvider>
      );
      
      expect(capturedState.debug).toBe(true);
      expect(capturedState.enabled).toBe(false);
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Element Registration', () => {
    it('should register element successfully', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      const registerBtn = screen.getByTestId('register-elements');
      fireEvent.click(registerBtn);
      
      expect(screen.getByTestId('elements-count')).toHaveTextContent('3');
    });

    it('should unregister element successfully', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      const registerBtn = screen.getByTestId('register-elements');
      const unregisterBtn = screen.getByTestId('unregister-elements');
      
      fireEvent.click(registerBtn);
      expect(screen.getByTestId('elements-count')).toHaveTextContent('3');
      
      fireEvent.click(unregisterBtn);
      expect(screen.getByTestId('elements-count')).toHaveTextContent('0');
    });

    it('should update element metadata', () => {
      let focusManager: any;
      
      const TestUpdateComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestUpdateComponent />
        </FocusManagerProvider>
      );
      
      // Register an element
      act(() => {
        focusManager.registerElement({
          id: 'test-field',
          ref: { current: document.createElement('input') },
          type: FocusableType.INPUT,
          scopeId: 'default'
        });
      });
      
      // Update the element
      act(() => {
        focusManager.updateElement('test-field', {
          metadata: { updated: true }
        });
      });
      
      const element = focusManager.state.elements.get('test-field');
      expect(element.metadata).toEqual({ updated: true });
    });

    it('should handle registration with all properties', () => {
      let focusManager: any;
      
      const TestCompleteComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestCompleteComponent />
        </FocusManagerProvider>
      );
      
      const mockValidator = vi.fn(() => true);
      const mockCanReceive = vi.fn(() => true);
      const mockCanLeave = vi.fn(() => true);
      
      act(() => {
        focusManager.registerElement({
          id: 'complete-field',
          ref: { current: document.createElement('input') },
          type: FocusableType.INPUT,
          scopeId: 'default',
          validator: mockValidator,
          canReceiveFocus: mockCanReceive,
          canLeaveFocus: mockCanLeave,
          skipInNavigation: true,
          tabIndex: 5,
          canFocus: false,
          metadata: { test: true },
          parentId: 'parent',
          mouseNavigation: {
            allowDirectJump: true
          },
          visualIndicator: {
            showInStepper: true,
            stepLabel: 'Test Step'
          }
        });
      });
      
      const element = focusManager.state.elements.get('complete-field');
      expect(element).toMatchObject({
        id: 'complete-field',
        type: FocusableType.INPUT,
        scopeId: 'default',
        validator: mockValidator,
        canReceiveFocus: mockCanReceive,
        canLeaveFocus: mockCanLeave,
        skipInNavigation: true,
        tabIndex: 5,
        canFocus: false,
        metadata: { test: true },
        parentId: 'parent',
        registeredAt: expect.any(Number)
      });
    });
  });

  describe('Scope Management', () => {
    it('should push and pop scopes correctly', () => {
      let focusManager: any;
      
      const TestScopeComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestScopeComponent />
        </FocusManagerProvider>
      );
      
      expect(focusManager.state.scopes).toHaveLength(1);
      expect(focusManager.state.activeScopeId).toBe('default');
      
      // Push a modal scope
      act(() => {
        focusManager.pushScope({
          id: 'modal-scope',
          type: 'modal',
          trapFocus: true,
          autoFocus: false
        });
      });
      
      expect(focusManager.state.scopes).toHaveLength(2);
      expect(focusManager.state.activeScopeId).toBe('modal-scope');
      
      // Pop the scope
      act(() => {
        focusManager.popScope();
      });
      
      expect(focusManager.state.scopes).toHaveLength(1);
      expect(focusManager.state.activeScopeId).toBe('default');
    });

    it('should not pop default scope', () => {
      let focusManager: any;
      
      const TestScopeComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestScopeComponent />
        </FocusManagerProvider>
      );
      
      // Try to pop default scope
      act(() => {
        focusManager.popScope();
      });
      
      expect(focusManager.state.scopes).toHaveLength(1);
      expect(focusManager.state.activeScopeId).toBe('default');
    });

    it('should get current scope', () => {
      let focusManager: any;
      
      const TestScopeComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestScopeComponent />
        </FocusManagerProvider>
      );
      
      const currentScope = focusManager.getCurrentScope();
      expect(currentScope).toMatchObject({
        id: 'default',
        type: 'default'
      });
    });

    it('should NOT auto-focus even when autoFocus is true (architectural requirement)', async () => {
      let focusManager: any;
      
      const TestAutoFocusComponent = () => {
        focusManager = useFocusManager();
        return <input ref={React.useRef()} data-testid="auto-focus-input" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestAutoFocusComponent />
        </FocusManagerProvider>
      );
      
      // Register an element first
      act(() => {
        focusManager.registerElement({
          id: 'auto-focus-field',
          ref: { current: screen.getByTestId('auto-focus-input') },
          type: FocusableType.INPUT,
          scopeId: 'auto-scope'
        });
      });
      
      // Push scope with auto-focus (which should be ignored per architecture)
      act(() => {
        focusManager.pushScope({
          id: 'auto-scope',
          type: 'modal',
          trapFocus: true,
          autoFocus: true // This should be ignored - NO auto-focus per architecture
        });
      });
      
      // Verify NO auto-focus occurs - focus remains unset
      // This is the correct behavior per architectural requirements
      expect(focusManager.state.currentFocusId).toBeUndefined();
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('Focus Navigation', () => {
    beforeEach(() => {
      // Reset mocks before each navigation test
      vi.clearAllMocks();
    });

    it('should focus specific field', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      
      const field1 = screen.getByTestId('field1');
      fireEvent.click(field1);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
      });
    });

    it('should focus next element', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      fireEvent.click(screen.getByTestId('focus-next'));
      
      // Should focus first available element
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
      });
      
      fireEvent.click(screen.getByTestId('focus-next'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
      });
    });

    it('should focus previous element', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      
      // Start at field2
      fireEvent.click(screen.getByTestId('field2'));
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
      });
      
      fireEvent.click(screen.getByTestId('focus-previous'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
      });
    });

    it('should focus first element', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      fireEvent.click(screen.getByTestId('focus-first'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field1');
      });
    });

    it('should focus last element', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      fireEvent.click(screen.getByTestId('focus-last'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('field2');
      });
    });

    it('should handle disabled state', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      fireEvent.click(screen.getByTestId('set-enabled'));
      
      expect(screen.getByTestId('enabled')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('focus-next'));
      
      // Should not change focus when disabled
      expect(screen.getByTestId('current-focus')).toHaveTextContent('none');
    });

    it('should handle navigation with no elements', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('focus-next'));
      
      // Should not crash and focus should remain none
      expect(screen.getByTestId('current-focus')).toHaveTextContent('none');
    });

    it('should handle element without ref', async () => {
      let focusManager: any;
      
      const TestNoRefComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestNoRefComponent />
        </FocusManagerProvider>
      );
      
      // Register element without ref
      act(() => {
        focusManager.registerElement({
          id: 'no-ref-field',
          ref: { current: null },
          type: FocusableType.INPUT,
          scopeId: 'default'
        });
      });
      
      const result = await act(async () => {
        return focusManager.focusField('no-ref-field');
      });
      
      expect(result).toBe(false);
    });
  });

  describe('Modal Management', () => {
    it('should open and close modal correctly', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('open-modal'));
      
      expect(screen.getByTestId('modal-count')).toHaveTextContent('1');
      expect(screen.getByTestId('scopes-count')).toHaveTextContent('2');
      
      fireEvent.click(screen.getByTestId('close-modal'));
      
      expect(screen.getByTestId('modal-count')).toHaveTextContent('0');
      expect(screen.getByTestId('scopes-count')).toHaveTextContent('1');
    });

    it('should track modal open state', () => {
      let focusManager: any;
      
      const TestModalComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestModalComponent />
        </FocusManagerProvider>
      );
      
      expect(focusManager.isModalOpen()).toBe(false);
      
      act(() => {
        focusManager.openModal('test-modal');
      });
      
      expect(focusManager.isModalOpen()).toBe(true);
      
      act(() => {
        focusManager.closeModal();
      });
      
      expect(focusManager.isModalOpen()).toBe(false);
    });

    it('should handle close modal when no modal open', () => {
      let focusManager: any;
      
      const TestModalComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestModalComponent />
        </FocusManagerProvider>
      );
      
      // Should not crash when no modal is open
      act(() => {
        focusManager.closeModal();
      });
      
      expect(focusManager.isModalOpen()).toBe(false);
    });

    it('should restore focus when modal closes', async () => {
      let focusManager: any;
      
      const TestModalFocusComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'modal-trigger',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="modal-trigger" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestModalFocusComponent />
        </FocusManagerProvider>
      );
      
      // Wait for element registration first
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBe(1);
      });

      // Focus the trigger field first
      await act(async () => {
        const success = await focusManager.focusField('modal-trigger');
        expect(success).toBe(true);
      });
      
      expect(focusManager.state.currentFocusId).toBe('modal-trigger');
      
      // Open modal with explicit focus restoration
      await act(async () => {
        focusManager.openModal('test-modal', {
          restoreFocusTo: 'modal-trigger'
        });
      });
      
      // Close modal
      await act(async () => {
        focusManager.closeModal();
      });
      
      // Focus should be restored after delay  
      await waitFor(() => {
        expect(focusManager.state.currentFocusId).toBe('modal-trigger');
      }, { timeout: 200 });
    });
  });

  describe('History Management', () => {
    it('should track focus history', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      
      fireEvent.click(screen.getByTestId('field1'));
      await waitFor(() => {
        expect(screen.getByTestId('history-count')).toHaveTextContent('1');
      });
      
      fireEvent.click(screen.getByTestId('field2'));
      await waitFor(() => {
        expect(screen.getByTestId('history-count')).toHaveTextContent('2');
      });
    });

    it('should clear history', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('register-elements'));
      fireEvent.click(screen.getByTestId('field1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('history-count')).toHaveTextContent('1');
      });
      
      fireEvent.click(screen.getByTestId('clear-history'));
      
      expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    });

    it('should undo focus changes', async () => {
      let focusManager: any;
      
      const TestUndoComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'undo-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
          
          focusManager.registerElement({
            id: 'undo-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="undo-field1" />
            <input ref={field2Ref} data-testid="undo-field2" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestUndoComponent />
        </FocusManagerProvider>
      );
      
      // Focus field1, then field2 - ensuring proper async handling
      await act(async () => {
        await focusManager.focusField('undo-field1');
      });
      
      await act(async () => {
        await focusManager.focusField('undo-field2');
      });
      
      expect(focusManager.state.currentFocusId).toBe('undo-field2');
      
      // Undo should return to field1 - properly wrapped in act
      await act(async () => {
        const undoResult = await focusManager.undoFocus();
        expect(undoResult).toBe(true);
      });
      
      expect(focusManager.state.currentFocusId).toBe('undo-field1');
    });

    it('should redo focus changes', async () => {
      let focusManager: any;
      
      const TestRedoComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'redo-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
          
          focusManager.registerElement({
            id: 'redo-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="redo-field1" />
            <input ref={field2Ref} data-testid="redo-field2" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestRedoComponent />
        </FocusManagerProvider>
      );
      
      // Focus field1, then field2 - ensuring proper async handling
      await act(async () => {
        await focusManager.focusField('redo-field1');
      });
      
      await act(async () => {
        await focusManager.focusField('redo-field2');
      });
      
      // Undo to field1 - wrapped in act
      await act(async () => {
        await focusManager.undoFocus();
      });
      expect(focusManager.state.currentFocusId).toBe('redo-field1');
      
      // Redo should return to field2 - wrapped in act
      await act(async () => {
        const redoResult = await focusManager.redoFocus();
        expect(redoResult).toBe(true);
      });
      expect(focusManager.state.currentFocusId).toBe('redo-field2');
    });

    it('should handle undo when no history', async () => {
      let focusManager: any;
      
      const TestNoHistoryComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestNoHistoryComponent />
        </FocusManagerProvider>
      );
      
      const result = await focusManager.undoFocus();
      expect(result).toBe(false);
    });

    it('should handle redo when at end of history', async () => {
      let focusManager: any;
      
      const TestNoRedoComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestNoRedoComponent />
        </FocusManagerProvider>
      );
      
      const result = await focusManager.redoFocus();
      expect(result).toBe(false);
    });

    it('should get history entries', async () => {
      let focusManager: any;
      
      const TestHistoryComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'history-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="history-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestHistoryComponent />
        </FocusManagerProvider>
      );
      
      // Wait for element registration
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBe(1);
      });
      
      // Focus the field and wait for the operation to complete
      await act(async () => {
        const success = await focusManager.focusField('history-field');
        expect(success).toBe(true);
      });
      
      // Wait for history to be updated
      await waitFor(() => {
        const history = focusManager.getHistory();
        expect(history).toHaveLength(1);
      });
      
      const history = focusManager.getHistory();
      expect(history[0]).toMatchObject({
        elementId: 'history-field',
        scopeId: 'default',
        reason: FocusChangeReason.PROGRAMMATIC
      });
    });

    it('should limit history size', async () => {
      let focusManager: any;
      
      const TestHistoryLimitComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'limit-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="limit-field" />;
      };
      
      render(
        <FocusManagerProvider maxHistorySize={2}>
          <TestHistoryLimitComponent />
        </FocusManagerProvider>
      );
      
      // Wait for element registration
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBe(1);
      });
      
      // Add more entries than the limit - each needs to be properly awaited
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          const success = await focusManager.focusField('limit-field');
          expect(success).toBe(true);
        });
        
        // Add a small delay to ensure history processing
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
      }
      
      // Wait for history to be properly limited
      await waitFor(() => {
        const history = focusManager.getHistory();
        expect(history.length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Navigation Mode Management', () => {
    it('should set and get navigation mode', () => {
      let focusManager: any;
      
      const TestNavigationComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestNavigationComponent />
        </FocusManagerProvider>
      );
      
      expect(focusManager.getNavigationMode()).toBe(NavigationMode.KEYBOARD);
      
      act(() => {
        focusManager.setNavigationMode(NavigationMode.MOUSE);
      });
      
      expect(focusManager.getNavigationMode()).toBe(NavigationMode.MOUSE);
    });

    it('should detect mode changes via mouse movement', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('keyboard');
      
      // Simulate mouse movement
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
      });
    });

    it('should detect mode changes via keyboard interaction', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      // Start by setting mouse mode
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
      });
      
      // Simulate keyboard interaction
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // Should remain in hybrid mode
      expect(screen.getByTestId('navigation-mode')).toHaveTextContent('hybrid');
    });
  });

  describe('Mouse Navigation', () => {
    it('should handle mouse navigation correctly', async () => {
      let focusManager: any;
      
      const TestMouseNavComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'mouse-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            mouseNavigation: {
              allowDirectJump: true
            }
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="mouse-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestMouseNavComponent />
        </FocusManagerProvider>
      );
      
      const mockEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200
      });
      
      await act(async () => {
        focusManager.handleMouseNavigation('mouse-field', mockEvent);
      });
      
      // Allow time for state updates
      await waitFor(() => {
        expect(focusManager.state.mouseInteractionHistory).toHaveLength(1);
      });
      
      expect(focusManager.state.mouseInteractionHistory[0]).toMatchObject({
        elementId: 'mouse-field',
        position: { x: 100, y: 200 },
        wasValid: true
      });
    });

    it('should check if node can jump', async () => {
      let focusManager: any;
      
      const TestJumpComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'jump-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            mouseNavigation: {
              allowDirectJump: true
            }
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="jump-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestJumpComponent />
        </FocusManagerProvider>
      );
      
      // Wait for element registration
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBeGreaterThan(0);
      });
      
      const canJump = await focusManager.canJumpToNode('jump-field');
      expect(canJump).toBe(true);
    });

    it('should prevent jump when not allowed', async () => {
      let focusManager: any;
      
      const TestNoJumpComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'no-jump-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            canFocus: false
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="no-jump-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestNoJumpComponent />
        </FocusManagerProvider>
      );
      
      // Wait for element registration
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBeGreaterThan(0);
      });
      
      const canJump = await focusManager.canJumpToNode('no-jump-field');
      expect(canJump).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should get elements in scope', () => {
      let focusManager: any;
      
      const TestScopeElementsComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'scope1-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'scope1'
          });
          
          focusManager.registerElement({
            id: 'scope2-field1',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'scope2'
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="scope1-field1" />
            <input ref={field2Ref} data-testid="scope2-field1" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestScopeElementsComponent />
        </FocusManagerProvider>
      );
      
      const scope1Elements = focusManager.getElementsInScope('scope1');
      const scope2Elements = focusManager.getElementsInScope('scope2');
      
      expect(scope1Elements).toHaveLength(1);
      expect(scope1Elements[0].id).toBe('scope1-field1');
      
      expect(scope2Elements).toHaveLength(1);
      expect(scope2Elements[0].id).toBe('scope2-field1');
    });

    it('should check if element can focus', async () => {
      let focusManager: any;
      
      const TestCanFocusComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'can-focus-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            canFocus: true
          });
          
          focusManager.registerElement({
            id: 'cannot-focus-field',
            ref: { current: null },
            type: FocusableType.INPUT,
            scopeId: 'default',
            canFocus: false
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="can-focus-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestCanFocusComponent />
        </FocusManagerProvider>
      );
      
      // Wait for elements to be registered
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBe(2);
      });
      
      expect(focusManager.canFocusElement('can-focus-field')).toBe(true);
      expect(focusManager.canFocusElement('cannot-focus-field')).toBe(false);
      expect(focusManager.canFocusElement('nonexistent-field')).toBe(false);
    });

    it('should enable and disable focus management', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('enabled')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByTestId('set-enabled'));
      
      expect(screen.getByTestId('enabled')).toHaveTextContent('false');
    });

    it('should enable and disable debug mode', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('debug')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('set-debug'));
      
      expect(screen.getByTestId('debug')).toHaveTextContent('true');
    });
  });

  describe('Step Indicator Integration', () => {
    it('should get visible steps', async () => {
      let focusManager: any;
      
      const TestStepsComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'step1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1,
            visualIndicator: {
              showInStepper: true,
              stepLabel: 'Step 1',
              stepDescription: 'First step'
            }
          });
          
          focusManager.registerElement({
            id: 'step2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2,
            visualIndicator: {
              showInStepper: true,
              stepLabel: 'Step 2',
              stepDescription: 'Second step'
            }
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="step1" />
            <input ref={field2Ref} data-testid="step2" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestStepsComponent />
        </FocusManagerProvider>
      );
      
      // Wait for elements to be registered first
      await waitFor(() => {
        expect(focusManager.state.elements.size).toBe(2);
      });
      
      const steps = await focusManager.getVisibleSteps();
      expect(steps).toHaveLength(2);
      
      // Make the expectation more flexible to handle any valid step object structure
      expect(steps[0]).toEqual(expect.objectContaining({
        id: 'step1',
        label: 'Step 1',
        description: 'First step'
      }));
      
      expect(steps[1]).toEqual(expect.objectContaining({
        id: 'step2',
        label: 'Step 2',
        description: 'Second step'
      }));
    });

    it('should update step status based on focus', async () => {
      let focusManager: any;
      
      const TestStepStatusComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'status-step',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            visualIndicator: {
              showInStepper: true,
              stepLabel: 'Status Step'
            }
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="status-step" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestStepStatusComponent />
        </FocusManagerProvider>
      );
      
      let steps = await focusManager.getVisibleSteps();
      expect(steps[0].status).toBe('upcoming');
      
      // Focus the element
      await act(async () => {
        await focusManager.focusField('status-step');
      });
      
      steps = await focusManager.getVisibleSteps();
      expect(steps[0].status).toBe('current');
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should handle escape key for modals', () => {
      let focusManager: any;
      
      const TestEscapeComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestEscapeComponent />
        </FocusManagerProvider>
      );
      
      // Open a modal
      act(() => {
        focusManager.openModal('escape-test');
      });
      
      expect(focusManager.isModalOpen()).toBe(true);
      
      // Press escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(focusManager.isModalOpen()).toBe(false);
    });

    it('should handle tab navigation in trapped scope', async () => {
      let focusManager: any;
      
      const TestTrapComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'trap1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'trapped-scope'
          });
          
          focusManager.registerElement({
            id: 'trap2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'trapped-scope'
          });
          
          focusManager.pushScope({
            id: 'trapped-scope',
            type: 'modal',
            trapFocus: true,
            autoFocus: false
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="trap1" />
            <input ref={field2Ref} data-testid="trap2" />
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestTrapComponent />
        </FocusManagerProvider>
      );
      
      // Wait for scope and elements to be registered
      await waitFor(() => {
        expect(focusManager.state.scopes.length).toBe(2); // default + trapped
        expect(focusManager.state.elements.size).toBe(2);
      });
      
      // Create a proper event with preventDefault mock
      const preventDefaultSpy = vi.fn();
      const tabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });
      
      // Replace preventDefault with our spy
      Object.defineProperty(tabEvent, 'preventDefault', {
        value: preventDefaultSpy,
        writable: true
      });
      
      fireEvent(document, tabEvent);
      
      // In a trapped scope, Tab should be prevented
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trap tab in non-trapping scope', () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      // Default scope should not trap focus
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
      
      fireEvent.keyDown(document, tabEvent);
      
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid element ID in focus operations', async () => {
      let focusManager: any;
      
      const TestInvalidComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestInvalidComponent />
        </FocusManagerProvider>
      );
      
      const result = await act(async () => {
        return focusManager.focusField('nonexistent-field');
      });
      
      expect(result).toBe(false);
    });

    it('should handle updates to nonexistent elements', () => {
      let focusManager: any;
      
      const TestUpdateComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestUpdateComponent />
        </FocusManagerProvider>
      );
      
      const initialState = focusManager.state;
      
      act(() => {
        focusManager.updateElement('nonexistent', { metadata: { test: true } });
      });
      
      // State should remain unchanged
      expect(focusManager.state).toBe(initialState);
    });

    it('should handle mouse navigation on nonexistent element', () => {
      let focusManager: any;
      
      const TestMouseComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestMouseComponent />
        </FocusManagerProvider>
      );
      
      const mockEvent = new MouseEvent('click');
      
      // Should not crash
      act(() => {
        focusManager.handleMouseNavigation('nonexistent', mockEvent);
      });
      
      expect(focusManager.state.mouseInteractionHistory).toHaveLength(0);
    });

    it('should handle validation failure gracefully', async () => {
      const { validateElement } = await import('../utils');
      (validateElement as any).mockResolvedValueOnce(false);
      
      let focusManager: any;
      
      const TestValidationComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'validation-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default'
          });
        }, []);
        
        return <input ref={fieldRef} data-testid="validation-field" />;
      };
      
      render(
        <FocusManagerProvider>
          <TestValidationComponent />
        </FocusManagerProvider>
      );
      
      const result = await act(async () => {
        return focusManager.focusField('validation-field');
      });
      
      expect(result).toBe(false);
    });

    it('should handle empty navigation attempts', async () => {
      render(
        <FocusManagerProvider>
          <TestComponent />
        </FocusManagerProvider>
      );
      
      // Try navigation with no elements registered
      fireEvent.click(screen.getByTestId('focus-next'));
      fireEvent.click(screen.getByTestId('focus-previous'));
      fireEvent.click(screen.getByTestId('focus-first'));
      fireEvent.click(screen.getByTestId('focus-last'));
      
      // Should not crash and focus should remain none
      expect(screen.getByTestId('current-focus')).toHaveTextContent('none');
    });

    it('should handle modal operations with invalid options', () => {
      let focusManager: any;
      
      const TestModalOptionsComponent = () => {
        focusManager = useFocusManager();
        return null;
      };
      
      render(
        <FocusManagerProvider>
          <TestModalOptionsComponent />
        </FocusManagerProvider>
      );
      
      // Should not crash with undefined or invalid options
      act(() => {
        focusManager.openModal('test-modal', undefined);
      });
      
      expect(focusManager.isModalOpen()).toBe(true);
      
      act(() => {
        focusManager.closeModal();
      });
      
      expect(focusManager.isModalOpen()).toBe(false);
    });
  });
});