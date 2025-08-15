# Comprehensive Focus Management Migration Plan

## Executive Summary
Implement a unified focus management system combining a custom FocusManagerContext with Radix UI Dialog components to handle complex focus flows throughout the medication management application.

## Architecture Overview

### Core Design Principles
1. **Separation of Concerns**: Radix handles modal-specific focus (trapping, restoration), FocusManager handles application flow
2. **Progressive Enhancement**: Can migrate incrementally without breaking existing functionality
3. **Type Safety**: Full TypeScript support with strongly typed focus nodes and flows
4. **Accessibility First**: WCAG 2.1 compliant keyboard navigation and screen reader support

### System Architecture
```
┌─────────────────────────────────────┐
│         FocusManagerContext         │ ← Orchestration Layer
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐ │
│  │ Focus Flow  │  │   Registry    │ │
│  │   Engine    │  │   Manager     │ │
│  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
           ↓                ↓
┌─────────────────┐  ┌──────────────┐
│  ManagedDialog  │  │ FocusableField│ ← Component Layer
│  (Radix Wrapper)│  │   Wrapper     │
└─────────────────┘  └──────────────┘
           ↓                ↓
┌─────────────────────────────────────┐
│        Application Components        │ ← Implementation Layer
│  • MedicationEntry  • DateSelection │
│  • SideEffects      • CategorySelect│
└─────────────────────────────────────┘
```

## Phase 1: Core Infrastructure (Week 1)

### 1.1 Create FocusManagerContext with Mouse Navigation Support
```typescript
// src/contexts/FocusManagerContext.tsx
import { createContext, useContext, useState, useRef, useCallback } from 'react';

// Mouse navigation configuration
interface MouseNavigationConfig {
  enableClickNavigation: boolean;
  preserveFocusOnClick: boolean;
  clickAdvancesBehavior: 'next' | 'specific' | 'none';
}

interface FocusNode {
  id: string;
  ref: RefObject<HTMLElement>;
  order: number;
  scope: string;
  validators?: {
    canReceiveFocus?: () => boolean;
    canLeaveFocus?: () => boolean;
  };
  metadata?: {
    label?: string;
    type?: 'field' | 'button' | 'modal-trigger';
  };
  // Mouse navigation support
  mouseNavigation?: {
    clickHandler?: (e: MouseEvent) => void;
    allowDirectJump?: boolean;
    preserveKeyboardFlow?: boolean;
  };
  // Visual indicator for step components
  visualIndicator?: {
    showInStepper?: boolean;
    stepLabel?: string;
    stepDescription?: string;
  };
}

// Step indicator data for visual progress tracking
interface StepIndicatorData {
  id: string;
  label: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming' | 'disabled';
  isClickable: boolean;
}

interface FocusManagerContextValue {
  registerNode: (node: FocusNode) => void;
  unregisterNode: (id: string) => void;
  focusNext: (fromId?: string) => void;
  focusPrevious: (fromId?: string) => void;
  focusField: (id: string) => void;
  pushModalScope: (modalId: string) => void;
  popModalScope: () => void;
  getCurrentFocus: () => string | null;
  isModalOpen: () => boolean;
  getModalStack: () => string[];
  // Mouse navigation methods
  handleMouseNavigation: (nodeId: string, event: MouseEvent) => void;
  setNavigationMode: (mode: 'keyboard' | 'mouse' | 'hybrid') => void;
  getNavigationMode: () => 'keyboard' | 'mouse' | 'hybrid';
  canJumpToNode: (nodeId: string) => boolean;
  getVisibleSteps: () => StepIndicatorData[];
}

const FocusManagerContext = createContext<FocusManagerContextValue | null>(null);

export const FocusManagerProvider = ({ children }) => {
  // Core state
  const [registry] = useState(new Map<string, FocusNode>());
  const [modalStack, setModalStack] = useState<string[]>([]);
  const [focusHistory] = useState<string[]>([]);
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  
  // Mouse navigation state
  const [navigationMode, setNavigationMode] = useState<'keyboard' | 'mouse' | 'hybrid'>('keyboard');
  const [mouseNavigationHistory] = useState<string[]>([]);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  
  // Track focus history for restoration
  const previousFocusStack = useRef<string[]>([]);
  
  // Register a focusable element
  const registerNode = useCallback((node: FocusNode) => {
    registry.set(node.id, node);
    console.log(`[FocusManager] Registered node: ${node.id}`);
  }, [registry]);
  
  // Unregister a focusable element
  const unregisterNode = useCallback((id: string) => {
    registry.delete(id);
    console.log(`[FocusManager] Unregistered node: ${id}`);
  }, [registry]);
  
  // Execute focus on a specific node
  const executeFocus = useCallback((nodeId: string) => {
    const node = registry.get(nodeId);
    if (!node) {
      console.warn(`[FocusManager] Node not found: ${nodeId}`);
      return;
    }
    
    // Check if node can receive focus
    if (node.validators?.canReceiveFocus?.() === false) {
      console.log(`[FocusManager] Node cannot receive focus: ${nodeId}`);
      return;
    }
    
    // Find the actual focusable element
    const element = node.ref.current;
    if (!element) {
      console.warn(`[FocusManager] Element not found for node: ${nodeId}`);
      return;
    }
    
    // Try to find input/button/select within the element
    const focusableElement = element.querySelector('input, button, select, textarea') as HTMLElement;
    const targetElement = focusableElement || element;
    
    // Set focus with a small delay to ensure DOM is ready
    setTimeout(() => {
      targetElement.focus();
      setCurrentFocus(nodeId);
      focusHistory.push(nodeId);
      console.log(`[FocusManager] Focused: ${nodeId}`);
    }, 50);
  }, [registry, focusHistory]);
  
  // Focus navigation
  const focusNext = useCallback((fromId?: string) => {
    const current = fromId || currentFocus;
    if (!current) {
      console.warn('[FocusManager] No current focus to navigate from');
      return;
    }
    
    const currentNode = registry.get(current);
    if (!currentNode) {
      console.warn(`[FocusManager] Current node not found: ${current}`);
      return;
    }
    
    // Get nodes in same scope, sorted by order
    const scopeNodes = Array.from(registry.values())
      .filter(n => n.scope === currentNode.scope)
      .sort((a, b) => a.order - b.order);
    
    // Find next valid node
    const currentIndex = scopeNodes.findIndex(n => n.id === current);
    for (let i = currentIndex + 1; i < scopeNodes.length; i++) {
      const node = scopeNodes[i];
      if (node.validators?.canReceiveFocus?.() !== false) {
        executeFocus(node.id);
        break;
      }
    }
  }, [currentFocus, registry, executeFocus]);
  
  // Focus previous element
  const focusPrevious = useCallback((fromId?: string) => {
    const current = fromId || currentFocus;
    if (!current) return;
    
    const currentNode = registry.get(current);
    if (!currentNode) return;
    
    const scopeNodes = Array.from(registry.values())
      .filter(n => n.scope === currentNode.scope)
      .sort((a, b) => a.order - b.order);
    
    const currentIndex = scopeNodes.findIndex(n => n.id === current);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const node = scopeNodes[i];
      if (node.validators?.canReceiveFocus?.() !== false) {
        executeFocus(node.id);
        break;
      }
    }
  }, [currentFocus, registry, executeFocus]);
  
  // Direct focus to specific field
  const focusField = useCallback((id: string) => {
    executeFocus(id);
  }, [executeFocus]);
  
  // Modal scope management
  const pushModalScope = useCallback((modalId: string) => {
    previousFocusStack.current.push(currentFocus || '');
    setModalStack(prev => [...prev, modalId]);
    console.log(`[FocusManager] Pushed modal scope: ${modalId}`);
  }, [currentFocus]);
  
  const popModalScope = useCallback(() => {
    const lastFocus = previousFocusStack.current.pop();
    setModalStack(prev => prev.slice(0, -1));
    
    // Restore focus after modal closes
    if (lastFocus) {
      setTimeout(() => {
        focusField(lastFocus);
      }, 100);
    }
    console.log('[FocusManager] Popped modal scope');
  }, [focusField]);
  
  // Mouse navigation handler
  const handleMouseNavigation = useCallback((nodeId: string, event: MouseEvent) => {
    const node = registry.get(nodeId);
    if (!node) {
      console.warn(`[FocusManager] Node not found for mouse navigation: ${nodeId}`);
      return;
    }
    
    // Check if mouse navigation is allowed for this node
    if (!node.mouseNavigation?.allowDirectJump && !canJumpToNode(nodeId)) {
      console.log(`[FocusManager] Direct jump not allowed to: ${nodeId}`);
      // Could trigger visual feedback here
      return;
    }
    
    // Handle navigation based on mode
    if (navigationMode === 'hybrid' || navigationMode === 'mouse') {
      // Execute focus with mouse-specific behavior
      executeFocus(nodeId);
      
      // Update mouse navigation history
      mouseNavigationHistory.push(nodeId);
      
      // Call custom click handler if provided
      node.mouseNavigation?.clickHandler?.(event);
    }
  }, [navigationMode, registry, executeFocus, mouseNavigationHistory]);
  
  // Check if jumping to a node is allowed
  const canJumpToNode = useCallback((nodeId: string) => {
    const node = registry.get(nodeId);
    if (!node) return false;
    
    // Check validators
    if (node.validators?.canReceiveFocus?.() === false) {
      return false;
    }
    
    // Check if all required previous nodes are complete
    // This logic can be customized based on your flow requirements
    const scopeNodes = Array.from(registry.values())
      .filter(n => n.scope === node.scope && n.order < node.order);
    
    // For now, allow jumping if the node allows it
    return node.mouseNavigation?.allowDirectJump ?? false;
  }, [registry]);
  
  // Get visible steps for step indicator
  const getVisibleSteps = useCallback((): StepIndicatorData[] => {
    const steps: StepIndicatorData[] = [];
    
    registry.forEach((node) => {
      if (node.visualIndicator?.showInStepper) {
        steps.push({
          id: node.id,
          label: node.visualIndicator.stepLabel || node.id,
          description: node.visualIndicator.stepDescription,
          status: determineStepStatus(node.id),
          isClickable: canJumpToNode(node.id)
        });
      }
    });
    
    return steps.sort((a, b) => {
      const nodeA = registry.get(a.id);
      const nodeB = registry.get(b.id);
      return (nodeA?.order ?? 0) - (nodeB?.order ?? 0);
    });
  }, [registry, currentFocus, canJumpToNode]);
  
  // Helper to determine step status
  const determineStepStatus = (nodeId: string): 'complete' | 'current' | 'upcoming' | 'disabled' => {
    if (nodeId === currentFocus) return 'current';
    
    const node = registry.get(nodeId);
    if (!node) return 'disabled';
    
    // Check if this step has been visited
    if (focusHistory.includes(nodeId) || mouseNavigationHistory.includes(nodeId)) {
      return 'complete';
    }
    
    // Check if node can receive focus
    if (node.validators?.canReceiveFocus?.() === false) {
      return 'disabled';
    }
    
    return 'upcoming';
  };
  
  // Detect and adapt to user's preferred navigation method
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moved = Math.abs(e.clientX - lastMousePosition.x) > 5 || 
                   Math.abs(e.clientY - lastMousePosition.y) > 5;
      if (moved) {
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        if (navigationMode === 'keyboard') {
          setNavigationMode('hybrid');
        }
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (navigationMode === 'mouse') {
          setNavigationMode('hybrid');
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigationMode, lastMousePosition]);
  
  const value = {
    registerNode,
    unregisterNode,
    focusNext,
    focusPrevious,
    focusField,
    pushModalScope,
    popModalScope,
    getCurrentFocus: () => currentFocus,
    isModalOpen: () => modalStack.length > 0,
    getModalStack: () => modalStack,
    handleMouseNavigation,
    setNavigationMode,
    getNavigationMode: () => navigationMode,
    canJumpToNode,
    getVisibleSteps
  };
  
  return (
    <FocusManagerContext.Provider value={value}>
      {children}
    </FocusManagerContext.Provider>
  );
};

export const useFocusManager = () => {
  const context = useContext(FocusManagerContext);
  if (!context) {
    throw new Error('useFocusManager must be used within FocusManagerProvider');
  }
  return context;
};
```

### 1.2 Create ManagedDialog Wrapper
```typescript
// src/components/ManagedDialog.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect } from 'react';
import { useFocusManager } from '../contexts/FocusManagerContext';

interface ManagedDialogProps extends Dialog.DialogProps {
  id: string;
  trigger?: React.ReactNode;
  onComplete?: () => void;
  focusRestorationId?: string;
  children: React.ReactNode;
}

export const ManagedDialog = ({ 
  id, 
  trigger,
  children, 
  onComplete,
  focusRestorationId,
  ...props 
}: ManagedDialogProps) => {
  const { pushModalScope, popModalScope, focusField, registerNode } = useFocusManager();
  
  useEffect(() => {
    registerNode({
      id,
      ref: { current: null },
      order: 0,
      scope: 'modal-layer',
      metadata: { type: 'modal-trigger' }
    });
  }, [id, registerNode]);
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
      pushModalScope(id);
    } else {
      popModalScope();
      if (focusRestorationId) {
        setTimeout(() => focusField(focusRestorationId), 100);
      }
      onComplete?.();
    }
    props.onOpenChange?.(open);
  };
  
  return (
    <Dialog.Root onOpenChange={handleOpenChange} {...props}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg p-6 max-w-md w-full animate-in zoom-in-95">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

### 1.3 Create StepIndicator Component
```typescript
// src/components/StepIndicator.tsx
import { cn } from '../utils/cn';
import { useFocusManager } from '../contexts/FocusManagerContext';

interface StepIndicatorProps {
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    status: 'complete' | 'current' | 'upcoming' | 'disabled';
    isClickable: boolean;
  }>;
  onStepClick?: (stepId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  allowJumping?: boolean;
}

export const StepIndicator = ({
  steps,
  onStepClick,
  orientation = 'horizontal',
  showConnectors = true,
  allowJumping = false
}: StepIndicatorProps) => {
  const { 
    handleMouseNavigation, 
    canJumpToNode,
    setNavigationMode,
    getCurrentFocus 
  } = useFocusManager();
  
  const handleStepClick = (stepId: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    // Set navigation mode to hybrid when clicking steps
    setNavigationMode('hybrid');
    
    // Check if jumping is allowed
    if (!allowJumping && !canJumpToNode(stepId)) {
      // Optionally show tooltip explaining why jump is disabled
      console.log(`Cannot jump to step: ${stepId}`);
      return;
    }
    
    // Handle the mouse navigation through context
    handleMouseNavigation(stepId, event.nativeEvent);
    
    // Call parent handler if provided
    onStepClick?.(stepId);
  };
  
  return (
    <div 
      className={cn(
        "step-indicator",
        orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col'
      )}
      role="navigation"
      aria-label="Form progress"
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            className={cn(
              "step-indicator-item",
              step.status === 'current' && "step-current",
              step.status === 'complete' && "step-complete",
              step.status === 'disabled' && "step-disabled opacity-50 cursor-not-allowed"
            )}
            onClick={(e) => step.isClickable && handleStepClick(step.id, e)}
            disabled={!step.isClickable}
            aria-current={step.status === 'current' ? 'step' : undefined}
            aria-label={`${step.label}${step.status === 'complete' ? ' (completed)' : ''}`}
            data-step-id={step.id}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step.label}</span>
            {step.description && (
              <span className="step-description text-sm text-gray-500">
                {step.description}
              </span>
            )}
          </button>
          
          {showConnectors && index < steps.length - 1 && (
            <div 
              className={cn(
                "step-connector",
                steps[index + 1].status !== 'upcoming' && "step-connector-active"
              )}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
```

### 1.4 Create FocusableField Component with Mouse Support
```typescript
// src/components/FocusableField.tsx
import { useEffect, useRef } from 'react';
import { useFocusManager } from '../contexts/FocusManagerContext';

interface FocusableFieldProps {
  id: string;
  order: number;
  scope?: string;
  onComplete?: () => boolean;
  validators?: {
    canReceiveFocus?: () => boolean;
    canLeaveFocus?: () => boolean;
  };
  mouseOverride?: {
    captureClicks?: boolean;
    onClickOutside?: () => void;
    preserveFocusOnInteraction?: boolean;
  };
  stepIndicator?: {
    label: string;
    description?: string;
    allowDirectAccess?: boolean;
  };
  children: React.ReactNode;
  className?: string;
}

export const FocusableField = ({ 
  id, 
  order, 
  scope = 'main-form',
  onComplete,
  validators,
  mouseOverride,
  stepIndicator,
  children,
  className
}: FocusableFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { 
    registerNode, 
    unregisterNode, 
    focusNext, 
    focusPrevious,
    setNavigationMode,
    getNavigationMode 
  } = useFocusManager();
  
  // Track interaction mode
  const [lastInteraction, setLastInteraction] = useState<'mouse' | 'keyboard'>('keyboard');
  
  useEffect(() => {
    registerNode({
      id,
      ref,
      order,
      scope,
      validators,
      mouseNavigation: {
        allowDirectJump: stepIndicator?.allowDirectAccess ?? false,
        preserveKeyboardFlow: mouseOverride?.preserveFocusOnInteraction ?? true,
        clickHandler: mouseOverride?.captureClicks ? handleMouseClick : undefined
      },
      visualIndicator: stepIndicator ? {
        showInStepper: true,
        stepLabel: stepIndicator.label,
        stepDescription: stepIndicator.description
      } : undefined
    });
    
    return () => unregisterNode(id);
  }, [id, order, scope, validators, mouseOverride, stepIndicator, registerNode, unregisterNode]);
  
  const handleMouseClick = (e: React.MouseEvent) => {
    setLastInteraction('mouse');
    setNavigationMode('hybrid');
    
    if (mouseOverride?.captureClicks) {
      e.stopPropagation();
      
      // Check if click should advance focus
      const shouldAdvance = onComplete ? onComplete() : false;
      if (shouldAdvance && mouseOverride.preserveFocusOnInteraction) {
        focusNext(id);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setLastInteraction('keyboard');
    
    // Enter key advances to next field
    if (e.key === 'Enter' && !e.shiftKey) {
      const shouldAdvance = onComplete ? onComplete() : true;
      if (shouldAdvance) {
        e.preventDefault();
        focusNext(id);
      }
    }
    
    // Enhanced: Allow Ctrl+Click behavior via keyboard
    if (e.key === 'Enter' && e.ctrlKey) {
      // Simulate direct jump behavior
      setNavigationMode('hybrid');
    }
    
    // Tab key navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        focusPrevious(id);
      } else {
        focusNext(id);
      }
    }
  };
  
  return (
    <div 
      ref={ref}
      onKeyDown={handleKeyDown}
      onClick={handleMouseClick}
      onFocus={() => {
        if (lastInteraction === 'mouse' && mouseOverride?.preserveFocusOnInteraction) {
          // Preserve focus flow even when clicked
          return;
        }
      }}
      data-focus-id={id}
      data-interaction-mode={lastInteraction}
      className={className}
    >
      {children}
    </div>
  );
};
```

## Phase 2: Migration - Medication Entry Form (Week 2)

### 2.1 Migrate MedicationSearch
```typescript
// Before:
<div className="space-y-4">
  <Input 
    ref={inputRef}
    placeholder="Search medications..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onFocus={() => {
      // Complex focus logic
      if (searchQuery.length > 2) {
        setShowDropdown(true);
      }
    }}
  />
</div>

// After:
<FocusableField 
  id="medication-search" 
  order={1}
  onComplete={() => searchQuery.length > 2}
  validators={{
    canLeaveFocus: () => searchQuery.length > 0
  }}
>
  <Input 
    ref={inputRef}
    placeholder="Search medications..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</FocusableField>
```

### 2.2 Migrate CategorySelection with Modals
```typescript
// Before:
<Button
  ref={broadCategoriesButtonRef}
  onClick={() => setShowBroadCategoriesModal(true)}
  onFocus={() => {
    // Auto-open modal on focus
    if (!showBroadCategoriesModal) {
      setShowBroadCategoriesModal(true);
    }
  }}
>
  {selectedBroadCategories.length > 0 
    ? `${selectedBroadCategories.length} selected`
    : 'Select Broad Categories'}
</Button>

// After:
<FocusableField id="broad-categories" order={2}>
  <ManagedDialog 
    id="broad-categories-modal"
    trigger={
      <Button>
        {selectedBroadCategories.length > 0 
          ? `${selectedBroadCategories.length} selected`
          : 'Select Broad Categories'}
      </Button>
    }
    onComplete={() => {
      // Focus advances to next field automatically
    }}
    focusRestorationId="specific-categories"
  >
    <Dialog.Title>Select Broad Categories</Dialog.Title>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {broadCategories.map(category => (
        <Checkbox
          key={category.id}
          checked={selectedBroadCategories.includes(category.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              addBroadCategory(category.id);
            } else {
              removeBroadCategory(category.id);
            }
          }}
        >
          {category.name}
        </Checkbox>
      ))}
    </div>
    <Dialog.Close asChild>
      <Button>Done</Button>
    </Dialog.Close>
  </ManagedDialog>
</FocusableField>
```

### 2.3 Migrate DateSelection with Calendar
```typescript
// After migration:
<FocusableField id="start-date" order={3}>
  <ManagedDialog
    id="start-date-calendar"
    trigger={
      <Button variant={startDate ? 'default' : 'outline'}>
        <CalendarIcon className="mr-2" />
        {startDate ? formatDate(startDate) : 'Select Start Date'}
      </Button>
    }
    focusRestorationId="discontinue-date"
  >
    <Dialog.Title>Select Start Date</Dialog.Title>
    <Calendar
      mode="single"
      selected={startDate}
      onSelect={(date) => {
        vm.setStartDate(date);
        // Dialog will close and focus will advance automatically
      }}
      disabled={(date) => date > new Date()}
    />
    <div className="flex gap-2 mt-4">
      <Dialog.Close asChild>
        <Button variant="outline">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close asChild>
        <Button onClick={() => vm.setStartDate(selectedDate)}>
          Done
        </Button>
      </Dialog.Close>
    </div>
  </ManagedDialog>
</FocusableField>

<FocusableField 
  id="discontinue-date" 
  order={4}
  validators={{
    canReceiveFocus: () => !!startDate // Only focusable if start date is set
  }}
>
  <ManagedDialog
    id="discontinue-date-calendar"
    trigger={
      <Button 
        variant={discontinueDate ? 'default' : 'outline'}
        disabled={!startDate}
      >
        <CalendarIcon className="mr-2" />
        {discontinueDate ? formatDate(discontinueDate) : 'Select Discontinuation Date'}
      </Button>
    }
    focusRestorationId="side-effects"
  >
    <Dialog.Title>Select Discontinuation Date</Dialog.Title>
    <Calendar
      mode="single"
      selected={discontinueDate}
      onSelect={(date) => {
        vm.setDiscontinueDate(date);
      }}
      disabled={(date) => date < startDate}
    />
  </ManagedDialog>
</FocusableField>
```

### 2.4 Migrate SideEffects with Nested Modals
```typescript
// Complex nested modal example:
<FocusableField id="side-effects" order={5}>
  <ManagedDialog
    id="side-effects-modal"
    trigger={
      <Button variant={selectedSideEffects.length > 0 ? 'default' : 'outline'}>
        {selectedSideEffects.length > 0 
          ? `${selectedSideEffects.length} side effects selected`
          : 'Select Side Effects'}
      </Button>
    }
    onComplete={() => {
      if (selectedSideEffects.includes('Other Side Effects')) {
        // Will open nested modal
        setShowOtherModal(true);
      }
    }}
  >
    <Dialog.Title>Select Side Effects</Dialog.Title>
    
    {/* Search input */}
    <Input
      placeholder="Search side effects..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="mb-4"
    />
    
    {/* Side effects list */}
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {filteredSideEffects.map(effect => (
        <Checkbox
          key={effect}
          checked={selectedSideEffects.includes(effect)}
          onCheckedChange={(checked) => {
            if (checked) {
              addSideEffect(effect);
            } else {
              removeSideEffect(effect);
            }
          }}
        >
          {effect}
        </Checkbox>
      ))}
    </div>
    
    <Dialog.Close asChild>
      <Button className="mt-4">Done</Button>
    </Dialog.Close>
    
    {/* Nested modal for "Other Side Effects" */}
    <ManagedDialog
      id="other-side-effects-modal"
      open={showOtherModal}
      onOpenChange={setShowOtherModal}
      onComplete={() => {
        // After other side effects modal closes, advance focus
        focusNext('side-effects');
      }}
    >
      <Dialog.Title>Describe Other Side Effects</Dialog.Title>
      <Textarea
        autoFocus
        placeholder="Please describe other side effects..."
        value={otherSideEffectsText}
        onChange={(e) => setOtherSideEffectsText(e.target.value)}
        className="min-h-32"
      />
      <div className="flex gap-2 mt-4">
        <Dialog.Close asChild>
          <Button 
            variant="outline"
            onClick={() => {
              // Remove "Other Side Effects" from selection
              removeSideEffect('Other Side Effects');
            }}
          >
            Skip
          </Button>
        </Dialog.Close>
        <Dialog.Close asChild>
          <Button 
            disabled={!otherSideEffectsText.trim()}
          >
            Done
          </Button>
        </Dialog.Close>
      </div>
    </ManagedDialog>
  </ManagedDialog>
</FocusableField>
```

## Phase 2.5: Integration with Step Indicators

### Example: MedicationEntry with Visual Step Indicators
```typescript
// src/views/medication/MedicationEntryWithStepper.tsx
import { useMemo } from 'react';
import { useViewModel } from '../hooks/useViewModel';
import { MedicationEntryViewModel } from '../viewModels/medication/MedicationEntryViewModel';
import { StepIndicator } from '../components/StepIndicator';
import { FocusableField } from '../components/FocusableField';
import { useFocusManager } from '../contexts/FocusManagerContext';

const MedicationEntryWithStepper = () => {
  const vm = useViewModel(MedicationEntryViewModel);
  const { getVisibleSteps, getCurrentFocus } = useFocusManager();
  
  // Define steps based on form state
  const steps = useMemo(() => [
    {
      id: 'medication-search',
      label: 'Medication',
      description: 'Search and select medication',
      status: vm.selectedMedication ? 'complete' : 
              getCurrentFocus() === 'medication-search' ? 'current' : 'upcoming',
      isClickable: true
    },
    {
      id: 'dosage-form',
      label: 'Dosage',
      description: 'Select dosage form',
      status: vm.dosageForm ? 'complete' : 
              getCurrentFocus() === 'dosage-form' ? 'current' : 'upcoming',
      isClickable: !!vm.selectedMedication
    },
    {
      id: 'categories',
      label: 'Categories',
      description: 'Assign categories',
      status: vm.categoriesCompleted ? 'complete' : 
              getCurrentFocus()?.includes('categories') ? 'current' : 'upcoming',
      isClickable: !!vm.dosageForm
    },
    {
      id: 'dates',
      label: 'Dates',
      description: 'Set medication dates',
      status: vm.startDate ? 'complete' : 
              getCurrentFocus()?.includes('date') ? 'current' : 'upcoming',
      isClickable: vm.categoriesCompleted
    },
    {
      id: 'side-effects',
      label: 'Side Effects',
      description: 'Record side effects',
      status: vm.sideEffects.length > 0 ? 'complete' : 
              getCurrentFocus() === 'side-effects' ? 'current' : 'upcoming',
      isClickable: !!vm.startDate
    }
  ], [vm, getCurrentFocus]);
  
  return (
    <div className="medication-entry-container">
      {/* Visual step indicator at the top */}
      <StepIndicator
        steps={steps}
        orientation="horizontal"
        allowJumping={false} // Enforce sequential completion
        onStepClick={(stepId) => {
          // Analytics or custom handling
          console.log('Step clicked:', stepId);
        }}
      />
      
      <div className="form-content mt-6">
        {/* Medication Search with mouse override */}
        <FocusableField
          id="medication-search"
          order={1}
          mouseOverride={{
            captureClicks: true,
            preserveFocusOnInteraction: true
          }}
          stepIndicator={{
            label: 'Select Medication',
            description: 'Search and select a medication',
            allowDirectAccess: true
          }}
        >
          <MedicationSearch 
            value={vm.searchQuery}
            onChange={vm.setSearchQuery}
            onSelect={vm.selectMedication}
          />
        </FocusableField>
        
        {/* Dosage Form */}
        <FocusableField
          id="dosage-form"
          order={2}
          validators={{
            canReceiveFocus: () => !!vm.selectedMedication
          }}
          stepIndicator={{
            label: 'Dosage Form',
            description: 'Select the form of medication',
            allowDirectAccess: false
          }}
        >
          <DosageFormSelect
            value={vm.dosageForm}
            onChange={vm.setDosageForm}
            disabled={!vm.selectedMedication}
          />
        </FocusableField>
        
        {/* Categories with Modal */}
        <FocusableField
          id="categories"
          order={3}
          validators={{
            canReceiveFocus: () => !!vm.dosageForm
          }}
          stepIndicator={{
            label: 'Categories',
            description: 'Assign medication categories',
            allowDirectAccess: false
          }}
        >
          <ManagedDialog
            id="categories-modal"
            trigger={
              <Button variant={vm.categories.length > 0 ? 'default' : 'outline'}>
                {vm.categories.length > 0 
                  ? `${vm.categories.length} categories selected`
                  : 'Select Categories'}
              </Button>
            }
            onComplete={() => vm.setCategoriesCompleted(true)}
            focusRestorationId="dates"
          >
            <CategorySelector
              selected={vm.categories}
              onChange={vm.setCategories}
            />
          </ManagedDialog>
        </FocusableField>
        
        {/* Continue with other fields... */}
      </div>
    </div>
  );
};
```

## Phase 3: Focus Flow Configuration (Week 3)

### 3.1 Define Focus Flows
```typescript
// src/config/focusFlows.ts
export interface FocusFlow {
  id: string;
  name: string;
  nodes: FocusFlowNode[];
  branches?: Record<string, FocusBranch>;
  validators?: Record<string, () => boolean>;
}

export interface FocusFlowNode {
  id: string;
  order: number;
  required: boolean;
  skipIf?: string; // Reference to validator function
}

export interface FocusBranch {
  condition: string;
  truePath: string;
  falsePath: string;
}

export const medicationEntryFlow: FocusFlow = {
  id: 'medication-entry',
  name: 'Medication Entry Flow',
  nodes: [
    { id: 'medication-search', order: 1, required: true },
    { id: 'broad-categories', order: 2, required: true },
    { id: 'specific-categories', order: 3, required: false },
    { id: 'start-date', order: 4, required: true },
    { id: 'discontinue-date', order: 5, required: false },
    { id: 'side-effects', order: 6, required: false },
    { id: 'dosage-form', order: 7, required: true },
    { id: 'save-button', order: 8, required: true }
  ],
  branches: {
    'side-effects': {
      condition: 'hasOtherSideEffects',
      truePath: 'other-side-effects-modal',
      falsePath: 'save-button'
    }
  },
  validators: {
    hasOtherSideEffects: () => {
      // Check if "Other Side Effects" is selected
      return selectedSideEffects.includes('Other Side Effects');
    }
  }
};
```

### 3.2 Implement Flow Engine
```typescript
// src/hooks/useFocusFlow.ts
import { useEffect } from 'react';
import { useFocusManager } from '../contexts/FocusManagerContext';
import { FocusFlow } from '../config/focusFlows';

export const useFocusFlow = (flow: FocusFlow) => {
  const { getCurrentFocus, focusField, registerNode } = useFocusManager();
  
  useEffect(() => {
    // Register all nodes in the flow
    flow.nodes.forEach(node => {
      registerNode({
        id: node.id,
        ref: { current: null },
        order: node.order,
        scope: flow.id,
        validators: {
          canReceiveFocus: () => {
            if (node.skipIf && flow.validators?.[node.skipIf]) {
              return !flow.validators[node.skipIf]();
            }
            return true;
          }
        }
      });
    });
  }, [flow, registerNode]);
  
  const getNextInFlow = (currentId: string): string | null => {
    const currentNode = flow.nodes.find(n => n.id === currentId);
    if (!currentNode) return null;
    
    // Check for branching logic
    const branch = flow.branches?.[currentId];
    if (branch && flow.validators?.[branch.condition]) {
      const condition = flow.validators[branch.condition]();
      return condition ? branch.truePath : branch.falsePath;
    }
    
    // Find next node in order
    const nextNodes = flow.nodes
      .filter(n => n.order > currentNode.order)
      .sort((a, b) => a.order - b.order);
    
    // Skip nodes that don't meet conditions
    for (const node of nextNodes) {
      if (node.skipIf && flow.validators?.[node.skipIf]) {
        if (flow.validators[node.skipIf]()) continue;
      }
      return node.id;
    }
    
    return null;
  };
  
  const advanceInFlow = () => {
    const current = getCurrentFocus();
    if (!current) return;
    
    const next = getNextInFlow(current);
    if (next) {
      focusField(next);
    }
  };
  
  return { advanceInFlow, getNextInFlow };
};
```

## Phase 4: Testing & Validation (Week 4)

### 4.1 Focus Flow Test Suite
```typescript
// src/__tests__/focusFlow.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FocusManagerProvider } from '../contexts/FocusManagerContext';
import { MedicationEntryModal } from '../views/medication/MedicationEntryModal';

describe('Medication Entry Focus Flow', () => {
  const renderWithFocusManager = (component: React.ReactNode) => {
    return render(
      <FocusManagerProvider>
        {component}
      </FocusManagerProvider>
    );
  };
  
  it('should follow correct flow from search to save', async () => {
    const { getByTestId } = renderWithFocusManager(<MedicationEntryModal />);
    
    // Start at search
    const searchInput = getByTestId('medication-search');
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);
    
    // Type medication name
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    // Press Enter to advance
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    
    // Should focus broad categories button
    await waitFor(() => {
      const broadCategoriesBtn = getByTestId('broad-categories-button');
      expect(document.activeElement).toBe(broadCategoriesBtn);
    });
    
    // Press Enter to open modal
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    
    // Modal should open and trap focus
    await waitFor(() => {
      const modalContent = getByTestId('broad-categories-modal');
      expect(modalContent).toBeInTheDocument();
    });
    
    // Select categories and close modal
    const doneButton = getByTestId('broad-categories-done');
    fireEvent.click(doneButton);
    
    // Should advance to specific categories
    await waitFor(() => {
      const specificCategoriesBtn = getByTestId('specific-categories-button');
      expect(document.activeElement).toBe(specificCategoriesBtn);
    });
    
    // Continue through flow...
  });
  
  it('should handle modal focus correctly', async () => {
    const { getByTestId } = renderWithFocusManager(<MedicationEntryModal />);
    
    // Open side effects modal
    const sideEffectsBtn = getByTestId('side-effects-button');
    fireEvent.click(sideEffectsBtn);
    
    // Focus should be trapped in modal
    await waitFor(() => {
      const modal = getByTestId('side-effects-modal');
      expect(modal).toBeInTheDocument();
    });
    
    // Tab through modal elements
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    
    // Should cycle within modal
    const firstElement = document.activeElement;
    
    // Tab to last element
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    }
    
    // Next tab should wrap to first element
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(firstElement);
    
    // Escape should close modal
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    
    // Focus should return to trigger button
    await waitFor(() => {
      expect(document.activeElement).toBe(sideEffectsBtn);
    });
  });
  
  it('should handle nested modals correctly', async () => {
    const { getByTestId, getByText } = renderWithFocusManager(<MedicationEntryModal />);
    
    // Open side effects modal
    const sideEffectsBtn = getByTestId('side-effects-button');
    fireEvent.click(sideEffectsBtn);
    
    // Select "Other Side Effects"
    await waitFor(() => {
      const otherCheckbox = getByText('Other Side Effects');
      fireEvent.click(otherCheckbox);
    });
    
    // Click Done to trigger nested modal
    const doneButton = getByTestId('side-effects-done');
    fireEvent.click(doneButton);
    
    // Other side effects modal should open
    await waitFor(() => {
      const otherModal = getByTestId('other-side-effects-modal');
      expect(otherModal).toBeInTheDocument();
    });
    
    // Focus should be on textarea
    const textarea = getByTestId('other-side-effects-input');
    expect(document.activeElement).toBe(textarea);
    
    // Type description
    fireEvent.change(textarea, { target: { value: 'Mild headache' } });
    
    // Close nested modal
    const otherDoneBtn = getByTestId('other-side-effects-done');
    fireEvent.click(otherDoneBtn);
    
    // Both modals should be closed, focus on save button
    await waitFor(() => {
      const saveBtn = getByTestId('medication-save-button');
      expect(document.activeElement).toBe(saveBtn);
    });
  });
  
  describe('Mixed Mouse/Keyboard Navigation', () => {
    it('should handle mouse clicks on step indicators', async () => {
      const { getByTestId, getByLabelText } = renderWithFocusManager(
        <MedicationEntryWithStepper />
      );
      
      // Complete first step via keyboard
      const searchInput = getByTestId('medication-search');
      fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      // Should advance to dosage form
      await waitFor(() => {
        const dosageForm = getByTestId('dosage-form');
        expect(document.activeElement).toBe(dosageForm);
      });
      
      // Click on step indicator to jump back
      const medicationStep = getByLabelText('Medication (completed)');
      fireEvent.click(medicationStep);
      
      // Focus should return to medication search
      await waitFor(() => {
        expect(document.activeElement).toBe(searchInput);
      });
      
      // Navigation mode should be 'hybrid'
      const { getNavigationMode } = useFocusManager();
      expect(getNavigationMode()).toBe('hybrid');
    });
    
    it('should prevent invalid jumps via mouse', async () => {
      const { getByLabelText, getByText } = renderWithFocusManager(
        <MedicationEntryWithStepper />
      );
      
      // Try to click on a disabled step (dates before completing categories)
      const datesStep = getByLabelText('Dates');
      expect(datesStep).toHaveAttribute('disabled');
      
      fireEvent.click(datesStep);
      
      // Focus should not change
      await waitFor(() => {
        const datesField = document.querySelector('[data-focus-id="dates"]');
        expect(document.activeElement).not.toBe(datesField);
      });
      
      // Console should log prevention message
      expect(console.log).toHaveBeenCalledWith('Cannot jump to step: dates');
    });
    
    it('should track navigation mode switching', async () => {
      const { getByTestId } = renderWithFocusManager(
        <MedicationEntryWithStepper />
      );
      
      const { getNavigationMode, setNavigationMode } = useFocusManager();
      
      // Start with keyboard
      expect(getNavigationMode()).toBe('keyboard');
      
      // Tab navigation
      fireEvent.keyDown(document.body, { key: 'Tab' });
      expect(getNavigationMode()).toBe('keyboard');
      
      // Mouse movement
      fireEvent.mouseMove(document.body, { clientX: 100, clientY: 100 });
      await waitFor(() => {
        expect(getNavigationMode()).toBe('hybrid');
      });
      
      // Click on element
      const searchInput = getByTestId('medication-search');
      fireEvent.click(searchInput);
      expect(getNavigationMode()).toBe('hybrid');
    });
    
    it('should preserve focus flow with mouse override', async () => {
      const { getByTestId } = renderWithFocusManager(
        <MedicationEntryWithStepper />
      );
      
      // Click on field with preserveFocusOnInteraction
      const searchField = getByTestId('medication-search');
      fireEvent.click(searchField);
      
      // Type and complete
      fireEvent.change(searchField.querySelector('input'), { 
        target: { value: 'Aspirin' } 
      });
      
      // Click should trigger advance if configured
      fireEvent.click(searchField);
      
      // Check interaction mode data attribute
      expect(searchField).toHaveAttribute('data-interaction-mode', 'mouse');
      
      // Should still allow keyboard navigation
      fireEvent.keyDown(searchField, { key: 'Tab' });
      await waitFor(() => {
        const nextField = getByTestId('dosage-form');
        expect(document.activeElement).toBe(nextField);
      });
    });
    
    it('should handle Ctrl+Enter for direct jumps', async () => {
      const { getByTestId } = renderWithFocusManager(
        <MedicationEntryWithStepper />
      );
      
      const searchField = getByTestId('medication-search');
      searchField.focus();
      
      // Ctrl+Enter simulates direct jump behavior
      fireEvent.keyDown(searchField, { key: 'Enter', ctrlKey: true });
      
      const { getNavigationMode } = useFocusManager();
      expect(getNavigationMode()).toBe('hybrid');
    });
  });
});
```

### 4.2 Accessibility Testing
```typescript
// src/__tests__/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderWithFocusManager(<MedicationEntryModal />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    const { getByTestId } = renderWithFocusManager(<MedicationEntryModal />);
    
    // Test Tab navigation
    const elements = [
      'medication-search',
      'broad-categories-button',
      'specific-categories-button',
      'start-date-button',
      'discontinue-date-button',
      'side-effects-button',
      'save-button'
    ];
    
    for (const elementId of elements) {
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      await waitFor(() => {
        expect(document.activeElement).toBe(getByTestId(elementId));
      });
    }
    
    // Test Shift+Tab backwards navigation
    for (let i = elements.length - 2; i >= 0; i--) {
      fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
      await waitFor(() => {
        expect(document.activeElement).toBe(getByTestId(elements[i]));
      });
    }
  });
  
  it('should announce focus changes to screen readers', async () => {
    const { getByTestId } = renderWithFocusManager(<MedicationEntryModal />);
    
    // Check ARIA labels
    const searchInput = getByTestId('medication-search');
    expect(searchInput).toHaveAttribute('aria-label', 'Search medications');
    
    const broadCategoriesBtn = getByTestId('broad-categories-button');
    expect(broadCategoriesBtn).toHaveAttribute('aria-expanded', 'false');
    
    // Open modal
    fireEvent.click(broadCategoriesBtn);
    
    await waitFor(() => {
      expect(broadCategoriesBtn).toHaveAttribute('aria-expanded', 'true');
    });
    
    // Check modal ARIA attributes
    const modal = getByTestId('broad-categories-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'broad-categories-title');
  });
});
```

## Phase 5: Application-Wide Rollout (Weeks 5-6)

### 5.1 Migration Order
1. **Standalone Forms** (Low risk)
   - Client selector
   - User settings
   - Profile editor
   
2. **Simple Modals** (Medium risk)
   - Confirmation dialogs
   - Alert dialogs
   - Success notifications
   
3. **Complex Forms** (High risk)
   - Medication entry (already done)
   - Patient records
   - Appointment scheduling
   - Treatment plans

### 5.2 Component Migration Checklist
For each component to be migrated:

- [ ] **Analysis Phase**
  - [ ] Map current focus flow
  - [ ] Identify all focusable elements
  - [ ] Document modal interactions
  - [ ] Note conditional focus logic

- [ ] **Implementation Phase**
  - [ ] Remove manual focus() calls
  - [ ] Remove setTimeout focus delays
  - [ ] Remove onFocus auto-open handlers
  - [ ] Wrap fields with FocusableField
  - [ ] Convert modals to ManagedDialog
  - [ ] Add proper scope and order attributes
  - [ ] Implement validators where needed

- [ ] **Integration Phase**
  - [ ] Add to focus flow configuration
  - [ ] Connect to FocusManagerProvider
  - [ ] Update parent component imports
  - [ ] Handle edge cases

- [ ] **Testing Phase**
  - [ ] Test keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Test modal focus trapping
  - [ ] Test focus restoration
  - [ ] Update component unit tests
  - [ ] Run accessibility audit

### 5.3 Migration Example - Client Selector
```typescript
// Before:
export const ClientSelector = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Manual focus management
    if (showDropdown) {
      inputRef.current?.focus();
    }
  }, [showDropdown]);
  
  return (
    <div>
      <Input
        ref={inputRef}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
    </div>
  );
};

// After:
export const ClientSelector = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <FocusableField 
      id="client-selector"
      order={1}
      scope="client-form"
    >
      <ManagedDialog
        id="client-dropdown"
        open={showDropdown}
        onOpenChange={setShowDropdown}
        trigger={
          <Input placeholder="Select client..." />
        }
      >
        <ClientList onSelect={(client) => {
          selectClient(client);
          setShowDropdown(false);
        }} />
      </ManagedDialog>
    </FocusableField>
  );
};
```

## Phase 6: Cleanup & Optimization (Week 7)

### 6.1 Remove Old Code
```typescript
// Remove these patterns throughout the codebase:

// ❌ Manual focus calls
element.focus();
ref.current?.focus();

// ❌ Focus with timeout
setTimeout(() => element.focus(), 100);

// ❌ onFocus auto-open handlers
onFocus={() => {
  if (!modalOpen) {
    setModalOpen(true);
  }
}}

// ❌ Focus tracking refs
const focusFromSideEffectsRef = useRef(false);
const previousFocusRef = useRef(null);

// ❌ Direct DOM queries for focus
document.getElementById('save-button')?.focus();
document.querySelector('[data-testid="next-field"]')?.focus();
```

### 6.2 Performance Optimization
```typescript
// src/contexts/FocusManagerContext.tsx - Optimized version
export const FocusManagerProvider = ({ children }) => {
  // Use WeakMap for automatic cleanup
  const registry = useRef(new WeakMap<HTMLElement, FocusNode>());
  
  // Batch focus updates
  const batchedFocusUpdate = useMemo(() => 
    debounce((nodeId: string) => {
      executeFocus(nodeId);
    }, 16), // One frame
    []
  );
  
  // Optimize registry lookups
  const nodeCache = useRef(new Map<string, FocusNode>());
  
  // Lazy load heavy modal content
  const LazyModalContent = lazy(() => import('./HeavyModalContent'));
  
  // Use intersection observer for viewport-based focus
  const observerRef = useRef<IntersectionObserver>();
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Element is visible, can receive focus
            const nodeId = entry.target.getAttribute('data-focus-id');
            if (nodeId) {
              nodeCache.current.get(nodeId)?.ref.current?.focus();
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    
    return () => observerRef.current?.disconnect();
  }, []);
};
```

## Success Metrics

### Quantitative Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Focus navigation time | < 100ms | Performance.mark() |
| Modal open/close time | < 150ms | Performance.measure() |
| Memory usage | < 5MB | Chrome DevTools Memory Profiler |
| Test coverage | > 90% | Jest coverage report |
| Accessibility score | 100 | Lighthouse audit |

### Qualitative Metrics
- No focus loops or dead ends (Manual testing)
- Predictable navigation for users (User feedback)
- Works with all screen readers (NVDA/JAWS testing)
- Easy to debug focus issues (Developer survey)

### Performance Monitoring
```typescript
// src/utils/focusMetrics.ts
export const trackFocusMetrics = () => {
  const metrics = {
    transitions: [],
    modalOpenings: [],
    errors: []
  };
  
  // Track focus transitions
  const trackTransition = (from: string, to: string) => {
    performance.mark(`focus-transition-start`);
    
    // Execute transition
    focusField(to);
    
    performance.mark(`focus-transition-end`);
    performance.measure(
      `focus-${from}-to-${to}`,
      'focus-transition-start',
      'focus-transition-end'
    );
    
    const measure = performance.getEntriesByName(`focus-${from}-to-${to}`)[0];
    metrics.transitions.push({
      from,
      to,
      duration: measure.duration,
      timestamp: Date.now()
    });
    
    // Alert if transition is slow
    if (measure.duration > 100) {
      console.warn(`Slow focus transition: ${from} -> ${to} (${measure.duration}ms)`);
    }
  };
  
  // Send metrics to analytics
  const sendMetrics = () => {
    if (window.analytics) {
      window.analytics.track('focus_metrics', metrics);
    }
  };
  
  return { trackTransition, sendMetrics, metrics };
};
```

## Risk Mitigation

### Rollback Strategy
```typescript
// src/features/focusManager.ts
const ENABLE_NEW_FOCUS_MANAGER = process.env.REACT_APP_NEW_FOCUS === 'true';

export const FocusProvider = ENABLE_NEW_FOCUS_MANAGER 
  ? NewFocusManagerProvider 
  : LegacyFocusProvider;

// Gradual rollout with feature flags
export const useFeatureFlag = (flag: string) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // Check user's feature flags
    fetch('/api/features')
      .then(res => res.json())
      .then(data => {
        setEnabled(data[flag] || false);
      });
  }, [flag]);
  
  return enabled;
};

// Usage in component
const MedicationForm = () => {
  const useNewFocus = useFeatureFlag('new_focus_manager');
  
  if (useNewFocus) {
    return <NewMedicationForm />;
  }
  
  return <LegacyMedicationForm />;
};
```

### Error Boundary
```typescript
// src/components/FocusErrorBoundary.tsx
class FocusErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Focus management error:', error, errorInfo);
    
    // Report to error tracking
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: 'focus_manager' },
        extra: errorInfo
      });
    }
    
    // Fallback to manual focus
    this.manualFocusRestore();
  }
  
  manualFocusRestore = () => {
    // Try to focus first interactive element
    const firstButton = document.querySelector('button:not([disabled])');
    const firstInput = document.querySelector('input:not([disabled])');
    const focusTarget = firstButton || firstInput;
    
    if (focusTarget) {
      (focusTarget as HTMLElement).focus();
    }
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Focus Management Error</h2>
          <p>The focus system encountered an error. Navigation may be limited.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Conclusion

This comprehensive focus management migration plan provides:

1. **Unified Architecture**: Combines FocusManagerContext with Radix UI for optimal focus handling
2. **Incremental Migration**: Phase-by-phase approach minimizes risk
3. **Type Safety**: Full TypeScript support throughout
4. **Testing Strategy**: Comprehensive test coverage including accessibility
5. **Performance Monitoring**: Built-in metrics and optimization
6. **Rollback Plan**: Feature flags and error boundaries for safety

The new system will provide a consistent, accessible, and maintainable focus management solution that scales with your application's growth.

## Next Steps

1. Review and approve the architecture
2. Set up development environment with feature flags
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews
5. Plan user testing sessions for Phase 4

## Resources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Focus Management Guide](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Testing Library Documentation](https://testing-library.com/)