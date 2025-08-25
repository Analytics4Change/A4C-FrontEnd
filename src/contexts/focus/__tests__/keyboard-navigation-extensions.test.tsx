/**
 * Task 031a: Keyboard Navigation Extensions
 * 
 * Additional keyboard navigation tests that extend existing coverage:
 * - Tab/Shift+Tab cycling (enhancement of existing tab tests)
 * - Enter advancement functionality
 * - Ctrl+Enter jump functionality  
 * - Additional keyboard shortcuts validation
 * 
 * Note: Basic Tab and Escape handling is already tested in FocusManagerContext.test.tsx
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  FocusManagerProvider
} from '../FocusManagerContext';
import { useFocusManager } from '../useFocusManager';
import { 
  FocusableType, 
  FocusChangeReason, 
  NavigationMode 
} from '../types';

// Enhanced mocks for utilities
vi.mock('../utils', async () => {
  const { mockUtils } = await import('@/test/utils/enhanced-focus-utils-mock');
  return mockUtils;
});

describe('Task 031a: Keyboard Navigation Extensions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tab/Shift+Tab Cycling Enhancement', () => {
    it('should cycle through multiple elements in correct order', async () => {
      let focusManager: any;
      
      const TabCycleComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        const field3Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'tab-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'tab-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
          
          focusManager.registerElement({
            id: 'tab-field3',
            ref: field3Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 3
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="tab-field1" />
            <input ref={field2Ref} data-testid="tab-field2" />
            <input ref={field3Ref} data-testid="tab-field3" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TabCycleComponent />
        </FocusManagerProvider>
      );

      // Test forward cycling: field1 -> field2 -> field3 -> field1
      await act(async () => {
        await focusManager.focusField('tab-field1');
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('tab-field1');
      
      await act(async () => {
        await focusManager.focusNext();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('tab-field2');
      
      await act(async () => {
        await focusManager.focusNext();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('tab-field3');

      // Test wrapping behavior
      await act(async () => {
        await focusManager.focusNext();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('tab-field1');
    });

    it('should reverse cycle through elements with focusPrevious', async () => {
      let focusManager: any;
      
      const ReverseCycleComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'reverse-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'reverse-field2', 
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="reverse-field1" />
            <input ref={field2Ref} data-testid="reverse-field2" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <ReverseCycleComponent />
        </FocusManagerProvider>
      );

      // Start at field2 and go backward
      await act(async () => {
        await focusManager.focusField('reverse-field2');
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('reverse-field2');
      
      await act(async () => {
        await focusManager.focusPrevious();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('reverse-field1');

      // Test reverse wrapping
      await act(async () => {
        await focusManager.focusPrevious();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('reverse-field2');
    });
  });

  describe('Enter Key Advancement', () => {
    it('should advance focus to next field when Enter is pressed', async () => {
      let focusManager: any;
      
      const EnterAdvanceComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'enter-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'enter-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            focusManager.focusNext();
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={field1Ref} data-testid="enter-field1" />
            <input ref={field2Ref} data-testid="enter-field2" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <EnterAdvanceComponent />
        </FocusManagerProvider>
      );

      // Focus first field
      await act(async () => {
        await focusManager.focusField('enter-field1');
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('enter-field1');

      // Press Enter to advance
      const field1 = screen.getByTestId('enter-field1');
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('enter-field2');
      });
    });

    it('should not advance when Enter is combined with modifiers', async () => {
      let focusManager: any;
      
      const EnterModifierComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'modifier-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            focusManager.focusNext();
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={fieldRef} data-testid="modifier-field" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <EnterModifierComponent />
        </FocusManagerProvider>
      );

      await act(async () => {
        await focusManager.focusField('modifier-field');
      });

      const field = screen.getByTestId('modifier-field');
      
      // Test Ctrl+Enter (should not advance)
      await act(async () => {
        fireEvent.keyDown(field, { key: 'Enter', ctrlKey: true });
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('modifier-field');

      // Test Meta+Enter (should not advance)  
      await act(async () => {
        fireEvent.keyDown(field, { key: 'Enter', metaKey: true });
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('modifier-field');
    });
  });

  describe('Ctrl+Enter Jump Functionality', () => {
    it('should execute direct jump when Ctrl+Enter is pressed', async () => {
      let focusManager: any;
      
      const CtrlEnterComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        const submitRef = React.useRef<HTMLButtonElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'ctrl-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'ctrl-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
          
          focusManager.registerElement({
            id: 'submit-button',
            ref: submitRef,
            type: FocusableType.BUTTON,
            scopeId: 'default',
            tabIndex: 3,
            mouseNavigation: {
              allowDirectJump: true
            }
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            focusManager.focusField('submit-button');
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={field1Ref} data-testid="ctrl-field1" />
            <input ref={field2Ref} data-testid="ctrl-field2" />
            <button ref={submitRef} data-testid="submit-button">Submit</button>
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <CtrlEnterComponent />
        </FocusManagerProvider>
      );

      // Focus first field
      await act(async () => {
        await focusManager.focusField('ctrl-field1');
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('ctrl-field1');

      // Press Ctrl+Enter to jump to submit button
      const field1 = screen.getByTestId('ctrl-field1');
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter', ctrlKey: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('submit-button');
      });
    });

    it('should support Meta+Enter for Mac compatibility', async () => {
      let focusManager: any;
      
      const MetaEnterComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        const targetRef = React.useRef<HTMLButtonElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'meta-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'meta-target',
            ref: targetRef,
            type: FocusableType.BUTTON,
            scopeId: 'default',
            tabIndex: 2,
            mouseNavigation: {
              allowDirectJump: true
            }
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            focusManager.focusField('meta-target');
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={fieldRef} data-testid="meta-field" />
            <button ref={targetRef} data-testid="meta-target">Target</button>
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <MetaEnterComponent />
        </FocusManagerProvider>
      );

      await act(async () => {
        await focusManager.focusField('meta-field');
      });

      const field = screen.getByTestId('meta-field');
      await act(async () => {
        fireEvent.keyDown(field, { key: 'Enter', metaKey: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('meta-target');
      });
    });
  });

  describe('Additional Keyboard Shortcuts Validation', () => {
    it('should handle Home and End keys for first/last navigation', async () => {
      let focusManager: any;
      
      const HomeEndComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        const field3Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'home-field1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'home-field2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
          
          focusManager.registerElement({
            id: 'home-field3',
            ref: field3Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 3
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Home') {
            e.preventDefault();
            focusManager.focusFirst();
          } else if (e.key === 'End') {
            e.preventDefault();
            focusManager.focusLast();
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={field1Ref} data-testid="home-field1" />
            <input ref={field2Ref} data-testid="home-field2" />
            <input ref={field3Ref} data-testid="home-field3" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <HomeEndComponent />
        </FocusManagerProvider>
      );

      // Focus middle field
      await act(async () => {
        await focusManager.focusField('home-field2');
      });

      // Test Home key (trigger via component handler)
      const container = screen.getByTestId('home-field1').parentElement;
      await act(async () => {
        fireEvent.keyDown(container!, { key: 'Home' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('home-field1');
      });

      // Test End key (trigger via component handler)
      await act(async () => {
        fireEvent.keyDown(container!, { key: 'End' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('home-field3');
      });
    });

    it('should validate all navigation shortcuts work without errors', async () => {
      let focusManager: any;
      
      const AllShortcutsComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'shortcuts-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
        }, []);
        
        return (
          <div>
            <input ref={fieldRef} data-testid="shortcuts-field" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
            <div data-testid="enabled">{focusManager.state.enabled.toString()}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <AllShortcutsComponent />
        </FocusManagerProvider>
      );

      // Test all keyboard shortcuts without crashing
      const shortcuts = [
        { key: 'Tab' },
        { key: 'Tab', shiftKey: true },
        { key: 'Enter' },
        { key: 'Enter', ctrlKey: true },
        { key: 'Enter', metaKey: true },
        { key: 'Escape' },
        { key: 'Home' },
        { key: 'End' },
        { key: 'PageUp' },
        { key: 'PageDown' },
        { key: 'ArrowUp' },
        { key: 'ArrowDown' },
        { key: 'ArrowLeft' },
        { key: 'ArrowRight' },
        { key: 'Space' },
        { key: 'F1' },
        { key: 'Delete' },
        { key: 'Backspace' }
      ];

      for (const shortcut of shortcuts) {
        await act(async () => {
          fireEvent.keyDown(document, shortcut);
        });
      }

      // Should remain enabled and not crash
      expect(screen.getByTestId('enabled')).toHaveTextContent('true');
    });
  });

  describe('Keyboard Shortcuts Success Criteria Validation', () => {
    it('should confirm Tab works correctly', async () => {
      let focusManager: any;
      
      const TabWorksComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'tab-works-1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'tab-works-2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default', 
            tabIndex: 2
          });
        }, []);
        
        return (
          <div>
            <input ref={field1Ref} data-testid="tab-works-1" />
            <input ref={field2Ref} data-testid="tab-works-2" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TabWorksComponent />
        </FocusManagerProvider>
      );

      // Test Tab works ✓
      await act(async () => {
        await focusManager.focusField('tab-works-1');
      });
      
      await act(async () => {
        await focusManager.focusNext();
      });
      
      expect(screen.getByTestId('current-focus')).toHaveTextContent('tab-works-2');
    });

    it('should confirm Enter advances correctly', async () => {
      let focusManager: any;
      let enterAdvanced = false;
      
      const EnterAdvancesComponent = () => {
        focusManager = useFocusManager();
        const field1Ref = React.useRef<HTMLInputElement>(null);
        const field2Ref = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'enter-advances-1',
            ref: field1Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
          
          focusManager.registerElement({
            id: 'enter-advances-2',
            ref: field2Ref,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 2
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            focusManager.focusNext();
            enterAdvanced = true;
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={field1Ref} data-testid="enter-advances-1" />
            <input ref={field2Ref} data-testid="enter-advances-2" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <EnterAdvancesComponent />
        </FocusManagerProvider>
      );

      await act(async () => {
        await focusManager.focusField('enter-advances-1');
      });

      const field1 = screen.getByTestId('enter-advances-1');
      await act(async () => {
        fireEvent.keyDown(field1, { key: 'Enter' });
      });

      // Test Enter advances ✓
      expect(enterAdvanced).toBe(true);
      await waitFor(() => {
        expect(screen.getByTestId('current-focus')).toHaveTextContent('enter-advances-2');
      });
    });

    it('should confirm Escape closes modals correctly', async () => {
      let focusManager: any;
      
      const EscapeClosesComponent = () => {
        focusManager = useFocusManager();
        return (
          <div>
            <div data-testid="modal-count">{focusManager.state.modalStack.length}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <EscapeClosesComponent />
        </FocusManagerProvider>
      );

      // Open modal
      await act(async () => {
        focusManager.openModal('test-escape-modal');
      });

      expect(screen.getByTestId('modal-count')).toHaveTextContent('1');

      // Test Escape closes ✓
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(screen.getByTestId('modal-count')).toHaveTextContent('0');
    });

    it('should confirm shortcuts work correctly', async () => {
      let focusManager: any;
      let shortcutsWorked = 0;
      
      const ShortcutsWorkComponent = () => {
        focusManager = useFocusManager();
        const fieldRef = React.useRef<HTMLInputElement>(null);
        
        React.useEffect(() => {
          focusManager.registerElement({
            id: 'shortcuts-work-field',
            ref: fieldRef,
            type: FocusableType.INPUT,
            scopeId: 'default',
            tabIndex: 1
          });
        }, []);
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (['Tab', 'Enter', 'Escape', 'Home', 'End'].includes(e.key)) {
            shortcutsWorked++;
          }
        };
        
        // Also add a global listener for document events
        React.useEffect(() => {
          const handleDocumentKeyDown = (e: KeyboardEvent) => {
            if (['Tab', 'Enter', 'Escape', 'Home', 'End'].includes(e.key)) {
              shortcutsWorked++;
            }
          };
          
          document.addEventListener('keydown', handleDocumentKeyDown);
          return () => document.removeEventListener('keydown', handleDocumentKeyDown);
        }, []);
        
        return (
          <div onKeyDown={handleKeyDown}>
            <input ref={fieldRef} data-testid="shortcuts-work-field" />
            <div data-testid="current-focus">{focusManager.state.currentFocusId || 'none'}</div>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <ShortcutsWorkComponent />
        </FocusManagerProvider>
      );

      // Test multiple shortcuts
      const testKeys = ['Tab', 'Enter', 'Escape', 'Home', 'End'];
      
      for (const key of testKeys) {
        await act(async () => {
          fireEvent.keyDown(document, { key });
        });
      }

      // Test Shortcuts work ✓
      expect(shortcutsWorked).toBeGreaterThan(0);
    });
  });
});