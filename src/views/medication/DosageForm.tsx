import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutocompleteDropdown } from '@/components/ui/autocomplete-dropdown';
import { 
  dosageFormCategories, 
  dosageFrequencies, 
  dosageConditions 
} from '@/mocks/data/dosages.mock';
import { DosageUnit } from '@/types/models';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';

interface DosageFormProps {
  dosageFormCategory: string;
  dosageFormType: string;
  dosageForm: string;  // For backward compatibility
  dosageAmount: string;
  dosageUnit: string;
  totalAmount: string;
  totalUnit: string;
  frequency: string;
  condition: string;
  availableFormTypes: string[];
  availableUnits: DosageUnit[];
  availableTotalUnits: DosageUnit[];
  errors: Map<string, string>;
  onCategoryChange: (category: string) => void;
  onFormTypeChange: (formType: string) => void;
  onFormChange: (form: string) => void;  // For backward compatibility
  onAmountChange: (amount: string) => void;
  onUnitChange: (unit: string) => void;
  onTotalAmountChange: (amount: string) => void;
  onTotalUnitChange: (unit: string) => void;
  onFrequencyChange: (freq: string) => void;
  onConditionChange: (cond: string) => void;
  onCategoryComplete?: () => void;
  onFormTypeComplete?: () => void;
  onFormComplete?: () => void;
  onAmountComplete?: () => void;
  onUnitComplete?: () => void;
  onTotalAmountComplete?: () => void;
  onTotalUnitComplete?: () => void;
  onFrequencyComplete?: () => void;
  onConditionComplete?: () => void;
  focusOnMount?: boolean;
  onDropdownOpen?: (elementId: string) => void;
}

export const DosageForm = observer(({
  dosageFormCategory,
  dosageFormType,
  dosageForm,
  dosageAmount,
  dosageUnit,
  totalAmount,
  totalUnit,
  frequency,
  condition,
  availableFormTypes,
  availableUnits,
  availableTotalUnits,
  errors,
  onCategoryChange,
  onFormTypeChange,
  onFormChange,
  onAmountChange,
  onUnitChange,
  onTotalAmountChange,
  onTotalUnitChange,
  onFrequencyChange,
  onConditionChange,
  onCategoryComplete,
  onFormTypeComplete,
  onFormComplete,
  onAmountComplete,
  onUnitComplete,
  onTotalAmountComplete,
  onTotalUnitComplete,
  onFrequencyComplete,
  onConditionComplete,
  focusOnMount = false,
  onDropdownOpen
}: DosageFormProps) => {
  const categoryInputContainerRef = useRef<HTMLDivElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const formTypeInputContainerRef = useRef<HTMLDivElement>(null);
  const formTypeInputRef = useRef<HTMLInputElement>(null);
  const formInputContainerRef = useRef<HTMLDivElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const unitInputContainerRef = useRef<HTMLDivElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const totalAmountInputRef = useRef<HTMLInputElement>(null);
  const totalUnitInputContainerRef = useRef<HTMLDivElement>(null);
  const totalUnitInputRef = useRef<HTMLInputElement>(null);
  const frequencyInputContainerRef = useRef<HTMLDivElement>(null);
  const frequencyInputRef = useRef<HTMLInputElement>(null);
  const conditionInputContainerRef = useRef<HTMLDivElement>(null);
  const conditionInputRef = useRef<HTMLInputElement>(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showFormTypeDropdown, setShowFormTypeDropdown] = React.useState(false);
  const [showFormDropdown, setShowFormDropdown] = React.useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = React.useState(false);
  const [showTotalUnitDropdown, setShowTotalUnitDropdown] = React.useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = React.useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = React.useState(false);

  const [categoryInput, setCategoryInput] = React.useState('');
  const [formTypeInput, setFormTypeInput] = React.useState('');
  const [formInput, setFormInput] = React.useState('');
  const [unitInput, setUnitInput] = React.useState('');
  const [totalUnitInput, setTotalUnitInput] = React.useState('');
  const [frequencyInput, setFrequencyInput] = React.useState('');
  const [conditionInput, setConditionInput] = React.useState('');
  const [amountValidationError, setAmountValidationError] = React.useState(false);
  const [totalAmountValidationError, setTotalAmountValidationError] = React.useState(false);

  // Auto-focus on mount or when focusOnMount changes
  useEffect(() => {
    if (focusOnMount && !dosageFormCategory) {
      categoryInputRef.current?.focus();
    }
  }, [focusOnMount, dosageFormCategory]);

  // Show all options, use highlighting for matches (A4C-figma pattern)
  const filteredCategories = dosageFormCategories;
  const isCategoryHighlighted = (category: string) => {
    if (!categoryInput) return false;
    return category.toLowerCase().startsWith(categoryInput.toLowerCase());
  };

  const filteredFormTypes = availableFormTypes;
  const isFormTypeHighlighted = (formType: string) => {
    if (!formTypeInput) return false;
    return formType.toLowerCase().startsWith(formTypeInput.toLowerCase());
  };

  // Keep for backward compatibility
  const filteredForms = availableFormTypes;
  const isFormHighlighted = (form: string) => {
    if (!formInput) return false;
    return form.toLowerCase().startsWith(formInput.toLowerCase());
  };

  const filteredUnits = availableUnits;
  const isUnitHighlighted = (unit: string) => {
    if (!unitInput) return false;
    return unit.toLowerCase().startsWith(unitInput.toLowerCase());
  };

  const filteredTotalUnits = availableTotalUnits;
  const isTotalUnitHighlighted = (unit: string) => {
    if (!totalUnitInput) return false;
    return unit.toLowerCase().startsWith(totalUnitInput.toLowerCase());
  };

  const filteredFrequencies = dosageFrequencies;
  const isFrequencyHighlighted = (freq: string) => {
    if (!frequencyInput) return false;
    return freq.toLowerCase().startsWith(frequencyInput.toLowerCase());
  };

  const filteredConditions = dosageConditions;
  const isConditionHighlighted = (cond: string) => {
    if (!conditionInput) return false;
    return cond.toLowerCase().startsWith(conditionInput.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* First Row: Dosage Form Category and Form Type */}
      <div className="grid grid-cols-2 gap-6">
        {/* Dosage Form Category Dropdown */}
        <div className="relative">
          <Label htmlFor="dosage-category" className="text-base font-medium">
            Dosage Form
          </Label>
          <div ref={categoryInputContainerRef} id="dosage-category-container" className="relative mt-2">
            <Input
              ref={categoryInputRef}
              id="dosage-category"
              data-testid="dosage-category-input"
              type="text"
              value={dosageFormCategory || categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                if (!dosageFormCategory) {
                  setShowCategoryDropdown(true);
                  onDropdownOpen?.('dosage-category-container');
                }
              }}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
              onKeyDown={(e) => {
                if ((e.key === 'Tab' || e.key === 'Enter') && !dosageFormCategory && filteredCategories.length > 0) {
                  const highlighted = filteredCategories.filter(c => isCategoryHighlighted(c));
                  if (highlighted.length === 1 || filteredCategories.length === 1) {
                    e.preventDefault();
                    const categoryToSelect = highlighted.length === 1 ? highlighted[0] : filteredCategories[0];
                    onCategoryChange(categoryToSelect);
                    setCategoryInput(categoryToSelect);
                    setShowCategoryDropdown(false);
                    // Focus on form type field after category selection
                    setTimeout(() => formTypeInputRef.current?.focus(), 50);
                  }
                }
              }}
              placeholder="Select dosage form..."
              className={`pr-10 ${dosageFormCategory ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormCategory') ? 'border-red-500' : ''}`}
              disabled={!!dosageFormCategory}
              aria-label="Dosage form category"
              aria-describedby={errors.get('dosageFormCategory') ? 'dosage-category-error' : undefined}
              aria-expanded={showCategoryDropdown}
              aria-haspopup="listbox"
              role="combobox"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showCategoryDropdown && !dosageFormCategory}
            items={filteredCategories}
            inputRef={categoryInputContainerRef}
            onSelect={(category) => {
              onCategoryChange(category);
              setCategoryInput(category);
              setShowCategoryDropdown(false);
              // Focus on form type field after category selection
              setTimeout(() => formTypeInputRef.current?.focus(), 50);
            }}
            getItemKey={(category) => category}
            isItemHighlighted={isCategoryHighlighted}
            testId="dosage-category-dropdown"
            renderItem={(category, index) => (
              <div data-testid={`dosage-category-option-${index}`}>
                {category}
              </div>
            )}
          />
          
          {errors.get('dosageFormCategory') && (
            <p id="dosage-category-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageFormCategory')}
            </p>
          )}
        </div>

        {/* Form Type Dropdown */}
        <div className="relative">
          <Label htmlFor="form-type" className="text-base font-medium">
            Form Type
          </Label>
          <div ref={formTypeInputContainerRef} id="form-type-container" className="relative mt-2">
            <Input
              ref={formTypeInputRef}
              id="form-type"
              data-testid="form-type-input"
              type="text"
              value={dosageFormType || formTypeInput}
              onChange={(e) => {
                setFormTypeInput(e.target.value);
                if (!dosageFormType) {
                  setShowFormTypeDropdown(true);
                  onDropdownOpen?.('form-type-container');
                }
              }}
              onBlur={() => setTimeout(() => setShowFormTypeDropdown(false), 200)}
              onKeyDown={(e) => {
                if ((e.key === 'Tab' || e.key === 'Enter') && !dosageFormType && filteredFormTypes.length > 0) {
                  const highlighted = filteredFormTypes.filter(ft => isFormTypeHighlighted(ft));
                  if (highlighted.length === 1 || filteredFormTypes.length === 1) {
                    e.preventDefault();
                    const formTypeToSelect = highlighted.length === 1 ? highlighted[0] : filteredFormTypes[0];
                    onFormTypeChange(formTypeToSelect);
                    setFormTypeInput(formTypeToSelect);
                    setShowFormTypeDropdown(false);
                    // Focus on amount field after form type selection
                    setTimeout(() => amountInputRef.current?.focus(), 50);
                  }
                }
              }}
              placeholder="Select form type..."
              className={`pr-10 ${dosageFormType ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormType') ? 'border-red-500' : ''}`}
              disabled={!dosageFormCategory || !!dosageFormType}
              aria-label="Form type"
              aria-describedby={errors.get('dosageFormType') ? 'form-type-error' : undefined}
              aria-expanded={showFormTypeDropdown}
              aria-haspopup="listbox"
              role="combobox"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showFormTypeDropdown && !dosageFormType && filteredFormTypes.length > 0}
            items={filteredFormTypes}
            inputRef={formTypeInputContainerRef}
            onSelect={(formType) => {
              onFormTypeChange(formType);
              setFormTypeInput(formType);
              setShowFormTypeDropdown(false);
              // Focus on amount field after form type selection
              setTimeout(() => amountInputRef.current?.focus(), 50);
            }}
            getItemKey={(formType) => formType}
            isItemHighlighted={isFormTypeHighlighted}
            testId="form-type-dropdown"
            renderItem={(formType, index) => (
              <div data-testid={`form-type-option-${index}`}>
                {formType}
              </div>
            )}
          />
          
          {errors.get('dosageFormType') && (
            <p id="form-type-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageFormType')}
            </p>
          )}
        </div>
      </div>

      {/* Second Row: Amount and Unit */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dosage-amount" className="text-base font-medium">
            Dosage Amount
          </Label>
          <Input
            ref={amountInputRef}
            id="dosage-amount"
            data-testid="dosage-amount-input"
            type="text"
            value={dosageAmount}
            onChange={(e) => {
              onAmountChange(e.target.value);
              // Clear validation error when user types
              if (amountValidationError) {
                const isValidNumber = /^\d*\.?\d*$/.test(e.target.value.trim());
                if (isValidNumber || e.target.value === '') {
                  setAmountValidationError(false);
                }
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === 'Tab') && dosageAmount) {
                // Validate numeric value before advancing
                const isValidNumber = /^\d*\.?\d+$/.test(dosageAmount.trim());
                if (isValidNumber) {
                  setAmountValidationError(false);
                  if (e.key === 'Tab') {
                    // Allow natural tab to unit field
                    return;
                  }
                  e.preventDefault();
                  // Focus on unit field after amount entry
                  setTimeout(() => unitInputRef.current?.focus(), 50);
                } else {
                  // Invalid number - prevent tab/enter advancement
                  e.preventDefault();
                  setAmountValidationError(true);
                }
              }
            }}
            placeholder="Enter amount..."
            className={`mt-2 ${dosageAmount && !amountValidationError ? 'border-blue-500 bg-blue-50' : ''} ${
              errors.get('dosageAmount') || amountValidationError ? 'border-red-500' : ''
            }`}
            aria-label="Dosage amount"
            aria-describedby={errors.get('dosageAmount') ? 'dosage-amount-error' : undefined}
            aria-invalid={!!errors.get('dosageAmount')}
          />
          {(errors.get('dosageAmount') || amountValidationError) && (
            <p id="dosage-amount-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageAmount') || 'Please enter a valid number'}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="dosage-unit" className="text-base font-medium">
            Dosage Unit
          </Label>
            <div ref={unitInputContainerRef} id="dosage-unit-container" className="relative mt-2">
              <Input
                ref={unitInputRef}
                id="dosage-unit"
                type="text"
                value={dosageUnit || unitInput}
                onChange={(e) => {
                  setUnitInput(e.target.value);
                  if (!dosageUnit) {
                    setShowUnitDropdown(true);
                    onDropdownOpen?.('dosage-unit-container');
                  }
                }}
                onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                onKeyDown={(e) => {
                  if ((e.key === 'Tab' || e.key === 'Enter') && !dosageUnit && filteredUnits.length > 0) {
                    const highlighted = filteredUnits.filter(u => isUnitHighlighted(u));
                    if (highlighted.length === 1 || filteredUnits.length === 1) {
                      e.preventDefault();
                      const unitToSelect = highlighted.length === 1 ? highlighted[0] : filteredUnits[0];
                      onUnitChange(unitToSelect);
                      setUnitInput(unitToSelect);
                      setShowUnitDropdown(false);
                      // Focus on total amount field after unit selection
                      setTimeout(() => totalAmountInputRef.current?.focus(), 50);
                    }
                  }
                }}
                placeholder="Unit..."
                className={`pr-10 ${dosageUnit ? 'border-blue-500 bg-blue-50' : ''}`}
                disabled={!dosageFormType || !!dosageUnit}
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <AutocompleteDropdown
              isOpen={showUnitDropdown && !dosageUnit && filteredUnits.length > 0}
              items={filteredUnits}
              inputRef={unitInputContainerRef}
              onSelect={(unit) => {
                onUnitChange(unit);
                setUnitInput(unit);
                setShowUnitDropdown(false);
                // Focus on frequency field after unit selection
                setTimeout(() => frequencyInputRef.current?.focus(), 50);
              }}
              getItemKey={(unit) => unit}
              isItemHighlighted={isUnitHighlighted}
              renderItem={(unit) => <div>{unit}</div>}
            />
          </div>
      </div>

      {/* Third Row: Total Amount and Total Unit */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="total-amount" className="text-base font-medium">
            Total Amount
          </Label>
          <Input
            ref={totalAmountInputRef}
            id="total-amount"
            data-testid="total-amount-input"
            type="text"
            value={totalAmount}
            onChange={(e) => {
              onTotalAmountChange(e.target.value);
              // Clear validation error when user types
              if (totalAmountValidationError) {
                const isValidNumber = /^\d*\.?\d*$/.test(e.target.value.trim());
                if (isValidNumber || e.target.value === '') {
                  setTotalAmountValidationError(false);
                }
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === 'Tab') && totalAmount) {
                // Validate numeric value before advancing
                const isValidNumber = /^\d*\.?\d+$/.test(totalAmount.trim());
                if (isValidNumber) {
                  setTotalAmountValidationError(false);
                  if (e.key === 'Tab') {
                    // Allow natural tab to total unit field
                    return;
                  }
                  e.preventDefault();
                  // Focus on total unit field after total amount entry
                  setTimeout(() => totalUnitInputRef.current?.focus(), 50);
                } else {
                  // Invalid number - prevent tab/enter advancement
                  e.preventDefault();
                  setTotalAmountValidationError(true);
                }
              }
            }}
            placeholder="Enter total amount..."
            className={`mt-2 ${totalAmount && !totalAmountValidationError ? 'border-blue-500 bg-blue-50' : ''} ${
              errors.get('totalAmount') || totalAmountValidationError ? 'border-red-500' : ''
            }`}
            aria-label="Total amount"
            aria-describedby={errors.get('totalAmount') ? 'total-amount-error' : undefined}
            aria-invalid={!!errors.get('totalAmount')}
          />
          {(errors.get('totalAmount') || totalAmountValidationError) && (
            <p id="total-amount-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('totalAmount') || 'Please enter a valid number'}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="total-unit" className="text-base font-medium">
            Total Unit
          </Label>
          <div ref={totalUnitInputContainerRef} id="total-unit-container" className="relative mt-2">
            <Input
              ref={totalUnitInputRef}
              id="total-unit"
              data-testid="total-unit-input"
              type="text"
              value={totalUnit || totalUnitInput}
              onChange={(e) => {
                setTotalUnitInput(e.target.value);
                if (!totalUnit) {
                  setShowTotalUnitDropdown(true);
                  onDropdownOpen?.('total-unit-container');
                }
              }}
              onBlur={() => setTimeout(() => setShowTotalUnitDropdown(false), 200)}
              onKeyDown={(e) => {
                if ((e.key === 'Tab' || e.key === 'Enter') && !totalUnit && filteredTotalUnits.length > 0) {
                  const highlighted = filteredTotalUnits.filter(u => isTotalUnitHighlighted(u));
                  if (highlighted.length === 1 || filteredTotalUnits.length === 1) {
                    e.preventDefault();
                    const unitToSelect = highlighted.length === 1 ? highlighted[0] : filteredTotalUnits[0];
                    onTotalUnitChange(unitToSelect);
                    setTotalUnitInput(unitToSelect);
                    setShowTotalUnitDropdown(false);
                    // Focus on frequency field after total unit selection
                    setTimeout(() => frequencyInputRef.current?.focus(), 50);
                  }
                }
              }}
              placeholder="Unit..."
              className={`pr-10 ${totalUnit ? 'border-blue-500 bg-blue-50' : ''}`}
              disabled={!dosageFormType || !!totalUnit}
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showTotalUnitDropdown && !totalUnit && filteredTotalUnits.length > 0}
            items={filteredTotalUnits}
            inputRef={totalUnitInputContainerRef}
            onSelect={(unit) => {
              onTotalUnitChange(unit);
              setTotalUnitInput(unit);
              setShowTotalUnitDropdown(false);
              // Focus on frequency field after total unit selection
              setTimeout(() => frequencyInputRef.current?.focus(), 50);
            }}
            getItemKey={(unit) => unit}
            isItemHighlighted={isTotalUnitHighlighted}
            testId="total-unit-dropdown"
            renderItem={(unit) => <div>{unit}</div>}
          />
        </div>
      </div>

      {/* Fourth Row: Frequency and Condition */}
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <Label htmlFor="dosage-frequency" className="text-base font-medium">
            Frequency
          </Label>
          <div ref={frequencyInputContainerRef} id="dosage-frequency-container" className="relative mt-2">
            <Input
              ref={frequencyInputRef}
              id="dosage-frequency"
              type="text"
              value={frequency || frequencyInput}
              onChange={(e) => {
                setFrequencyInput(e.target.value);
                if (!frequency) {
                  setShowFrequencyDropdown(true);
                  onDropdownOpen?.('dosage-frequency-container');
                }
              }}
              onBlur={() => setTimeout(() => setShowFrequencyDropdown(false), 200)}
              onKeyDown={(e) => {
                if ((e.key === 'Tab' || e.key === 'Enter') && !frequency && filteredFrequencies.length > 0) {
                  const highlighted = filteredFrequencies.filter(f => isFrequencyHighlighted(f));
                  if (highlighted.length === 1 || filteredFrequencies.length === 1) {
                    e.preventDefault();
                    const freqToSelect = highlighted.length === 1 ? highlighted[0] : filteredFrequencies[0];
                    onFrequencyChange(freqToSelect);
                    setFrequencyInput(freqToSelect);
                    setShowFrequencyDropdown(false);
                    // Focus on condition field after frequency selection
                    setTimeout(() => conditionInputRef.current?.focus(), 50);
                  }
                }
              }}
              placeholder="Select frequency..."
              className={`pr-10 ${frequency ? 'border-blue-500 bg-blue-50' : ''}`}
              disabled={!!frequency}
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showFrequencyDropdown && !frequency}
            items={filteredFrequencies}
            inputRef={frequencyInputContainerRef}
            onSelect={(freq) => {
              onFrequencyChange(freq);
              setFrequencyInput(freq);
              setShowFrequencyDropdown(false);
              // Focus on condition field after frequency selection
              setTimeout(() => conditionInputRef.current?.focus(), 50);
            }}
            getItemKey={(freq) => freq}
            isItemHighlighted={isFrequencyHighlighted}
            renderItem={(freq) => <div>{freq}</div>}
          />
        </div>

        <div className="relative">
          <Label htmlFor="dosage-condition" className="text-base font-medium">
            Condition
          </Label>
          <div ref={conditionInputContainerRef} id="dosage-condition-container" className="relative mt-2">
            <Input
              ref={conditionInputRef}
              id="dosage-condition"
              type="text"
              value={condition || conditionInput}
              onChange={(e) => {
                setConditionInput(e.target.value);
                if (!condition) {
                  setShowConditionDropdown(true);
                  onDropdownOpen?.('dosage-condition-container');
                }
              }}
              onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
              onKeyDown={(e) => {
                if ((e.key === 'Tab' || e.key === 'Enter') && !condition && filteredConditions.length > 0) {
                  const highlighted = filteredConditions.filter(c => isConditionHighlighted(c));
                  if (highlighted.length === 1 || filteredConditions.length === 1) {
                    e.preventDefault();
                    const condToSelect = highlighted.length === 1 ? highlighted[0] : filteredConditions[0];
                    onConditionChange(condToSelect);
                    setConditionInput(condToSelect);
                    setShowConditionDropdown(false);
                    if (onConditionComplete) {
                      setTimeout(() => onConditionComplete(), 50);
                    }
                  }
                }
              }}
              placeholder="Select condition..."
              className={`pr-10 ${condition ? 'border-blue-500 bg-blue-50' : ''}`}
              disabled={!!condition}
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showConditionDropdown && !condition}
            items={filteredConditions}
            inputRef={conditionInputContainerRef}
            onSelect={(cond) => {
              onConditionChange(cond);
              setConditionInput(cond);
              setShowConditionDropdown(false);
              if (onConditionComplete) {
                setTimeout(() => onConditionComplete(), 50);
              }
            }}
            getItemKey={(cond) => cond}
            isItemHighlighted={isConditionHighlighted}
            renderItem={(cond) => <div>{cond}</div>}
          />
        </div>
      </div>
    </div>
  );
});