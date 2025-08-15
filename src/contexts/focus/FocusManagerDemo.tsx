/**
 * FocusManager Demo
 * Example implementation showing migration from old focus system to new FocusManagerContext
 */

import React, { useState, useCallback } from 'react';
import { 
  FocusManagerProvider,
  useFocusable,
  useModalFocus,
  useFocusManager,
  useFocusHistory,
  useFocusDebug,
  useMouseNavigation,
  useStepIndicator,
  FocusableType,
  FocusChangeReason,
  NavigationMode
} from './index';

/**
 * Example: Migrated MedicationSearch component
 */
const MigratedMedicationSearch: React.FC = () => {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Use new focus system instead of manual focus management
  const { ref, focus, update } = useFocusable('medication-search', {
    type: FocusableType.COMBOBOX,
    metadata: { component: 'MedicationSearch' },
    validator: async () => {
      // Example validation: ensure value is not empty
      return value.trim().length > 0;
    }
  });
  
  const { focusNext } = useFocusManager();
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      // Move to next field on Enter
      focusNext();
    } else if (e.key === 'ArrowDown') {
      setShowDropdown(true);
    }
  };
  
  return (
    <div className="medication-search">
      <label htmlFor="medication">Medication</label>
      <input
        ref={ref as any}
        id="medication"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search medications..."
        role="combobox"
        aria-expanded={showDropdown}
      />
      
      {showDropdown && (
        <div className="dropdown">
          <div>Medication Option 1</div>
          <div>Medication Option 2</div>
          <div>Medication Option 3</div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Migrated DosageForm component
 */
const MigratedDosageForm: React.FC = () => {
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('mg');
  
  // Register multiple focusable elements
  const { ref: dosageRef } = useFocusable('dosage-amount', {
    type: FocusableType.INPUT,
    tabIndex: 1
  });
  
  const { ref: unitRef } = useFocusable('dosage-unit', {
    type: FocusableType.SELECT,
    tabIndex: 2
  });
  
  const { focusNext, focusPrevious } = useFocusManager();
  
  return (
    <div className="dosage-form">
      <div className="form-group">
        <label htmlFor="dosage">Dosage Amount</label>
        <input
          ref={dosageRef as any}
          id="dosage"
          type="number"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') focusNext();
            if (e.key === 'Tab' && e.shiftKey) {
              e.preventDefault();
              focusPrevious();
            }
          }}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="unit">Unit</label>
        <select
          ref={unitRef as any}
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="mg">mg</option>
          <option value="ml">ml</option>
          <option value="tablets">tablets</option>
        </select>
      </div>
    </div>
  );
};

/**
 * Example: Modal with proper focus management
 */
const MigratedModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { scopeId, open, close } = useModalFocus('demo-modal', {
    closeOnEscape: true,
    closeOnOutsideClick: true,
    autoFocus: true
  });
  
  const { ref: titleRef } = useFocusable('modal-title', {
    scopeId,
    type: FocusableType.INPUT
  });
  
  const { ref: descRef } = useFocusable('modal-description', {
    scopeId,
    type: FocusableType.TEXTAREA
  });
  
  const { ref: saveRef } = useFocusable('modal-save', {
    scopeId,
    type: FocusableType.BUTTON
  });
  
  React.useEffect(() => {
    if (isOpen) {
      open();
    } else {
      close();
    }
  }, [isOpen, open, close]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    close();
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Demo Modal</h2>
        
        <div className="form-group">
          <label htmlFor="modal-title">Title</label>
          <input
            ref={titleRef as any}
            id="modal-title"
            type="text"
            placeholder="Enter title..."
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="modal-desc">Description</label>
          <textarea
            ref={descRef as any}
            id="modal-desc"
            placeholder="Enter description..."
            rows={4}
          />
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button ref={saveRef as any} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Component with Mouse Navigation Support
 */
const MouseNavigationDemo: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { steps, onStepClick } = useStepIndicator();
  const { getNavigationMode, setNavigationMode } = useFocusManager();
  const mode = getNavigationMode();
  
  // Field with mouse navigation
  const Field: React.FC<{ id: string; label: string; allowJump?: boolean }> = ({ 
    id, 
    label, 
    allowJump = false 
  }) => {
    const [value, setValue] = useState('');
    const { ref, focus } = useFocusable(id, {
      type: FocusableType.INPUT,
      metadata: { label, required: !allowJump },
      tabIndex: parseInt(id.replace('field', '')),
      validator: allowJump ? undefined : () => value.length > 0
    });
    
    const mouseNav = useMouseNavigation(id, {
      allowDirectJump: allowJump,
      clickAdvancesBehavior: 'next'
    });
    
    // Register for step indicator
    const { updateElement } = useFocusManager();
    React.useEffect(() => {
      updateElement(id, {
        visualIndicator: {
          showInStepper: true,
          stepLabel: label,
          stepDescription: `Enter ${label.toLowerCase()}`
        },
        mouseNavigation: {
          allowDirectJump: allowJump,
          enableClickNavigation: true
        }
      });
    }, [id, label, allowJump, updateElement]);
    
    const handleComplete = () => {
      if (value && !completedSteps.includes(id)) {
        setCompletedSteps(prev => [...prev, id]);
        focus(FocusChangeReason.PROGRAMMATIC);
      }
    };
    
    return (
      <div className="field" style={{ marginBottom: '10px' }}>
        <label>{label}:</label>
        <input
          ref={ref as any}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleComplete}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...mouseNav}
          style={{
            border: mouseNav.canJump ? '2px solid green' : '1px solid #ccc',
            padding: '5px'
          }}
        />
        {mouseNav.canJump && <span> ✓ Can jump here</span>}
      </div>
    );
  };
  
  return (
    <div className="mouse-navigation-demo">
      <h3>Mouse Navigation Features</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Navigation Mode:</strong> {mode}
        <div>
          <button onClick={() => setNavigationMode(NavigationMode.KEYBOARD)}>
            Keyboard Mode
          </button>
          <button onClick={() => setNavigationMode(NavigationMode.MOUSE)}>
            Mouse Mode
          </button>
          <button onClick={() => setNavigationMode(NavigationMode.HYBRID)}>
            Hybrid Mode
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>Step Indicator (Click to Navigate)</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={(e) => onStepClick(step.id, e)}
              disabled={!step.isClickable}
              style={{
                padding: '10px',
                background: step.status === 'complete' ? '#4CAF50' :
                           step.status === 'current' ? '#2196F3' :
                           step.status === 'disabled' ? '#ccc' : '#fff',
                color: step.status === 'complete' || step.status === 'current' ? '#fff' : '#000',
                border: '1px solid #ccc',
                cursor: step.isClickable ? 'pointer' : 'not-allowed'
              }}
            >
              {index + 1}. {step.label}
              <div style={{ fontSize: '10px' }}>{step.status}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4>Form Fields (Try clicking directly on later fields)</h4>
        <Field id="field1" label="First Name" />
        <Field id="field2" label="Last Name" />
        <Field id="field3" label="Email" allowJump={true} />
        <Field id="field4" label="Phone" />
        <p style={{ fontSize: '12px', color: '#666' }}>
          * Email field allows direct jumping (green border)
          * Other fields require previous fields to be completed
          * Move mouse to switch to hybrid mode
          * Use Tab key to navigate with keyboard
        </p>
      </div>
    </div>
  );
};

/**
 * Main demo application
 */
export const FocusManagerDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <FocusManagerProvider debug={true}>
      <div className="demo-app">
        <h1>FocusManager Demo - Migration Example</h1>
        
        <div className="demo-section">
          <h2>Medication Entry Form</h2>
          <p>This demonstrates the migration from the old focus system to the new FocusManagerContext.</p>
          
          <MigratedMedicationSearch />
          <MigratedDosageForm />
          
          <button onClick={() => setModalOpen(true)}>
            Open Modal
          </button>
        </div>
        
        <div className="demo-section" style={{ marginTop: '30px' }}>
          <h2>Mouse Navigation Demo</h2>
          <p>This demonstrates the new mouse navigation features added in Task 002.</p>
          <MouseNavigationDemo />
        </div>
        
        <MigratedModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        
        <FocusDebugPanel />
      </div>
    </FocusManagerProvider>
  );
};

/**
 * Debug panel to show focus state
 */
const FocusDebugPanel: React.FC = () => {
  const { state, enableDebug, disableDebug, isDebugEnabled } = useFocusDebug();
  const { undo, redo, canUndo, canRedo, history, clear } = useFocusHistory();
  const { focusFirst, focusLast } = useFocusManager();
  
  return (
    <div className="debug-panel" style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '300px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h3>Focus Debug Panel</h3>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={isDebugEnabled}
            onChange={(e) => e.target.checked ? enableDebug() : disableDebug()}
          />
          Enable Debug Logging
        </label>
      </div>
      
      <div>
        <h4>Current State:</h4>
        <ul>
          <li>Active Scope: {state.activeScopeId}</li>
          <li>Current Focus: {state.currentFocusId || 'none'}</li>
          <li>Elements: {state.elements.size}</li>
          <li>Scopes: {state.scopes.length}</li>
          <li>Modal Stack: {state.modalStack.length}</li>
          <li>History: {history.length} entries</li>
          <li>Navigation Mode: {state.navigationMode}</li>
          <li>Mouse Interactions: {state.mouseInteractionHistory.length}</li>
          <li>Mouse Position: ({state.lastMousePosition.x}, {state.lastMousePosition.y})</li>
        </ul>
      </div>
      
      <div>
        <h4>Navigation:</h4>
        <button onClick={() => focusFirst()}>Focus First</button>
        <button onClick={() => focusLast()}>Focus Last</button>
      </div>
      
      <div>
        <h4>History:</h4>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
        <button onClick={clear}>Clear</button>
      </div>
      
      <div>
        <h4>Registered Elements:</h4>
        <ul style={{ fontSize: '12px' }}>
          {Array.from(state.elements.values()).map(el => (
            <li key={el.id}>
              {el.id} ({el.type}) - Scope: {el.scopeId}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Migration Guide Comments:
 * 
 * Key Changes from Old System:
 * 1. Replace `useFocusProgression` with `useFocusable` and `useFocusManager`
 * 2. Replace `useFocusTrap` with `useModalFocus` or `useFocusScope`
 * 3. Remove manual setTimeout() calls - the context handles timing
 * 4. Remove manual dropdown click triggers - use metadata and type system
 * 5. Validation is now async and integrated into navigation
 * 
 * Benefits:
 * - Centralized focus state management
 * - Automatic history tracking with undo/redo
 * - Better modal and scope isolation
 * - Debug tools for development
 * - Type-safe with TypeScript
 * - Ready for Radix UI integration
 */