# FocusManager Migration Guide

## Overview
This guide helps migrate from the existing focus management system to the new FocusManagerContext infrastructure.

## New in Task 002: Mouse Navigation Support

The FocusManagerContext now includes comprehensive mouse navigation features:

### Mouse Navigation Features
- **Navigation Mode Detection**: Automatic detection of keyboard/mouse/hybrid interaction modes
- **Jump Validation**: Control which elements can be directly clicked
- **Mouse Interaction History**: Track last 10 mouse interactions for pattern detection
- **Step Indicator Integration**: Visual progress indicators with clickable navigation
- **Auto-Mode Switching**: Automatically switch between keyboard and mouse modes based on user behavior

### Using Mouse Navigation

```tsx
import { useMouseNavigation, useStepIndicator, NavigationMode } from '@/contexts/focus';

// Basic mouse navigation
const mouseNav = useMouseNavigation('element-id', {
  allowDirectJump: true,  // Allow clicking directly on this element
  clickAdvancesBehavior: 'next',  // Advance to next field on click
  preserveKeyboardFlow: true  // Maintain keyboard navigation flow
});

// Apply to element
<input {...mouseNav} />

// Step indicator integration
const { steps, onStepClick } = useStepIndicator();

// Render clickable steps
{steps.map(step => (
  <button
    onClick={(e) => onStepClick(step.id, e)}
    disabled={!step.isClickable}
  >
    {step.label}
  </button>
))}

// Register element with mouse navigation config
const { ref } = useFocusable('my-field', {
  type: FocusableType.INPUT,
  metadata: { label: 'My Field' }
});

const { updateElement } = useFocusManager();

useEffect(() => {
  updateElement('my-field', {
    mouseNavigation: {
      allowDirectJump: true,
      enableClickNavigation: true
    },
    visualIndicator: {
      showInStepper: true,
      stepLabel: 'My Field',
      stepDescription: 'Enter your data'
    }
  });
}, []);
```

### Navigation Modes

The system supports three navigation modes:
- **Keyboard**: Traditional Tab/Enter navigation only
- **Mouse**: Click-based navigation only  
- **Hybrid**: Mixed interaction (automatically detected)

```tsx
const { getNavigationMode, setNavigationMode } = useFocusManager();

// Get current mode
const mode = getNavigationMode(); // 'keyboard' | 'mouse' | 'hybrid'

// Manually set mode
setNavigationMode(NavigationMode.HYBRID);
```

## Quick Start

### 1. Wrap your app with FocusManagerProvider

```tsx
import { FocusManagerProvider } from '@/contexts/focus';

function App() {
  return (
    <FocusManagerProvider debug={process.env.NODE_ENV === 'development'}>
      {/* Your app components */}
    </FocusManagerProvider>
  );
}
```

### 2. Replace old hooks with new ones

| Old Hook | New Hook | Notes |
|----------|----------|-------|
| `useFocusProgression` | `useFocusable` + `useFocusManager` | More granular control |
| `useFocusTrap` | `useModalFocus` or `useFocusScope` | Better modal support |
| `useAutoScroll` | Built into focus system | Automatic with `behavior: 'smooth'` |

## Migration Examples

### Before: Using useFocusProgression

```tsx
// OLD CODE
const { registerField, focusNext, focusFirst } = useFocusProgression();
const fieldRef = useRef(null);

useEffect(() => {
  registerField('field1', fieldRef, false);
}, []);

const handleEnter = () => {
  setTimeout(() => focusNext('field1'), 100);
};
```

### After: Using FocusManagerContext

```tsx
// NEW CODE
const { ref, focus } = useFocusable('field1', {
  type: FocusableType.INPUT
});
const { focusNext } = useFocusManager();

const handleEnter = () => {
  focusNext(); // No setTimeout needed!
};
```

### Before: Modal with Focus Trap

```tsx
// OLD CODE
const containerRef = useFocusTrap(isOpen);

useEffect(() => {
  if (isOpen) {
    setTimeout(() => {
      const firstInput = containerRef.current?.querySelector('input');
      firstInput?.focus();
    }, 100);
  }
}, [isOpen]);
```

### After: Modal with FocusManager

```tsx
// NEW CODE
const { scopeId, open, close } = useModalFocus('my-modal', {
  autoFocus: true,
  closeOnEscape: true
});

useEffect(() => {
  if (isOpen) open();
  else close();
}, [isOpen]);
```

## Step-by-Step Migration

### Step 1: Identify Components Using Old Focus System

Look for these patterns:
- `useFocusProgression()`
- `useFocusTrap()`
- `setTimeout(() => element.focus(), 100)`
- Manual dropdown triggers with `.click()`
- `registerField()` calls

### Step 2: Add FocusManagerProvider

Wrap your app root or the section you're migrating:

```tsx
<FocusManagerProvider>
  <YourComponents />
</FocusManagerProvider>
```

### Step 3: Replace Focus Registration

Old:
```tsx
const { registerField } = useFocusProgression();
const ref = useRef(null);
registerField('myField', ref, isComplete);
```

New:
```tsx
const { ref } = useFocusable('myField', {
  type: FocusableType.INPUT,
  skipInNavigation: isComplete
});
```

### Step 4: Replace Navigation Logic

Old:
```tsx
setTimeout(() => focusNext(currentId), 100);
```

New:
```tsx
focusNext(); // Context tracks current focus
```

### Step 5: Add Validation

New system supports async validation:

```tsx
const { ref } = useFocusable('validated-field', {
  validator: async () => {
    // Return true if field is valid
    return await validateField();
  }
});
```

### Step 6: Handle Modals

Old:
```tsx
const trapRef = useFocusTrap(isOpen);
// Manual escape handling
// Manual focus restoration
```

New:
```tsx
const { open, close } = useModalFocus('modal', {
  closeOnEscape: true,
  autoFocus: true,
  restoreFocus: true
});
```

## Feature Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| Focus Registration | Manual with refs | Automatic with hooks |
| Navigation | Manual ID tracking | Automatic state management |
| Validation | Blocking, sync only | Non-blocking, async support |
| Modal Management | Manual trap + restore | Automatic with stack |
| History | None | Full undo/redo support |
| Debugging | Console logs | Debug panel + state inspection |
| TypeScript | Partial | Full type safety |
| Performance | Multiple timeouts | Optimized with single context |

## Advanced Features

### Focus History

```tsx
const { undo, redo, history } = useFocusHistory();

// Navigate through focus history
<button onClick={undo}>Undo</button>
<button onClick={redo}>Redo</button>
```

### Custom Scopes

```tsx
const { scopeId, activate, deactivate } = useFocusScope('custom-scope', {
  trapFocus: true,
  autoFocus: true
});

// Create isolated focus regions
```

### Debug Mode

```tsx
const { enableDebug, state } = useFocusDebug();

// Inspect focus state in development
if (process.env.NODE_ENV === 'development') {
  enableDebug();
}
```

## Common Pitfalls

1. **Don't use setTimeout for focus** - The new system handles timing
2. **Don't manually track focus IDs** - Context maintains state
3. **Don't forget validators are async** - Use async/await
4. **Don't mix old and new systems** - Migrate complete components

## Testing

The new system is fully testable:

```tsx
import { render } from '@testing-library/react';
import { FocusManagerProvider } from '@/contexts/focus';

test('focus navigation', () => {
  render(
    <FocusManagerProvider>
      <YourComponent />
    </FocusManagerProvider>
  );
  
  // Test focus behavior
});
```

## Rollback Plan

If issues arise, you can:
1. Keep both systems during migration
2. Use feature flags to toggle between systems
3. Migrate component by component

## Next Steps

1. Start with leaf components (no children)
2. Move to container components
3. Finally migrate modal/dialog components
4. Remove old focus hooks when complete

## Support

For issues or questions about migration:
- Check the test file: `FocusManager.test.tsx`
- Review the demo: `FocusManagerDemo.tsx`
- Enable debug mode for state inspection