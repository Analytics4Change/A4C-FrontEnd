# Medication Entry Form - Detailed Sequence Diagrams

## Overview
This document provides detailed sequence and flow diagrams for the medication entry form UX redesign, illustrating all interaction patterns, state transitions, and data flows.

## 1. Complete User Journey - Happy Path

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant UI as Form UI
    participant VM as ViewModel
    participant F as Focus Manager
    participant V as Validator
    participant API as API Service

    Note over U,API: Initial Form Load
    U->>UI: Open medication modal
    UI->>VM: Initialize ViewModel
    VM->>UI: Return empty state
    UI->>F: Setup focus trap
    F->>UI: Focus medication input

    Note over U,API: Medication Selection
    U->>UI: Type "Aspirin"
    UI->>VM: searchMedications("Aspirin")
    VM->>API: GET /medications?q=Aspirin
    API-->>VM: Return results
    VM-->>UI: Update dropdown
    U->>UI: Select "Aspirin 325mg" (keyboard)
    UI->>VM: selectMedication(aspirin)
    VM->>VM: Set selectedMedication
    VM->>VM: Auto-populate categories
    UI->>F: advanceFocus('keyboard')
    F->>UI: Focus Continue button

    Note over U,API: Dosage Configuration
    U->>UI: Press Enter on Continue
    UI->>UI: Show dosage fields
    F->>UI: Focus Category input
    
    U->>UI: Select "Solid" (keyboard)
    UI->>VM: setDosageFormCategory("Solid")
    VM->>VM: Clear dependent fields
    F->>UI: Focus Form Type
    
    U->>UI: Select "Tablet" (keyboard)
    UI->>VM: setDosageFormType("Tablet")
    VM->>VM: Update available units
    F->>UI: Focus Amount
    
    U->>UI: Type "325"
    UI->>VM: updateDosageAmount("325")
    V->>VM: Validate amount
    U->>UI: Tab to Unit
    
    U->>UI: Select "mg" (keyboard)
    UI->>VM: setDosageUnit("mg")
    F->>UI: Focus Total Amount
    
    U->>UI: Type "30"
    UI->>VM: updateTotalAmount("30")
    U->>UI: Tab to Total Unit
    
    U->>UI: Select "tablets" (keyboard)
    UI->>VM: setTotalUnit("tablets")
    F->>UI: Focus Frequency
    
    U->>UI: Select "Once daily" (keyboard)
    UI->>VM: setFrequency("Once daily")
    F->>UI: Focus Condition
    
    U->>UI: Select "With food" (keyboard)
    UI->>VM: setCondition("With food")
    F->>UI: Focus Therapeutic Classes

    Note over U,API: Category Selection
    U->>UI: Press Enter on Therapeutic
    UI->>UI: Open modal dialog
    U->>UI: Select categories
    UI->>VM: toggleTherapeuticClass(...)
    U->>UI: Close modal
    F->>UI: Focus Regimen Categories
    
    U->>UI: Skip Regimen (Tab)
    F->>UI: Focus Start Date
    
    Note over U,API: Date Selection
    U->>UI: Enter today's date
    UI->>VM: setStartDate(date)
    U->>UI: Tab to Save
    
    Note over U,API: Save Operation
    U->>UI: Press Enter on Save
    UI->>V: Validate all fields
    V-->>UI: Validation passed
    UI->>VM: save()
    VM->>API: POST /medications
    API-->>VM: Success response
    VM->>UI: Close modal
    UI->>U: Show success message
```

## 2. Field Editing Flow - Changing Existing Values

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Field
    participant UI as Form UI
    participant VM as ViewModel
    participant D as Dependencies

    Note over U,D: User wants to change Category from "Solid" to "Liquid"
    
    U->>F: Click on filled Category field
    F->>F: Check if editable
    F->>UI: Remove readonly attribute
    F->>UI: Clear current value display
    F->>UI: Show dropdown
    
    U->>F: Select "Liquid"
    F->>VM: setDosageFormCategory("Liquid")
    
    Note over VM,D: Cascade Clear Logic
    VM->>D: Check dependencies
    D-->>VM: Form Type depends on Category
    D-->>VM: Units depend on Form Type
    
    VM->>VM: Clear dosageFormType
    VM->>VM: Clear dosageUnit
    VM->>VM: Clear totalUnit
    VM->>VM: Keep other fields
    
    VM->>UI: Update field states
    UI->>F: Apply readonly to Category
    UI->>F: Clear Form Type field
    UI->>F: Clear Unit fields
    UI->>UI: Highlight cleared fields
    
    Note over U,D: User must re-select cleared fields
    U->>F: Tab to Form Type
    F->>UI: Show new Liquid options
    U->>F: Select "Solution"
    F->>VM: setDosageFormType("Solution")
    VM->>UI: Update Unit options (mL, tsp, etc.)
```

## 3. Mixed Input Method Flow

```mermaid
flowchart TD
    Start([User on Medication field])
    
    Start --> KeyInput{Input Method?}
    
    KeyInput -->|Keyboard| KType[Type search query]
    KeyInput -->|Mouse| MClick[Click dropdown]
    
    KType --> KSelect[Navigate with arrows]
    MClick --> MSelect[Click item]
    
    KSelect --> KEnter[Press Enter]
    MSelect --> MSelected[Item selected]
    
    KEnter --> KAdvance[Auto-advance focus]
    MSelected --> MStay[Keep current focus]
    
    KAdvance --> NextField([Next field focused])
    MStay --> SameField([Same field active])
    
    NextField --> Mixed{User action?}
    SameField --> Mixed
    
    Mixed -->|Mouse click elsewhere| ClickField[Focus clicked field]
    Mixed -->|Tab key| TabNext[Focus next tabIndex]
    Mixed -->|Continue typing| StayEdit[Stay in edit mode]
    
    ClickField --> EditMode([Enter edit mode])
    TabNext --> EditMode
    StayEdit --> EditMode
```

## 4. Cascade Clear Decision Tree

```mermaid
flowchart TD
    Change([Field Changed])
    
    Change --> Which{Which Field?}
    
    Which -->|Medication| ClearAll[Clear entire form]
    Which -->|Category| ClearCat[Clear Type, Units]
    Which -->|Form Type| ClearUnit[Clear Units only]
    Which -->|Other| NoOp[No cascade]
    
    ClearAll --> ResetVM[Reset ViewModel]
    ClearCat --> CheckType{Had Form Type?}
    ClearUnit --> CheckUnit{Had Unit?}
    NoOp --> UpdateOnly[Update field only]
    
    CheckType -->|Yes| NeedReselect1[User must reselect]
    CheckType -->|No| WaitSelect1[Wait for selection]
    
    CheckUnit -->|Yes| NeedReselect2[User must reselect]
    CheckUnit -->|No| WaitSelect2[Wait for selection]
    
    ResetVM --> FocusMed[Focus medication field]
    NeedReselect1 --> FocusType[Focus Form Type field]
    NeedReselect2 --> FocusUnit[Focus Unit field]
    WaitSelect1 --> KeepFocus1[Keep current focus]
    WaitSelect2 --> KeepFocus2[Keep current focus]
    UpdateOnly --> KeepFocus3[Keep current focus]
```

## 5. Focus Management State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Component Mount
    
    Idle --> Focusing: User Action
    
    Focusing --> Keyboard: Keyboard Event
    Focusing --> Mouse: Mouse Event
    
    Keyboard --> AdvancingFocus: Selection Made
    Mouse --> MaintainingFocus: Selection Made
    
    AdvancingFocus --> WaitingForPortal: Portal Element?
    AdvancingFocus --> ImmediateFocus: DOM Element?
    
    WaitingForPortal --> DelayedFocus: After Delay
    ImmediateFocus --> Focused: Immediate
    DelayedFocus --> Focused: After Portal Render
    MaintainingFocus --> Focused: No Change
    
    Focused --> Idle: Await Input
    Focused --> EditMode: Click/Type
    
    EditMode --> Validating: Blur Event
    Validating --> Focused: Valid
    Validating --> Error: Invalid
    
    Error --> EditMode: Focus Return
    Error --> Focused: Error Dismissed
```

## 6. Component Communication Flow

```mermaid
graph TB
    subgraph "User Interface Layer"
        Modal[MedicationEntryModal]
        MedSearch[MedicationSearch]
        DosForm[DosageFormInputs]
        FreqCond[FrequencyConditionInputs]
        CatSel[CategorySelection]
        DateSel[DateSelection]
    end
    
    subgraph "State Management"
        VM[MedicationEntryViewModel]
        Val[MedicationEntryValidation]
    end
    
    subgraph "Focus Management"
        FocusAdv[useFocusAdvancement]
        KeyNav[useKeyboardNavigation]
        FocusMgr[FocusManager]
    end
    
    subgraph "Data Layer"
        API[MedicationAPI]
        Mock[MockData]
    end
    
    Modal --> VM
    MedSearch --> VM
    DosForm --> VM
    FreqCond --> VM
    CatSel --> VM
    DateSel --> VM
    
    VM <--> Val
    VM --> API
    API --> Mock
    
    Modal --> KeyNav
    MedSearch --> FocusAdv
    DosForm --> FocusAdv
    FreqCond --> FocusAdv
    
    FocusAdv --> FocusMgr
    KeyNav --> FocusMgr
```

## 7. Save Validation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Form UI
    participant V as Validator
    participant VM as ViewModel
    participant API as API Service

    U->>UI: Click Save
    UI->>V: validateRequiredFields()
    
    alt All Required Fields Present
        V-->>UI: Validation Success
        UI->>VM: save()
        VM->>API: POST /medications
        
        alt API Success
            API-->>VM: 200 OK
            VM->>UI: Close modal
            UI->>U: Show success toast
        else API Error
            API-->>VM: Error response
            VM->>UI: Show error message
            UI->>U: Display error
        end
        
    else Missing Required Fields
        V-->>UI: Validation Errors
        UI->>UI: Highlight error fields
        UI->>UI: Focus first error
        UI->>U: Show error messages
        
        loop For each error field
            U->>UI: Fix field value
            UI->>V: Revalidate field
            V-->>UI: Clear field error
        end
        
        U->>UI: Click Save again
        Note over U,API: Repeat validation flow
    end
```

## 8. Accessibility Flow

```mermaid
flowchart LR
    subgraph "Screen Reader Announcements"
        SR1[Field Focused]
        SR2[Dropdown Opened]
        SR3[Item Selected]
        SR4[Error Announced]
        SR5[Success Announced]
    end
    
    subgraph "Keyboard Navigation"
        Tab[Tab Key]
        Shift[Shift+Tab]
        Enter[Enter Key]
        Escape[Escape Key]
        Arrows[Arrow Keys]
    end
    
    subgraph "ARIA Attributes"
        Label[aria-label]
        Desc[aria-describedby]
        Live[aria-live]
        Role[role]
        Modal[aria-modal]
    end
    
    Tab --> SR1
    Shift --> SR1
    Enter --> SR3
    Escape --> SR5
    Arrows --> SR2
    
    SR1 --> Label
    SR2 --> Role
    SR3 --> Live
    SR4 --> Desc
    SR5 --> Live
    
    Label --> Announce[Screen Reader Output]
    Desc --> Announce
    Live --> Announce
    Role --> Announce
    Modal --> Announce
```

## 9. Error Recovery Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Form UI
    participant VM as ViewModel
    participant ER as Error Recovery

    Note over U,ER: Error Occurs During Form Fill
    
    UI->>ER: Catch Error
    ER->>ER: Log Error Details
    ER->>VM: Get Current State
    VM-->>ER: Return State Snapshot
    
    alt Recoverable Error
        ER->>UI: Show Error Message
        ER->>VM: Restore Last Valid State
        VM->>UI: Update Fields
        UI->>U: Display Recovery Options
        
        U->>UI: Choose Recovery Action
        alt Retry
            UI->>VM: Retry Last Action
        else Edit
            UI->>UI: Focus Error Field
        else Cancel
            UI->>VM: Reset Form
        end
        
    else Non-Recoverable Error
        ER->>UI: Show Fatal Error
        ER->>VM: Save Draft State
        VM->>ER: Store in LocalStorage
        ER->>UI: Offer Reload
        
        U->>UI: Reload Page
        UI->>VM: Check for Draft
        VM->>ER: Retrieve from LocalStorage
        ER-->>VM: Restore Draft
        VM->>UI: Populate Fields
        UI->>U: Show Draft Restored
    end
```

## 10. Performance Optimization Flow

```mermaid
flowchart TD
    Input([User Input])
    
    Input --> Debounce{Debounce?}
    
    Debounce -->|Search| SearchDebounce[300ms delay]
    Debounce -->|Validation| ValidDebounce[500ms delay]
    Debounce -->|No| Immediate[Process immediately]
    
    SearchDebounce --> MinLength{Min length?}
    ValidDebounce --> Validate[Run validation]
    Immediate --> Process[Process input]
    
    MinLength -->|< 2 chars| Skip[Skip search]
    MinLength -->|>= 2 chars| Search[Search API]
    
    Search --> Cache{In cache?}
    Cache -->|Yes| ReturnCache[Return cached]
    Cache -->|No| APICall[Call API]
    
    APICall --> StoreCache[Store in cache]
    StoreCache --> UpdateUI[Update UI]
    ReturnCache --> UpdateUI
    
    Validate --> ShowError{Has errors?}
    ShowError -->|Yes| Display[Display errors]
    ShowError -->|No| Clear[Clear errors]
    
    Skip --> WaitMore[Wait for input]
    Process --> UpdateUI
    Display --> UpdateUI
    Clear --> UpdateUI
    
    UpdateUI --> RenderOptimized[React.memo components]
    RenderOptimized --> UserSees([User sees update])
```

## Implementation Priority

1. **Phase 1**: Core field editability and cascade logic
2. **Phase 2**: Focus management and navigation patterns
3. **Phase 3**: Validation and error handling
4. **Phase 4**: Performance optimizations
5. **Phase 5**: Accessibility enhancements

## Testing Coverage Requirements

- Unit tests for each sequence flow
- Integration tests for complete journeys
- E2E tests for critical paths
- Performance tests for large datasets
- Accessibility tests for WCAG compliance

## Monitoring Points

Each sequence diagram indicates key monitoring points for:
- User interaction metrics
- Performance bottlenecks
- Error rates and types
- Accessibility violations
- Focus management issues