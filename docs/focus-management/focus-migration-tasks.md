# Focus Management System Migration Task List

## Overview
This document tracks the implementation of the new unified focus management system, migrating from the current complex implementation (9 complexity points identified) to a clean architecture using FocusManagerContext + Radix UI.

## Current State Analysis
- **Complexity Points Identified**: 9 major issues
  - Mixed focus patterns (auto-open vs manual)
  - Heavy reliance on 50ms/100ms timeouts
  - Validation blocking without escape
  - No escape hatch in modals
  - Tab prevention breaking standard navigation
  - State coupling with ViewModel
  - Auto-open modals on focus events
  - Complex nested modal flows
  - Missing SideEffectsSelection implementation

## Required Documentation
**All agents MUST review these documents before beginning any task:**

### 1. /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md
- **Purpose**: Comprehensive architecture plan and implementation examples
- **Contents**: Design principles, component architecture, implementation patterns, testing strategies
- **Critical for**: Understanding the target state and migration approach

### 2. /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md  
- **Purpose**: Current implementation details with all complexity points
- **Contents**: Actual code flows, timeout dependencies, modal behaviors, known issues
- **Critical for**: Understanding what needs to be migrated and potential pitfalls

### 3. /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md
- **Purpose**: Step-by-step migration guide with examples
- **Contents**: Hook replacements, migration patterns, common pitfalls, testing strategies
- **Critical for**: Understanding how to convert old patterns to new system

### 4. /home/lars/dev/A4C-FrontEnd/docs/focus-management/medication-search-analysis.md
- **Purpose**: Deep analysis of MedicationSearch component complexity
- **Contents**: Detailed breakdown of focus issues, complexity score, migration risks
- **Critical for**: Understanding specific migration challenges for complex components

### 5. /home/lars/dev/A4C-FrontEnd/docs/focus-management/INFRASTRUCTURE_TESTS_SUMMARY.md
- **Purpose**: Summary of all infrastructure testing completed
- **Contents**: Test coverage reports, edge cases covered, validation approaches
- **Critical for**: Understanding testing requirements and patterns

## Migration Phases

### PHASE 1: Core Infrastructure (Tasks 001-006)
**Goal**: Build foundational components without breaking existing functionality
**Risk Level**: Low (new code, no breaking changes)
**Token Budget**: ~40,000 tokens

#### Task 001: Core FocusManagerContext [software-architect-dbc] ✅ COMPLETED
**Required Reading**: 
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Sections on "Architecture Overview" and "Core Components"
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Review current complexity points to avoid
- [x] Create base context with registry system
- [x] Implement scope management for modal isolation  
- [x] Add basic navigation (focusNext, focusPrevious, focusField)
- [x] Implement modal stack for nested modals
- [x] Add focus history tracking
**Success Criteria**: Context created ✅ | Registry working ✅ | Navigation tested ✅ | Modal stack functional ✅
**Implementation Notes**: 
- Created complete FocusManagerContext with all required features
- Added comprehensive TypeScript types and interfaces
- Implemented multiple hooks for different use cases
- Included test suite and migration guide
- Files created in src/contexts/focus/

#### Task 002: Mouse Navigation Support [fullstack-engineer-tdd] ✅ COMPLETED
**Completed**: 2025-01-15 3:30 PM
**Duration**: 45 minutes
**Dependencies**: task-001 (✅ COMPLETED)
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "Mouse Navigation" section and interaction patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current mouse handling limitations
- [x] Add mouse click handlers to context (enhanced handleMouseNavigation with visual feedback)
- [x] Implement navigation mode detection (keyboard/mouse/hybrid with AUTO mode)
- [x] Create jump validation logic (enhanced canJumpToNode with hybrid mode support)
- [x] Add mouse interaction history (MouseInteraction tracking with validity status)
- [x] Implement auto-mode switching based on user behavior (3-second timeout for mode transitions)
**Success Criteria**: 
- Mouse handlers work ✓ (handleMouseNavigation with click behaviors and custom handlers)
- Mode switching smooth ✓ (auto-detection with timeouts, immediate hybrid mode on interaction)
- Validation active ✓ (canJumpToNode with debug logging and hybrid mode permissions)
- History tracked ✓ (mouseInteractionHistory with position and validity tracking)
**Implementation Notes**:
- Enhanced existing mouse navigation implementation in FocusManagerContext.tsx
- Added visual feedback for invalid jump attempts (CSS class animation)
- Implemented custom event dispatching for invalid jumps (focusInvalidJump event)
- Added support for clickAdvancesTo property for specific navigation targets
- Created comprehensive test suite in __tests__/mouseNavigation.test.tsx
- Built demo component in demo/MouseNavigationDemo.tsx showcasing all features
- Added CSS styles in focus-manager.css for visual feedback and mode indicators
- Enhanced auto-mode switching with activity timeouts (3 seconds of single-mode activity)
- Added debug logging throughout for better development experience

#### Task 003: ManagedDialog Wrapper [fullstack-engineer-tdd] ✅ COMPLETED
**Completed**: 2025-01-15 4:15 PM
**Duration**: 45 minutes
**Dependencies**: task-001 (✅ COMPLETED - FocusManagerContext exists in src/contexts/focus/)
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "ManagedDialog Component" implementation example
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Modal complexity points and auto-open issues
- [x] Create Radix Dialog wrapper component (implemented in src/components/focus/ManagedDialog.tsx)
- [x] Integrate with FocusManager scope push/pop (using openModal/closeModal from context)
- [x] Implement focus restoration on close (restores to trigger or specified element)
- [x] Add support for nested dialogs (demonstrated in ManagedDialogDemo.tsx)
- [x] Test with simple modal example (created comprehensive demo and test suite)
**Success Criteria**: 
- Wrapper created ✓ (ManagedDialog component fully implemented with TypeScript)
- Scope works ✓ (integrated with FocusManager's modal stack management)
- Restoration tested ✓ (focus restoration working with 100ms delay for stability)
- Radix stable ✓ (using existing @radix-ui/react-dialog v1.1.14)
**Implementation Notes**:
- Created ManagedDialog.tsx with full TypeScript interface and documentation
- Integrated with FocusManagerContext's openModal/closeModal for scope management
- Implemented automatic focus restoration to trigger element or custom target
- Added support for nested dialogs through modal stack in FocusManager
- Created ManagedDialogClose component for custom close buttons
- Implemented useManagedDialog hook for programmatic control
- Built comprehensive demo component (ManagedDialogDemo.tsx) showcasing:
  - Simple dialogs with auto-restoration
  - Form dialogs with custom restoration targets
  - Nested dialog support
  - Programmatically controlled dialogs
  - Various configuration options (closeOnEscape, closeOnOutsideClick, etc.)
- Created extensive test suite (ManagedDialog.test.tsx) covering:
  - Basic functionality
  - Focus management and restoration
  - Nested dialog support
  - Keyboard navigation (Escape key)
  - Programmatic control
  - Completion callbacks
- Files created:
  - /src/components/focus/ManagedDialog.tsx (main component)
  - /src/components/focus/ManagedDialogDemo.tsx (demo/examples)
  - /src/components/focus/ManagedDialog.test.tsx (test suite)
  - /src/components/focus/index.ts (exports)

#### Task 004: FocusableField Component [fullstack-engineer-tdd] ✅ COMPLETED
**Completed**: 2025-01-15 5:30 PM
**Duration**: 30 minutes
**Dependencies**: task-001 (✅ COMPLETED - FocusManagerContext exists in src/contexts/focus/)
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "FocusableField Component" implementation
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current field validation and blocking behavior
- [x] Create field wrapper with ref management (implemented with wrapperRef and proper DOM element handling)
- [x] Add validator support (canReceiveFocus, canLeaveFocus implemented as async functions)
- [x] Implement mouse override configuration (full MouseNavigationConfig support with captureClicks, preserveFocusOnInteraction, allowDirectJump)
- [x] Add keyboard handlers (Enter/Tab implemented with validation checks and Ctrl+Enter for hybrid mode)
- [x] Include step indicator metadata (VisualIndicatorConfig with label, description, and allowDirectAccess)
**Success Criteria**: 
- Component works ✓ (FocusableField.tsx fully implemented with TypeScript)
- Validators functional ✓ (canReceiveFocus and canLeaveFocus working with async support)
- Navigation works ✓ (keyboard navigation via Enter/Tab, mouse click handling)
- Overrides applied ✓ (mouse overrides and step indicator metadata properly integrated)
**Implementation Notes**:
- Created FocusableField.tsx component with comprehensive TypeScript interface
- Integrated with existing FocusManagerContext using registerElement/unregisterElement
- Implemented dual interaction mode tracking (mouse vs keyboard)
- Added validation support with canReceiveFocus and canLeaveFocus functions
- Mouse override configuration includes:
  - captureClicks for custom click handling
  - onClickOutside callback support
  - preserveFocusOnInteraction to maintain focus flow
  - allowDirectJump for step indicator navigation
- Keyboard handlers include:
  - Enter key to advance when field is complete
  - Tab key respects validation (prevented when canLeaveFocus returns false)
  - Ctrl+Enter switches to hybrid navigation mode
- Step indicator metadata properly registered with visual indicator config
- Created comprehensive demo (FocusableField.demo.tsx) showcasing:
  - Progressive field enabling based on validation
  - Email and phone validation examples
  - Step indicator with clickable navigation
  - Real-time validation feedback
- Created extensive test suite (FocusableField.test.tsx) covering:
  - Component registration and cleanup
  - Validation function behavior
  - Keyboard navigation
  - Mouse interaction overrides
  - Step indicator metadata
  - Integration scenarios
- Files created:
  - /src/components/FocusableField.tsx (main component)
  - /src/components/FocusableField.demo.tsx (interactive demo)
  - /src/components/FocusableField.test.tsx (test suite)

#### Task 005: StepIndicator Component [fullstack-engineer-tdd] ✅ COMPLETED
**Completed**: 2025-01-15 6:00 PM
**Duration**: 30 minutes
**Dependencies**: task-002 (✅ COMPLETED - Mouse Navigation Support)
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "Visual Progress Indicators" section
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current navigation flow for context
- [x] Build visual progress component (implemented in src/components/focus/StepIndicator.tsx)
- [x] Add clickable step navigation (handleStepClick with validation and visual feedback)
- [x] Implement status tracking (complete/current/upcoming/disabled with proper styling)
- [x] Add connector lines between steps (with animated progress indicators)
- [x] Support horizontal/vertical orientation (plus compact variant)
**Success Criteria**: 
- Renders correctly ✓ (all status types render with proper classes and icons)
- Clicks work ✓ (clickable steps navigate, non-clickable show visual feedback)
- Status updates ✓ (integrates with FocusManagerContext for real-time updates)
- A11y compliant ✓ (proper ARIA attributes, keyboard navigation, screen reader support)
**Implementation Notes**:
- Created StepIndicator.tsx component with full TypeScript support
- Integrates with FocusManagerContext via getVisibleSteps() for automatic step discovery
- Supports both custom steps array and automatic discovery from registered FocusableFields
- Click navigation features:
  - Validates jumps using canJumpToNode from context
  - Switches to hybrid navigation mode on click
  - Shows invalid jump animation with shake effect
  - Respects allowJumping prop for override behavior
- Status tracking implementation:
  - Complete: green with checkmark icon
  - Current: blue with ring animation
  - Upcoming: white/gray, clickable based on validation
  - Disabled: grayed out with reduced opacity
- Connector lines show progress between steps with color coding
- Three orientation/size variants:
  - StepIndicator: standard horizontal/vertical with all features
  - VerticalStepIndicator: vertical-only variant
  - CompactStepIndicator: small size without descriptions
- Accessibility features:
  - Proper role="navigation" with aria-label
  - aria-current="step" for current step
  - Descriptive aria-labels including status
  - Keyboard accessible with proper focus states
  - Screen reader announcements for all states
- Created comprehensive demo (StepIndicator.demo.tsx) with:
  - Form integration showing real-time updates
  - Static examples with all variants
  - Size demonstrations (small/medium/large)
  - Custom render function example
- Created extensive test suite (StepIndicator.test.tsx) covering:
  - Basic rendering and status display
  - Click navigation and validation
  - Orientation and connector rendering
  - Size variants and custom rendering
  - Accessibility compliance
  - Integration with FocusableField
- Added CSS animations (StepIndicator.css) including:
  - Invalid jump shake animation
  - Current step pulse effect
  - Connector progress animation
  - Checkmark draw animation
  - Dark mode and high contrast support
  - Reduced motion media query support
- Files created:
  - /src/components/focus/StepIndicator.tsx (main component)
  - /src/components/focus/StepIndicator.demo.tsx (interactive demo)
  - /src/components/focus/StepIndicator.test.tsx (test suite)
  - /src/components/focus/StepIndicator.css (styles and animations)
  - Updated /src/components/focus/index.ts (exports)

#### Task 006: Infrastructure Testing [qa-test-engineer] ✅ COMPLETED
**Completed**: 2025-01-17 (via qa-test-engineer agent)
**Duration**: ~1 hour
**Dependencies**: task-001, task-003, task-004, task-005
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "Testing Strategy" section
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Known issues to test against
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/INFRASTRUCTURE_TESTS_SUMMARY.md: Test patterns and coverage
- [x] Unit tests for FocusManagerContext (89 tests created)
- [x] Unit tests for ManagedDialog (67 tests created)  
- [x] Component tests for FocusableField (78 tests created)
- [x] Visual tests for StepIndicator (71 tests created)
- [x] Edge case coverage (comprehensive edge cases tested)
**Success Criteria**: 90% coverage ✓ | All passing ✓ | Edge cases handled ✓
**Implementation Notes**:
- Created 305 total unit test cases across 49 test suites
- Test files created in:
  - src/contexts/focus/__tests__/FocusManagerContext.test.tsx
  - src/components/focus/__tests__/ManagedDialog.test.tsx  
  - src/components/__tests__/FocusableField.test.tsx
  - src/components/focus/__tests__/StepIndicator.test.tsx
- Comprehensive coverage of registry management, navigation, modal operations, mouse handling
- Edge cases thoroughly tested including null refs, missing validators, rapid operations
- All tests follow React Testing Library best practices
- Note: Integration tests skipped per user request, only unit tests written

### PHASE 2: Component Migration (Tasks 007-017)
**Goal**: Migrate existing components to new system
**Risk Level**: Medium (modifying existing code)
**Token Budget**: ~60,000 tokens

#### Task 007: Analyze MedicationSearch [software-architect-dbc] ✅ COMPLETED
**Completed**: 2025-01-17 (via software-architect-dbc agent)
**Duration**: ~30 minutes
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Review architecture principles before analysis
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: "MedicationSearch" section for current implementation
- [x] Document current focus implementation (comprehensive analysis completed)
- [x] Map timeout dependencies (3 timeouts found: 50ms, 50ms, 200ms)
- [x] Identify dropdown auto-open logic (onChange triggered with value check)
- [x] List all refs and event handlers (2 refs, 6 event handlers documented)
- [x] Create migration checklist (detailed checklist with code examples)
**Success Criteria**: Flow documented ✓ | Dependencies mapped ✓ | Complexity identified ✓
**Implementation Notes**:
- Component located at: src/components/MedicationSearch/MedicationSearch.tsx
- Complexity Score: 7/10 (high complexity due to timeouts and keyboard handling)
- Key issues identified:
  - 3 setTimeout instances (50ms, 50ms, 200ms delays)
  - Complex onKeyDown with 12 cyclomatic complexity
  - Manual focus() calls on refs
  - Tab key preventDefault breaking standard navigation
  - Tight coupling with parent component for dropdown state
- Analysis document created: src/contexts/focus/__tests__/medication-search-analysis.md
- Migration risks identified: High risk for dropdown and Tab handling
- Recommended phased migration approach documented

#### Task 008: Migrate MedicationSearch [fullstack-engineer-tdd] ⚠️ SPLIT REQUIRED
**Dependencies**: task-004, task-007
**References**: task-007 findings (Complexity: 7/10)
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Component migration patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: MedicationSearch complexity points
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/medication-search-analysis.md: Full analysis (Complexity: 7/10)

**⚠️ IMPORTANT**: Based on Task 007 analysis, this component's complexity (7/10) exceeds initial estimates. Recommend splitting into 3 sub-tasks:

##### Task 008a: Dropdown Pattern Development
- [ ] Create DropdownField wrapper component
- [ ] Implement AutoCompleteValidator
- [ ] Add FocusableDropdown integration
- [ ] Test with simple use case

##### Task 008b: Core MedicationSearch Migration
- [ ] Replace manual focus() calls (lines 45-47)
- [ ] Remove all setTimeout wrappers (3 instances)
- [ ] Wrap with FocusableField
- [ ] Migrate basic keyboard handlers

##### Task 008c: Complex Logic Migration
- [ ] Refactor onKeyDown logic (complexity: 12)
- [ ] Implement search validators
- [ ] Handle Tab preventDefault properly
- [ ] Preserve dropdown functionality
- [ ] Test auto-selection heuristics

**Success Criteria**: Migration complete ✓ | No timeouts ✓ | Validators work ✓ | Dropdown functional ✓
**Estimated Effort**: 12-16 hours (increased from 8-12)
**Risk Level**: Medium-High (elevated from Medium)

#### Task 009: Analyze DosageForm [software-architect-dbc]
**Dependencies**: task-008
**References**: task-008 challenges
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Multi-field form handling patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: "DosageForm" section with 8-field complexity
- [ ] Map all 8 input refs
- [ ] Document validation blocking logic
- [ ] Identify condition-based completion
- [ ] Note amount field special handling
- [ ] Create field dependency map
**Success Criteria**: Refs mapped ✓ | Validation documented ✓ | Flow diagram created ✓

#### Task 010: Migrate DosageForm [fullstack-engineer-tdd]
**Dependencies**: task-004, task-009
**References**: task-009 findings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: FocusableField usage in forms
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: DosageForm validation blocking issues
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md: FocusableField patterns
- [ ] Wrap all 8 fields with FocusableField
- [ ] Implement amount validation guards
- [ ] Add proper field ordering
- [ ] Handle conditional completion
- [ ] Test validation blocking
**Success Criteria**: 8 fields migrated ✓ | Validation works ✓ | Flow preserved ✓

#### Task 011: Analyze CategorySelection [software-architect-dbc]
**References**: Previous modal findings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Modal management patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: "CategorySelection" auto-open behavior
- [ ] Document auto-open on focus behavior
- [ ] Map broad/specific modal relationship
- [ ] Identify state management coupling
- [ ] Note button refs usage
- [ ] Document selection persistence
**Success Criteria**: Auto-open documented ✓ | Flow mapped ✓ | Coupling identified ✓

#### Task 012: Migrate CategorySelection [fullstack-engineer-tdd]
**Dependencies**: task-003, task-011
**References**: task-011 findings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: ManagedDialog implementation
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Nested modal complexity
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md: Modal migration patterns
- [ ] Convert to ManagedDialog
- [ ] Remove onFocus auto-open
- [ ] Implement modal scope management
- [ ] Preserve selection state
- [ ] Test both modal flows
**Success Criteria**: Modals migrated ✓ | Auto-open removed ✓ | Scope works ✓ | Selection preserved ✓

#### Task 013: Analyze DateSelection [software-architect-dbc]
**References**: Modal patterns from task-011
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Conditional navigation patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: "DateSelection" auto-open and timeout issues
- [ ] Document calendar auto-open
- [ ] Map temp date state management
- [ ] Identify Skip/Cancel/Done flow
- [ ] Note 50ms delay usage
- [ ] Document conditional relationships
**Success Criteria**: Calendar documented ✓ | State mapped ✓ | Refs identified ✓

#### Task 014: Migrate DateSelection [fullstack-engineer-tdd]
**Dependencies**: task-003, task-013
**References**: task-013 findings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Calendar modal patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Date selection flow complexity
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md: ManagedDialog usage
- [ ] Convert both calendars to ManagedDialog
- [ ] Add conditional validators
- [ ] Remove auto-open logic
- [ ] Implement proper restoration
- [ ] Test date relationships
**Success Criteria**: Calendars migrated ✓ | Conditionals work ✓ | Restoration tested ✓

#### Task 015: Create SideEffectsSelection [fullstack-engineer-tdd]
**Dependencies**: task-003
**Challenge**: New component, nested modal pattern
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Nested modal examples and patterns (Section 2.4)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Expected integration points
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md: ManagedDialog nested modal support
- [ ] Implement base selection modal
- [ ] Add search functionality
- [ ] Create selection list UI
- [ ] Implement nested "Other" modal
- [ ] Add text capture for custom effects
**Success Criteria**: Component created ✓ | Search works ✓ | Nested modal works ✓ | Text captured ✓

#### Task 016: Handle Nested Modal Focus [software-architect-dbc]
**Dependencies**: task-015
**References**: task-015 implementation
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Modal stack management (Lines 226-244)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Nested modal issues to avoid
- [ ] Implement nested scope management
- [ ] Add proper focus restoration chain
- [ ] Prevent focus loops
- [ ] Test escape key handling
- [ ] Document nesting pattern
**Success Criteria**: Nesting works ✓ | Restoration correct ✓ | No loops ✓

#### Task 017: Integration Testing [qa-test-engineer]
**Dependencies**: task-008, task-010, task-012, task-014, task-015
**References**: All migration challenges
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Full testing strategy (Phase 4)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: All complexity points to verify resolved
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/INFRASTRUCTURE_TESTS_SUMMARY.md: Test patterns to follow
- [ ] Test complete medication flow
- [ ] Verify no focus dead ends
- [ ] Check modal transitions
- [ ] Validate save button reachable
- [ ] Test error scenarios
**Success Criteria**: Full flow works ✓ | No dead ends ✓ | Save reachable ✓

### PHASE 3: Flow Configuration (Tasks 018-021)
**Goal**: Implement declarative flow configuration
**Risk Level**: Low (enhancement layer)
**Token Budget**: ~30,000 tokens

#### Task 018: Create Flow Configuration [software-architect-dbc]
**References**: Integration test findings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: "Declarative Flow Configuration" section (Lines 1262-1313)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current flow for reference
- [ ] Define medicationEntryFlow structure
- [ ] Add node definitions with order
- [ ] Implement branch conditions
- [ ] Create validators map
- [ ] Add skip conditions
**Success Criteria**: Config created ✓ | Branches defined ✓ | Validators work ✓

#### Task 019: Implement useFocusFlow Hook [software-architect-dbc]
**Dependencies**: task-018
**References**: task-018 configuration
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Flow hook implementation patterns (Lines 1315-1384)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Flow complexity to abstract
- [ ] Process flow configuration
- [ ] Auto-register nodes
- [ ] Handle branching logic
- [ ] Implement skip conditions
- [ ] Add flow navigation methods
**Success Criteria**: Hook works ✓ | Branching functional ✓ | Skips respected ✓

#### Task 020: Step Indicator Integration [fullstack-engineer-tdd]
**Dependencies**: task-005, task-019
**References**: Flow configuration
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Progress indicator integration (Lines 1105-1258)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Navigation flow context
- [ ] Connect to focus flow
- [ ] Show current position
- [ ] Update completed steps
- [ ] Enable allowed navigation
- [ ] Add visual feedback
**Success Criteria**: Steps display ✓ | Status updates ✓ | Navigation works ✓

#### Task 021: Mouse/Keyboard Mode Switching [fullstack-engineer-tdd]
**Dependencies**: task-002
**References**: Mouse navigation patterns
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Interaction mode detection (Lines 336-364)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current interaction limitations
- [ ] Add interaction detection
- [ ] Implement mode switching
- [ ] Add visual indicators
- [ ] Handle Ctrl+Click behavior
- [ ] Test mode persistence
**Success Criteria**: Detection works ✓ | Switching smooth ✓ | Indicators present ✓

### PHASE 4: Testing & Validation (Tasks 022-026)
**Goal**: Ensure quality and accessibility
**Risk Level**: Low (validation only)
**Token Budget**: ~40,000 tokens

#### Task 022: Keyboard Navigation Testing [qa-test-engineer]
**Dependencies**: task-017
**References**: All keyboard patterns
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Keyboard navigation specifications (Lines 1666-1690)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current keyboard issues
- [ ] Test Tab/Shift+Tab cycle
- [ ] Verify Enter advancement
- [ ] Test Escape in modals
- [ ] Check Ctrl+Enter jumps
- [ ] Validate all shortcuts
**Success Criteria**: Tab works ✓ | Enter advances ✓ | Escape closes ✓ | Shortcuts work ✓

#### Task 023: Mouse Navigation Testing [qa-test-engineer]
**Dependencies**: task-021
**References**: Mouse implementation
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Mouse navigation specifications (Lines 1524-1644)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current mouse handling
- [ ] Test click advancement
- [ ] Verify step indicator clicks
- [ ] Test invalid jump prevention
- [ ] Check mode switching
- [ ] Validate visual feedback
**Success Criteria**: Clicks advance ✓ | Steps clickable ✓ | Jumps prevented ✓ | Mode switches ✓

#### Task 024: Accessibility Audit [qa-test-engineer]
**Dependencies**: task-017
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Accessibility requirements (Lines 1648-1716)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current accessibility gaps
- [ ] Run axe-core tests
- [ ] Test NVDA screen reader
- [ ] Test JAWS screen reader
- [ ] Verify ARIA attributes
- [ ] Check color contrast
**Success Criteria**: No violations ✓ | Readers work ✓ | ARIA correct ✓ | Contrast passes ✓

#### Task 025: Performance Testing [qa-test-engineer]
**Dependencies**: task-017
**References**: Performance metrics
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Performance targets (Lines 1896-1961)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Current performance issues (timeouts)
- [ ] Measure focus transitions
- [ ] Time modal open/close
- [ ] Check memory usage
- [ ] Profile for bottlenecks
- [ ] Create performance report
**Success Criteria**: <100ms transitions ✓ | <150ms modals ✓ | <5MB memory ✓ | No bottlenecks ✓

#### Task 026: Error Boundary Implementation [software-architect-dbc]
**References**: Error scenarios from testing
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Error handling patterns (Lines 2036-2087)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Known failure modes
- [ ] Create FocusErrorBoundary
- [ ] Add fallback UI
- [ ] Implement error reporting
- [ ] Add manual restoration
- [ ] Test error recovery
**Success Criteria**: Catches errors ✓ | Fallback works ✓ | Errors reported ✓ | Restore works ✓

### PHASE 5: Cleanup & Optimization (Tasks 027-030)
**Goal**: Remove legacy code and optimize
**Risk Level**: Medium (removing old code)
**Token Budget**: ~30,000 tokens

#### Task 027: Remove Legacy Code [software-architect-dbc]
**Dependencies**: task-017
**References**: All legacy patterns found
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Target state for comparison (Lines 1824-1849)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: All legacy patterns to remove (Lines 105-182)
- [ ] Delete setTimeout focus calls
- [ ] Remove onFocus auto-open
- [ ] Eliminate focus tracking refs
- [ ] Clean unused utilities
- [ ] Update imports
**Success Criteria**: Timeouts removed ✓ | Auto-open deleted ✓ | Refs cleaned ✓ | No legacy remains ✓

#### Task 028: Implement Feature Flags [software-architect-dbc]
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Migration strategy section (Lines 1998-2033)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Risk areas needing flags
- [ ] Add environment flags
- [ ] Support user-specific flags
- [ ] Enable A/B testing
- [ ] Create rollback mechanism
- [ ] Document flag usage
**Success Criteria**: Flags work ✓ | Rollback possible ✓ | A/B ready ✓

#### Task 029: Performance Optimization [software-architect-dbc]
**Dependencies**: task-025
**References**: Performance test results
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Performance optimization techniques (Lines 1851-1894)
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Performance bottlenecks
- [ ] Debounce focus updates
- [ ] Add intersection observer
- [ ] Optimize registry lookups
- [ ] Implement caching
- [ ] Reduce re-renders
**Success Criteria**: Updates debounced ✓ | Observer works ✓ | Lookups fast ✓ | Performance improved ✓

#### Task 030: Documentation & Handoff [software-architect-dbc]
**Dependencies**: task-029
**References**: All implementation learnings
**Required Reading**:
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md: Full document for reference
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md: Migration journey context
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/MIGRATION_GUIDE.md: Complete migration patterns
- /home/lars/dev/A4C-FrontEnd/docs/focus-management/INFRASTRUCTURE_TESTS_SUMMARY.md: Testing approach documentation
- [ ] Write developer guide
- [ ] Document migration patterns
- [ ] Create troubleshooting guide
- [ ] Record video walkthrough
- [ ] Prepare handoff materials
**Success Criteria**: Guide complete ✓ | Patterns documented ✓ | Troubleshooting ready ✓ | Video done ✓

## Implementation Notes

### Critical Documentation Requirements
**IMPORTANT**: Before starting ANY task, agents MUST:
1. Load and review focus-rearchitecture.md for target architecture understanding
2. Load and review current-focus-flow.md for current implementation context
3. Review the specific "Required Reading" sections listed in their task
4. Reference these documents throughout implementation

## Task Completion Protocol

### Overview
**Every agent MUST follow this protocol when working on and completing tasks.** This ensures consistent progress tracking, clear communication between agents, and verifiable completion of all work items.

### Task Status Legend
- **[ ]** Not started - Task has not been begun
- **[x]** Completed - Individual checklist item is complete
- **✅ COMPLETED** - Task fully verified with all success criteria met
- **⚠️ PARTIAL** - Some items complete but blocked or needs review
- **❌ BLOCKED** - Cannot proceed due to dependencies or issues

### Pre-Task Requirements
Before beginning any task:
1. **Verify Dependencies**: Check that all listed dependency tasks show ✅ COMPLETED status
2. **Load Required Documentation**: Read all documents listed in "Required Reading" section
3. **Review References**: Check findings from referenced tasks
4. **Update Status**: Add timestamp when starting work (e.g., "Started: 2025-01-15 10:30 AM")

**Document Priority Order for Loading**:
1. First: `/home/lars/dev/A4C-FrontEnd/docs/focus-management/focus-rearchitecture.md` (target architecture)
2. Second: `/home/lars/dev/A4C-FrontEnd/docs/focus-management/current-focus-flow.md` (current state)
3. Then: Task-specific documents as listed in Required Reading

### During Task Execution

#### Checklist Item Updates
As you work through the task:
1. **Mark items in real-time**: Update [x] as each checklist item is completed
2. **Add inline notes**: Include brief implementation notes after completed items
   ```
   - [x] Create base context with registry system (implemented in src/contexts/focus/)
   ```
3. **Document blockers**: If an item cannot be completed, note the reason
   ```
   - [ ] Add keyboard handlers ⚠️ BLOCKED: Waiting for Task 001 context implementation
   ```

#### Implementation Notes
Add detailed notes in the **Implementation Notes** section of your task:
- File paths created or modified
- Key design decisions made
- Challenges encountered and how they were resolved
- Deviations from the original plan with justification
- Performance measurements or test results
- Integration points with other components

### Success Criteria Verification

#### Verification Process
**Each success criterion MUST be individually verified before marking the task complete:**

1. **Test Each Criterion**: Run specific tests to verify each success point
2. **Mark with Checkmark**: Add ✓ after verified criteria
3. **Provide Evidence**: Include test output, screenshots, or metrics as proof
4. **Document Failures**: If a criterion cannot be met, mark with ✗ and explain

#### Evidence Documentation Format
```
**Success Criteria**: 
- Context created ✓ (FocusManagerContext.tsx implemented and exports working)
- Registry working ✓ (Unit tests passing: 15/15 tests)  
- Navigation tested ✓ (Manual testing completed, Tab/Enter/Arrow keys functional)
- Modal stack functional ✗ (Nested modals not fully working - see notes)
```

#### Handling Unmet Criteria
If success criteria cannot be fully met:
1. **Do NOT mark task as ✅ COMPLETED**
2. **Use ⚠️ PARTIAL status** with explanation
3. **Document the specific issue** in Implementation Notes
4. **Create follow-up task** if needed
5. **Note impact on dependent tasks**

### Task Completion Steps

#### Final Verification Checklist
Before marking a task as ✅ COMPLETED:
- [ ] All checklist items marked [x] or documented as blocked
- [ ] All success criteria verified with ✓ marks
- [ ] Implementation notes added with file paths and decisions
- [ ] Test results or evidence provided
- [ ] Dependencies for next tasks verified as unblocked
- [ ] Cross-references to affected tasks added

#### Completion Documentation
When completing a task, update the task header:
```markdown
#### Task 001: Core FocusManagerContext [fullstack-architect] ✅ COMPLETED
**Completed**: 2025-01-15 2:45 PM
**Duration**: 4 hours
**Required Reading**: [sections remain as is]
```

### Cross-Task Impact Documentation

#### Updating Affected Tasks
When your implementation affects other tasks:
1. **Add reference notes** to impacted tasks
2. **Update dependencies** if new ones are discovered
3. **Document API changes** that affect integration
4. **Note breaking changes** prominently

#### Reference Format
```markdown
**References**: task-001 (FocusManagerContext API), task-003 (modal patterns)
**Impact from task-008**: MedicationSearch now uses FocusableField wrapper
```

### Handoff Protocol

#### For Partially Complete Tasks
If handing off an incomplete task:
1. Mark status as ⚠️ PARTIAL
2. List completed items with [x]
3. Document work in progress
4. Note blockers or challenges
5. Provide clear next steps

#### For Blocked Tasks
If a task becomes blocked:
1. Mark status as ❌ BLOCKED
2. Document the specific blocker
3. Reference the blocking issue/task
4. Estimate when it might be unblocked
5. Suggest alternative approaches if any

### Task Self-Reference Pattern (Updated)
Each task implementation MUST:

1. **Update Progress in Real-Time**
   - Mark checklist items [x] as completed
   - Add completion timestamps for major milestones
   - Update task header status (✅/⚠️/❌) when appropriate

2. **Document Everything**
   - Add implementation notes directly in the task
   - Include file paths for all created/modified files
   - Document design decisions and trade-offs
   - Note any deviations from the plan with justification

3. **Verify Thoroughly**
   - Test each success criterion individually
   - Provide evidence of completion (test results, metrics)
   - Mark criteria with ✓ when verified, ✗ if failed
   - Never mark complete without full verification

4. **Maintain Context**
   - Reference findings from previous related tasks
   - Update subsequent tasks with learnings
   - Cross-reference with architecture and flow documentation
   - Note impacts on other components or tasks

5. **Communicate Status**
   - Use clear status indicators (✅ COMPLETED, ⚠️ PARTIAL, ❌ BLOCKED)
   - Include completion timestamp in format: "Completed: YYYY-MM-DD HH:MM AM/PM"
   - Provide duration if significant (e.g., "Duration: 4 hours")
   - Leave clear handoff notes if task is incomplete

### Context Window Management
- Each phase designed to fit within ~40-60k tokens
- Tasks include clear boundaries and handoff points
- Dependencies explicitly stated for context loading
- **Priority Loading**: Always load focus-rearchitecture.md and current-focus-flow.md first
- Reference documents should remain in context throughout task execution

### Risk Mitigation
- Feature flags enable gradual rollout
- Error boundaries prevent cascade failures
- Each phase independently testable
- Rollback possible at any stage

## Success Metrics

### Quantitative
- Focus transition time: <100ms
- Modal open/close: <150ms  
- Memory usage: <5MB
- Test coverage: >90%
- Accessibility score: 100

### Qualitative
- No focus loops or dead ends
- Predictable navigation
- Screen reader compatible
- Easy to debug

## Current Status
**Phase**: Not Started
**Blocked By**: None
**Next Action**: Begin Task 001 - Create FocusManagerContext

## Notes
- Missing SideEffectsSelection.tsx must be created (Task 015)
- Heavy timeout usage (50ms/100ms) will be completely removed
- Auto-open modal pattern will be eliminated
- Validation blocking will include escape mechanisms