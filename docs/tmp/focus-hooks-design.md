# Focus Management Hooks Design

## Overview

This document explores the design of two complementary React hooks that together solve the focus management challenges in the A4C-FrontEnd application:

1. **`useFocusAdvancement`** - Handles selection-method-aware focus advancement after dropdown selections
2. **`useKeyboardNavigation`** - Manages actual DOM focus movement for Tab/Shift+Tab navigation with focus trapping support

## Important Distinction: Actual Focus vs Virtual Focus

Before diving into the hooks, it's crucial to understand two different focus patterns:

### Actual Focus Movement
- The browser's focus actually moves between DOM elements
- Used for: Tab navigation, focus traps, form field progression
- Visual indication: Browser's focus outline moves
- Screen reader: Announces new focused element
- **Use `useKeyboardNavigation` for these patterns**

### Virtual Focus (Highlighting)
- Focus stays on one element while selection moves within a widget
- Used for: Dropdown options, calendar dates, grid cells
- Visual indication: Highlight styling changes
- Screen reader: Uses `aria-activedescendant` to announce selection
- **Do NOT use `useKeyboardNavigation` for these patterns**

## Hook 1: useFocusAdvancement

### Purpose
Replace setTimeout-based focus advancement with a declarative hook that handles the complexity of Portal timing and selection methods.

### Design

```typescript
interface UseFocusAdvancementOptions {
  // Target for focus advancement
  targetTabIndex?: number;
  targetRef?: RefObject<HTMLElement>;
  targetSelector?: string;
  
  // Trigger configuration
  enabled?: boolean;
  delay?: number; // Defaults to TIMINGS.focus.transitionDelay
  
  // Advanced options
  skipIfMouseSelection?: boolean; // Default: true
  onFocusComplete?: () => void;
  onFocusError?: (error: Error) => void;
}

interface UseFocusAdvancementResult {
  // Trigger focus advancement programmatically
  advanceFocus: (method?: 'keyboard' | 'mouse') => void;
  
  // For integration with dropdown onSelect
  handleSelection: (item: any, method: 'keyboard' | 'mouse') => void;
  
  // State
  isPending: boolean;
  lastError: Error | null;
}

function useFocusAdvancement(options: UseFocusAdvancementOptions): UseFocusAdvancementResult;
```

### Implementation Strategy

```typescript
export function useFocusAdvancement(options: UseFocusAdvancementOptions): UseFocusAdvancementResult {
  const {
    targetTabIndex,
    targetRef,
    targetSelector,
    enabled = true,
    delay = TIMINGS.focus.transitionDelay,
    skipIfMouseSelection = true,
    onFocusComplete,
    onFocusError
  } = options;

  const [isPending, setIsPending] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const advanceFocus = useCallback((method: 'keyboard' | 'mouse' = 'keyboard') => {
    // Skip if disabled or mouse selection when configured
    if (!enabled || (skipIfMouseSelection && method === 'mouse')) {
      return;
    }

    setIsPending(true);
    setLastError(null);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Use requestAnimationFrame for zero delay in tests
    const advance = () => {
      try {
        let element: HTMLElement | null = null;

        if (targetRef?.current) {
          element = targetRef.current;
        } else if (targetTabIndex !== undefined) {
          element = findElementByTabIndex(targetTabIndex);
        } else if (targetSelector) {
          element = document.querySelector<HTMLElement>(targetSelector);
        }

        if (element) {
          element.focus();
          
          // Select text if it's a text input
          if (element instanceof HTMLInputElement && 
              ['text', 'search', 'tel', 'url', 'email'].includes(element.type)) {
            element.select();
          }
          
          onFocusComplete?.();
        } else {
          throw new Error('Target element not found');
        }
      } catch (error) {
        setLastError(error as Error);
        onFocusError?.(error as Error);
      } finally {
        setIsPending(false);
      }
    };

    // Use configured delay or RAF for tests
    if (delay === 0) {
      requestAnimationFrame(advance);
    } else {
      timeoutRef.current = setTimeout(advance, delay);
    }
  }, [enabled, skipIfMouseSelection, targetRef, targetTabIndex, targetSelector, delay, onFocusComplete, onFocusError]);

  const handleSelection = useCallback((item: any, method: 'keyboard' | 'mouse') => {
    advanceFocus(method);
  }, [advanceFocus]);

  return {
    advanceFocus,
    handleSelection,
    isPending,
    lastError
  };
}
```

### Usage Example

```typescript
// In FrequencyConditionInputs.tsx
const conditionFocusAdvancement = useFocusAdvancement({
  targetTabIndex: 17, // Therapeutic Classes button
  enabled: true,
  onFocusComplete: () => console.log('Focus advanced to Therapeutic Classes')
});

// In the AutocompleteDropdown onSelect
<AutocompleteDropdown
  onSelect={(cond, method) => {
    onConditionChange(cond);
    setConditionInput(cond);
    setShowConditionDropdown(false);
    
    // Replace setTimeout with hook
    conditionFocusAdvancement.handleSelection(cond, method);
  }}
/>
```

## Hook 2: useKeyboardNavigation

### Purpose
Manage actual DOM focus movement between focusable elements. This hook is specifically for scenarios where browser focus physically moves between elements, NOT for virtual selection within widgets.

### When TO Use This Hook

✅ **Modal/Dialog Focus Traps**
- Keeping focus within a modal boundary
- Tab/Shift+Tab cycles through modal elements
- Escape key handling

✅ **Form Section Navigation**
- Moving between major form sections
- Skip links or landmark navigation
- Custom tab order management

✅ **Toolbar/Menu Bar Navigation**
- Arrow keys move focus between menu items
- Tab moves out of the toolbar entirely

✅ **Wizard/Step Navigation**
- Moving focus between step indicators
- Previous/Next navigation with focus management

### When NOT TO Use This Hook

❌ **Dropdown Option Selection**
- Dropdowns use `highlightedIndex` state
- Focus remains on the input field
- Arrow keys change virtual selection
- Already implemented in `AutocompleteDropdown`

❌ **Calendar Date Navigation**
- `react-day-picker` has built-in keyboard handling
- Complex grid navigation logic
- Would conflict with library behavior

❌ **Data Grid/Table Navigation**
- Cells use virtual focus pattern
- Complex 2D navigation requirements
- Needs specialized grid navigation logic

❌ **Checkbox/Radio Lists**
- Standard form controls with built-in behavior
- Unless adding non-standard arrow navigation

### Design

```typescript
interface UseKeyboardNavigationOptions {
  // Container configuration
  containerRef?: RefObject<HTMLElement>;
  enabled?: boolean;
  
  // Focus trap configuration
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  
  // Navigation configuration
  allowTabNavigation?: boolean;
  allowArrowNavigation?: boolean;
  wrapAround?: boolean;
  
  // Filtering
  includeSelectors?: string[];
  excludeSelectors?: string[];
  
  // Callbacks
  onNavigate?: (element: HTMLElement, direction: 'forward' | 'backward') => void;
  onEscape?: () => void;
}

interface UseKeyboardNavigationResult {
  // Current focus state
  currentFocusIndex: number;
  focusableElements: HTMLElement[];
  
  // Navigation methods
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusByIndex: (index: number) => void;
  
  // For manual key handling
  handleKeyDown: (event: KeyboardEvent) => void;
}

function useKeyboardNavigation(options: UseKeyboardNavigationOptions): UseKeyboardNavigationResult;
```

### Implementation Strategy

```typescript
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions): UseKeyboardNavigationResult {
  const {
    containerRef,
    enabled = true,
    trapFocus = false,
    restoreFocus = false,
    initialFocusRef,
    allowTabNavigation = true,
    allowArrowNavigation = false,
    wrapAround = trapFocus,
    includeSelectors = [],
    excludeSelectors = [],
    onNavigate,
    onEscape
  } = options;

  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Update focusable elements when container changes
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef?.current || document;
    const elements = getAllFocusableElements(container, {
      includeSelectors,
      excludeSelectors
    });
    
    setFocusableElements(elements);
    
    // Track current focus
    const updateCurrentIndex = () => {
      const activeElement = document.activeElement as HTMLElement;
      const index = elements.indexOf(activeElement);
      setCurrentFocusIndex(index);
    };
    
    container.addEventListener('focusin', updateCurrentIndex);
    return () => container.removeEventListener('focusin', updateCurrentIndex);
  }, [containerRef, enabled, includeSelectors, excludeSelectors]);

  // Handle initial focus
  useEffect(() => {
    if (!enabled || !initialFocusRef?.current) return;
    
    // Store previous focus for restoration
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    
    initialFocusRef.current.focus();
  }, [enabled, initialFocusRef, restoreFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  const focusNext = useCallback(() => {
    if (focusableElements.length === 0) return;
    
    let nextIndex = currentFocusIndex + 1;
    
    if (nextIndex >= focusableElements.length) {
      nextIndex = wrapAround ? 0 : focusableElements.length - 1;
    }
    
    const element = focusableElements[nextIndex];
    element?.focus();
    onNavigate?.(element, 'forward');
  }, [currentFocusIndex, focusableElements, wrapAround, onNavigate]);

  const focusPrevious = useCallback(() => {
    if (focusableElements.length === 0) return;
    
    let prevIndex = currentFocusIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = wrapAround ? focusableElements.length - 1 : 0;
    }
    
    const element = focusableElements[prevIndex];
    element?.focus();
    onNavigate?.(element, 'backward');
  }, [currentFocusIndex, focusableElements, wrapAround, onNavigate]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    switch (event.key) {
      case 'Tab':
        if (allowTabNavigation) {
          event.preventDefault();
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        if (allowArrowNavigation) {
          event.preventDefault();
          focusNext();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        if (allowArrowNavigation) {
          event.preventDefault();
          focusPrevious();
        }
        break;
        
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
        
      case 'Home':
        if (allowArrowNavigation) {
          event.preventDefault();
          focusFirst();
        }
        break;
        
      case 'End':
        if (allowArrowNavigation) {
          event.preventDefault();
          focusLast();
        }
        break;
    }
  }, [enabled, allowTabNavigation, allowArrowNavigation, focusNext, focusPrevious, onEscape]);

  // Attach keyboard listener
  useEffect(() => {
    if (!enabled) return;
    
    const container = containerRef?.current || document;
    container.addEventListener('keydown', handleKeyDown as any);
    
    return () => container.removeEventListener('keydown', handleKeyDown as any);
  }, [containerRef, enabled, handleKeyDown]);

  const focusFirst = useCallback(() => {
    focusableElements[0]?.focus();
  }, [focusableElements]);

  const focusLast = useCallback(() => {
    focusableElements[focusableElements.length - 1]?.focus();
  }, [focusableElements]);

  const focusByIndex = useCallback((index: number) => {
    focusableElements[index]?.focus();
  }, [focusableElements]);

  return {
    currentFocusIndex,
    focusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusByIndex,
    handleKeyDown
  };
}
```

### Usage Examples

#### Example 1: Modal Focus Trap (Good Use Case)
```typescript
// In MedicationEntryModalRefactored.tsx
const navigation = useKeyboardNavigation({
  containerRef: modalRef,
  enabled: isOpen,
  trapFocus: true,
  restoreFocus: true,
  initialFocusRef: searchInputRef,
  onEscape: onClose
});

// Replaces 30+ lines of manual Tab handling
// Focus cycles within modal boundaries
```

#### Example 2: What NOT To Do - Dropdown Navigation
```typescript
// ❌ WRONG - Don't use for dropdown options
const dropdownNav = useKeyboardNavigation({
  containerRef: dropdownRef,
  allowArrowNavigation: true
});

// ✅ RIGHT - Dropdowns use virtual focus
const [highlightedIndex, setHighlightedIndex] = useState(0);
// Arrow keys change highlightedIndex, not actual focus
```

#### Example 3: Section Navigation (Good Use Case)
```typescript
// Navigate between collapsible form sections
const sectionNav = useKeyboardNavigation({
  includeSelectors: ['.section-header[role="button"]'],
  allowArrowNavigation: true,
  onNavigate: (element, direction) => {
    // Focus moves to section headers
    const section = element.closest('.form-section');
    expandSection(section);
  }
});
```

## Understanding Existing Patterns

### How Dropdowns Currently Work (Virtual Focus)

The `AutocompleteDropdown` component uses a virtual focus pattern that should NOT be replaced:

```typescript
// Current implementation in AutocompleteDropdown
const [highlightedIndex, setHighlightedIndex] = useState(-1);

// Keyboard handling
switch (keyEvent.key) {
  case 'ArrowDown':
    setHighlightedIndex(prev => (prev + 1) % items.length);
    break;
  case 'ArrowUp':
    setHighlightedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
    break;
}

// In the render
<input 
  aria-activedescendant={`option-${highlightedIndex}`}
  // Focus stays here
/>
<div role="listbox">
  {items.map((item, index) => (
    <div 
      id={`option-${index}`}
      aria-selected={index === highlightedIndex}
      // This is highlighted, not focused
    >
  ))}
</div>
```

This pattern is correct because:
1. Screen readers announce the highlighted option via `aria-activedescendant`
2. Users can still type to filter while navigating options
3. Focus never leaves the input field
4. It's the standard ARIA combobox pattern

### How Calendar Works (Built-in Navigation)

The `react-day-picker` component has sophisticated keyboard handling:
- Arrow keys navigate days in a grid pattern
- Page Up/Down changes months
- Home/End moves within weeks
- Enter selects a date

This should NOT be replaced because it's a complete, accessible implementation.

## Supporting Utilities

### New functions for focus-management.ts

```typescript
/**
 * Get all focusable elements in order, respecting tabIndex
 */
export function getAllFocusableElements(
  container: HTMLElement | Document = document,
  options: {
    includeSelectors?: string[];
    excludeSelectors?: string[];
  } = {}
): HTMLElement[] {
  const defaultSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  const selectors = options.includeSelectors?.length 
    ? options.includeSelectors 
    : defaultSelectors;
    
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(selectors.join(', '))
  );
  
  // Filter out excluded selectors
  const filtered = options.excludeSelectors?.length
    ? elements.filter(el => !options.excludeSelectors!.some(sel => el.matches(sel)))
    : elements;
  
  // Sort by tabIndex order
  return sortByTabIndex(filtered);
}

/**
 * Sort elements by tabIndex order
 */
export function sortByTabIndex(elements: HTMLElement[]): HTMLElement[] {
  return elements.sort((a, b) => {
    const tabIndexA = parseInt(a.getAttribute('tabindex') || '0');
    const tabIndexB = parseInt(b.getAttribute('tabindex') || '0');
    
    // Both have positive tabIndex
    if (tabIndexA > 0 && tabIndexB > 0) {
      return tabIndexA - tabIndexB;
    }
    
    // Only A has positive tabIndex
    if (tabIndexA > 0) return -1;
    
    // Only B has positive tabIndex  
    if (tabIndexB > 0) return 1;
    
    // Both have 0 or no tabIndex, use DOM order
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}

/**
 * Find the previous focusable element
 */
export function findPreviousFocusableElement(
  current: HTMLElement,
  container: HTMLElement | Document = document
): HTMLElement | null {
  const elements = getAllFocusableElements(container);
  const currentIndex = elements.indexOf(current);
  
  if (currentIndex > 0) {
    return elements[currentIndex - 1];
  }
  
  // Wrap to last element
  return elements[elements.length - 1] || null;
}
```

## Integration Benefits

### 1. Clean Component Code

Before:
```typescript
// Scattered setTimeout calls
if (method === 'keyboard') {
  setTimeout(() => focusByTabIndex(15), 50);
}
```

After:
```typescript
// Declarative hook usage
const focusAdvancement = useFocusAdvancement({
  targetTabIndex: 15
});

// In onSelect
focusAdvancement.handleSelection(item, method);
```

### 2. Testability

All timing is injectable through configuration:
- Tests run with 0ms delays automatically
- No flaky timing-dependent tests
- Clear assertions on focus behavior

### 3. Reusability

The hooks can be used across all components:
- Modal focus traps
- Dropdown navigation
- Form field advancement
- Wizard step navigation

### 4. Accessibility

Built-in WCAG compliance:
- Proper keyboard navigation
- Focus restoration
- Screen reader support
- Predictable focus flow

## Migration Strategy

### Phase 1: Create Infrastructure
1. Implement both hooks
2. Add supporting utilities
3. Write comprehensive tests

### Phase 2: Gradual Migration
1. Start with one component (FrequencyConditionInputs)
2. Validate behavior matches existing
3. Roll out to other components

### Phase 3: Remove Old Code
1. Remove all setTimeout calls
2. Delete duplicate focus trap logic
3. Update documentation

## Testing Strategy

### Unit Tests
```typescript
describe('useFocusAdvancement', () => {
  it('should advance focus on keyboard selection', () => {
    const { result } = renderHook(() => 
      useFocusAdvancement({ targetTabIndex: 5 })
    );
    
    act(() => {
      result.current.handleSelection(item, 'keyboard');
    });
    
    expect(document.activeElement).toHaveAttribute('tabindex', '5');
  });
  
  it('should skip focus on mouse selection', () => {
    const { result } = renderHook(() => 
      useFocusAdvancement({ targetTabIndex: 5 })
    );
    
    const initialFocus = document.activeElement;
    
    act(() => {
      result.current.handleSelection(item, 'mouse');
    });
    
    expect(document.activeElement).toBe(initialFocus);
  });
});
```

### Integration Tests
```typescript
describe('Keyboard Navigation Integration', () => {
  it('should trap focus within modal', () => {
    const { getByTestId } = render(<Modal />);
    const modal = getByTestId('modal');
    
    // Tab from last element wraps to first
    fireEvent.keyDown(modal, { key: 'Tab' });
    expect(document.activeElement).toBe(firstElement);
  });
});
```

## Quick Reference: Which Pattern to Use?

| Component Type | Pattern to Use | Why |
|---|---|---|
| **Modal/Dialog** | `useKeyboardNavigation` | Focus trap, Tab cycling |
| **Dropdown Options** | Keep existing `highlightedIndex` | Virtual focus with aria-activedescendant |
| **Calendar Picker** | Keep `react-day-picker` | Built-in grid navigation |
| **Form Fields** | `useFocusAdvancement` | Advance after selection |
| **Checkbox List** | Standard Tab navigation | Built-in browser behavior |
| **Toolbar/Menu Bar** | `useKeyboardNavigation` | Arrow keys between buttons |
| **Wizard Steps** | `useKeyboardNavigation` | Navigate between steps |
| **Search Results** | Keep existing pattern | Virtual focus like dropdowns |
| **Data Grid** | Custom grid navigation | 2D navigation needs special handling |
| **Accordion Sections** | `useKeyboardNavigation` | Navigate between headers |

## Key Principles

1. **Don't Over-Engineer**: If standard Tab navigation works, don't add custom keyboard handling
2. **Respect Existing Patterns**: Dropdowns and calendars have established patterns - don't break them
3. **Virtual vs Actual**: Understand whether focus should actually move or just appear to move
4. **Accessibility First**: Follow ARIA authoring practices for each widget type

## Conclusion

These two hooks provide targeted solutions for specific focus management challenges:

1. **`useFocusAdvancement`** solves the selection-method-aware focus advancement problem after dropdown selections
2. **`useKeyboardNavigation`** manages actual DOM focus movement for modals, toolbars, and section navigation

They complement, not replace, existing virtual focus patterns used in dropdowns and other complex widgets. Together with the existing patterns, they provide a complete focus management strategy for the application.