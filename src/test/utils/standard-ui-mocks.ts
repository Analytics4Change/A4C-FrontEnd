/**
 * Standardized UI Component Mocks
 * 
 * This file provides consistent mock implementations for all UI components
 * to prevent "missing export" errors in tests.
 * 
 * Usage in test files:
 * import { mockButton, mockCard, mockInput } from '@/test/utils/standard-ui-mocks';
 * 
 * vi.mock('@/components/ui/button', () => mockButton);
 * vi.mock('@/components/ui/card', () => mockCard);
 */

import React from 'react';

// Standard props interface for most UI components
interface StandardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  [key: string]: any;
}

// Button Component Mocks
export const mockButton = {
  Button: ({ children, onClick, disabled, className, ...props }: StandardProps) => 
    React.createElement('button', {
      onClick,
      disabled,
      className,
      ...props
    }, children)
};

// Card Component Mocks  
export const mockCard = {
  Card: ({ children, className }: StandardProps) => 
    React.createElement('div', { className }, children),
  CardContent: ({ children, className }: StandardProps) => 
    React.createElement('div', { className }, children),
  CardHeader: ({ children, className }: StandardProps) => 
    React.createElement('div', { className }, children),
  CardTitle: ({ children, className }: StandardProps) => 
    React.createElement('h2', { className }, children),
  CardAction: ({ children, className }: StandardProps) => 
    React.createElement('div', { className }, children)
};

// Input Component Mocks
export const mockInput = {
  Input: React.forwardRef<HTMLInputElement, StandardProps>(
    ({ className, type = "text", ...props }, ref) => 
      React.createElement('input', {
        ref,
        type,
        className,
        ...props
      })
  )
};

// Label Component Mocks
export const mockLabel = {
  Label: ({ children, className, htmlFor, ...props }: StandardProps & { htmlFor?: string }) => 
    React.createElement('label', {
      className,
      htmlFor,
      ...props
    }, children)
};

// Badge Component Mocks
export const mockBadge = {
  Badge: ({ children, className, variant, ...props }: StandardProps & { variant?: string }) => 
    React.createElement('span', {
      className,
      'data-variant': variant,
      ...props
    }, children)
};

// Checkbox Component Mocks
export const mockCheckbox = {
  Checkbox: React.forwardRef<HTMLInputElement, StandardProps & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }>(
    ({ className, checked, onCheckedChange, ...props }, ref) => 
      React.createElement('input', {
        ref,
        type: 'checkbox',
        checked,
        onChange: (e: any) => onCheckedChange?.(e.target.checked),
        className,
        ...props
      })
  )
};

// AutocompleteDropdown Component Mocks
export const mockAutocompleteDropdown = {
  AutocompleteDropdown: ({ 
    value, 
    onValueChange, 
    options = [], 
    placeholder, 
    className,
    ...props 
  }: StandardProps & { 
    value?: string; 
    onValueChange?: (value: string) => void; 
    options?: any[]; 
    placeholder?: string;
  }) => 
    React.createElement('div', {
      className,
      'data-testid': 'autocomplete-dropdown',
      ...props
    }, [
      React.createElement('input', {
        key: 'input',
        value: value || '',
        onChange: (e: any) => onValueChange?.(e.target.value),
        placeholder,
        'data-testid': 'autocomplete-input'
      }),
      React.createElement('div', {
        key: 'options',
        'data-testid': 'autocomplete-options'
      }, options.map((option, index) => 
        React.createElement('div', {
          key: index,
          onClick: () => onValueChange?.(option.value || option)
        }, option.label || option)
      ))
    ])
};

// Dialog Component Mocks (for Radix UI compatibility)
export const mockDialog = {
  Root: ({ children, open, onOpenChange }: StandardProps & { open?: boolean; onOpenChange?: (open: boolean) => void }) =>
    React.createElement('div', {
      'data-testid': 'dialog-root',
      'data-open': open,
      onClick: () => onOpenChange?.(!open)
    }, children),
  Title: ({ children, className }: StandardProps) => 
    React.createElement('div', {
      'data-testid': 'dialog-title',
      className
    }, children),
  Trigger: ({ children }: StandardProps) => children,
  Portal: ({ children }: StandardProps) => children,
  Content: ({ children, className }: StandardProps) =>
    React.createElement('div', {
      'data-testid': 'dialog-content',
      className
    }, children),
  Close: ({ children, className }: StandardProps) =>
    React.createElement('button', {
      'data-testid': 'dialog-close',
      className
    }, children)
};

// Complete UI mocks object for bulk import
export const standardUIMocks = {
  '@/components/ui/button': mockButton,
  '@/components/ui/card': mockCard,
  '@/components/ui/input': mockInput,
  '@/components/ui/label': mockLabel,
  '@/components/ui/badge': mockBadge,
  '@/components/ui/checkbox': mockCheckbox,
  '@/components/ui/autocomplete-dropdown': mockAutocompleteDropdown,
  '@radix-ui/react-dialog': mockDialog
};

// Helper function to apply all standard mocks
export function applyStandardUIMocks() {
  Object.entries(standardUIMocks).forEach(([path, mock]) => {
    // This would be used in a test setup file
    // vi.mock(path, () => mock);
  });
}

/**
 * Usage Examples:
 * 
 * // In individual test files:
 * import { mockButton, mockCard } from '@/test/utils/standard-ui-mocks';
 * vi.mock('@/components/ui/button', () => mockButton);
 * vi.mock('@/components/ui/card', () => mockCard);
 * 
 * // In test setup file:
 * import { applyStandardUIMocks } from '@/test/utils/standard-ui-mocks';
 * applyStandardUIMocks();
 */