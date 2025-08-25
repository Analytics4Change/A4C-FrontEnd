# Modal Architecture and Focus Management Mental Model

## Overview
This document outlines the mental model for modal architecture and focus management in the A4C-FrontEnd medication entry system, addressing the complexities of nested modals and tab order management.

## Current Architecture Analysis

### Modal Hierarchy
The application uses a hybrid approach with a single primary modal container and embedded sections:

```
Main Application
└── Medication Entry Modal (primary container - data-modal-id="medication-entry")
    ├── Medication Search Section
    │   ├── Search Input Field
    │   ├── Selected Medication Display
    │   ├── Clear (X) Button
    │   └── Search Results Dropdown (data-modal-id="medication-search-results")
    ├── Dosage Form Section
    │   ├── Dosage Form Category Dropdown
    │   ├── Form Type Dropdown
    │   ├── Dosage Amount Input
    │   ├── Dosage Unit Dropdown
    │   ├── Total Amount Input
    │   ├── Total Unit Dropdown
    │   ├── Frequency Dropdown
    │   └── Condition Dropdown
    ├── Category Selection Section
    │   ├── Broad Categories Button/List
    │   └── Specific Categories Button/List
    └── Date Selection Section
        ├── Start Date Input with Calendar Popup
        └── Discontinue Date Input with Calendar Popup
```

## Nested Modals in UX Development

### Definition
Nested modals (modal stacking) occur when a modal dialog opens on top of another modal. While technically possible, they present significant UX challenges.

### Common Problems with Nested Modals
1. **Focus Management Complexity**: Each modal layer requires its own focus trap
2. **Keyboard Navigation Ambiguity**: Unclear which modal responds to Escape key
3. **Z-index Management**: Ensuring proper visual layering
4. **Accessibility Barriers**: Screen readers struggle with multiple modal contexts
5. **Mobile Usability**: Limited screen space makes nesting impractical
6. **User Confusion**: Loss of context and navigation path

### When Nested Modals Are Acceptable
- **Transient Overlays**: Date pickers, autocomplete dropdowns, tooltips
- **Critical Confirmations**: "Are you sure?" dialogs that must interrupt flow
- **Progressive Disclosure**: Step-by-step wizards with clear progression

## Recommended Mental Model

### Single Container with Focus Contexts
Instead of true nested modals, implement a single modal container with multiple focus contexts:

```
Medication Entry Modal (Primary Focus Container)
├── Focus Context 1: Search/Selection Phase
├── Focus Context 2: Form Input Phase (structured tab order)
├── Focus Context 3: Transient Overlays (temporary focus trap)
└── Focus Context 4: Action Phase (Save/Cancel)
```

### Focus Flow Principles
1. **Linear Progression**: Main form follows predictable top-to-bottom, left-to-right flow
2. **Temporary Diversion**: Dropdowns/calendars create temporary focus traps
3. **Return Path**: Closing overlays returns focus to trigger element
4. **Escape Hierarchy**: Escape closes deepest overlay first, then modal

## Tab Order Implementation Strategy

### Current Issues
- Elements without explicit tabIndex values fall back to DOM order
- Mixing numbered and unnumbered elements creates unexpected tab sequences
- Browser handles tab order as: positive tabIndex (1,2,3...) → elements without tabIndex (DOM order) → negative tabIndex (not focusable)

### Recommended Approach

#### Option 1: Comprehensive tabIndex Assignment
Assign explicit tabIndex to ALL interactive elements:
```
Search Section: 1-2
Form Fields: 3-14
Categories: 15-16
Dates: 17-18
Actions: 19-20
```

#### Option 2: Natural DOM Order
Remove all tabIndex attributes and ensure DOM order matches desired tab sequence.

#### Option 3: Hybrid Approach (Current)
Use tabIndex only for elements that need non-DOM order, but this creates the current jumping behavior.

## Focus Management Rules

### Within Main Modal
1. Tab cycles through all focusable elements
2. Shift+Tab reverses direction
3. Tab from last element wraps to first (if focus trapped)

### Within Dropdowns/Overlays
1. Opening dropdown moves focus into it
2. Tab/Arrow keys navigate options
3. Enter selects option and closes
4. Escape closes without selection
5. Focus returns to trigger element on close

### Edge Cases
- Disabled fields should be skipped in tab order
- Hidden elements must not receive focus
- Dynamic content changes should preserve focus position
- Loading states should announce to screen readers

## Implementation Considerations

### Accessibility Requirements
- ARIA attributes: role, aria-modal, aria-labelledby
- Focus visible indicators for keyboard navigation
- Screen reader announcements for state changes
- Escape key handling at each level

### Performance Implications
- Minimize DOM manipulation during focus changes
- Debounce rapid focus events
- Clean up event listeners on unmount
- Avoid forced reflows during transitions

## Testing Strategy

### Manual Testing
1. Navigate entire form using only keyboard
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Verify focus trap boundaries
4. Test escape key at each level
5. Verify tab order matches visual layout

### Automated Testing (Playwright)
- Tab order sequence validation
- Focus trap boundary testing
- Keyboard navigation paths
- ARIA attribute presence
- Focus restoration after overlay close

## Future Improvements

1. **Standardize Focus Management**: Create reusable focus trap hook
2. **Declarative Tab Order**: Define tab order in configuration
3. **Focus History**: Maintain focus history for complex navigation
4. **Keyboard Shortcuts**: Add accelerator keys for common actions
5. **Visual Focus Indicators**: Enhanced focus rings for better visibility

## Conclusion

The current implementation mixes paradigms (numbered tabIndex with unnumbered elements), creating unexpected tab sequences. A comprehensive approach using either full tabIndex assignment or natural DOM order would provide more predictable keyboard navigation. The single modal container with multiple focus contexts is the correct architecture, but requires consistent focus management implementation across all interactive elements.