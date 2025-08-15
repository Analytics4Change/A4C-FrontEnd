# Claude Code Prompt: Medication Side Effects Multi-Select Dropdown with Modal

## Project Context
Existing medication entry system for client management. Need to add a multi-select dropdown for side effects entry with special modal functionality for "Other Side Effects" option.

## Current System Analysis Needed
Please first analyze the existing codebase to understand:
- Current medication entry form structure and components
- **Existing patterns for dropdown population with mock data** (analyze other form elements)
- **The "Medication Categories" label and dropdown pattern** (this is the exact pattern to follow for label styling)
- **The "Medication Dates" section layout and positioning**
- **Current focus flow from "Discontinuation Date" (needs to be updated)**
- **The positioning of "Discard" and "Save Medication" buttons**
- **Form section ordering and spacing patterns**
- **Existing modal/dialog patterns and implementations**
- **Current focus management and z-index patterns**
- Current multi-select component implementations (if any)
- Form validation and state management patterns
- Mock data generation and management approaches

## Task Description
Implement a multi-select dropdown component for side effects selection with special modal functionality when "Other Side Effects" is selected, positioned between the "Medication Dates" section and the action buttons, and update the focus flow accordingly.

## Requirements

### Functional Requirements
- Create a multi-select dropdown for side effects selection
- **Add a label above the dropdown following the exact label styling of "Medication Categories"**
- **Single dropdown occupying its own full line** (not side-by-side like Medication Categories)
- Allow users to select multiple side effects from a predefined list
- Display selected side effects clearly following the exact pattern used by `Broad Categories`
- Enable removal of individual selected side effects
- Support search/filter functionality within the dropdown
- **Special "Other Side Effects" modal functionality**
- **Update focus flow to include Side Effects dropdown**
- Integrate seamlessly with existing medication entry form

### Focus Flow Requirements
```pseudo
UPDATED_FOCUS_FLOW:
  PREVIOUS_FLOW:
    Discontinuation Date → Save Medication
    
  NEW_FOCUS_FLOW:
    Discontinuation Date → Side Effects dropdown → Save Medication
    
  DETAILED_FLOW:
    1. User completes "Discontinuation Date" selection
    2. Focus advances to "Side Effects" dropdown
    3. User interacts with Side Effects dropdown
    4. User clicks "Done" on Side Effects dropdown:
       IF "Other Side Effects" selected:
         - open modal
         - focus text input in modal (blinking cursor)
         - modal interaction completes → focus advances to "Save Medication"
       ELSE:
         - focus advances directly to "Save Medication" button
```

### Other Side Effects Modal Requirements
```pseudo
OTHER_SIDE_EFFECTS_WORKFLOW:
  TRIGGER: user selects "Other Side Effects" and clicks "Done"
  
  MODAL_BEHAVIOR:
    DISPLAY: new modal canvas on z-axis above main form
    FOCUS: blinking cursor in text input field (auto-focus)
    CONTENT: free-form text entry field
    BUTTONS: "Skip" and "Done" buttons
    POSITIONING: buttons at bottom center of modal canvas
    
  USER_ACTIONS:
    IF user clicks "Skip":
      - close modal
      - deselect "Other Side Effects" from dropdown
      - return focus to Side Effects dropdown
      
    IF user clicks "Done" (in modal):
      - close modal
      - keep "Other Side Effects" selected
      - store entered text
      - advance focus to "Save Medication" button
      NOTE: Done button only enabled when text has been entered
      
  NORMAL_WORKFLOW:
    IF "Done" clicked without "Other Side Effects" selected:
      - advance focus directly to "Save Medication" button
```

### Technical Requirements
- **Follow the existing established pattern for mock data population** (analyze how other dropdowns/form elements populate their data)
- **Use the exact label styling from "Medication Categories" but adapt the layout for a single full-width dropdown**
- **Follow existing modal/dialog patterns for the "Other Side Effects" modal**
- **Update existing focus management to include Side Effects dropdown in the flow**
- Use the same data structure and generation approach as other form elements
- Maintain consistency with existing form validation patterns
- Follow current component architecture and styling
- Ensure accessibility compliance with existing form standards
- Integrate with existing form state management
- **Implement proper focus management and z-index layering**

### Positioning Requirements (Pseudo-code)
```pseudo
FORM_STRUCTURE:
  EXISTING_SECTIONS_ABOVE
  
  MEDICATION_CATEGORIES_SECTION (existing dual dropdown)
  
  OTHER_EXISTING_SECTIONS
  
  MEDICATION_DATES_SECTION (existing date inputs)
    DISCONTINUATION_DATE (focus flows FROM here)
  
  INSERT_HERE: SIDE_EFFECTS_SECTION
    LABEL: "Side Effects" (styled like Medication Categories label)
    MULTI_SELECT_DROPDOWN: full-width implementation with "Done" button
      (focus flows TO here from Discontinuation Date)
      (focus flows FROM here to Save Medication)
  
  FORM_ACTIONS_SECTION (existing)
    DISCARD_BUTTON
    SAVE_MEDICATION_BUTTON (focus target after side effects completion)
```

### Side Effects Selection Modal Requirements (Pseudo-code)
```pseudo
SIDE_EFFECTS_SELECTION_MODAL:
  STRUCTURE:
    MODAL_OVERLAY: (follow existing Broad Categories modal pattern)
    MODAL_CONTENT:
      TITLE: "Select Side Effects"
      SEARCH_FIELD: 
        TYPE: text input for filtering 56 options
        PLACEHOLDER: "Search side effects..."
        POSITION: below title, above options list
        FUNCTIONALITY: real-time filtering of options
      SCROLLABLE_CONTENT:
        HEIGHT: taller than Broad Categories modal to accommodate 56 options
        OPTIONS_LIST: checkboxes with side effect names
        SCROLLBAR: visible scrollbar (matching Broad Categories pattern)
        SELECTION_FEEDBACK: blue checkboxes for selected items
      BUTTON_CONTAINER:
        POSITION: bottom of modal
        BUTTONS:
          CANCEL_BUTTON: "Cancel" (left)
          DONE_BUTTON: "Done" (right, blue primary button)
          
  STYLING: exact match to Broad Categories modal pattern
  Z_INDEX: appropriate layer above main form
  ACCESSIBILITY: proper modal accessibility patterns

OTHER_SIDE_EFFECTS_MODAL:
  STRUCTURE:
    MODAL_OVERLAY: (follow existing modal patterns)
    MODAL_CONTENT:
      TITLE: "Describe Other Side Effects"
      TEXT_INPUT: 
        TYPE: textarea or large text input
        PLACEHOLDER: appropriate placeholder text
        AUTO_FOCUS: true (blinking cursor)
        VALIDATION: required field - text must be entered
      BUTTON_CONTAINER:
        POSITION: bottom center of modal
        BUTTONS:
          SKIP_BUTTON: "Skip" (always enabled)
          DONE_BUTTON: "Done" (only enabled when text is entered in textarea)
          
  STYLING: follow existing modal patterns
  Z_INDEX: appropriate layer above main form
  ACCESSIBILITY: proper modal accessibility patterns
  BUTTON_STATE_MANAGEMENT: Done button disabled until user enters text
```

### Mock Data Requirements - SPECIFIC LIST
```javascript
[
  "Aggressiveness",
  "Bizarre behavior",
  "Black or bloody stools",
  "Blurred vision or other vision problems",
  "Chest pain",
  "Chills",
  "Confusion",
  "Constipation",
  "Decreased concentration",
  "Decreased coordination",
  "Delusions/Hallucinations",
  "Depression",
  "Diarrhea",
  "Dizziness",
  "Dry Mouth",
  "Exaggerated feeling of well-being",
  "Fainting",
  "Fast or irregular heartbeat",
  "Fast, slow, or irregular heartbeat",
  "Fatigue",
  "Fever",
  "Frequent urination",
  "Hallucinations",
  "Headache",
  "Hostility",
  "Impulsiveness",
  "Increase in aggression",
  "Increase in agitation",
  "Increase in anxiety",
  "Increased sweating",
  "Irritability",
  "Light-headedness when you stand or sit up",
  "Loss of appetite",
  "Memory loss",
  "Nausea",
  "Nervousness",
  "New or worsening agitation",
  "New or worsening mental or mood problems",
  "Numbness or tingling of an arm or leg",
  "Panic attacks",
  "Persistent headache",
  "Restlessness",
  "Shortness of breath",
  "Sleepiness",
  "Trouble sleeping",
  "Uncontrolled muscle movement",
  "Unpleasant taste",
  "Unusual or severe mental or mood changes",
  "Unusual weakness",
  "Unusual weakness or tiredness",
  "Vision changes",
  "Vomiting",
  "Weakness",
  "Weight loss",
  "Worsening of depression",
  "Other Side Effects"
]
```

**CRITICAL MOCK DATA REQUIREMENTS**:
- **Use the exact list provided above as a simple array of strings**
- **The list is alphabetized EXCEPT "Other Side Effects" which must appear LAST**
- **Use the list exactly as provided**
- **"Other Side Effects" must always appear as the final option regardless of alphabetical order**
- **Data structure is a simple array of strings, not objects with id/name properties**

## Expected Deliverables
- [ ] Multi-select dropdown component for side effects
- [ ] **Label component matching "Medication Categories" label styling exactly**
- [ ] **Proper positioning between "Medication Dates" and action buttons**
- [ ] **Layout adaptation for single full-width dropdown (not side-by-side)**
- [ ] **Mock data file with the exact 56 side effects list as string array**
- [ ] **"Other Side Effects" modal component following existing modal patterns**
- [ ] **Updated focus management integrating Side Effects dropdown into the flow**
- [ ] **Modified "Discontinuation Date" focus behavior to advance to Side Effects**
- [ ] Integration with current medication entry form
- [ ] Form validation for side effects selection
- [ ] Updated form submission handling to include selected side effects and other side effects text
- [ ] Updated form styling to maintain visual consistency

## Implementation Specifications

### Focus Management Updates Required
```pseudo
FOCUS_MANAGEMENT_CHANGES:
  
  DISCONTINUATION_DATE_COMPLETION:
    PREVIOUS: focus advances to "Save Medication" button
    NEW: focus advances to "Side Effects" dropdown
    
  SIDE_EFFECTS_DROPDOWN_DONE:
    IF "Other Side Effects" selected:
      - open modal
      - focus text input in modal (blinking cursor)
    ELSE:
      - advance focus to "Save Medication" button
      
  MODAL_INTERACTIONS:
    MODAL_SKIP_CLICKED:
      - close modal
      - deselect "Other Side Effects"
      - return focus to "Side Effects" dropdown
      
    MODAL_DONE_CLICKED:
      - close modal
      - keep "Other Side Effects" selected
      - store entered text
      - advance focus to "Save Medication" button
      
  ANALYSIS_REQUIRED:
    - locate current "Discontinuation Date" focus handling code
    - update to point to new "Side Effects" dropdown instead of "Save Medication"
    - ensure tab order includes new Side Effects dropdown
    - test complete focus flow from Discontinuation Date through Side Effects to Save Medication
```

### Mock Data Implementation Requirements
```pseudo
MOCK_DATA_IMPLEMENTATION:
  LOCATION: (follow existing mock data storage pattern)
  FORMAT: simple array of strings (not objects)
  CONTENT: exact 56-item string array provided above
  ORDER: list is alphabetized EXCEPT "Other Side Effects" always appears last
  SPECIAL_RULE: "Other Side Effects" always appears last regardless of alphabetical order
  STRUCTURE: ["string1", "string2", ..., "Other Side Effects"]
```

### Component Behavior
- **Dropdown State**: Closed by default, opens modal on click/focus (follows Broad Categories pattern)
- **Modal Selection**: Side Effects selection happens in modal overlay (not inline dropdown)
- **Search Functionality**: Real-time filtering within modal for 56 side effects
- **Selection Display**: Blue checkboxes within modal, selected items displayed as tags/chips in form after modal closes
- **Modal Height**: Taller than Broad Categories modal to accommodate 56 options with visible scrollbar
- **Keyboard Navigation**: Support arrow keys, Enter, Escape within modal
- **Option Display**: Display all 56 options with "Other Side Effects" always appearing last
- **Done Button**: In main modal triggers focus advance or secondary modal based on "Other Side Effects" selection
- **Secondary Modal Behavior**: Auto-focus text input for "Other Side Effects" description
- **Full-Width Layout**: Form field should span the full available width of its container
- **Focus Integration**: Receives focus from "Discontinuation Date", passes focus to "Save Medication"

### Data Management Requirements
```pseudo
DATA_HANDLING:
  SIDE_EFFECTS_SELECTION: array of selected side effect strings
  OTHER_SIDE_EFFECTS_TEXT: string value from modal text input
  
  FORM_SUBMISSION_DATA:
    selected_side_effects: [array of selected side effect strings]
    other_side_effects_description: string (if "Other Side Effects" was selected)
    
  VALIDATION:
    - ensure selected side effects are valid strings from the list
    - validate other side effects text if "Other Side Effects" selected
    - "Other Side Effects" modal Done button only enabled when text is entered
    - handle case where "Other Side Effects" selected but user clicks Skip (deselects option)
```

## UI/UX Consistency Requirements
- **Label styling must match "Medication Categories" exactly**
- **Dropdown should span full width like other single-input form elements**
- **Section should integrate seamlessly into form flow between Medication Dates and buttons**
- **Modal should follow existing modal patterns exactly**
- **Focus flow should feel natural and intuitive with the new Side Effects step**
- Use existing dropdown styling and animations
- Follow current color scheme and typography
- Maintain consistent spacing with other form sections
- Use established loading states and placeholder text
- Follow existing responsive design breakpoints
- **Ensure dropdown can handle displaying 56 string options efficiently**
- **Modal buttons should match existing button styling and positioning patterns**



## Additional Context
**Priority**: The Side Effects section must integrate seamlessly into the existing form flow with updated focus management that inserts the Side Effects dropdown between "Discontinuation Date" and "Save Medication" button.

**Focus Flow Priority**: Critical to update the existing "Discontinuation Date" focus behavior to advance to the new "Side Effects" dropdown instead of directly to "Save Medication". This change affects the overall UX flow of the form.

**Mock Data Priority**: Use the exact 56-item string array provided - do not modify, alphabetize, or change the order. "Other Side Effects" must always appear last. Data should be a simple array of strings, not objects.

**Modal Priority**: The "Other Side Effects" modal must follow existing modal patterns exactly, including styling, z-index management, accessibility, and button positioning.

**Framework Agnostic**: All implementation details should be determined by analyzing the existing codebase patterns. The pseudo-code above is for conceptual understanding only - actual implementation must follow the project's specific framework and architectural patterns.

## Key Focus Areas for Claude

### Critical Focus Flow Analysis
```pseudo
ANALYSIS_PRIORITY:
  STEP_1: locate current "Discontinuation Date" focus handling implementation
  STEP_2: understand existing focus management patterns and architecture
  STEP_3: identify how to update focus target from "Save Medication" to "Side Effects"
  STEP_4: plan integration of Side Effects dropdown into existing focus chain
  STEP_5: examine modal/dialog focus management patterns
  STEP_6: understand form tab order and accessibility requirements
```

### Implementation Priority
```pseudo
IMPLEMENTATION_FOCUS:
  PRIORITY_1: implement Side Effects dropdown with exact 56-item string array
  PRIORITY_2: update "Discontinuation Date" focus behavior to point to Side Effects
  PRIORITY_3: implement Side Effects to "Save Medication" focus advancement
  PRIORITY_4: add "Other Side Effects" modal with proper focus handling
  PRIORITY_5: test complete updated focus flow thoroughly
  PRIORITY_6: ensure no regression in existing form functionality
```