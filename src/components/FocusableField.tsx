/**
 * FocusableField Component
 * 
 * A field wrapper component that integrates with the FocusManagerContext
 * to provide managed focus behavior with validation support, mouse overrides,
 * and keyboard navigation handlers.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useFocusManager } from '../contexts/focus/useFocusManager';
import {
  FocusableElement,
  FocusableType,
  FocusValidator,
  FocusChangeReason,
  MouseNavigationConfig,
  VisualIndicatorConfig
} from '../contexts/focus/types';
import { getFocusableType, generateElementId } from '../contexts/focus/utils';

/**
 * Props for the FocusableField component
 */
export interface FocusableFieldProps {
  /** Unique identifier for the field */
  id: string;
  
  /** Order in the focus flow (used for navigation) */
  order: number;
  
  /** Scope this field belongs to (default: 'main-form') */
  scope?: string;
  
  /** Type of focusable element */
  type?: FocusableType;
  
  /** Callback when field interaction is complete */
  onComplete?: () => boolean;
  
  /** Validation functions */
  validators?: {
    /** Determines if this field can receive focus */
    canReceiveFocus?: (source?: string) => boolean | Promise<boolean>;
    /** Determines if focus can leave this field */
    canLeaveFocus?: () => boolean | Promise<boolean>;
  };
  
  /** Mouse interaction overrides */
  mouseOverride?: {
    /** Capture and handle clicks specially */
    captureClicks?: boolean;
    /** Callback when clicking outside */
    onClickOutside?: () => void;
    /** Preserve focus flow when interacting with mouse */
    preserveFocusOnInteraction?: boolean;
    /** Allow direct jump to this field via mouse */
    allowDirectJump?: boolean;
  };
  
  /** Step indicator metadata */
  stepIndicator?: {
    /** Label for step indicator */
    label: string;
    /** Description for step indicator */
    description?: string;
    /** Allow direct access via step indicator */
    allowDirectAccess?: boolean;
  };
  
  /** Child elements to wrap */
  children: React.ReactNode;
  
  /** Additional CSS class */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
  
  /** Skip this field in keyboard navigation */
  skipInNavigation?: boolean;
  
  /** Custom tab index */
  tabIndex?: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Auto-register on mount (default: true) */
  autoRegister?: boolean;
  
  /** Parent element ID if nested */
  parentId?: string;
}

/**
 * FocusableField Component
 * 
 * Wraps form fields to provide managed focus behavior integrated with
 * the FocusManagerContext system.
 */
export const FocusableField: React.FC<FocusableFieldProps> = ({
  id,
  order,
  scope = 'main-form',
  type,
  onComplete,
  validators,
  mouseOverride,
  stepIndicator,
  children,
  className,
  style,
  skipInNavigation = false,
  tabIndex,
  metadata,
  autoRegister = true,
  parentId
}) => {
  // Reference to the wrapper div
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Track interaction mode (mouse vs keyboard)
  const [lastInteraction, setLastInteraction] = useState<'mouse' | 'keyboard'>('keyboard');
  
  // Get focus manager functions
  const {
    registerElement,
    unregisterElement,
    updateElement,
    focusNext,
    focusPrevious,
    focusField,
    setNavigationMode,
    getNavigationMode,
    state
  } = useFocusManager();
  
  // Track if this field is currently focused
  const isFocused = state.currentFocusId === id;
  
  /**
   * Register the field with the focus manager
   */
  useEffect(() => {
    if (!autoRegister) return;
    
    // Build mouse navigation config
    const mouseNavConfig: MouseNavigationConfig = {
      enableClickNavigation: mouseOverride?.captureClicks || false,
      preserveFocusOnClick: mouseOverride?.preserveFocusOnInteraction || false,
      allowDirectJump: mouseOverride?.allowDirectJump || stepIndicator?.allowDirectAccess || false,
      preserveKeyboardFlow: mouseOverride?.preserveFocusOnInteraction ?? true,
      clickAdvancesBehavior: mouseOverride?.captureClicks ? 'next' : 'none'
    };
    
    // Build visual indicator config
    const visualIndicatorConfig: VisualIndicatorConfig | undefined = stepIndicator ? {
      showInStepper: true,
      stepLabel: stepIndicator.label,
      stepDescription: stepIndicator.description
    } : undefined;
    
    // Create the focusable element
    const element: Omit<FocusableElement, 'registeredAt'> = {
      id,
      ref: wrapperRef as React.RefObject<HTMLElement>,
      type: type || FocusableType.CUSTOM,
      scopeId: scope,
      skipInNavigation,
      tabIndex: tabIndex ?? order,
      metadata: {
        ...metadata,
        order
      },
      parentId,
      canReceiveFocus: validators?.canReceiveFocus 
        ? (source?: string) => {
            const result = validators.canReceiveFocus!(source);
            return result instanceof Promise ? result : Promise.resolve(result);
          }
        : undefined,
      canLeaveFocus: validators?.canLeaveFocus 
        ? () => {
            const result = validators.canLeaveFocus!();
            return result instanceof Promise ? result : Promise.resolve(result);
          }
        : undefined,
      mouseNavigation: mouseNavConfig,
      visualIndicator: visualIndicatorConfig
    };
    
    // Register the element
    registerElement(element);
    
    // Cleanup on unmount
    return () => {
      unregisterElement(id);
    };
  }, [
    id,
    order,
    scope,
    type,
    skipInNavigation,
    tabIndex,
    metadata,
    autoRegister,
    parentId,
    validators,
    mouseOverride,
    stepIndicator,
    registerElement,
    unregisterElement
  ]);
  
  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    setLastInteraction('keyboard');
    
    // Enter key handling
    if (e.key === 'Enter' && !e.shiftKey) {
      // Check if field is complete and should advance
      const shouldAdvance = onComplete ? onComplete() : true;
      
      if (shouldAdvance) {
        e.preventDefault();
        
        // Check if focus can leave this field - handle async validators
        if (validators?.canLeaveFocus) {
          try {
            const canLeaveResult = validators.canLeaveFocus();
            const canLeave = canLeaveResult instanceof Promise 
              ? await canLeaveResult 
              : canLeaveResult;
            
            if (!canLeave) {
              console.log(`[FocusableField] Cannot leave field: ${id}`);
              return;
            }
          } catch (error) {
            console.error(`[FocusableField] Error in canLeaveFocus validator for ${id}:`, error);
            return; // Don't advance on error
          }
        }
        
        // Advance to next field - await the async operation
        try {
          await focusNext({ skipValidation: false });
        } catch (error) {
          console.error(`[FocusableField] Error advancing focus from ${id}:`, error);
        }
      }
    }
    
    // Enhanced: Ctrl+Enter for direct jump behavior
    if (e.key === 'Enter' && e.ctrlKey) {
      // Simulate direct jump by switching to hybrid mode
      setNavigationMode('hybrid' as any);
    }
    
    // Tab key navigation with auto-selection logic
    if (e.key === 'Tab') {
      // Check if focus can leave this field - handle async validators
      if (validators?.canLeaveFocus) {
        try {
          const canLeaveResult = validators.canLeaveFocus();
          const canLeave = canLeaveResult instanceof Promise 
            ? await canLeaveResult 
            : canLeaveResult;
          
          if (!canLeave) {
            e.preventDefault();
            console.log(`[FocusableField] Tab blocked - cannot leave field: ${id}`);
            
            // For dropdowns/comboboxes, try auto-selection if canLeaveFocus blocked Tab
            // This allows validators to implement auto-selection logic as shown in architecture
            // The validator should handle auto-selection and return false to block initial Tab
            // Then allow subsequent Tab after auto-selection is complete
            return;
          }
        } catch (error) {
          console.error(`[FocusableField] Error in canLeaveFocus validator for ${id}:`, error);
          e.preventDefault(); // Block navigation on error
          return;
        }
      }
      
      // Let the focus manager handle tab navigation
      // The useFocusNavigation hook in the context will handle this
      // We only prevent default if we're blocking the navigation
    }
  }, [id, onComplete, validators, focusNext, setNavigationMode]);
  
  /**
   * Handle mouse click events
   */
  const handleMouseClick = useCallback(async (e: React.MouseEvent) => {
    setLastInteraction('mouse');
    setNavigationMode('hybrid' as any);
    
    if (mouseOverride?.captureClicks) {
      e.stopPropagation();
      
      // Check if click should advance focus
      const shouldAdvance = onComplete ? onComplete() : false;
      
      if (shouldAdvance && mouseOverride.preserveFocusOnInteraction) {
        // Check if focus can leave this field - handle async validators
        if (validators?.canLeaveFocus) {
          try {
            const canLeaveResult = validators.canLeaveFocus();
            const canLeave = canLeaveResult instanceof Promise 
              ? await canLeaveResult 
              : canLeaveResult;
            
            if (!canLeave) {
              console.log(`[FocusableField] Click advance blocked - cannot leave field: ${id}`);
              return;
            }
          } catch (error) {
            console.error(`[FocusableField] Error in canLeaveFocus validator for ${id}:`, error);
            return; // Don't advance on error
          }
        }
        
        // Advance to next field - await the async operation
        try {
          await focusNext({ skipValidation: false });
        } catch (error) {
          console.error(`[FocusableField] Error advancing focus from ${id}:`, error);
        }
      }
    }
  }, [id, mouseOverride, onComplete, validators, focusNext, setNavigationMode]);
  
  /**
   * Handle focus events
   */
  const handleFocus = useCallback((e: React.FocusEvent) => {
    // Update element to track focus state
    updateElement(id, {
      metadata: {
        ...metadata,
        order,
        lastFocused: Date.now(),
        interactionMode: lastInteraction
      }
    });
    
    // If this was a mouse click and we should preserve focus flow
    if (lastInteraction === 'mouse' && mouseOverride?.preserveFocusOnInteraction) {
      // Don't disrupt the focus flow
      return;
    }
  }, [id, metadata, order, lastInteraction, mouseOverride, updateElement]);
  
  /**
   * Handle blur events
   */
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Update metadata on blur
    updateElement(id, {
      metadata: {
        ...metadata,
        order,
        lastBlurred: Date.now()
      }
    });
  }, [id, metadata, order, updateElement]);
  
  /**
   * Handle click outside if configured
   */
  useEffect(() => {
    if (!mouseOverride?.onClickOutside) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        mouseOverride.onClickOutside!();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mouseOverride?.onClickOutside]);
  
  // Build data attributes for debugging and testing
  const dataAttributes = {
    'data-focus-id': id,
    'data-focus-order': order,
    'data-focus-scope': scope,
    'data-interaction-mode': lastInteraction,
    'data-focused': isFocused ? 'true' : 'false',
    'data-can-jump': mouseOverride?.allowDirectJump || stepIndicator?.allowDirectAccess ? 'true' : 'false'
  };
  
  return (
    <div
      ref={wrapperRef}
      className={className}
      style={style}
      onKeyDown={handleKeyDown}
      onClick={handleMouseClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={-1} // Wrapper itself shouldn't be in tab order
      {...dataAttributes}
    >
      {children}
    </div>
  );
};

/**
 * Default export
 */
export default FocusableField;