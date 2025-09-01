import React, { useRef, useState } from 'react';
import { ChevronDown, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutocompleteDropdown, SelectionMethod } from '@/components/ui/autocomplete-dropdown';
import { dosageFrequencies, dosageConditions } from '@/mocks/data/dosages.mock';
import { useDropdownBlur } from '@/hooks/useDropdownBlur';
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';
import { filterStringItems, isItemHighlighted } from '@/utils/dropdown-filter';

interface FrequencyConditionInputsProps {
  frequency: string;
  condition: string;
  errors: Map<string, string>;
  onFrequencyChange: (freq: string) => void;
  onConditionChange: (cond: string) => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const FrequencyConditionInputsEditable: React.FC<FrequencyConditionInputsProps> = ({
  frequency,
  condition,
  errors,
  onFrequencyChange,
  onConditionChange,
  onDropdownOpen
}) => {
  const [frequencyInput, setFrequencyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  
  // Edit mode states
  const [editingFrequency, setEditingFrequency] = useState(false);
  const [editingCondition, setEditingCondition] = useState(false);

  const frequencyInputRef = useRef<HTMLInputElement>(null);
  const conditionInputRef = useRef<HTMLInputElement>(null);

  // Dropdown blur handlers using abstracted timing logic
  const handleFrequencyBlur = useDropdownBlur(() => {
    setShowFrequencyDropdown(false);
    if (!frequency) {
      setEditingFrequency(false);
    }
  });
  
  const handleConditionBlur = useDropdownBlur(() => {
    setShowConditionDropdown(false);
    if (!condition) {
      setEditingCondition(false);
    }
  });

  // Focus advancement hooks for keyboard navigation
  const frequencyFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 15, // Move to Condition input
    enabled: true
  });

  const conditionFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 17, // Move to Therapeutic Classes button
    enabled: true
  });
  
  // Enter edit mode handlers
  const enterFrequencyEdit = () => {
    setEditingFrequency(true);
    setFrequencyInput(frequency);
    setShowFrequencyDropdown(true);
    setTimeout(() => frequencyInputRef.current?.focus(), 0);
  };

  const enterConditionEdit = () => {
    setEditingCondition(true);
    setConditionInput(condition);
    setShowConditionDropdown(true);
    setTimeout(() => conditionInputRef.current?.focus(), 0);
  };

  // Use generic filtering utilities
  const filteredFrequencies = filterStringItems(dosageFrequencies, frequencyInput, 'contains');
  const isFrequencyHighlighted = (freq: string) => 
    isItemHighlighted(freq, frequencyInput, 'startsWith');

  const filteredConditions = filterStringItems(dosageConditions, conditionInput, 'contains');
  const isConditionHighlighted = (cond: string) => 
    isItemHighlighted(cond, conditionInput, 'startsWith');

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Frequency */}
      <div className="relative">
        <Label htmlFor="dosage-frequency" className="text-base font-medium">
          Frequency
        </Label>
        <div id="frequency-container" className="relative mt-2">
          <Input
            ref={frequencyInputRef}
            id="dosage-frequency"
            data-testid="dosage-frequency-input"
            type="text"
            value={editingFrequency ? frequencyInput : (frequency || frequencyInput)}
            onChange={(e) => {
              setFrequencyInput(e.target.value);
              if (!frequency || editingFrequency) {
                setShowFrequencyDropdown(true);
                onDropdownOpen?.('frequency-container');
              }
            }}
            onClick={() => {
              if (frequency && !editingFrequency) {
                enterFrequencyEdit();
              }
            }}
            onFocus={() => {
              if (!frequency || editingFrequency) {
                setShowFrequencyDropdown(true);
              }
            }}
            onBlur={handleFrequencyBlur}
            placeholder="Select frequency..."
            className={`pr-10 cursor-pointer ${
              frequency && !editingFrequency ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' : ''
            } ${errors.get('frequency') ? 'border-red-500' : ''} ${
              editingFrequency ? 'bg-white' : ''
            }`}
            readOnly={!!frequency && !editingFrequency}
            aria-label="Dosage frequency"
            aria-describedby={errors.get('frequency') ? 'frequency-error' : undefined}
            tabIndex={13}
          />
          {frequency && !editingFrequency && (
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={enterFrequencyEdit}
              aria-label="Edit frequency"
              tabIndex={14}
            >
              <Edit2 className="text-gray-400" size={16} />
            </button>
          )}
          {(!frequency || editingFrequency) && (
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={() => {
                setShowFrequencyDropdown(true);
                frequencyInputRef.current?.focus();
                onDropdownOpen?.('frequency-container');
              }}
              aria-label="Open frequency dropdown"
              tabIndex={14}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          )}
        </div>
        
        <AutocompleteDropdown
          isOpen={showFrequencyDropdown && (!frequency || editingFrequency)}
          items={filteredFrequencies}
          inputRef={frequencyInputRef}
          onSelect={(freq, method) => {
            onFrequencyChange(freq);
            setFrequencyInput(freq);
            setShowFrequencyDropdown(false);
            setEditingFrequency(false);
            
            // Use hook for focus advancement
            frequencyFocusAdvancement.handleSelection(freq, method);
          }}
          getItemKey={(freq) => freq}
          isItemHighlighted={isFrequencyHighlighted}
          testId="frequency-dropdown"
          modalId="frequency-dropdown"
          renderItem={(freq, index) => (
            <div data-testid={`frequency-option-${index}`}>
              {freq}
            </div>
          )}
        />
        
        {errors.get('frequency') && (
          <p id="frequency-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.get('frequency')}
          </p>
        )}
      </div>

      {/* Condition */}
      <div className="relative">
        <Label htmlFor="dosage-condition" className="text-base font-medium">
          Condition
        </Label>
        <div id="condition-container" className="relative mt-2">
          <Input
            ref={conditionInputRef}
            id="dosage-condition"
            data-testid="dosage-condition-input"
            type="text"
            value={editingCondition ? conditionInput : (condition || conditionInput)}
            onChange={(e) => {
              setConditionInput(e.target.value);
              if (!condition || editingCondition) {
                setShowConditionDropdown(true);
                onDropdownOpen?.('condition-container');
              }
            }}
            onClick={() => {
              if (condition && !editingCondition) {
                enterConditionEdit();
              }
            }}
            onFocus={() => {
              if (!condition || editingCondition) {
                setShowConditionDropdown(true);
              }
            }}
            onBlur={handleConditionBlur}
            placeholder="Select condition..."
            className={`pr-10 cursor-pointer ${
              condition && !editingCondition ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' : ''
            } ${
              editingCondition ? 'bg-white' : ''
            }`}
            readOnly={!!condition && !editingCondition}
            aria-label="Dosage condition"
            tabIndex={15}
          />
          {condition && !editingCondition && (
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={enterConditionEdit}
              aria-label="Edit condition"
              tabIndex={16}
            >
              <Edit2 className="text-gray-400" size={16} />
            </button>
          )}
          {(!condition || editingCondition) && (
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={() => {
                setShowConditionDropdown(true);
                conditionInputRef.current?.focus();
                onDropdownOpen?.('condition-container');
              }}
              aria-label="Open condition dropdown"
              tabIndex={16}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          )}
        </div>
        
        <AutocompleteDropdown
          isOpen={showConditionDropdown && (!condition || editingCondition)}
          items={filteredConditions}
          inputRef={conditionInputRef}
          onSelect={(cond, method) => {
            onConditionChange(cond);
            setConditionInput(cond);
            setShowConditionDropdown(false);
            setEditingCondition(false);
            
            // Use hook for focus advancement
            conditionFocusAdvancement.handleSelection(cond, method);
          }}
          getItemKey={(cond) => cond}
          isItemHighlighted={isConditionHighlighted}
          testId="condition-dropdown"
          modalId="condition-dropdown"
          renderItem={(cond, index) => (
            <div data-testid={`condition-option-${index}`}>
              {cond}
            </div>
          )}
        />
      </div>
    </div>
  );
};