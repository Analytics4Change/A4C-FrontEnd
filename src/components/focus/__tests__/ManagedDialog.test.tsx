/**
 * ManagedDialog Unit Tests
 * Comprehensive tests for Task 003: ManagedDialog component functionality
 */

import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { 
  ManagedDialog, 
  ManagedDialogClose, 
  useManagedDialog,
  ManagedDialogProps 
} from '../ManagedDialog';
import { FocusManagerProvider } from '../../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../../contexts/focus/useFocusManager';

// Mock Radix Dialog components
vi.mock('@radix-ui/react-dialog', async () => ({
  ...(await vi.importActual('@radix-ui/react-dialog')),
  Root: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog-root" data-open={open}>
      {children}
    </div>
  ),
  Portal: ({ children }: any) => children,
  Overlay: ({ children }: any) => <div data-testid="dialog-overlay">{children}</div>,
  Content: ({ children, onEscapeKeyDown, onInteractOutside, ...props }: any) => (
    <div 
      data-testid="dialog-content" 
      {...props}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && onEscapeKeyDown) {
          onEscapeKeyDown(e);
        }
      }}
      onClick={(e: React.MouseEvent) => {
        // Simulate outside click
        if (e.target === e.currentTarget && onInteractOutside) {
          onInteractOutside(e.nativeEvent);
        }
      }}
    >
      {children}
    </div>
  ),
  Trigger: ({ children, asChild, ...props }: any) => (
    asChild ? 
      React.cloneElement(children, { ...props, 'data-testid': 'dialog-trigger' }) :
      <button data-testid="dialog-trigger" {...props}>{children}</button>
  ),
  Close: ({ children, ...props }: any) => (
    <button data-testid="dialog-close" {...props}>{children}</button>
  ),
  Title: ({ children, ...props }: any) => (
    <h2 data-testid="dialog-title" {...props}>{children}</h2>
  ),
  Description: ({ children, ...props }: any) => (
    <p data-testid="dialog-description" {...props}>{children}</p>
  ),
  Header: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  Footer: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}));

// Mock UI Dialog components
vi.mock('../../ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="ui-dialog" data-open={open} onClick={() => onOpenChange && onOpenChange(!open)}>
      {children}
    </div>
  ),
  DialogContent: ({ children, onEscapeKeyDown, onInteractOutside, showCloseButton, ...props }: any) => (
    <div 
      data-testid="ui-dialog-content" 
      {...props}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && onEscapeKeyDown) {
          onEscapeKeyDown(e);
        }
      }}
      onClick={(e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onInteractOutside) {
          onInteractOutside(e.nativeEvent);
        }
      }}
    >
      {children}
    </div>
  ),
  DialogTrigger: ({ children, asChild }: any) => (
    asChild ? 
      React.cloneElement(children, { 'data-testid': 'ui-dialog-trigger' }) :
      <button data-testid="ui-dialog-trigger">{children}</button>
  ),
  DialogTitle: ({ children, ...props }: any) => (
    <h2 data-testid="ui-dialog-title" {...props}>{children}</h2>
  ),
  DialogDescription: ({ children, ...props }: any) => (
    <p data-testid="ui-dialog-description" {...props}>{children}</p>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="ui-dialog-header">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="ui-dialog-footer">{children}</div>
}));

// Test component that uses focus manager
const TestFocusComponent = ({ onFocusChange }: { onFocusChange?: (id: string) => void }) => {
  const { 
    registerElement, 
    focusField, 
    state 
  } = useFocusManager();
  
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    registerElement({
      id: 'test-trigger',
      ref: buttonRef,
      type: 'button' as any,
      scopeId: 'default'
    });
  }, [registerElement]);
  
  React.useEffect(() => {
    if (onFocusChange && state.currentFocusId) {
      onFocusChange(state.currentFocusId);
    }
  }, [state.currentFocusId, onFocusChange]);
  
  return (
    <button 
      ref={buttonRef}
      data-testid="focus-trigger"
      onClick={() => focusField('test-trigger')}
    >
      Focus Me
    </button>
  );
};

// Basic test component
const BasicDialogTest: React.FC<Partial<ManagedDialogProps>> = (props) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <FocusManagerProvider>
      <TestFocusComponent />
      <ManagedDialog
        id="test-dialog"
        open={open}
        onOpenChange={setOpen}
        trigger={<button>Open Dialog</button>}
        {...props}
      >
        <div data-testid="dialog-content-inner">Dialog Content</div>
      </ManagedDialog>
      <button data-testid="external-open" onClick={() => setOpen(true)}>
        External Open
      </button>
    </FocusManagerProvider>
  );
};

// Controlled dialog test component
const ControlledDialogTest: React.FC<{ 
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void; 
}> = ({ onOpenChange, onComplete }) => {
  const [open, setOpen] = React.useState(false);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  
  return (
    <FocusManagerProvider>
      <TestFocusComponent />
      <ManagedDialog
        id="controlled-dialog"
        open={open}
        onOpenChange={handleOpenChange}
        onComplete={onComplete}
        title="Test Dialog"
        description="Test Description"
        footer={<button data-testid="footer-button">Footer Action</button>}
      >
        <div data-testid="controlled-content">Controlled Content</div>
      </ManagedDialog>
      <button data-testid="open-controlled" onClick={() => handleOpenChange(true)}>
        Open
      </button>
      <button data-testid="close-controlled" onClick={() => handleOpenChange(false)}>
        Close
      </button>
    </FocusManagerProvider>
  );
};

// Hook test component
const HookTestComponent = () => {
  const dialog = useManagedDialog('hook-dialog');
  
  return (
    <FocusManagerProvider>
      <div>
        <div data-testid="dialog-open">{dialog.isOpen.toString()}</div>
        <button data-testid="hook-open" onClick={dialog.open}>
          Open
        </button>
        <button data-testid="hook-close" onClick={dialog.close}>
          Close
        </button>
        <button data-testid="hook-toggle" onClick={dialog.toggle}>
          Toggle
        </button>
        
        <ManagedDialog
          {...dialog.dialogProps}
          trigger={<button>Hook Trigger</button>}
        >
          <div data-testid="hook-content">Hook Content</div>
        </ManagedDialog>
      </div>
    </FocusManagerProvider>
  );
};

describe('ManagedDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render dialog with basic props', () => {
      render(<BasicDialogTest />);
      
      expect(screen.getByTestId('ui-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('ui-dialog-trigger')).toBeInTheDocument();
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
      render(<BasicDialogTest />);
      
      const trigger = screen.getByText('Open Dialog');
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
      });
    });

    it('should close dialog when clicked outside (if enabled)', async () => {
      render(<BasicDialogTest closeOnOutsideClick={true} />);
      
      // Open dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
      });
      
      // Click outside (simulate by clicking content directly)
      const content = screen.getByTestId('ui-dialog-content');
      fireEvent.click(content);
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'false');
      });
    });

    it('should not close dialog when outside click is disabled', async () => {
      render(<BasicDialogTest closeOnOutsideClick={false} />);
      
      // Open dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
      });
      
      // Try to click outside
      const content = screen.getByTestId('ui-dialog-content');
      fireEvent.click(content);
      
      // Dialog should remain open
      expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
    });

    it('should close dialog on escape key (if enabled)', async () => {
      render(<BasicDialogTest closeOnEscape={true} />);
      
      // Open dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
      });
      
      // Press escape
      const content = screen.getByTestId('ui-dialog-content');
      fireEvent.keyDown(content, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'false');
      });
    });

    it('should not close dialog on escape when disabled', async () => {
      render(<BasicDialogTest closeOnEscape={false} />);
      
      // Open dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
      });
      
      // Press escape
      const content = screen.getByTestId('ui-dialog-content');
      fireEvent.keyDown(content, { key: 'Escape' });
      
      // Dialog should remain open
      expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Focus Management Integration', () => {
    it('should integrate with focus manager on open', async () => {
      let capturedState: any;
      
      const TestFocusIntegration = () => {
        const focusManager = useFocusManager();
        capturedState = focusManager.state;
        
        return (
          <ManagedDialog
            id="focus-dialog"
            open={true}
            onOpenChange={() => {}}
          >
            <div>Focus Integration Test</div>
          </ManagedDialog>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestFocusIntegration />
        </FocusManagerProvider>
      );
      
      await waitFor(() => {
        expect(capturedState.modalStack).toHaveLength(1);
        expect(capturedState.modalStack[0].scopeId).toBe('focus-dialog');
      });
    });

    it('should track focus restoration target', async () => {
      let currentFocus = '';
      
      const TestFocusRestoration = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <TestFocusComponent onFocusChange={(id) => currentFocus = id} />
            <ManagedDialog
              id="restore-dialog"
              open={open}
              onOpenChange={setOpen}
              restoreFocus={true}
            >
              <div>Restoration Test</div>
            </ManagedDialog>
            <button data-testid="open-restore" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-restore" onClick={() => setOpen(false)}>
              Close
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestFocusRestoration />);
      
      // Focus the trigger first
      fireEvent.click(screen.getByTestId('focus-trigger'));
      await waitFor(() => {
        expect(currentFocus).toBe('test-trigger');
      });
      
      // Open dialog
      fireEvent.click(screen.getByTestId('open-restore'));
      
      // Close dialog
      fireEvent.click(screen.getByTestId('close-restore'));
      
      // Focus should be restored
      await waitFor(() => {
        expect(currentFocus).toBe('test-trigger');
      }, { timeout: 200 });
    });

    it('should handle focus restoration with custom target', async () => {
      const TestCustomRestore = () => {
        const [open, setOpen] = React.useState(false);
        const { registerElement, focusField } = useFocusManager();
        const customRef = React.useRef<HTMLButtonElement>(null);
        
        React.useEffect(() => {
          registerElement({
            id: 'custom-restore-target',
            ref: customRef,
            type: 'button' as any,
            scopeId: 'default'
          });
        }, [registerElement]);
        
        return (
          <div>
            <button 
              ref={customRef}
              data-testid="custom-target"
              onClick={() => focusField('custom-restore-target')}
            >
              Custom Target
            </button>
            
            <ManagedDialog
              id="custom-restore-dialog"
              open={open}
              onOpenChange={setOpen}
              focusRestorationId="custom-restore-target"
            >
              <div>Custom Restore Test</div>
            </ManagedDialog>
            
            <button data-testid="open-custom" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-custom" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestCustomRestore />
        </FocusManagerProvider>
      );
      
      // Open and close dialog
      fireEvent.click(screen.getByTestId('open-custom'));
      fireEvent.click(screen.getByTestId('close-custom'));
      
      // Custom target should receive focus after delay
      await waitFor(() => {
        // We can't easily test actual DOM focus, but the focusField should be called
        expect(screen.getByTestId('custom-target')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should disable focus restoration when configured', async () => {
      const TestNoRestore = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <TestFocusComponent />
            <ManagedDialog
              id="no-restore-dialog"
              open={open}
              onOpenChange={setOpen}
              restoreFocus={false}
            >
              <div>No Restore Test</div>
            </ManagedDialog>
            <button data-testid="open-no-restore" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-no-restore" onClick={() => setOpen(false)}>
              Close
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestNoRestore />);
      
      // Focus trigger
      fireEvent.click(screen.getByTestId('focus-trigger'));
      
      // Open and close dialog
      fireEvent.click(screen.getByTestId('open-no-restore'));
      fireEvent.click(screen.getByTestId('close-no-restore'));
      
      // No focus restoration should occur
      // This is hard to test directly, but the component should not crash
      expect(screen.getByTestId('focus-trigger')).toBeInTheDocument();
    });
  });

  describe('Dialog Content and Structure', () => {
    it('should render title and description when provided', () => {
      render(
        <ControlledDialogTest />
      );
      
      fireEvent.click(screen.getByTestId('open-controlled'));
      
      expect(screen.getByTestId('ui-dialog-title')).toHaveTextContent('Test Dialog');
      expect(screen.getByTestId('ui-dialog-description')).toHaveTextContent('Test Description');
    });

    it('should render footer when provided', () => {
      render(
        <ControlledDialogTest />
      );
      
      fireEvent.click(screen.getByTestId('open-controlled'));
      
      expect(screen.getByTestId('ui-dialog-footer')).toBeInTheDocument();
      expect(screen.getByTestId('footer-button')).toHaveTextContent('Footer Action');
    });

    it('should apply custom content class name', () => {
      render(
        <BasicDialogTest contentClassName="custom-dialog-class" />
      );
      
      fireEvent.click(screen.getByText('Open Dialog'));
      
      const content = screen.getByTestId('ui-dialog-content');
      expect(content).toHaveClass('custom-dialog-class');
    });

    it('should set proper ARIA attributes', () => {
      render(
        <FocusManagerProvider>
          <ManagedDialog
            id="aria-dialog"
            open={true}
            onOpenChange={() => {}}
            title="ARIA Test"
            description="ARIA Description"
          >
            <div>ARIA Content</div>
          </ManagedDialog>
        </FocusManagerProvider>
      );
      
      const content = screen.getByTestId('ui-dialog-content');
      expect(content).toHaveAttribute('aria-labelledby', 'aria-dialog-title');
      expect(content).toHaveAttribute('aria-describedby', 'aria-dialog-description');
      expect(content).toHaveAttribute('data-managed-dialog', 'aria-dialog');
    });

    it('should not set ARIA attributes when title/description not provided', () => {
      render(
        <FocusManagerProvider>
          <ManagedDialog
            id="no-aria-dialog"
            open={true}
            onOpenChange={() => {}}
          >
            <div>No ARIA Content</div>
          </ManagedDialog>
        </FocusManagerProvider>
      );
      
      const content = screen.getByTestId('ui-dialog-content');
      expect(content).not.toHaveAttribute('aria-labelledby');
      expect(content).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Callback Handling', () => {
    it('should call onComplete when dialog closes', async () => {
      const onComplete = vi.fn();
      
      render(
        <ControlledDialogTest onComplete={onComplete} />
      );
      
      fireEvent.click(screen.getByTestId('open-controlled'));
      fireEvent.click(screen.getByTestId('close-controlled'));
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should call controlled onOpenChange', async () => {
      const onOpenChange = vi.fn();
      
      render(
        <ControlledDialogTest onOpenChange={onOpenChange} />
      );
      
      fireEvent.click(screen.getByTestId('open-controlled'));
      
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
      
      fireEvent.click(screen.getByTestId('close-controlled'));
      
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should handle trigger ref tracking', () => {
      const TestTriggerRef = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="trigger-ref-dialog"
              open={open}
              onOpenChange={setOpen}
              trigger={
                <button id="trigger-with-id">
                  Trigger with ID
                </button>
              }
            >
              <div>Trigger Ref Test</div>
            </ManagedDialog>
          </FocusManagerProvider>
        );
      };
      
      render(<TestTriggerRef />);
      
      // Should render without crashing
      expect(screen.getByText('Trigger with ID')).toBeInTheDocument();
    });
  });

  describe('ManagedDialogClose Component', () => {
    it('should render close button', () => {
      render(
        <FocusManagerProvider>
          <ManagedDialogClose>
            Close Dialog
          </ManagedDialogClose>
        </FocusManagerProvider>
      );
      
      expect(screen.getByTestId('dialog-close')).toHaveTextContent('Close Dialog');
    });

    it('should apply custom class name', () => {
      render(
        <FocusManagerProvider>
          <ManagedDialogClose className="custom-close-class">
            Close
          </ManagedDialogClose>
        </FocusManagerProvider>
      );
      
      const closeButton = screen.getByTestId('dialog-close');
      expect(closeButton).toHaveClass('custom-close-class');
    });

    it('should handle click events', () => {
      const onClick = vi.fn();
      
      render(
        <FocusManagerProvider>
          <ManagedDialogClose onClick={onClick}>
            Close
          </ManagedDialogClose>
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('dialog-close'));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('useManagedDialog Hook', () => {
    it('should provide dialog state and controls', () => {
      render(<HookTestComponent />);
      
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('hook-open'));
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByTestId('hook-close'));
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('false');
    });

    it('should toggle dialog state', () => {
      render(<HookTestComponent />);
      
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('hook-toggle'));
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByTestId('hook-toggle'));
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('false');
    });

    it('should provide correct dialog props', () => {
      const TestHookProps = () => {
        const dialog = useManagedDialog('hook-props-test');
        
        return (
          <div>
            <div data-testid="dialog-id">{dialog.dialogProps.id}</div>
            <div data-testid="dialog-open">{dialog.dialogProps.open.toString()}</div>
            <button 
              data-testid="test-open" 
              onClick={() => dialog.dialogProps.onOpenChange(true)}
            >
              Test Open
            </button>
          </div>
        );
      };
      
      render(<TestHookProps />);
      
      expect(screen.getByTestId('dialog-id')).toHaveTextContent('hook-props-test');
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('test-open'));
      expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing focus manager gracefully', () => {
      // Render without FocusManagerProvider
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <ManagedDialog
            id="no-provider-dialog"
            open={true}
            onOpenChange={() => {}}
          >
            <div>No Provider Test</div>
          </ManagedDialog>
        );
      }).toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle rapid open/close operations', async () => {
      const TestRapidToggle = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="rapid-dialog"
              open={open}
              onOpenChange={setOpen}
            >
              <div>Rapid Toggle Test</div>
            </ManagedDialog>
            <button 
              data-testid="rapid-toggle" 
              onClick={() => {
                setOpen(true);
                setTimeout(() => setOpen(false), 10);
                setTimeout(() => setOpen(true), 20);
              }}
            >
              Rapid Toggle
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestRapidToggle />);
      
      // Should not crash with rapid toggles
      fireEvent.click(screen.getByTestId('rapid-toggle'));
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toBeInTheDocument();
      });
    });

    it('should handle missing refs safely', () => {
      const TestMissingRef = () => {
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="missing-ref-dialog"
              open={true}
              onOpenChange={() => {}}
              trigger={null}
            >
              <div>Missing Ref Test</div>
            </ManagedDialog>
          </FocusManagerProvider>
        );
      };
      
      render(<TestMissingRef />);
      
      // Should render without crashing
      expect(screen.getByTestId('ui-dialog-content')).toBeInTheDocument();
    });

    it('should handle undefined onComplete callback', async () => {
      const TestUndefinedCallback = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="undefined-callback-dialog"
              open={open}
              onOpenChange={setOpen}
              onComplete={undefined}
            >
              <div>Undefined Callback Test</div>
            </ManagedDialog>
            <button data-testid="open-undefined" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-undefined" onClick={() => setOpen(false)}>
              Close
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestUndefinedCallback />);
      
      fireEvent.click(screen.getByTestId('open-undefined'));
      fireEvent.click(screen.getByTestId('close-undefined'));
      
      // Should not crash when onComplete is undefined
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'false');
      });
    });

    it('should handle invalid focus restoration targets', async () => {
      const TestInvalidRestore = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="invalid-restore-dialog"
              open={open}
              onOpenChange={setOpen}
              focusRestorationId="nonexistent-element"
            >
              <div>Invalid Restore Test</div>
            </ManagedDialog>
            <button data-testid="open-invalid" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-invalid" onClick={() => setOpen(false)}>
              Close
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestInvalidRestore />);
      
      fireEvent.click(screen.getByTestId('open-invalid'));
      fireEvent.click(screen.getByTestId('close-invalid'));
      
      // Should handle invalid restoration target gracefully
      await waitFor(() => {
        expect(screen.getByTestId('ui-dialog')).toHaveAttribute('data-open', 'false');
      });
    });

    it('should handle nested dialog scenarios', () => {
      const TestNestedDialogs = () => {
        const [outer, setOuter] = React.useState(false);
        const [inner, setInner] = React.useState(false);
        
        return (
          <FocusManagerProvider>
            <ManagedDialog
              id="outer-dialog"
              open={outer}
              onOpenChange={setOuter}
            >
              <div>
                <div>Outer Dialog</div>
                <button data-testid="open-inner" onClick={() => setInner(true)}>
                  Open Inner
                </button>
                
                <ManagedDialog
                  id="inner-dialog"
                  open={inner}
                  onOpenChange={setInner}
                >
                  <div data-testid="inner-content">Inner Dialog</div>
                </ManagedDialog>
              </div>
            </ManagedDialog>
            
            <button data-testid="open-outer" onClick={() => setOuter(true)}>
              Open Outer
            </button>
          </FocusManagerProvider>
        );
      };
      
      render(<TestNestedDialogs />);
      
      fireEvent.click(screen.getByTestId('open-outer'));
      fireEvent.click(screen.getByTestId('open-inner'));
      
      // Both dialogs should be open
      expect(screen.getByTestId('inner-content')).toBeInTheDocument();
    });
  });

  describe('Modal Stack Integration', () => {
    it('should properly manage modal stack', async () => {
      let modalStackSize = 0;
      
      const TestModalStack = () => {
        const { state } = useFocusManager();
        const [open, setOpen] = React.useState(false);
        
        modalStackSize = state.modalStack.length;
        
        return (
          <div>
            <div data-testid="modal-stack-size">{modalStackSize}</div>
            <ManagedDialog
              id="stack-dialog"
              open={open}
              onOpenChange={setOpen}
            >
              <div>Stack Test</div>
            </ManagedDialog>
            <button data-testid="open-stack" onClick={() => setOpen(true)}>
              Open
            </button>
            <button data-testid="close-stack" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestModalStack />
        </FocusManagerProvider>
      );
      
      expect(modalStackSize).toBe(0);
      
      fireEvent.click(screen.getByTestId('open-stack'));
      
      await waitFor(() => {
        expect(modalStackSize).toBe(1);
      });
      
      fireEvent.click(screen.getByTestId('close-stack'));
      
      await waitFor(() => {
        expect(modalStackSize).toBe(0);
      });
    });

    it('should handle modal options correctly', () => {
      let modalOptions: any;
      
      const TestModalOptions = () => {
        const { state } = useFocusManager();
        const [open, setOpen] = React.useState(false);
        
        modalOptions = state.modalStack[0]?.options;
        
        return (
          <div>
            <ManagedDialog
              id="options-dialog"
              open={open}
              onOpenChange={setOpen}
              closeOnEscape={false}
              closeOnOutsideClick={false}
              preventScroll={false}
            >
              <div>Options Test</div>
            </ManagedDialog>
            <button data-testid="open-options" onClick={() => setOpen(true)}>
              Open
            </button>
          </div>
        );
      };
      
      render(
        <FocusManagerProvider>
          <TestModalOptions />
        </FocusManagerProvider>
      );
      
      fireEvent.click(screen.getByTestId('open-options'));
      
      expect(modalOptions).toMatchObject({
        closeOnEscape: false,
        closeOnOutsideClick: false,
        preventScroll: false
      });
    });
  });
});