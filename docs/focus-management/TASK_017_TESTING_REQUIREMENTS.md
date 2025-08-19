# Task 017 Testing Requirements: Comprehensive Integration Testing Guide

## Executive Summary

This document provides comprehensive testing requirements for Task 017 (Integration Testing) of the focus management system migration. It addresses all test failures from Tasks 001-016, establishes data-testid conventions, provides Playwright guidance, and ensures a clear path to achieving 95%+ test pass rate.

## Current Testing Status

### Test Results Summary (Tasks 001-016)
- **Overall Pass Rate**: ~43.4% (85 passing, 66 failing, ~45 timeout)
- **FocusManagerContext**: 88.5% pass rate (46/52 passing)
- **ManagedDialog**: 81.3% pass rate (26/32 passing)
- **MedicationSearch**: 82.6% pass rate (19/23 passing)
- **Component Migrations**: CategorySelection, DateSelection, SideEffectsSelection all migrated with tests

### Critical Issues Requiring Resolution
1. **Jest→Vitest Migration**: 44 failures from `jest.fn()` usage
2. **Promise-Based API**: Async methods not properly awaited in tests
3. **React act() Wrappers**: Missing for state updates
4. **Modal Stack Integration**: Communication issues between ManagedDialog and FocusManager
5. **RAF Timing**: Focus operations using requestAnimationFrame not properly tested
6. **Component Cleanup**: Lifecycle and unmount issues

## Testing Infrastructure Decision

### Playwright vs Playwright MCP Server

**Decision: Use Native Playwright (Already Installed)**

**Rationale:**
- ✅ Playwright v1.54.2 is already installed and configured
- ✅ Full multi-browser support (Chrome, Firefox, Safari, Mobile)
- ✅ Existing e2e test infrastructure in `/e2e` directory
- ✅ Configured with dev server auto-start
- ❌ Playwright MCP server adds unnecessary complexity
- ❌ No additional benefits for our use case

**Configuration Status:**
```typescript
// playwright.config.ts already configured with:
- Test directory: ./e2e
- Base URL: http://localhost:3000
- Multi-browser projects
- Automatic dev server startup
- Test artifacts and reporting
```

## Data-testid Requirements

### Naming Convention

All interactive elements MUST have data-testid attributes following this pattern:

```
data-testid="[component]-[element]-[identifier]"
```

### Required Test IDs by Component

#### 1. FocusableField Components
```typescript
// Pattern: focus-field-[fieldId]
data-testid="focus-field-medication-search"
data-testid="focus-field-category"
data-testid="focus-field-dosage-amount"
data-testid="focus-field-start-date"
data-testid="focus-field-side-effects"
```

#### 2. Input Elements
```typescript
// Pattern: input-[fieldName]
data-testid="input-medication-search"
data-testid="input-dosage-amount"
data-testid="input-dosage-unit"
data-testid="input-frequency"
data-testid="input-condition"
```

#### 3. Buttons
```typescript
// Pattern: button-[action]
data-testid="button-save"
data-testid="button-cancel"
data-testid="button-next"
data-testid="button-previous"
data-testid="button-modal-close"
data-testid="button-broad-categories"
data-testid="button-specific-categories"
```

#### 4. Modal/Dialog Elements
```typescript
// Pattern: dialog-[id] and dialog-[id]-[element]
data-testid="dialog-medication-entry"
data-testid="dialog-medication-entry-close"
data-testid="dialog-broad-categories"
data-testid="dialog-specific-categories"
data-testid="dialog-calendar-picker"
```

#### 5. Step Indicator
```typescript
// Pattern: step-[index] or step-indicator-[element]
data-testid="step-indicator"
data-testid="step-0"
data-testid="step-1"
data-testid="step-indicator-current"
data-testid="step-indicator-complete"
```

#### 6. Lists and Options
```typescript
// Pattern: option-[value] or list-[name]
data-testid="list-medication-results"
data-testid="option-medication-aspirin"
data-testid="list-categories"
data-testid="option-category-cardiology"
```

### Implementation Examples

```tsx
// FocusableField wrapper
<FocusableField
  id="medication-search"
  data-testid="focus-field-medication-search"
>
  <input 
    ref={ref}
    data-testid="input-medication-search"
    {...props}
  />
</FocusableField>

// ManagedDialog
<ManagedDialog
  id="broad-categories-modal"
  data-testid="dialog-broad-categories"
>
  <DialogClose data-testid="dialog-broad-categories-close" />
</ManagedDialog>

// StepIndicator
<div data-testid="step-indicator">
  {steps.map((step, index) => (
    <div 
      key={step.id}
      data-testid={`step-${index}`}
      className={step.current ? 'current' : ''}
    />
  ))}
</div>
```

## Test Environment Fixes

### 1. Jest to Vitest Migration (CRITICAL - 44 failures)

**Search and Replace Pattern:**
```typescript
// Find all occurrences of:
jest.fn()
jest.spyOn()
jest.mock()
jest.clearAllMocks()
jest.resetAllMocks()

// Replace with:
vi.fn()
vi.spyOn()
vi.mock()
vi.clearAllMocks()
vi.resetAllMocks()
```

**Implementation Script:**
```bash
# Run in test directories
find . -name "*.test.tsx" -o -name "*.test.ts" | xargs sed -i 's/jest\./vi\./g'
```

### 2. Promise-Based API Integration

**The FocusManagerContext uses async/await extensively:**

```typescript
// ALL focus methods are async and return Promise<boolean>:
async focusField(id: string): Promise<boolean>
async focusNext(options?: FocusNavigationOptions): Promise<boolean>
async focusPrevious(options?: FocusNavigationOptions): Promise<boolean>
async focusFirst(options?: FocusNavigationOptions): Promise<boolean>
async focusLast(options?: FocusNavigationOptions): Promise<boolean>
```

**Test Pattern Updates Required:**

```typescript
// ❌ WRONG - Will fail
it('should focus next field', () => {
  focusManager.focusNext();
  expect(getCurrentFocus()).toBe('field2');
});

// ✅ CORRECT - Properly awaits Promise
it('should focus next field', async () => {
  await focusManager.focusNext();
  expect(getCurrentFocus()).toBe('field2');
});

// ✅ CORRECT - With act() wrapper for React state
it('should focus next field', async () => {
  await act(async () => {
    await focusManager.focusNext();
  });
  expect(getCurrentFocus()).toBe('field2');
});
```

### 3. React act() Wrapper Requirements

**When to use act():**
- Any operation that triggers state updates
- Focus navigation methods
- Modal open/close operations
- Element registration/unregistration

```typescript
import { act } from '@testing-library/react';

// Pattern for state updates
await act(async () => {
  await focusManager.focusNext();
});

// Pattern for modal operations
await act(async () => {
  focusManager.openModal('test-modal');
});

// Pattern for element registration
await act(async () => {
  const { result } = renderHook(() => useFocusManager());
  result.current.registerElement({
    id: 'test-field',
    ref: { current: element },
    order: 1
  });
});
```

### 4. RequestAnimationFrame (RAF) Handling

**The focusElement function uses RAF internally:**

```typescript
// utils.ts implementation
export function focusElement(element: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      element.focus();
      resolve(true);
    });
  });
}
```

**Test Pattern for RAF:**
```typescript
// Use fake timers for RAF testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should handle RAF in focus operations', async () => {
  const focusPromise = focusManager.focusField('test-field');
  
  // Advance timers to trigger RAF
  await act(async () => {
    vi.runAllTimers();
  });
  
  const result = await focusPromise;
  expect(result).toBe(true);
});
```

### 5. Modal Stack Integration Fix

```typescript
// Ensure ManagedDialog properly communicates with FocusManager
const TestModalSetup = () => {
  const { openModal, closeModal } = useFocusManager();
  
  return (
    <ManagedDialog
      id="test-modal"
      onOpen={() => openModal({
        scopeId: 'test-modal',
        previousFocusId: 'trigger-button'
      })}
      onClose={() => closeModal('test-modal')}
    >
      <div data-testid="modal-content">Content</div>
    </ManagedDialog>
  );
};
```

## Integration Test Scenarios

### Scenario 1: Complete Medication Entry Flow

```typescript
// e2e/medication-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete medication entry flow', async ({ page }) => {
  await page.goto('/medication-entry');
  
  // Step 1: Search for medication
  await page.fill('[data-testid="input-medication-search"]', 'Aspirin');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="list-medication-results"]')).toBeVisible();
  
  // Step 2: Select medication
  await page.click('[data-testid="option-medication-aspirin"]');
  await page.keyboard.press('Tab');
  
  // Step 3: Fill dosage form
  await page.fill('[data-testid="input-dosage-amount"]', '100');
  await page.keyboard.press('Tab');
  await page.selectOption('[data-testid="input-dosage-unit"]', 'mg');
  await page.keyboard.press('Tab');
  
  // Step 4: Select categories
  await page.click('[data-testid="button-broad-categories"]');
  await page.click('[data-testid="option-category-cardiology"]');
  await page.click('[data-testid="dialog-broad-categories-close"]');
  
  // Step 5: Set dates
  await page.click('[data-testid="button-start-date"]');
  await page.click('[data-testid="calendar-today"]');
  
  // Step 6: Save
  await page.click('[data-testid="button-save"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Scenario 2: No Focus Dead Ends

```typescript
test('no focus dead ends in flow', async ({ page }) => {
  await page.goto('/medication-entry');
  
  // Track all focused elements
  const focusHistory: string[] = [];
  
  // Tab through entire form
  for (let i = 0; i < 20; i++) {
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    if (focused && !focusHistory.includes(focused)) {
      focusHistory.push(focused);
    }
    await page.keyboard.press('Tab');
  }
  
  // Verify save button is reachable
  expect(focusHistory).toContain('button-save');
  
  // Verify no element appears twice (no loops)
  const uniqueElements = new Set(focusHistory);
  expect(uniqueElements.size).toBe(focusHistory.length);
});
```

### Scenario 3: Modal Transitions

```typescript
test('modal focus restoration', async ({ page }) => {
  await page.goto('/medication-entry');
  
  // Focus a field before opening modal
  await page.focus('[data-testid="input-medication-search"]');
  const initialFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  
  // Open modal
  await page.click('[data-testid="button-broad-categories"]');
  await expect(page.locator('[data-testid="dialog-broad-categories"]')).toBeVisible();
  
  // Close modal with Escape
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="dialog-broad-categories"]')).not.toBeVisible();
  
  // Verify focus restored
  const restoredFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(restoredFocus).toBe(initialFocus);
});
```

### Scenario 4: Keyboard Navigation

```typescript
test('keyboard navigation through form', async ({ page }) => {
  await page.goto('/medication-entry');
  
  // Tab forward
  await page.keyboard.press('Tab');
  let focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('focus-field-medication-search');
  
  // Enter to advance when field complete
  await page.fill('[data-testid="input-medication-search"]', 'Aspirin');
  await page.keyboard.press('Enter');
  
  // Tab backward
  await page.keyboard.press('Shift+Tab');
  focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('focus-field-medication-search');
  
  // Ctrl+Enter for hybrid mode
  await page.keyboard.press('Control+Enter');
  // Verify mode indicator
  await expect(page.locator('.navigation-mode-hybrid')).toBeVisible();
});
```

### Scenario 5: Error Recovery

```typescript
test('error recovery and validation', async ({ page }) => {
  await page.goto('/medication-entry');
  
  // Try to advance without required field
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab'); // Try to skip medication search
  
  // Should remain on medication search
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('input-medication-search');
  
  // Fill invalid dosage
  await page.fill('[data-testid="input-medication-search"]', 'Aspirin');
  await page.keyboard.press('Tab');
  await page.fill('[data-testid="input-dosage-amount"]', 'abc');
  await page.keyboard.press('Tab');
  
  // Should show validation error
  await expect(page.locator('[data-testid="error-dosage-amount"]')).toBeVisible();
});
```

## Test Execution Plan

### Phase 1: Environment Fixes (2-3 hours)
1. [ ] Run Jest→Vitest migration script
2. [ ] Update all test imports
3. [ ] Fix mock implementations
4. [ ] Verify basic tests run

### Phase 2: Async/Promise Updates (3-4 hours)
1. [ ] Add `await` to all focus method calls
2. [ ] Wrap state updates in `act()`
3. [ ] Update RAF-dependent tests
4. [ ] Fix modal stack tests

### Phase 3: Data-testid Implementation (2-3 hours)
1. [ ] Add test IDs to all FocusableField components
2. [ ] Add test IDs to all input elements
3. [ ] Add test IDs to all buttons
4. [ ] Add test IDs to modals and dialogs
5. [ ] Verify with attribute checker script

### Phase 4: Integration Testing (4-5 hours)
1. [ ] Run complete medication flow test
2. [ ] Verify no dead ends
3. [ ] Test modal transitions
4. [ ] Validate keyboard navigation
5. [ ] Test error scenarios

### Phase 5: Verification (1-2 hours)
1. [ ] Run full test suite
2. [ ] Verify 95%+ pass rate
3. [ ] Document any remaining issues
4. [ ] Create performance benchmarks

## Success Criteria

### Quantitative Metrics
- **Unit Test Pass Rate**: ≥95% (currently ~43.4%)
- **Integration Test Pass Rate**: 100% for critical paths
- **Test Execution Time**: <30 seconds per suite
- **No Flaky Tests**: <5% intermittent failures

### Qualitative Requirements
- ✅ Complete medication flow works end-to-end
- ✅ No focus dead ends or infinite loops
- ✅ Modal focus restoration works correctly
- ✅ Save button always reachable
- ✅ Error states handled gracefully
- ✅ Keyboard navigation fully functional
- ✅ Mouse interactions work as expected

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: "Cannot read property 'focus' of null"
**Cause**: Element not mounted or ref not set
**Solution**: 
```typescript
await waitFor(() => {
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
});
```

#### Issue 2: "Timeout waiting for Promise"
**Cause**: Missing await or act() wrapper
**Solution**:
```typescript
await act(async () => {
  await focusManager.focusNext();
});
```

#### Issue 3: "Element not focused after focusField"
**Cause**: RAF not properly handled
**Solution**:
```typescript
vi.useFakeTimers();
const promise = focusManager.focusField('test');
vi.runAllTimers();
await promise;
```

#### Issue 4: "Modal stack out of sync"
**Cause**: openModal/closeModal not called properly
**Solution**: Ensure ManagedDialog uses proper callbacks

#### Issue 5: "Validation always returns false"
**Cause**: Async validator not awaited
**Solution**:
```typescript
const isValid = await validateElement(element);
```

## Test Helper Utilities

### Enhanced Focus Test Helper
```typescript
// test-utils/focus-helpers.ts
export const setupFocusTest = () => {
  const { container } = render(<YourComponent />);
  
  // Mock focus/blur for jsdom
  const focusMock = vi.fn();
  const blurMock = vi.fn();
  
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: true,
    value: focusMock
  });
  
  Object.defineProperty(HTMLElement.prototype, 'blur', {
    configurable: true,
    value: blurMock
  });
  
  return { container, focusMock, blurMock };
};

export const waitForFocus = async (testId: string) => {
  await waitFor(() => {
    const element = screen.getByTestId(testId);
    expect(element).toHaveFocus();
  });
};

export const tabTo = async (testId: string) => {
  await userEvent.tab();
  await waitForFocus(testId);
};
```

### Playwright Page Object Model
```typescript
// e2e/pages/MedicationEntryPage.ts
export class MedicationEntryPage {
  constructor(private page: Page) {}
  
  async searchMedication(name: string) {
    await this.page.fill('[data-testid="input-medication-search"]', name);
    await this.page.keyboard.press('Enter');
  }
  
  async fillDosage(amount: string, unit: string) {
    await this.page.fill('[data-testid="input-dosage-amount"]', amount);
    await this.page.selectOption('[data-testid="input-dosage-unit"]', unit);
  }
  
  async selectCategories(broad: string, specific?: string) {
    await this.page.click('[data-testid="button-broad-categories"]');
    await this.page.click(`[data-testid="option-category-${broad}"]`);
    if (specific) {
      await this.page.click('[data-testid="button-specific-categories"]');
      await this.page.click(`[data-testid="option-category-${specific}"]`);
    }
  }
  
  async save() {
    await this.page.click('[data-testid="button-save"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }
}
```

## Verification Checklist

Before marking Task 017 as complete, verify:

- [ ] All Jest references converted to Vitest
- [ ] All async focus methods properly awaited
- [ ] All state updates wrapped in act()
- [ ] All components have data-testid attributes
- [ ] RAF timing issues resolved with fake timers
- [ ] Modal stack integration working
- [ ] Complete medication flow test passes
- [ ] No focus dead ends detected
- [ ] Modal transitions test passes
- [ ] Save button reachability verified
- [ ] Error scenarios handled
- [ ] 95%+ overall test pass rate achieved
- [ ] Test execution time <30 seconds
- [ ] No flaky tests identified

## Next Steps

1. **Immediate Actions**:
   - Apply Jest→Vitest fixes
   - Add missing await statements
   - Implement data-testid attributes

2. **Testing Phase**:
   - Run updated unit tests
   - Execute integration test suite
   - Verify with Playwright e2e tests

3. **Documentation**:
   - Update test results in focus-migration-tasks.md
   - Document any remaining issues
   - Create performance benchmarks

## References

- Focus Management Architecture: `/docs/focus-management/focus-rearchitecture.md`
- Current Implementation: `/docs/focus-management/current-focus-flow.md`
- Test Failure Analysis: `/docs/focus-management/TEST_FAILURE_ANALYSIS_REPORT.md`
- Migration Guide: `/docs/focus-management/MIGRATION_GUIDE.md`
- Playwright Documentation: https://playwright.dev/docs/test-intro

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-20
**Author**: Focus Management Migration Team
**Status**: Ready for QA Implementation