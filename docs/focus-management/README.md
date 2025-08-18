# Focus Management System Documentation Index

## Overview
This directory contains all documentation related to the focus management system rearchitecture project. The goal is to migrate from a complex, timeout-dependent focus system to a clean, unified architecture using FocusManagerContext + Radix UI.

## Migration Status
- **Phase 1 (Infrastructure)**: ✅ COMPLETED - All core components built
- **Phase 2 (Component Migration)**: 🔄 IN PROGRESS - Task 008 ready to begin
- **Phase 3 (Flow Configuration)**: ⏸️ PENDING - Waiting on Phase 2
- **Phase 4 (Testing & Validation)**: ⏸️ PENDING - Waiting on Phase 2
- **Phase 5 (Cleanup & Optimization)**: ⏸️ PENDING - Waiting on Phase 4

## Documents

### 1. 📋 [focus-migration-tasks.md](./focus-migration-tasks.md)
**Purpose**: Master task list and project tracker  
**Use When**: 
- Starting any migration task
- Checking project status
- Understanding task dependencies
- Finding agent assignments

**Key Contents**:
- 30 detailed tasks across 5 phases
- Task dependencies and success criteria
- Agent assignments (corrected for available agents)
- Required reading for each task
- Implementation notes from completed tasks

### 2. 🏗️ [focus-rearchitecture.md](./focus-rearchitecture.md)
**Purpose**: Comprehensive technical architecture and implementation guide  
**Use When**:
- Understanding the target architecture
- Implementing new components
- Finding code examples
- Understanding design decisions

**Key Contents**:
- Complete FocusManagerContext implementation (Lines 41-398)
- ManagedDialog wrapper pattern (Lines 400-460)
- FocusableField component (Lines 704-841)
- StepIndicator with mouse navigation (Lines 600-701)
- Testing strategies (Lines 1389-1716)
- Performance optimization (Lines 1851-1894)

### 3. 📊 [current-focus-flow.md](./current-focus-flow.md)
**Purpose**: Detailed documentation of the existing implementation  
**Use When**:
- Understanding what needs to be migrated
- Identifying complexity points to avoid
- Finding current component locations
- Understanding existing patterns

**Key Contents**:
- Visual flow diagram of current system
- All 9 complexity points identified (Lines 174-182)
- Ref and ID inventory (Lines 130-153)
- Timing dependencies catalog
- Missing implementation notes

### 4. 📚 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
**Purpose**: Step-by-step migration instructions with examples  
**Use When**:
- Converting components from old to new system
- Understanding hook replacements
- Finding migration patterns
- Troubleshooting common issues

**Key Contents**:
- Mouse navigation features (Lines 7-85)
- Hook replacement table (Lines 102-107)
- Before/after code examples (Lines 111-171)
- Common pitfalls (Lines 300-304)
- Testing patterns (Lines 308-324)

### 5. 🔍 [medication-search-analysis.md](./medication-search-analysis.md)
**Purpose**: Deep dive into MedicationSearch component complexity  
**Use When**:
- Working on Task 008 (MedicationSearch migration)
- Understanding complex component patterns
- Assessing migration risks
- Planning similar component migrations

**Key Contents**:
- Complexity score: 7/10
- Detailed code flow analysis
- Timeout dependency mapping
- Migration risks and recommendations
- Suggested task splitting for Task 008

### 6. ✅ [INFRASTRUCTURE_TESTS_SUMMARY.md](./INFRASTRUCTURE_TESTS_SUMMARY.md)
**Purpose**: Summary of all infrastructure testing completed  
**Use When**:
- Writing new tests
- Understanding test coverage
- Finding test patterns
- Reviewing what's been tested

**Key Contents**:
- 305 total test cases created
- Test file locations and coverage
- Key features tested
- Edge cases covered
- Test patterns to follow

## Quick Reference

### For New Agents Starting Work
1. Read this README first
2. Load `focus-rearchitecture.md` (target state)
3. Load `current-focus-flow.md` (current state)
4. Load `focus-migration-tasks.md` and find your task
5. Read task-specific Required Reading sections

### Component Locations
- **New Focus System**: `/src/contexts/focus/`
- **New Components**: `/src/components/focus/`
- **Tests**: `__tests__` subdirectories
- **Current Components**: `/src/views/medication/`

### Key Patterns to Follow
- ✅ Use FocusManagerContext for all focus management
- ✅ Use ManagedDialog for all modals
- ✅ Use FocusableField for all form fields
- ❌ No setTimeout for focus operations
- ❌ No manual focus() calls
- ❌ No onFocus auto-open handlers

### Available Sub-Agents
- **software-architect-dbc**: Architecture and analysis tasks
- **systems-architect**: Alternative for complex architecture
- **fullstack-engineer-tdd**: Component implementation
- **qa-test-engineer**: Testing and validation

## Critical Information

### Complexity Points Being Addressed
1. Mixed focus patterns (auto-open vs manual)
2. Heavy reliance on 50ms/100ms timeouts
3. Validation blocking without escape
4. No escape hatch in modals
5. Tab prevention breaking standard navigation
6. State coupling with ViewModel
7. Auto-open modals on focus events
8. Complex nested modal flows
9. Missing SideEffectsSelection implementation

### Success Metrics
- Focus transition time: <100ms (currently 50-100ms timeouts)
- Modal open/close: <150ms
- Memory usage: <5MB
- Test coverage: >90%
- Accessibility score: 100

### Next Priority Tasks
1. **Task 008**: Migrate MedicationSearch (SPLIT REQUIRED - see medication-search-analysis.md)
2. **Task 009**: Analyze DosageForm
3. **Task 010**: Migrate DosageForm

## Notes for Project Orchestrator
- Infrastructure phase (Tasks 001-006) is complete
- All documentation has been centralized here for easy access
- Agent assignments have been corrected to match available agents
- Document paths are now absolute for clarity
- Task 008 needs to be split into 3 sub-tasks due to complexity (7/10)
- Consider using systems-architect for particularly complex analysis tasks