/**
 * ManagedDialog Test Suite
 * 
 * Tests for the ManagedDialog component including:
 * - Focus scope management
 * - Focus restoration
 * - Nested dialog support
 * - Keyboard navigation
 * - Escape key handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManagedDialog, ManagedDialogClose, useManagedDialog } from './ManagedDialog';
import { FocusManagerProvider } from '../../contexts/focus';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Helper to render with FocusManagerProvider
const renderWithFocusManager = (component: React.ReactNode) => {
  return render(
    <FocusManagerProvider debug={false}>
      {component}
    </FocusManagerProvider>
  );
};

describe('ManagedDialog', () => {
  describe('Basic Functionality', () => {
    it('should render dialog trigger and content', () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
          description="Test description"
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      // Check trigger is rendered
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
      
      // Dialog content should not be visible initially
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
    });
    
    it('should open dialog when trigger is clicked', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      const trigger = screen.getByText('Open Dialog');
      await userEvent.click(trigger);
      
      // Dialog should be visible
      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
    });
    
    it('should close dialog when close button is clicked', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
          footer={
            <ManagedDialogClose asChild>
              <Button>Close</Button>
            </ManagedDialogClose>
          }
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      // Open dialog
      await userEvent.click(screen.getByText('Open Dialog'));
      
      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      // Close dialog
      await userEvent.click(screen.getByText('Close'));
      
      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('Focus Management', () => {
    it('should restore focus to trigger when dialog closes', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button data-testid="trigger">Open Dialog</Button>}
          title="Test Dialog"
          footer={
            <ManagedDialogClose asChild>
              <Button data-testid="close">Close</Button>
            </ManagedDialogClose>
          }
        >
          <Input data-testid="dialog-input" autoFocus />
        </ManagedDialog>
      );
      
      const trigger = screen.getByTestId('trigger');
      
      // Focus the trigger
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      
      // Open dialog
      await userEvent.click(trigger);
      
      // Wait for dialog to open and input to be focused
      await waitFor(() => {
        const input = screen.getByTestId('dialog-input');
        expect(input).toBeInTheDocument();
      });
      
      // Close dialog
      const closeButton = screen.getByTestId('close');
      await userEvent.click(closeButton);
      
      // Focus should return to trigger (with a delay)
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      }, { timeout: 200 });
    });
    
    it('should restore focus to specified element', async () => {
      renderWithFocusManager(
        <div>
          <Input data-testid="restore-target" id="restore-target" />
          <ManagedDialog
            id="test-dialog"
            trigger={<Button data-testid="trigger">Open Dialog</Button>}
            title="Test Dialog"
            focusRestorationId="restore-target"
            footer={
              <ManagedDialogClose asChild>
                <Button data-testid="close">Close</Button>
              </ManagedDialogClose>
            }
          >
            <div>Dialog Content</div>
          </ManagedDialog>
        </div>
      );
      
      const restoreTarget = screen.getByTestId('restore-target');
      const trigger = screen.getByTestId('trigger');
      
      // Open dialog
      await userEvent.click(trigger);
      
      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      // Close dialog
      await userEvent.click(screen.getByTestId('close'));
      
      // Focus should go to restore target
      await waitFor(() => {
        expect(document.activeElement).toBe(restoreTarget);
      }, { timeout: 200 });
    });
  });
  
  describe('Nested Dialogs', () => {
    it('should support nested dialogs', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="parent-dialog"
          trigger={<Button data-testid="parent-trigger">Open Parent</Button>}
          title="Parent Dialog"
        >
          <div>
            <p>Parent Content</p>
            <ManagedDialog
              id="child-dialog"
              trigger={<Button data-testid="child-trigger">Open Child</Button>}
              title="Child Dialog"
              footer={
                <ManagedDialogClose asChild>
                  <Button data-testid="child-close">Close Child</Button>
                </ManagedDialogClose>
              }
            >
              <p>Child Content</p>
            </ManagedDialog>
            <ManagedDialogClose asChild>
              <Button data-testid="parent-close">Close Parent</Button>
            </ManagedDialogClose>
          </div>
        </ManagedDialog>
      );
      
      // Open parent dialog
      await userEvent.click(screen.getByTestId('parent-trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Parent Content')).toBeInTheDocument();
      });
      
      // Open child dialog
      await userEvent.click(screen.getByTestId('child-trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Child Content')).toBeInTheDocument();
      });
      
      // Both dialogs should be visible
      expect(screen.getByText('Parent Content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
      
      // Close child dialog
      await userEvent.click(screen.getByTestId('child-close'));
      
      await waitFor(() => {
        expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
      });
      
      // Parent should still be visible
      expect(screen.getByText('Parent Content')).toBeInTheDocument();
      
      // Close parent dialog
      await userEvent.click(screen.getByTestId('parent-close'));
      
      await waitFor(() => {
        expect(screen.queryByText('Parent Content')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('Keyboard Navigation', () => {
    it('should close on Escape key when closeOnEscape is true', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
          closeOnEscape={true}
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      // Open dialog
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
      });
    });
    
    it('should not close on Escape when closeOnEscape is false', async () => {
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
          closeOnEscape={false}
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      // Open dialog
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Dialog should remain open
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
    });
  });
  
  describe('Programmatic Control', () => {
    const TestComponent = () => {
      const dialog = useManagedDialog('test-dialog');
      
      return (
        <div>
          <Button data-testid="open" onClick={dialog.open}>
            Open
          </Button>
          <Button data-testid="close" onClick={dialog.close}>
            Close
          </Button>
          <Button data-testid="toggle" onClick={dialog.toggle}>
            Toggle
          </Button>
          
          <ManagedDialog
            {...dialog.dialogProps}
            title="Controlled Dialog"
          >
            <div>Controlled Content</div>
          </ManagedDialog>
        </div>
      );
    };
    
    it('should open and close programmatically', async () => {
      renderWithFocusManager(<TestComponent />);
      
      // Initially closed
      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();
      
      // Open programmatically
      await userEvent.click(screen.getByTestId('open'));
      
      await waitFor(() => {
        expect(screen.getByText('Controlled Content')).toBeInTheDocument();
      });
      
      // Close programmatically
      await userEvent.click(screen.getByTestId('close'));
      
      await waitFor(() => {
        expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();
      });
    });
    
    it('should toggle dialog state', async () => {
      renderWithFocusManager(<TestComponent />);
      
      const toggleButton = screen.getByTestId('toggle');
      
      // Initially closed
      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();
      
      // Toggle open
      await userEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Controlled Content')).toBeInTheDocument();
      });
      
      // Toggle closed
      await userEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('Completion Callback', () => {
    it('should call onComplete when dialog closes', async () => {
      const onComplete = vi.fn();
      
      renderWithFocusManager(
        <ManagedDialog
          id="test-dialog"
          trigger={<Button>Open Dialog</Button>}
          title="Test Dialog"
          onComplete={onComplete}
          footer={
            <ManagedDialogClose asChild>
              <Button>Close</Button>
            </ManagedDialogClose>
          }
        >
          <div>Dialog Content</div>
        </ManagedDialog>
      );
      
      // Open dialog
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      // onComplete should not be called yet
      expect(onComplete).not.toHaveBeenCalled();
      
      // Close dialog
      await userEvent.click(screen.getByText('Close'));
      
      // onComplete should be called
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });
  });
});