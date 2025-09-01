# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A4C-FrontEnd is a React-based medication management application built with TypeScript and Vite. The application provides healthcare professionals with tools to manage client medications, including search, dosage configuration, and prescription tracking.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: MobX with mobx-react-lite
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Radix UI primitives (@radix-ui)
- **Icons**: Lucide React
- **Testing**: Vitest (unit), Playwright (E2E)
- **Code Quality**: ESLint, TypeScript strict mode

## Available Commands

```bash
npm run dev        # Start development server (default port 5173)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript compiler checks
npm run lint       # Run ESLint
```

## Current Features

### Medication Management
- **Medication Search**: Real-time search with debouncing
- **Dosage Configuration**: 
  - Form categories (Solid, Liquid, etc.)
  - Dosage amounts and units
  - Frequency and condition settings
  - Total amount tracking
- **Date Management**: Start and discontinue date selection with calendar
- **Category Selection**: Broad and specific medication categorization

### Client Management
- Client selection interface
- Client-specific medication tracking

### Form Infrastructure
- Complex multi-step forms with validation
- Accessible form controls with ARIA labels
- **Keyboard Navigation Standards**:
  - Full keyboard support required for all interactive elements
  - Tab/Shift+Tab for field navigation
  - Arrow keys for option selection in dropdowns
  - Space key to toggle checkboxes and radio buttons
  - Enter key to submit forms or accept selections
  - Escape key to cancel operations or close dropdowns
- Focus trapping in modals
- **Multi-Select Dropdown Pattern**:
  - Use unified `MultiSelectDropdown` component for consistency
  - Maintains focus context for keyboard navigation
  - Supports WCAG 2.1 Level AA compliance
  - Handles both keyboard and mouse interactions seamlessly

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (button, input, etc.)
│   │   └── MultiSelectDropdown.tsx  # Unified multi-select component
│   └── debug/       # Debug utilities (dev only)
│       └── MobXDebugger.tsx  # MobX state visualization
├── config/          # Application configuration
│   ├── timings.ts   # Centralized timing configuration
│   └── mobx.config.ts  # MobX debugging configuration
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── mocks/           # Mock data for development
├── services/        # API interfaces and implementations
│   ├── api/         # API interfaces
│   └── mock/        # Mock API implementations
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── viewModels/      # MobX ViewModels for state management
└── views/           # Feature-specific components
    ├── client/      # Client-related views
    └── medication/  # Medication-related views
```

## Development Guidelines

### Architecture Patterns
- **MVVM Pattern**: ViewModels (MobX) handle business logic, Views (React) handle presentation
- **Composition over Inheritance**: Use component composition for complex UIs
- **Interface-based Services**: All services implement interfaces for easy mocking/testing
- **Unified Component Pattern**: Create single, reusable components for similar functionality (e.g., MultiSelectDropdown for all multi-select needs)

### State Management with MobX
- Use MobX ViewModels for complex state logic
- Keep component state minimal and UI-focused
- **CRITICAL**: Always wrap components with `observer` HOC from mobx-react-lite for reactive components
- **Array Reactivity Rules**:
  - Never spread observable arrays in props: `<Component items={[...observableArray]} />` ❌
  - Pass observable arrays directly: `<Component items={observableArray} />` ✅
  - Use immutable updates in ViewModels: `this.array = [...this.array, item]` instead of `this.array.push(item)`
  - Always use `runInAction` for multiple state updates
- **Debugging MobX**: When reactivity issues occur, check:
  1. Component is wrapped with `observer`
  2. No array spreading breaking the observable chain
  3. State mutations are using replacement, not mutation
  4. Parent components in render chain are also wrapped with `observer`

### TypeScript Guidelines
- Strict mode is enabled - avoid `any` types
- Define interfaces for all props and complex data structures
- Use type inference where possible, explicit types where necessary

## Search and Development Resources

- For code base searches use the serena mcp server
- For deep research use the exa mcp server
- For exact code syntax use the context7 mcp server
- For UI / UX testing use the playwright mcp server

## Code Organization Guidelines

### File Size Standards
- All code files should be approximately 300 lines or less
- Only exceed 300 lines when splitting would negatively affect:
  - Implementation complexity
  - Testing complexity
  - Readability
  - Performance

### Component Structure for Large Forms
When dealing with complex forms (like medication entry):
1. Split form sections into separate components (e.g., DosageFormInputs, TotalAmountInputs)
2. Keep validation logic in separate files or services
3. Use composition pattern in main component
4. Share state via props or context, not prop drilling

## Timing and Async Patterns

### Timing Abstractions
The codebase uses centralized timing configuration to ensure testability and maintainability:
- **Configuration**: All timing delays are defined in `/src/config/timings.ts`
- **Test Environment**: All delays automatically set to 0ms when `NODE_ENV === 'test'`
- **Custom Hooks**: 
  - `useDropdownBlur` - Dropdown blur delays
  - `useScrollToElement` - Scroll animations
  - `useDebounce` - General value debouncing
  - `useSearchDebounce` - Search-specific debouncing with min length

### Best Practices for setTimeout

#### ✅ ACCEPTABLE Uses:
1. **Dropdown onBlur delays (200ms)**: Industry-standard UX pattern to allow clicking dropdown items without premature closure
2. **DOM update delays for animations**: When waiting for React renders before scrolling (use `useScrollToElement` hook)
3. **Debouncing/Throttling**: 
   - Search input delays (300-500ms typical) - use `useDebounce` or `useSearchDebounce` hooks
   - Form validation delays
   - API call rate limiting
4. **User feedback delays**: Show a message for X seconds then hide
5. **Third-party library workarounds**: When you genuinely need to wait for external code
6. **Event listener setup delays**: Preventing immediate trigger of global listeners (e.g., click-outside handlers that shouldn't fire on the opening click)

#### ❌ AVOID setTimeout for:
1. **Focus management**: Use `useEffect` with proper dependencies or `autoFocus` attribute instead
2. **State synchronization**: Use React lifecycle hooks
3. **API call sequencing**: Use async/await or promises
4. **Component mounting**: Use useEffect or useLayoutEffect

### Focus Management Patterns
- Focus traps should always respect tabIndex order
- Always use `useEffect` hooks for focus transitions after state changes
- Never use setTimeout for focus changes - use React lifecycle instead
- Consider using the `autoFocus` attribute for initial focus
- Ensure proper cleanup in useEffect return functions

### Example Patterns

#### Dropdown Blur Pattern:
```typescript
// ❌ DON'T DO THIS:
onBlur={() => setTimeout(() => setShow(false), 200)}

// ✅ DO THIS:
import { useDropdownBlur } from '@/hooks/useDropdownBlur';
const handleBlur = useDropdownBlur(setShow);
// ...
onBlur={handleBlur}
```

#### Focus Management Pattern:
```typescript
// ❌ DON'T DO THIS:
setTimeout(() => element.focus(), 100);

// ✅ DO THIS:
useEffect(() => {
  if (condition) {
    element?.focus();
  }
}, [condition]);

// OR for initial focus:
<input autoFocus />
```

#### Scroll Animation Pattern:
```typescript
// ❌ DON'T DO THIS:
setTimeout(() => {
  document.getElementById(id)?.scrollIntoView();
}, 100);

// ✅ DO THIS:
import { useScrollToElement } from '@/hooks/useScrollToElement';
const scrollTo = useScrollToElement(scrollFunction);
scrollTo(elementId);
```

#### Search Debouncing Pattern:
```typescript
// ❌ DON'T DO THIS:
const timeoutRef = useRef();
const handleSearch = (value) => {
  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    searchAPI(value);
  }, 500);
};

// ✅ DO THIS:
import { useSearchDebounce } from '@/hooks/useDebounce';
const { handleSearchChange } = useSearchDebounce(
  (query) => searchAPI(query),
  2, // min length
  TIMINGS.debounce.search // centralized timing
);
```

#### Click-Outside Pattern:
```typescript
// ❌ DON'T DO THIS:
setTimeout(() => {
  document.addEventListener('click', handleClickOutside);
}, 0);

// ✅ DO THIS:
import { TIMINGS } from '@/config/timings';
const timeoutId = setTimeout(() => {
  document.addEventListener('click', handleClickOutside);
}, TIMINGS.eventSetup.clickOutsideDelay);
```

### Testing Considerations
- All timing delays should be injectable or configurable
- Use centralized timing configuration that sets to 0ms in test environment
- Tests should run instantly without fake timers when properly abstracted
- This eliminates flaky tests and improves test execution speed

## Testing Patterns

### E2E Testing with Playwright
- **Keyboard Navigation Tests**: Always test full keyboard flow for forms
- **Multi-Select Testing**: Verify Space key toggles, Enter accepts, Escape cancels
- **Focus Management**: Ensure focus moves predictably through Tab order
- **Accessibility**: Test ARIA attributes and screen reader compatibility

### Debugging MobX Reactivity Issues
When components don't re-render despite state changes:

1. **Enable MobX debugging** in `/src/config/mobx.config.ts`
2. **Add diagnostic logging** to track state changes:
   ```typescript
   console.log('[Component] Rendering with:', observableArray.slice());
   ```
3. **Use MobXDebugger component** in development to visualize state
4. **Check for array spreading** that breaks observable chain
5. **Verify observer wrapping** on all components in render hierarchy

### Common Pitfalls and Solutions

#### ❌ Problem: Array spreading breaks reactivity
```typescript
// BAD - Creates new non-observable array
<CategorySelection 
  selectedClasses={[...vm.selectedTherapeuticClasses]} 
/>
```

#### ✅ Solution: Pass observable directly
```typescript
// GOOD - Maintains observable chain
<CategorySelection 
  selectedClasses={vm.selectedTherapeuticClasses} 
/>
```

#### ❌ Problem: Direct array mutation doesn't trigger updates
```typescript
// BAD - MobX might not detect the change
this.selectedItems.push(newItem);
```

#### ✅ Solution: Use immutable updates
```typescript
// GOOD - Creates new array reference
runInAction(() => {
  this.selectedItems = [...this.selectedItems, newItem];
});
```

## Component Patterns

### Unified Multi-Select Dropdown
The `MultiSelectDropdown` component is the standard for all multi-select needs:

```typescript
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';

<MultiSelectDropdown
  id="unique-id"
  label="Selection Label"
  options={['Option 1', 'Option 2']}
  selected={observableSelectedArray}  // Pass observable directly!
  onChange={(newSelection) => vm.setSelection(newSelection)}
  placeholder="Select items..."
  buttonTabIndex={17}
/>
```

Key features:
- Full keyboard navigation (Tab, Arrows, Space, Enter, Escape)
- WCAG 2.1 Level AA compliant
- MobX observable compatible
- Consistent UX across the application