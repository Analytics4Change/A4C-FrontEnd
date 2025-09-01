# UAT Test Plan: Condition → Therapeutic Classes Navigation

## Test Environment Setup

1. Open the application in your browser at http://localhost:3456
2. Open browser Developer Console (F12)
3. Clear the console
4. The UAT logger should show initialization message

## Pre-Test Instructions

Before each test:
1. Clear browser console
2. Open medication modal (Add New Prescribed Medication)
3. Navigate to show Frequency and Condition fields (fill in required fields up to that point)

## Test Execution Format

For each test:
1. Run the command in console: `window.uatTest.start("Test X.X")`
2. Perform the test steps
3. Run the command in console: `window.uatTest.end("Test X.X")`
4. Copy ALL console output between TEST START and TEST END
5. Answer the test questions

---

## TEST SUITE A: Keyboard-Only Navigation

### Test A.1: Tab Through Empty Condition Field
**Console Commands:**
```javascript
window.uatTest.start("Test A.1")
// ... perform test steps ...
window.uatTest.end("Test A.1")
```

**Steps:**
1. Focus on Frequency field (tabIndex 13)
2. Select a frequency using KEYBOARD (arrow keys + Enter)
3. Press Tab to reach Condition input (should auto-advance)
4. Press Tab again (without selecting anything)

**Expected:**
- Focus should move from Condition input (15) to Therapeutic Classes button (17)
- Should skip the disabled dropdown button (16)

**Questions:**
- [yes] Did focus advance from Frequency to Condition automatically?
- [no] Did Tab from empty Condition go to Therapeutic Classes?
- [x] Console output:
```
window.uatTest.start("Test A.1")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test A.1 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:42.511Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:42.513Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:44.017Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:44.017Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:44.111Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:44.111Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:45.331Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:45.332Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lor", timestamp: "2025-08-31T20:40:51.248Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lor", timestamp: "2025-08-31T20:40:51.248Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:51.253Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:51.253Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T20:40:52.531Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T20:40:52.532Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:40:52.545Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:52.550Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:52.550Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:40:52.553Z" }
<anonymous code>:1:150327
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T20:40:54.580Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T20:40:54.580Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Solid", method: "keyboard", enabled: true, targetTabIndex: 5, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, timestamp: "2025-08-31T20:40:54.581Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "form-type", targetTabIndex: 5, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-category", timestamp: "2025-08-31T20:40:54.630Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:54.633Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:40:54.633Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "form-type", newActiveTabIndex: 5, success: true, timestamp: "2025-08-31T20:40:54.633Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Ta", timestamp: "2025-08-31T20:40:56.508Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Ta", timestamp: "2025-08-31T20:40:56.508Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Tablet", timestamp: "2025-08-31T20:41:05.718Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Tablet", timestamp: "2025-08-31T20:41:05.719Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Tablet", method: "keyboard", enabled: true, targetTabIndex: 7, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, timestamp: "2025-08-31T20:41:05.719Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-amount", targetTabIndex: 7, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "form-type", timestamp: "2025-08-31T20:41:05.770Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:05.772Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:05.772Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-amount", newActiveTabIndex: 7, success: true, timestamp: "2025-08-31T20:41:05.772Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:11.360Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:11.362Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:11.363Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:11.363Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T20:41:14.651Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T20:41:14.653Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 10, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, timestamp: "2025-08-31T20:41:14.653Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "total-amount", targetTabIndex: 10, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-unit", timestamp: "2025-08-31T20:41:14.704Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:14.705Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:14.705Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "total-amount", newActiveTabIndex: 10, success: true, timestamp: "2025-08-31T20:41:14.706Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:16.657Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:16.658Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:16.659Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:16.660Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:25.733Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:25.735Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T20:41:26.977Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T20:41:26.978Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 13, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, timestamp: "2025-08-31T20:41:26.979Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-frequency", targetTabIndex: 13, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "total-unit", timestamp: "2025-08-31T20:41:27.030Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:27.032Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:27.032Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-frequency", newActiveTabIndex: 13, success: true, timestamp: "2025-08-31T20:41:27.033Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T20:41:27.039Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:41:28.624Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:31.362Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:31.364Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T20:41:31.372Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "", timestamp: "2025-08-31T20:41:33.996Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "", timestamp: "2025-08-31T20:41:33.996Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Once daily", method: "keyboard", enabled: true, targetTabIndex: 15, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, timestamp: "2025-08-31T20:41:33.997Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:41:34.006Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-condition", targetTabIndex: 15, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-frequency", timestamp: "2025-08-31T20:41:34.047Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:34.050Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:34.050Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-condition", newActiveTabIndex: 15, success: true, timestamp: "2025-08-31T20:41:34.051Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T20:41:34.057Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:41:35.406Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:47.275Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:47.277Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T20:41:47.286Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 5, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:49.603Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 6, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:41:49.603Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:49.604Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:41:49.604Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:41:49.808Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:42:31.716Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:42:31.717Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:43:01.406Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:43:01.406Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:43:08.116Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:43:08.117Z" }
uat-logger.ts:40:13
window.uatTest.end("Test A.1")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test A.1 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test A.2: Keyboard Selection in Condition → Auto-Advance
**Console Commands:**
```javascript
window.uatTest.start("Test A.2")
// ... perform test steps ...
window.uatTest.end("Test A.2")
```

**Steps:**
1. Focus on Condition input (tabIndex 15)
2. Type "with" to filter options
3. Use Arrow Down to highlight "With Food"
4. Press Enter to select

**Expected:**
- Focus should automatically advance to Therapeutic Classes (17)
- No Tab press needed

**Questions:**
- [yes] Did dropdown appear when typing?
- [yes] Did arrow keys navigate the dropdown?
- [yes] Did Enter select the item?
- [yes, with questions about what the UX should be from thereafter] Did focus automatically move to Therapeutic Classes?
- [ ] Console output:
```
Source map error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= uat-logger.ts:3:11
[UAT-LOG] All focus navigation will be logged to console uat-logger.ts:4:11
[UAT-LOG] Copy/paste console output after each test uat-logger.ts:5:11
[UAT-LOG] Test helpers available: App.tsx:34:13
[UAT-LOG] - window.uatTest.start("test name") App.tsx:35:13
[UAT-LOG] - window.uatTest.end("test name") App.tsx:36:13
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= <anonymous code>:1:150327
[UAT-LOG] All focus navigation will be logged to console <anonymous code>:1:150327
[UAT-LOG] Copy/paste console output after each test <anonymous code>:1:150327
[UAT-LOG] Test helpers available: <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.start("test name") <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.end("test name") <anonymous code>:1:150327
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1066:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
Source map error: can't access property "sources", map is undefined
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: react_devtools_backend_compact.js.map
window.uatTest.start("Test A.2")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test A.2 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:17.250Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:17.251Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:18.275Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:18.275Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:18.382Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:18.382Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:20.126Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:20.126Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lor", timestamp: "2025-08-31T20:44:25.231Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lor", timestamp: "2025-08-31T20:44:25.231Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:25.236Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:25.236Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T20:44:26.689Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T20:44:26.689Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:44:26.703Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:26.707Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:26.708Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:44:26.710Z" }
<anonymous code>:1:150327
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "Sol", timestamp: "2025-08-31T20:44:31.208Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "Sol", timestamp: "2025-08-31T20:44:31.209Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Solid", method: "keyboard", enabled: true, targetTabIndex: 5, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, timestamp: "2025-08-31T20:44:31.209Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "form-type", targetTabIndex: 5, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-category", timestamp: "2025-08-31T20:44:31.260Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:31.261Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:31.261Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "form-type", newActiveTabIndex: 5, success: true, timestamp: "2025-08-31T20:44:31.262Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Ta", timestamp: "2025-08-31T20:44:37.987Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "Ta", timestamp: "2025-08-31T20:44:37.987Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Tablet", method: "keyboard", enabled: true, targetTabIndex: 7, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, timestamp: "2025-08-31T20:44:37.987Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-amount", targetTabIndex: 7, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "form-type", timestamp: "2025-08-31T20:44:38.037Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:38.039Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:38.040Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-amount", newActiveTabIndex: 7, success: true, timestamp: "2025-08-31T20:44:38.040Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:44:40.118Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:44:40.118Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:40.119Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:40.119Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T20:44:42.135Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T20:44:42.135Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 10, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, timestamp: "2025-08-31T20:44:42.135Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "total-amount", targetTabIndex: 10, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-unit", timestamp: "2025-08-31T20:44:42.186Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:42.188Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:42.188Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "total-amount", newActiveTabIndex: 10, success: true, timestamp: "2025-08-31T20:44:42.188Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:44:43.392Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T20:44:43.392Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:43.393Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:43.393Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:52.801Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:52.801Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T20:44:55.334Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T20:44:55.334Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 13, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, timestamp: "2025-08-31T20:44:55.334Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-frequency", targetTabIndex: 13, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "total-unit", timestamp: "2025-08-31T20:44:55.385Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:55.387Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:44:55.387Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-frequency", newActiveTabIndex: 13, success: true, timestamp: "2025-08-31T20:44:55.387Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T20:44:55.392Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:45:00.170Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:04.515Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:04.517Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T20:45:04.518Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "once", timestamp: "2025-08-31T20:45:07.194Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "once", timestamp: "2025-08-31T20:45:07.196Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Once daily", method: "keyboard", enabled: true, targetTabIndex: 15, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, timestamp: "2025-08-31T20:45:07.196Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:45:07.211Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-condition", targetTabIndex: 15, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-frequency", timestamp: "2025-08-31T20:45:07.247Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:07.250Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:07.251Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-condition", newActiveTabIndex: 15, success: true, timestamp: "2025-08-31T20:45:07.252Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T20:45:07.257Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:45:09.628Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:12.247Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:12.248Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T20:45:12.258Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "wi", timestamp: "2025-08-31T20:45:15.458Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "wi", timestamp: "2025-08-31T20:45:15.460Z" }
uat-logger.ts:24:15
[UAT-LOG] Condition Selection: 
Object { selectedValue: "With meals", selectionMethod: "keyboard", previousValue: "", activeElement: "INPUT", activeElementId: "dosage-condition", activeElementTabIndex: 15, timestamp: "2025-08-31T20:45:15.460Z" }
FrequencyConditionInputs.tsx:265:21
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "With meals", method: "keyboard", enabled: true, targetTabIndex: 17, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, timestamp: "2025-08-31T20:45:15.461Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] After Condition Selection Handler: 
Object { willAdvanceFocus: true, targetTabIndex: 17, timestamp: "2025-08-31T20:45:15.461Z" }
FrequencyConditionInputs.tsx:278:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "With meals", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:45:15.476Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "BUTTON", targetId: "therapeutic-classes-button", targetTabIndex: 17, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-condition", timestamp: "2025-08-31T20:45:15.511Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:15.513Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:15.514Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "BUTTON", newActiveId: "therapeutic-classes-button", newActiveTabIndex: 17, success: true, timestamp: "2025-08-31T20:45:15.514Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:39.568Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:45:39.570Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:18.347Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:18.349Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", timestamp: "2025-08-31T20:46:20.054Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", timestamp: "2025-08-31T20:46:20.054Z" }
uat-logger.ts:24:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 5, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T20:46:24.254Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 6, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T20:46:24.254Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:24.257Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:24.257Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:31.362Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:31.363Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:35.811Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:46:35.812Z" }
uat-logger.ts:40:13
window.uatTest.end("Test A.2")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test A.2 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test A.3: Tab After Keyboard Selection
**Console Commands:**
```javascript
window.uatTest.start("Test A.3")
// ... perform test steps ...
window.uatTest.end("Test A.3")
```

**Steps:**
1. Focus on Condition input (already has value from A.2)
2. Press Tab

**Expected:**
- Focus should move to next element after Therapeutic Classes
- Condition is readOnly so Tab should work normally

**Questions:**
- [yes] Is Condition input readOnly (not disabled)?
- [yes] Did Tab move focus forward from the readOnly field?
- [x] Console output:
```
window.uatTest.start("Test A.3")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test A.3 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:07.647Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:07.647Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "With meals", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T20:49:12.721Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "With meals", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T20:49:12.722Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:12.723Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:12.723Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:22.145Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:22.146Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T20:49:23.728Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "therapeutic-classes-button", currentActiveTabIndex: 17, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T20:49:23.729Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:23.730Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:23.730Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:39.526Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:49:39.526Z" }
uat-logger.ts:40:13
window.uatTest.end("Test A.3")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test A.3 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

## TEST SUITE B: Mouse-Only Navigation

### Test B.1: Mouse Selection → Manual Tab Required
**Console Commands:**
```javascript
window.uatTest.start("Test B.1")
// ... perform test steps ...
window.uatTest.end("Test B.1")
```

**Steps:**
1. Click on Condition input with mouse
2. Click on dropdown button
3. Click on "Empty Stomach" option with mouse
4. Observe where focus is

**Expected:**
- Focus should remain on Condition input after mouse selection
- No automatic advancement

**Questions:**
- [yes] Did dropdown open on click?
- [yes] Did mouse selection work?
- [yes] Did focus stay on Condition input?
- [x] Console output:
```
window.uatTest.start("Test B.1")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test B.1 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:51:58.563Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:51:58.565Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T20:51:58.576Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Before meals", parentDropdown: "condition-dropdown", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", timestamp: "2025-08-31T20:52:09.857Z" }
uat-logger.ts:62:15
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Before meals", parentDropdown: "condition-dropdown", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", timestamp: "2025-08-31T20:52:09.858Z" }
uat-logger.ts:62:15
[UAT-LOG] Condition Selection: 
Object { selectedValue: "Before meals", selectionMethod: "mouse", previousValue: "", activeElement: "INPUT", activeElementId: "dosage-condition", activeElementTabIndex: 15, timestamp: "2025-08-31T20:52:09.858Z" }
FrequencyConditionInputs.tsx:265:21
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Before meals", method: "mouse", enabled: true, targetTabIndex: 17, targetSelector: undefined, willAdvance: false, currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, timestamp: "2025-08-31T20:52:09.859Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] After Condition Selection Handler: 
Object { willAdvanceFocus: false, targetTabIndex: 17, timestamp: "2025-08-31T20:52:09.859Z" }
FrequencyConditionInputs.tsx:278:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "Before meals", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T20:52:09.876Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:52:16.614Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:52:16.615Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:52:29.023Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:52:29.023Z" }
uat-logger.ts:40:13
window.uatTest.end("Test B.1")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test B.1 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test B.2: Tab After Mouse Selection
**Console Commands:**
```javascript
window.uatTest.start("Test B.2")
// ... perform test steps ...
window.uatTest.end("Test B.2")
```

**Steps:**
1. After B.1 (Condition selected via mouse)
2. Press Tab

**Expected:**
- Focus should move to Therapeutic Classes (17)
- Should skip the now-disabled dropdown button

**Questions:**
- [yes] Did Tab move to Therapeutic Classes?
- [yes] Was the dropdown button skipped?
- [x] Console output:
```
window.uatTest.start("Test B.2")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test B.2 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:53:50.539Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:53:50.539Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "Before meals", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T20:53:53.335Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "Before meals", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T20:53:53.335Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:53:53.337Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:53:53.337Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:54:28.325Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T20:54:28.325Z" }
uat-logger.ts:40:13

```

---

## TEST SUITE C: Mixed Input Methods

### Test C.1: Mouse Click + Keyboard Navigation
**Console Commands:**
```javascript
window.uatTest.start("Test C.1")
// ... perform test steps ...
window.uatTest.end("Test C.1")
```

**Steps:**
1. Click Condition input with mouse
2. Type "bed" to filter
3. Press Arrow Down to highlight "Bedtime"
4. Press Enter to select

**Expected:**
- Typing should filter dropdown
- Enter should select and auto-advance focus

**Questions:**
- [yes] Did filtering work after mouse click?
- [yes, but no focus ring was present] Did keyboard selection auto-advance?
- Notes: As I typed `be`, both [Bedtime, Before Meals] were highlighted.  However the arrow keys would not let me select between the two of them.  I either had to narrow the input further by continuing typing `bed` to get a single selection and then I could hit enter, or I had to choose with the mouse input.
- [x] Console output:
```
Source map error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= uat-logger.ts:3:11
[UAT-LOG] All focus navigation will be logged to console uat-logger.ts:4:11
[UAT-LOG] Copy/paste console output after each test uat-logger.ts:5:11
[UAT-LOG] Test helpers available: App.tsx:34:13
[UAT-LOG] - window.uatTest.start("test name") App.tsx:35:13
[UAT-LOG] - window.uatTest.end("test name") App.tsx:36:13
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= <anonymous code>:1:150327
[UAT-LOG] All focus navigation will be logged to console <anonymous code>:1:150327
[UAT-LOG] Copy/paste console output after each test <anonymous code>:1:150327
[UAT-LOG] Test helpers available: <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.start("test name") <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.end("test name") <anonymous code>:1:150327
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1066:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
Source map error: can't access property "sources", map is undefined
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: react_devtools_backend_compact.js.map
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:05.417Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:05.417Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:06.745Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:06.746Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:06.859Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:06.860Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:08.184Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:08.184Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:18:13.903Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:18:13.904Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:13.911Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:13.911Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:18:14.973Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:18:14.973Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:18:14.986Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:14.990Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:14.990Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:18:14.998Z" }
<anonymous code>:1:150327
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T21:18:18.720Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T21:18:18.721Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Solid", method: "keyboard", enabled: true, targetTabIndex: 5, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, timestamp: "2025-08-31T21:18:18.721Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "form-type", targetTabIndex: 5, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-category", timestamp: "2025-08-31T21:18:18.772Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:18.774Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:18.774Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "form-type", newActiveTabIndex: 5, success: true, timestamp: "2025-08-31T21:18:18.774Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:18:23.091Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:18:23.092Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Capsule", method: "keyboard", enabled: true, targetTabIndex: 7, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, timestamp: "2025-08-31T21:18:23.093Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-amount", targetTabIndex: 7, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "form-type", timestamp: "2025-08-31T21:18:23.143Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:23.145Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:23.145Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-amount", newActiveTabIndex: 7, success: true, timestamp: "2025-08-31T21:18:23.146Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", timestamp: "2025-08-31T21:18:24.996Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", timestamp: "2025-08-31T21:18:24.996Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:52.359Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:18:52.360Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:44.661Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:44.662Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:19:49.484Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:19:49.485Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:49.487Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:49.487Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:19:52.227Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:19:52.227Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 10, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, timestamp: "2025-08-31T21:19:52.228Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "total-amount", targetTabIndex: 10, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-unit", timestamp: "2025-08-31T21:19:52.279Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:52.281Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:52.281Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "total-amount", newActiveTabIndex: 10, success: true, timestamp: "2025-08-31T21:19:52.281Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:19:56.124Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:19:56.124Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:56.126Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:56.126Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T21:19:59.910Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T21:19:59.910Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 13, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, timestamp: "2025-08-31T21:19:59.911Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-frequency", targetTabIndex: 13, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "total-unit", timestamp: "2025-08-31T21:19:59.961Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:59.962Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:19:59.963Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-frequency", newActiveTabIndex: 13, success: true, timestamp: "2025-08-31T21:19:59.963Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T21:19:59.968Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "once", timestamp: "2025-08-31T21:20:04.811Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "once", timestamp: "2025-08-31T21:20:04.811Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Once daily", method: "keyboard", enabled: true, targetTabIndex: 15, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, timestamp: "2025-08-31T21:20:04.812Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:20:04.817Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-condition", targetTabIndex: 15, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-frequency", timestamp: "2025-08-31T21:20:04.862Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:04.864Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:04.864Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-condition", newActiveTabIndex: 15, success: true, timestamp: "2025-08-31T21:20:04.865Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T21:20:04.870Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "bed", timestamp: "2025-08-31T21:20:12.861Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, currentActiveValue: "bed", timestamp: "2025-08-31T21:20:12.861Z" }
uat-logger.ts:24:15
[UAT-LOG] Condition Selection: 
Object { selectedValue: "Bedtime", selectionMethod: "keyboard", previousValue: "", activeElement: "INPUT", activeElementId: "dosage-condition", activeElementTabIndex: 15, timestamp: "2025-08-31T21:20:12.861Z" }
FrequencyConditionInputs.tsx:265:21
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Bedtime", method: "keyboard", enabled: true, targetTabIndex: 17, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, timestamp: "2025-08-31T21:20:12.862Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] After Condition Selection Handler: 
Object { willAdvanceFocus: true, targetTabIndex: 17, timestamp: "2025-08-31T21:20:12.862Z" }
FrequencyConditionInputs.tsx:278:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "Bedtime", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:20:12.868Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "BUTTON", targetId: "therapeutic-classes-button", targetTabIndex: 17, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-condition", timestamp: "2025-08-31T21:20:12.911Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:12.914Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:12.914Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "BUTTON", newActiveId: "therapeutic-classes-button", newActiveTabIndex: 17, success: true, timestamp: "2025-08-31T21:20:12.914Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:52.020Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:20:52.022Z" }
uat-logger.ts:40:13
window.uatTest.end("Test C.1")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test C.1 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test C.2: Keyboard Navigation + Mouse Selection
**Console Commands:**
```javascript
window.uatTest.start("Test C.2")
// ... perform test steps ...
window.uatTest.end("Test C.2")
```

**Steps:**
1. Tab to Condition input
2. Type to open dropdown
3. Click an option with mouse

**Expected:**
- Focus should stay on Condition
- No auto-advancement

**Questions:**
- [?] Did mouse selection work after keyboard navigation?
- user note: I am unable to tab directly there as per step 1.  I Must fill everything out, in order to advance.  But if I fill everything out, Focus does stay on Condition.
- [?] Did focus remain on Condition?
- [x] Console output:
```
Source map error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= uat-logger.ts:3:11
[UAT-LOG] All focus navigation will be logged to console uat-logger.ts:4:11
[UAT-LOG] Copy/paste console output after each test uat-logger.ts:5:11
[UAT-LOG] Test helpers available: App.tsx:34:13
[UAT-LOG] - window.uatTest.start("test name") App.tsx:35:13
[UAT-LOG] - window.uatTest.end("test name") App.tsx:36:13
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= <anonymous code>:1:150327
[UAT-LOG] All focus navigation will be logged to console <anonymous code>:1:150327
[UAT-LOG] Copy/paste console output after each test <anonymous code>:1:150327
[UAT-LOG] Test helpers available: <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.start("test name") <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.end("test name") <anonymous code>:1:150327
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1066:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
Source map error: can't access property "sources", map is undefined
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: react_devtools_backend_compact.js.map
window.uatTest.start("Test C.2")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test C.2 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:51.122Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:51.123Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:52.170Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:52.170Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:52.287Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:52.288Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:53.407Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:53.407Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:21:58.888Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:21:58.888Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:58.893Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:21:58.893Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:22:00.358Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:22:00.358Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:22:00.372Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:00.377Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:00.377Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:22:00.382Z" }
<anonymous code>:1:150327
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:02.283Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:02.284Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:02.285Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:02.285Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:02.986Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:02.986Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 5, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:04.557Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 6, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:04.557Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 7, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:04.964Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 8, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:22:04.964Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:23.389Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:22:23.390Z" }
uat-logger.ts:40:13
window.uatTest.end("Test C.2")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test C.2 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

## TEST SUITE D: Edge Cases

### Test D.1: Escape Key Behavior
**Console Commands:**
```javascript
window.uatTest.start("Test D.1")
// ... perform test steps ...
window.uatTest.end("Test D.1")
```

**Steps:**
1. Tab to Condition input
2. Type to open dropdown
3. Press Escape
4. Press Tab

**Expected:**
- Escape should close dropdown
- Tab should move to Therapeutic Classes

**Questions:**
- [kind of] Did Escape close the dropdown?
- user note: Hitting escape completely shuts down the `add-new-prescribed-medication` view and brings back into focus `medication-management` (with the `Add New Medication` button)
- [no] Did Tab work normally after Escape?
- [ ] Console output:
```
Source map error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= uat-logger.ts:3:11
[UAT-LOG] All focus navigation will be logged to console uat-logger.ts:4:11
[UAT-LOG] Copy/paste console output after each test uat-logger.ts:5:11
[UAT-LOG] Test helpers available: App.tsx:34:13
[UAT-LOG] - window.uatTest.start("test name") App.tsx:35:13
[UAT-LOG] - window.uatTest.end("test name") App.tsx:36:13
[UAT-LOG] ============= UAT LOGGER INITIALIZED ============= <anonymous code>:1:150327
[UAT-LOG] All focus navigation will be logged to console <anonymous code>:1:150327
[UAT-LOG] Copy/paste console output after each test <anonymous code>:1:150327
[UAT-LOG] Test helpers available: <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.start("test name") <anonymous code>:1:150327
[UAT-LOG] - window.uatTest.end("test name") <anonymous code>:1:150327
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1066:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
Source map error: can't access property "sources", map is undefined
Resource URL: http://localhost:3456/%3Canonymous%20code%3E
Source Map URL: react_devtools_backend_compact.js.map
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:15.008Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:15.009Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:16.406Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:16.406Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:16.555Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:16.555Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:20.729Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:20.730Z" }
uat-logger.ts:40:13
window.uatTest.start("Test D.1")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test D.1 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:28.144Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:28.146Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:28.266Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:28.266Z" }
uat-logger.ts:40:13
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Lorazepam", parentDropdown: "medication-search-results", currentActiveElement: "INPUT", currentActiveId: "medication-search", timestamp: "2025-08-31T21:24:32.509Z" }
uat-logger.ts:62:15
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Lorazepam", parentDropdown: "medication-search-results", currentActiveElement: "INPUT", currentActiveId: "medication-search", timestamp: "2025-08-31T21:24:32.509Z" }
uat-logger.ts:62:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:32.511Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:32.511Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:32.602Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:32.603Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:38.265Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:38.265Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:38.267Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:38.267Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 2, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:38.875Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 2, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:38.875Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:38.877Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:38.878Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 5, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 3, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:41.354Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 6, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 3, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:41.354Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:41.355Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:41.355Z" }
uat-logger.ts:40:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 7, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:41.908Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 8, shiftKey: false, direction: "FORWARD", currentActiveElement: "BUTTON", currentActiveId: "", currentActiveTabIndex: 4, currentActiveValue: "", currentActiveReadOnly: undefined, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:41.908Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:41.909Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:41.909Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:24:42.510Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:24:42.510Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:24:42.523Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:42.526Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:42.526Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:24:42.530Z" }
<anonymous code>:1:150327
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "solid", timestamp: "2025-08-31T21:24:46.114Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "solid", timestamp: "2025-08-31T21:24:46.114Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Solid", method: "keyboard", enabled: true, targetTabIndex: 5, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, timestamp: "2025-08-31T21:24:46.114Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "form-type", targetTabIndex: 5, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-category", timestamp: "2025-08-31T21:24:46.165Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:46.167Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:46.167Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "form-type", newActiveTabIndex: 5, success: true, timestamp: "2025-08-31T21:24:46.168Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:24:49.628Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:24:49.629Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Capsule", method: "keyboard", enabled: true, targetTabIndex: 7, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, timestamp: "2025-08-31T21:24:49.629Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-amount", targetTabIndex: 7, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "form-type", timestamp: "2025-08-31T21:24:49.680Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:49.682Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:49.682Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-amount", newActiveTabIndex: 7, success: true, timestamp: "2025-08-31T21:24:49.682Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 9, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:52.790Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 10, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:52.791Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:52.791Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:52.791Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:24:55.636Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:24:55.636Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 10, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, timestamp: "2025-08-31T21:24:55.637Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "total-amount", targetTabIndex: 10, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-unit", timestamp: "2025-08-31T21:24:55.687Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:55.689Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:55.689Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "total-amount", newActiveTabIndex: 10, success: true, timestamp: "2025-08-31T21:24:55.690Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 11, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:58.949Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 12, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:24:58.949Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:58.951Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:24:58.951Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T21:25:02.556Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", timestamp: "2025-08-31T21:25:02.556Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 13, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, timestamp: "2025-08-31T21:25:02.556Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-frequency", targetTabIndex: 13, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "total-unit", timestamp: "2025-08-31T21:25:02.607Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:02.608Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:02.608Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-frequency", newActiveTabIndex: 13, success: true, timestamp: "2025-08-31T21:25:02.609Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T21:25:02.614Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:25:11.474Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:15.028Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:15.028Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T21:25:15.029Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "On", timestamp: "2025-08-31T21:25:17.326Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "On", timestamp: "2025-08-31T21:25:17.326Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Once daily", method: "keyboard", enabled: true, targetTabIndex: 15, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, timestamp: "2025-08-31T21:25:17.327Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:25:17.332Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-condition", targetTabIndex: 15, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-frequency", timestamp: "2025-08-31T21:25:17.377Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:17.379Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:25:17.379Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-condition", newActiveTabIndex: 15, success: true, timestamp: "2025-08-31T21:25:17.379Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T21:25:17.384Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:25:19.281Z" }
uat-logger.ts:32:15
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:25:19.282Z" }
uat-logger.ts:32:15
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:25:43.166Z" }
uat-logger.ts:32:15
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:25:43.168Z" }
uat-logger.ts:32:15
window.uatTest.end("Test D.1")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test D.1 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:36.359Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:36.361Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:36.461Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:36.462Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:37.821Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:37.821Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:39.624Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:39.624Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:27:39.752Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:39.755Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:39.755Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:27:39.763Z" }
<anonymous code>:1:150327
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:42.652Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:27:42.653Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T21:27:42.660Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:27:48.382Z" }
uat-logger.ts:32:15
[UAT-LOG] ESCAPE PRESS: 
Object { timestamp: "2025-08-31T21:27:48.382Z" }
uat-logger.ts:32:15
window.uatTest.end("Test D.1")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test D.1 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test D.2: Clear and Re-select
**Console Commands:**
```javascript
window.uatTest.start("Test D.2")
// ... perform test steps ...
window.uatTest.end("Test D.2")
```

**Steps:**
1. With Condition already selected
2. Click the clear/X button (if available) or manually clear
3. Re-select using keyboard
4. Observe focus behavior

**Expected:**
- Clearing should enable the dropdown button
- Keyboard selection should auto-advance again

**Questions:**
- [no] Could you clear the selection?
There is no clear button on an input by input selection basis.
- [n/a] Did re-selection with keyboard auto-advance?
- [x] Console output:
```
window.uatTest.start("Test D.2")
<empty string> uat-logger.ts:77:11
[UAT-LOG] ======================================== uat-logger.ts:78:11
[UAT-LOG] TEST START: Test D.2 uat-logger.ts:79:11
[UAT-LOG] ======================================== uat-logger.ts:80:11
[UAT-LOG] Tab counter reset uat-logger.ts:74:11
undefined
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:48.284Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:48.284Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:49.794Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:49.796Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:49.906Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:49.906Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:50.911Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:29:50.911Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:30:02.061Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "medication-search", currentActiveTabIndex: 1, currentActiveValue: "Lora", timestamp: "2025-08-31T21:30:02.063Z" }
uat-logger.ts:24:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:02.068Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:02.068Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:30:03.204Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "BUTTON", currentActiveId: "medication-continue-button", currentActiveTabIndex: 5, currentActiveValue: "", timestamp: "2025-08-31T21:30:03.204Z" }
uat-logger.ts:24:15
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:30:03.217Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:03.222Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:03.222Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State:  
Object { frequency: "", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:30:03.230Z" }
<anonymous code>:1:150327
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T21:30:09.454Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, currentActiveValue: "sol", timestamp: "2025-08-31T21:30:09.455Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Solid", method: "keyboard", enabled: true, targetTabIndex: 5, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-category", currentActiveTabIndex: 3, timestamp: "2025-08-31T21:30:09.455Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "form-type", targetTabIndex: 5, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-category", timestamp: "2025-08-31T21:30:09.506Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:09.508Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:09.508Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "form-type", newActiveTabIndex: 5, success: true, timestamp: "2025-08-31T21:30:09.509Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:30:12.595Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, currentActiveValue: "caps", timestamp: "2025-08-31T21:30:12.597Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Capsule", method: "keyboard", enabled: true, targetTabIndex: 7, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "form-type", currentActiveTabIndex: 5, timestamp: "2025-08-31T21:30:12.597Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-amount", targetTabIndex: 7, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "form-type", timestamp: "2025-08-31T21:30:12.647Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:12.650Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:12.650Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-amount", newActiveTabIndex: 7, success: true, timestamp: "2025-08-31T21:30:12.650Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 1, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:15.364Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 2, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "dosage-amount", currentActiveTabIndex: 7, currentActiveValue: "4", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:15.365Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:15.367Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:15.367Z" }
uat-logger.ts:40:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:30:16.665Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, currentActiveValue: "mg", timestamp: "2025-08-31T21:30:16.665Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "keyboard", enabled: true, targetTabIndex: 10, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-unit", currentActiveTabIndex: 8, timestamp: "2025-08-31T21:30:16.666Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "total-amount", targetTabIndex: 10, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-unit", timestamp: "2025-08-31T21:30:16.716Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:16.718Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:16.718Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "total-amount", newActiveTabIndex: 10, success: true, timestamp: "2025-08-31T21:30:16.718Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 3, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:18.870Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 4, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-amount", currentActiveTabIndex: 10, currentActiveValue: "40", currentActiveReadOnly: false, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:18.871Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:18.873Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:18.873Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:34.853Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:34.855Z" }
uat-logger.ts:40:13
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "mg", parentDropdown: "total-unit-dropdown", currentActiveElement: "INPUT", currentActiveId: "total-unit", timestamp: "2025-08-31T21:30:39.646Z" }
uat-logger.ts:62:15
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "mg", parentDropdown: "total-unit-dropdown", currentActiveElement: "INPUT", currentActiveId: "total-unit", timestamp: "2025-08-31T21:30:39.647Z" }
uat-logger.ts:62:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "mg", method: "mouse", enabled: true, targetTabIndex: 13, targetSelector: undefined, willAdvance: false, currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, timestamp: "2025-08-31T21:30:39.647Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 5, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:41.195Z" }
uat-logger.ts:10:15
[UAT-LOG] TAB PRESS: 
Object { pressNumber: 6, shiftKey: false, direction: "FORWARD", currentActiveElement: "INPUT", currentActiveId: "total-unit", currentActiveTabIndex: 11, currentActiveValue: "mg", currentActiveReadOnly: true, currentActiveDisabled: false, timestamp: "2025-08-31T21:30:41.195Z" }
uat-logger.ts:10:15
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:41.197Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:41.197Z" }
uat-logger.ts:40:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "", condition: "", showFrequencyDropdown: true, showConditionDropdown: false, timestamp: "2025-08-31T21:30:41.201Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "Once", timestamp: "2025-08-31T21:30:46.423Z" }
uat-logger.ts:24:15
[UAT-LOG] ENTER PRESS: 
Object { currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, currentActiveValue: "Once", timestamp: "2025-08-31T21:30:46.424Z" }
uat-logger.ts:24:15
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Once daily", method: "keyboard", enabled: true, targetTabIndex: 15, targetSelector: undefined, willAdvance: true, currentActiveElement: "INPUT", currentActiveId: "dosage-frequency", currentActiveTabIndex: 13, timestamp: "2025-08-31T21:30:46.424Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:30:46.429Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] Focus Advancement - FOCUSING: 
Object { targetElement: "INPUT", targetId: "dosage-condition", targetTabIndex: 15, targetValue: "", previousActiveElement: "INPUT", previousActiveId: "dosage-frequency", timestamp: "2025-08-31T21:30:46.474Z" }
useFocusAdvancement.ts:56:21
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:46.476Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:30:46.476Z" }
uat-logger.ts:40:13
[UAT-LOG] Focus Advancement - COMPLETED: 
Object { newActiveElement: "INPUT", newActiveId: "dosage-condition", newActiveTabIndex: 15, success: true, timestamp: "2025-08-31T21:30:46.476Z" }
useFocusAdvancement.ts:69:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "", showFrequencyDropdown: false, showConditionDropdown: true, timestamp: "2025-08-31T21:30:46.480Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Bedtime", parentDropdown: "condition-dropdown", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", timestamp: "2025-08-31T21:30:51.546Z" }
uat-logger.ts:62:15
[UAT-LOG] MOUSE CLICK ON DROPDOWN ITEM: 
Object { clickedElement: "Bedtime", parentDropdown: "condition-dropdown", currentActiveElement: "INPUT", currentActiveId: "dosage-condition", timestamp: "2025-08-31T21:30:51.548Z" }
uat-logger.ts:62:15
[UAT-LOG] Condition Selection: 
Object { selectedValue: "Bedtime", selectionMethod: "mouse", previousValue: "", activeElement: "INPUT", activeElementId: "dosage-condition", activeElementTabIndex: 15, timestamp: "2025-08-31T21:30:51.548Z" }
FrequencyConditionInputs.tsx:265:21
[UAT-LOG] useFocusAdvancement.handleSelection: 
Object { item: "Bedtime", method: "mouse", enabled: true, targetTabIndex: 17, targetSelector: undefined, willAdvance: false, currentActiveElement: "INPUT", currentActiveId: "dosage-condition", currentActiveTabIndex: 15, timestamp: "2025-08-31T21:30:51.549Z" }
useFocusAdvancement.ts:111:13
[UAT-LOG] After Condition Selection Handler: 
Object { willAdvanceFocus: false, targetTabIndex: 17, timestamp: "2025-08-31T21:30:51.549Z" }
FrequencyConditionInputs.tsx:278:21
[UAT-LOG] FrequencyConditionInputs State: 
Object { frequency: "Once daily", condition: "Bedtime", showFrequencyDropdown: false, showConditionDropdown: false, timestamp: "2025-08-31T21:30:51.560Z" }
FrequencyConditionInputs.tsx:55:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:31:21.047Z" }
uat-logger.ts:40:13
[UAT-LOG] FOCUS CHANGE: 
Object { eventType: "focusin", newFocus: {…}, previousFocus: {…}, timestamp: "2025-08-31T21:31:21.047Z" }
uat-logger.ts:40:13
window.uatTest.end("Test D.2")
[UAT-LOG] ======================================== uat-logger.ts:84:11
[UAT-LOG] TEST END: Test D.2 uat-logger.ts:85:11
[UAT-LOG] ======================================== uat-logger.ts:86:11
<empty string> uat-logger.ts:87:11
undefined

```

---

### Test D.3: Shift+Tab Backwards Navigation
**Console Commands:**
```javascript
window.uatTest.start("Test D.3")
// ... perform test steps ...
window.uatTest.end("Test D.3")
```

**Steps:**
1. Focus on Therapeutic Classes
2. Press Shift+Tab
3. Observe which element receives focus

**Expected:**
- Should go back to Condition input (15) if it has no value
- Should go back to Condition input (15) if it has a value (readOnly)
- Should skip the disabled button

**Questions:**
- [ ] Did Shift+Tab go to Condition input?
- [ ] Was the dropdown button skipped?
- [ ] Console output:
```
[PASTE CONSOLE OUTPUT HERE]
```

---

## TEST SUITE E: Therapeutic Classes Interaction

### Test E.1: Enter Therapeutic Classes After Auto-Advance
**Console Commands:**
```javascript
window.uatTest.start("Test E.1")
// ... perform test steps ...
window.uatTest.end("Test E.1")
```

**Steps:**
1. Select Condition with keyboard (auto-advances to Therapeutic)
2. Press Enter or Space to open Therapeutic Classes
3. Make a selection

**Expected:**
- Should be able to interact immediately
- No focus issues

**Questions:**
- [ ] Could you open Therapeutic Classes immediately?
- [ ] Did selection work properly?
- [ ] Console output:
```
[PASTE CONSOLE OUTPUT HERE]
```

---

### Test E.2: Tab Through Therapeutic Classes
**Console Commands:**
```javascript
window.uatTest.start("Test E.2")
// ... perform test steps ...
window.uatTest.end("Test E.2")
```

**Steps:**
1. With Therapeutic Classes modal/dropdown open
2. Use Tab to navigate through options
3. Select one and observe focus

**Expected:**
- Tab should work within the Therapeutic Classes component
- Selection should maintain proper focus

**Questions:**
- [ ] Did Tab navigation work in Therapeutic Classes?
- [ ] Where did focus go after selection?
- [ ] Console output:
```
[PASTE CONSOLE OUTPUT HERE]
```

---

## Summary Section

After completing all tests, please provide:

1. **Overall Success Rate:** ___ out of 13 tests passed

2. **Critical Issues Found:**
   - 
   - 

3. **Minor Issues Found:**
   - 
   - 

4. **Unexpected Behaviors:**
   - 
   - 

5. **User Experience Feedback:**
   - What felt natural?
   - What felt confusing?
   - Suggestions for improvement?

---

## Console Output Collection

If any test fails or shows unexpected behavior, please provide the COMPLETE console output for that entire test sequence, including all [UAT-LOG] entries.

**Remember:** Start each test with `window.uatTest.start("Test X.X")` and end with `window.uatTest.end("Test X.X")`



## Additional User Notes:
- If I am in the medication-search input box and I start typing, then hit tab, it will take me to medication-search-results, but the arrow keys will not work for further navigation.  However, if I start typing, then hit the arrow keys, it will take me to medication-search-results and the arrow keys are focus-trapped within the search results and further navigation within the search-results works.
- If I am in the dosage type dropdown, and I start typing `tablet`, it will narrow to a single entry (probably due to a startsWith constraint?), but I cannot select with the enter key, presumably because other entries like `chewable tablet` were present (contains constraint).  I would expect that narrowing to a single entry no-matter whether startsWith or contains is the match criteria, that it would allow the enter key to select and focus advancement would continue.
- In `Dosage Form` if I type `Solid` a single entry comes up.  If I hit tab, the focus advances to the dropdown.  I must hit enter on the dropdown chevron, and then manually select solid again with the enter key.  This may be desirable, but seems weird since I typed it out and expected it to just advance to `Type`
- In `Dosage Amount` and `Total Amount`, when I click enter after typing valid number focus does not advance.  Only tab will allow it to advance.
-
