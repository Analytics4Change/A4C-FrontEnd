# Amended Implementation Plan: Focus Management System

## Overview
This document outlines the complete implementation plan for the focus management system, including amendments discovered during initial implementation.

## Completed Items ✅

### 1. Core Infrastructure
- **Focus Management Utilities** - Added getAllFocusableElements, sortByTabIndex, findPreviousFocusableElement
- **useFocusAdvancement Hook** - Handles selection-method-aware focus advancement
- **useKeyboardNavigation Hook** - Manages Tab/Shift+Tab with focus trapping

### 2. Bug Fixes
- **Fixed Mouse Selection** - Changed from onClick to onMouseDown to prevent race condition with blur

### 3. First Component Refactor
- **FrequencyConditionInputs** - Implemented hooks and readonly pattern

## Amendment: Readonly Pattern for Better UX 🔄

### Original Plan Issue
Using `disabled` attribute on selected inputs caused poor Tab navigation UX:
- Disabled inputs with focus created confusion
- Tab behavior from disabled elements was inconsistent

### New Pattern (Implemented)
```typescript
// Inputs: Use readOnly instead of disabled
<Input
  readOnly={!!value}        // Allows focus but prevents editing
  className={value ? 'border-blue-500 bg-blue-50' : ''}
  tabIndex={13}
/>

// Buttons: Remove from tab order when disabled
<button
  disabled={!!value}
  tabIndex={value ? -1 : 14}  // -1 removes from tab order
/>
```

### Benefits
- Natural Tab flow works perfectly (13 → 15 → 17)
- Users can still select/copy text from filled fields
- Better visual feedback (fields look interactive)
- Consistent behavior for both keyboard and mouse users

## Remaining Implementation Tasks 📋

### Phase 1: Component Refactoring (Apply Readonly Pattern)

#### Task 1: Refactor DosageFormInputs.tsx
- Replace 3 setTimeout instances
- Implement useFocusAdvancement for:
  - Category → Form Type (tabIndex 5)
  - Form Type → Amount (tabIndex 7)
  - Unit → Total Amount (tabIndex 10)
- Apply readonly pattern to all dropdown inputs
- Set tabIndex to -1 on buttons when selections are made

#### Task 2: Refactor TotalAmountInputs.tsx
- Replace 1 setTimeout instance
- Implement useFocusAdvancement for:
  - Total Unit → Frequency (tabIndex 13)
- Apply readonly pattern
- Dynamic button tabIndex

#### Task 3: Refactor MedicationEntryModalRefactored.tsx
- Replace manual focus trap (30+ lines) with useKeyboardNavigation
- Configuration:
  ```typescript
  useKeyboardNavigation({
    containerRef: modalRef,
    enabled: isOpen,
    trapFocus: true,
    restoreFocus: true,
    initialFocusRef: searchInputRef,
    onEscape: onClose
  })
  ```

### Phase 2: Testing

#### Task 4: Create useFocusAdvancement Tests
- Test keyboard vs mouse selection behavior
- Test focus advancement with different targets
- Test with 0ms delay in test environment
- Test error handling

#### Task 5: Create useKeyboardNavigation Tests
- Test Tab/Shift+Tab navigation
- Test focus trapping in containers
- Test focus restoration on unmount
- Test with various tabIndex configurations

### Phase 3: Additional Components (If Needed)

Check and update any other components using:
- setTimeout for focus management
- disabled pattern on dropdown inputs
- Manual focus trap implementations

## Implementation Checklist

```markdown
✅ Core Infrastructure
  ✅ Focus utilities
  ✅ useFocusAdvancement hook
  ✅ useKeyboardNavigation hook
  
✅ Bug Fixes
  ✅ Fix mouse selection (onMouseDown)
  
✅ Amended Pattern
  ✅ Readonly input pattern
  ✅ Dynamic tabIndex for buttons
  
⏳ Component Updates
  ✅ FrequencyConditionInputs
  ⬜ DosageFormInputs (3 setTimeout)
  ⬜ TotalAmountInputs (1 setTimeout)
  ⬜ MedicationEntryModalRefactored (focus trap)
  
⬜ Testing
  ⬜ useFocusAdvancement tests
  ⬜ useKeyboardNavigation tests
  ⬜ Integration tests
```

## Key Patterns to Apply

### For Dropdown Inputs
```typescript
// 1. Import the hook
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';

// 2. Create focus advancement instance
const focusAdvancement = useFocusAdvancement({
  targetTabIndex: nextFieldTabIndex,
  enabled: true
});

// 3. In onSelect handler
onSelect={(item, method) => {
  setValue(item);
  focusAdvancement.handleSelection(item, method);
}}

// 4. Input uses readOnly
<Input readOnly={!!value} tabIndex={X} />

// 5. Button removed from tab order when disabled
<button disabled={!!value} tabIndex={value ? -1 : X+1} />
```

### For Modal Focus Trap
```typescript
// Replace manual Tab handling with:
const navigation = useKeyboardNavigation({
  containerRef: modalRef,
  enabled: isOpen,
  trapFocus: true,
  restoreFocus: true
});
// Remove manual handleKeyDown for Tab
```

## Expected Outcomes

1. **No setTimeout calls** for focus management
2. **Consistent UX** across all dropdowns
3. **Better keyboard navigation** with natural Tab flow
4. **Cleaner code** with reusable hooks
5. **Testable** with injectable timing
6. **Accessible** following WCAG patterns

## Success Criteria

- All 6 setTimeout instances removed
- Tab navigation flows smoothly: 13→15→17 (skipping 14,16 when selected)
- Mouse selections keep focus, keyboard selections advance focus
- Modal properly traps focus without manual code
- All tests pass with 0ms delays