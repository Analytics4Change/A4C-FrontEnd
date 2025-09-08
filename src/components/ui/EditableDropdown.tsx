import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit2 } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { AutocompleteDropdown, SelectionMethod } from './autocomplete-dropdown';
import { useDropdownBlur } from '@/hooks/useDropdownBlur';
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';
import { filterStringItems, isItemHighlighted } from '@/utils/dropdown-filter';
import { Logger } from '@/utils/logger';

const log = Logger.getLogger('navigation');

interface EditableDropdownProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  tabIndex: number;
  targetTabIndex?: number;
  onChange: (value: string) => void;
  onDropdownOpen?: (elementId: string) => void;
  filterMode?: 'contains' | 'startsWith';
  testIdPrefix?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Reusable editable dropdown component that provides:
 * - Edit mode functionality (click to re-edit selected values)
 * - Autocomplete search
 * - Keyboard navigation
 * - Accessibility support
 * - Visual feedback for selected/editing states
 */
export const EditableDropdown: React.FC<EditableDropdownProps> = ({
  id,
  label,
  value,
  options,
  placeholder = 'Select...',
  disabled = false,
  disabledMessage,
  error,
  tabIndex,
  targetTabIndex,
  onChange,
  onDropdownOpen,
  filterMode = 'contains',
  testIdPrefix,
  className = '',
  showLabel = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use testIdPrefix or id for test IDs
  const testId = testIdPrefix || id;

  // Dropdown blur handler using abstracted timing logic
  const handleBlur = useDropdownBlur(() => {
    setShowDropdown(false);
    if (!value) {
      setIsEditing(false);
    }
  });

  // Focus advancement hook for keyboard navigation
  const focusAdvancement = useFocusAdvancement({
    targetTabIndex: targetTabIndex || tabIndex + 1,
    enabled: !!targetTabIndex
  });

  // Enter edit mode
  const enterEditMode = () => {
    setIsEditing(true);
    setInputValue(value);
    setShowDropdown(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!value || isEditing) {
      setShowDropdown(true);
      onDropdownOpen?.(`${id}-container`);
    }
  };

  // Handle input click
  const handleInputClick = () => {
    if (value && !isEditing && !disabled) {
      enterEditMode();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled && (!value || isEditing)) {
      setShowDropdown(true);
    }
  };

  // Handle selection from dropdown
  const handleSelect = (selectedValue: string, method: SelectionMethod) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setShowDropdown(false);
    setIsEditing(false);
    
    // Use focus advancement if configured
    if (targetTabIndex) {
      focusAdvancement.handleSelection(selectedValue, method);
    }
  };
  

  // Filter options based on input
  const filteredOptions = filterStringItems(options, inputValue, filterMode);
  
  // Highlight matching option - always use startsWith for highlighting to prioritize prefix matches
  const isOptionHighlighted = (option: string) => 
    isItemHighlighted(option, inputValue, 'startsWith');

  // Determine display value
  const displayValue = isEditing ? inputValue : (value || inputValue);

  // Determine if field is read-only
  const isReadOnly = disabled || (!!value && !isEditing);

  // Build className for input
  const inputClassName = `pr-10 ${
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  } ${
    value && !isEditing ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' : ''
  } ${
    error ? 'border-red-500' : ''
  } ${
    isEditing ? 'bg-white' : ''
  } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500 focus:outline-none ${className}`;

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={id} className="text-base font-medium">
          {label}
          {disabled && disabledMessage && (
            <span className="text-gray-400 text-sm ml-1">{disabledMessage}</span>
          )}
        </Label>
      )}
      
      <div id={`${id}-container`} className="relative">
        <Input
          ref={inputRef}
          id={id}
          data-testid={`${testId}-input`}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onBlur={handleBlur}
          placeholder={disabled && disabledMessage ? disabledMessage : placeholder}
          className={inputClassName}
          readOnly={isReadOnly}
          aria-label={label}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          tabIndex={disabled || (value && !isEditing) ? -1 : tabIndex}
        />
        
        {/* Edit button - shows when value is selected and not editing */}
        {!disabled && value && !isEditing && (
          <button
            id={`${id}-edit-button`}
            type="button"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
            onClick={enterEditMode}
            aria-label={`Edit ${label}`}
            tabIndex={tabIndex}
          >
            <Edit2 className="text-gray-400" size={16} />
          </button>
        )}
        
        {/* Dropdown button - shows when no value or editing */}
        {!disabled && (!value || isEditing) && (
          <button
            type="button"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
            onClick={() => {
              setShowDropdown(true);
              inputRef.current?.focus();
              onDropdownOpen?.(`${id}-container`);
            }}
            aria-label={`Open ${label} dropdown`}
            tabIndex={-1}
          >
            <ChevronDown className="text-gray-400" size={20} />
          </button>
        )}
      </div>
      
      {/* Autocomplete dropdown */}
      <AutocompleteDropdown
        isOpen={showDropdown && !disabled && (!value || isEditing)}
        items={filteredOptions}
        inputRef={inputRef}
        onSelect={handleSelect}
        getItemKey={(option) => option}
        isItemHighlighted={isOptionHighlighted}
        testId={`${testId}-dropdown`}
        modalId={`${id}-dropdown`}
        renderItem={(option, index) => (
          <div data-testid={`${testId}-option-${index}`}>
            {option}
          </div>
        )}
      />
      
      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};