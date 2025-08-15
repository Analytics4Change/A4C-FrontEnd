/**
 * ManagedDialog Component
 * 
 * A wrapper around Radix UI Dialog that integrates with FocusManagerContext
 * for proper focus scope management and restoration.
 * 
 * Features:
 * - Automatic focus scope push/pop on open/close
 * - Focus restoration to triggering element
 * - Support for nested dialogs
 * - Integration with modal stack management
 */

import React, { useRef, useCallback, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useFocusManager, useModalFocus } from '../../contexts/focus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { cn } from '../ui/utils';

export interface ManagedDialogProps {
  /** Unique identifier for this dialog */
  id: string;
  
  /** Whether the dialog is open (controlled mode) */
  open?: boolean;
  
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  
  /** Element or component to trigger the dialog */
  trigger?: React.ReactNode;
  
  /** Dialog content */
  children: React.ReactNode;
  
  /** Optional title for the dialog */
  title?: string;
  
  /** Optional description for the dialog */
  description?: string;
  
  /** ID of element to restore focus to when dialog closes */
  focusRestorationId?: string;
  
  /** Callback when dialog completes/closes */
  onComplete?: () => void;
  
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  
  /** Whether to prevent scroll when open */
  preventScroll?: boolean;
  
  /** Whether to auto-focus first element in dialog */
  autoFocus?: boolean;
  
  /** Whether to restore focus when dialog closes */
  restoreFocus?: boolean;
  
  /** Custom class name for dialog content */
  contentClassName?: string;
  
  /** Whether to show close button */
  showCloseButton?: boolean;
  
  /** Footer content for the dialog */
  footer?: React.ReactNode;
}

/**
 * ManagedDialog Component
 * 
 * Wraps Radix Dialog with FocusManager integration for proper
 * focus scope management and restoration.
 */
export function ManagedDialog({
  id,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  children,
  title,
  description,
  focusRestorationId,
  onComplete,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  preventScroll = true,
  autoFocus = true,
  restoreFocus = true,
  contentClassName,
  showCloseButton = true,
  footer,
}: ManagedDialogProps) {
  const { 
    pushScope, 
    popScope, 
    focusField, 
    state,
    openModal,
    closeModal 
  } = useFocusManager();
  
  const triggerRef = useRef<HTMLElement>(null);
  const isOpenRef = useRef(false);
  const previousFocusRef = useRef<string | undefined>();
  
  // Track the trigger element for focus restoration
  useEffect(() => {
    if (trigger && triggerRef.current) {
      // Store the trigger element ID for focus restoration
      const triggerId = triggerRef.current.id || triggerRef.current.getAttribute('data-focus-id');
      if (triggerId) {
        previousFocusRef.current = triggerId;
      }
    }
  }, [trigger]);
  
  // Handle dialog open/close
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      // Opening dialog
      isOpenRef.current = true;
      
      // Store current focus for restoration
      if (!previousFocusRef.current && state.currentFocusId) {
        previousFocusRef.current = state.currentFocusId;
      }
      
      // Open modal in focus manager
      openModal(id, {
        closeOnEscape,
        closeOnOutsideClick,
        preventScroll
      });
      
      console.log(`[ManagedDialog] Opened dialog: ${id}`);
    } else {
      // Closing dialog
      isOpenRef.current = false;
      
      // Close modal in focus manager
      closeModal();
      
      // Handle focus restoration
      if (restoreFocus) {
        const restoreToId = focusRestorationId || previousFocusRef.current;
        if (restoreToId) {
          // Use setTimeout to ensure dialog is fully closed before restoring focus
          setTimeout(() => {
            focusField(restoreToId);
            console.log(`[ManagedDialog] Restored focus to: ${restoreToId}`);
          }, 100);
        }
      }
      
      // Call completion callback
      if (onComplete) {
        onComplete();
      }
      
      console.log(`[ManagedDialog] Closed dialog: ${id}`);
    }
    
    // Call controlled handler if provided
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open);
    }
  }, [
    id,
    openModal,
    closeModal,
    focusField,
    focusRestorationId,
    onComplete,
    closeOnEscape,
    closeOnOutsideClick,
    preventScroll,
    restoreFocus,
    controlledOnOpenChange,
    state.currentFocusId
  ]);
  
  // Handle escape key
  const handleEscapeKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      e.preventDefault();
      handleOpenChange(false);
    }
  }, [closeOnEscape, handleOpenChange]);
  
  // Handle outside click
  const handleInteractOutside = useCallback((e: Event) => {
    if (closeOnOutsideClick) {
      handleOpenChange(false);
    } else {
      // Prevent closing
      e.preventDefault();
    }
  }, [closeOnOutsideClick, handleOpenChange]);
  
  // Build dialog props
  const dialogProps: React.ComponentProps<typeof Dialog> = {
    open: controlledOpen,
    onOpenChange: handleOpenChange,
  };
  
  return (
    <Dialog {...dialogProps}>
      {trigger && (
        <DialogTrigger asChild>
          <span ref={triggerRef as any} data-managed-dialog-trigger={id}>
            {trigger}
          </span>
        </DialogTrigger>
      )}
      
      <DialogContent
        className={cn(
          'managed-dialog-content',
          contentClassName
        )}
        onEscapeKeyDown={handleEscapeKeyDown as any}
        onInteractOutside={handleInteractOutside as any}
        data-managed-dialog={id}
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle id={`${id}-title`}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription id={`${id}-description`}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        <div className="managed-dialog-body">
          {children}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ManagedDialogClose Component
 * 
 * A button that closes the nearest ManagedDialog when clicked.
 * Useful for custom close buttons within dialog content.
 */
export function ManagedDialogClose({
  children,
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DialogPrimitive.Close
      className={cn('managed-dialog-close', className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  );
}

/**
 * Hook for programmatically controlling a ManagedDialog
 */
export function useManagedDialog(dialogId: string) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    dialogProps: {
      id: dialogId,
      open: isOpen,
      onOpenChange: setIsOpen,
    }
  };
}