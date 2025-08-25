import React, { useRef, useState } from 'react';
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
  dosageForm: string;
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
  onFormChange: (form: string) => void;
  onAmountChange: (amount: string) => void;
  onUnitChange: (unit: string) => void;
  onTotalAmountChange: (amount: string) => void;
  onTotalUnitChange: (unit: string) => void;
  onFrequencyChange: (freq: string) => void;
  onConditionChange: (cond: string) => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const DosageForm = observer((props: DosageFormProps) => {
  const {
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
    onDropdownOpen
  } = props;

  // Local state for dropdown management
  const [categoryInput, setCategoryInput] = useState('');
  const [formTypeInput, setFormTypeInput] = useState('');
  const [unitInput, setUnitInput] = useState('');
  const [totalUnitInput, setTotalUnitInput] = useState('');
  const [frequencyInput, setFrequencyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFormTypeDropdown, setShowFormTypeDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showTotalUnitDropdown, setShowTotalUnitDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);

  // Refs for dropdown positioning
  const categoryInputContainerRef = useRef<HTMLDivElement>(null);
  const formTypeInputContainerRef = useRef<HTMLDivElement>(null);
  const unitInputContainerRef = useRef<HTMLDivElement>(null);
  const totalUnitInputContainerRef = useRef<HTMLDivElement>(null);
  const frequencyInputContainerRef = useRef<HTMLDivElement>(null);
  const conditionInputContainerRef = useRef<HTMLDivElement>(null);

  // Filter functions
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
        {/* Dosage Form Category */}
        <div className="relative">
          <Label htmlFor="dosage-category" className="text-base font-medium">
            Dosage Form
          </Label>
          <div ref={categoryInputContainerRef} id="dosage-category-container" className="relative mt-2">
            <Input
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
              onFocus={() => !dosageFormCategory && setShowCategoryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
              placeholder="Select dosage form..."
              className={`pr-10 ${dosageFormCategory ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormCategory') ? 'border-red-500' : ''}`}
              disabled={!!dosageFormCategory}
              aria-label="Dosage form category"
              aria-describedby={errors.get('dosageFormCategory') ? 'dosage-category-error' : undefined}
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
            }}
            getItemKey={(category) => category}
            isItemHighlighted={isCategoryHighlighted}
            testId="dosage-category-dropdown"
            modalId="dosage-form-dropdown"
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

        {/* Form Type */}
        <div className="relative">
          <Label htmlFor="form-type" className="text-base font-medium">
            Form Type
          </Label>
          <div ref={formTypeInputContainerRef} id="form-type-container" className="relative mt-2">
            <Input
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
              onFocus={() => !dosageFormType && setShowFormTypeDropdown(true)}
              onBlur={() => setTimeout(() => setShowFormTypeDropdown(false), 200)}
              placeholder="Select form type..."
              className={`pr-10 ${dosageFormType ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormType') ? 'border-red-500' : ''}`}
              disabled={!!dosageFormType || !dosageFormCategory}
              aria-label="Form type"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showFormTypeDropdown && !dosageFormType && !!dosageFormCategory}
            items={filteredFormTypes}
            inputRef={formTypeInputContainerRef}
            onSelect={(formType) => {
              onFormTypeChange(formType);
              setFormTypeInput(formType);
              setShowFormTypeDropdown(false);
            }}
            getItemKey={(formType) => formType}
            isItemHighlighted={isFormTypeHighlighted}
            testId="form-type-dropdown"
            modalId="form-type-dropdown"
            renderItem={(formType, index) => (
              <div data-testid={`form-type-option-${index}`}>
                {formType}
              </div>
            )}
          />
          
          {errors.get('dosageFormType') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageFormType')}
            </p>
          )}
        </div>
      </div>

      {/* Second Row: Amount and Unit */}
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <Label htmlFor="dosage-amount" className="text-base font-medium">
            Dosage Amount
          </Label>
          <Input
            id="dosage-amount"
            data-testid="dosage-amount-input"
            type="text"
            value={dosageAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Enter amount..."
            className={`mt-2 ${errors.get('dosageAmount') ? 'border-red-500' : ''}`}
            aria-label="Dosage amount"
            aria-describedby={errors.get('dosageAmount') ? 'dosage-amount-error' : undefined}
          />
          {errors.get('dosageAmount') && (
            <p id="dosage-amount-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageAmount')}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="dosage-unit" className="text-base font-medium">
            Unit
          </Label>
          <div ref={unitInputContainerRef} id="dosage-unit-container" className="relative mt-2">
            <Input
              id="dosage-unit"
              data-testid="dosage-unit-input"
              type="text"
              value={dosageUnit || unitInput}
              onChange={(e) => {
                setUnitInput(e.target.value);
                if (!dosageUnit) {
                  setShowUnitDropdown(true);
                  onDropdownOpen?.('dosage-unit-container');
                }
              }}
              onFocus={() => !dosageUnit && setShowUnitDropdown(true)}
              onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
              placeholder="Select unit..."
              className={`pr-10 ${dosageUnit ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageUnit') ? 'border-red-500' : ''}`}
              disabled={!!dosageUnit}
              aria-label="Dosage unit"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showUnitDropdown && !dosageUnit}
            items={filteredUnits}
            inputRef={unitInputContainerRef}
            onSelect={(unit) => {
              onUnitChange(unit);
              setUnitInput(unit);
              setShowUnitDropdown(false);
            }}
            getItemKey={(unit) => unit}
            isItemHighlighted={isUnitHighlighted}
            testId="dosage-unit-dropdown"
            modalId="dosage-unit-dropdown"
            renderItem={(unit, index) => (
              <div data-testid={`dosage-unit-option-${index}`}>
                {unit}
              </div>
            )}
          />
          
          {errors.get('dosageUnit') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageUnit')}
            </p>
          )}
        </div>
      </div>

      {/* Third Row: Total Amount and Total Unit */}
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <Label htmlFor="total-amount" className="text-base font-medium">
            Total Amount <span className="text-gray-500 text-sm">(Optional)</span>
          </Label>
          <Input
            id="total-amount"
            data-testid="total-amount-input"
            type="text"
            value={totalAmount}
            onChange={(e) => onTotalAmountChange(e.target.value)}
            placeholder="Enter total amount..."
            className={`mt-2 ${errors.get('totalAmount') ? 'border-red-500' : ''}`}
            aria-label="Total amount"
          />
          {errors.get('totalAmount') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('totalAmount')}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="total-unit" className="text-base font-medium">
            Total Unit <span className="text-gray-500 text-sm">(Optional)</span>
          </Label>
          <div ref={totalUnitInputContainerRef} id="total-unit-container" className="relative mt-2">
            <Input
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
              onFocus={() => !totalUnit && setShowTotalUnitDropdown(true)}
              onBlur={() => setTimeout(() => setShowTotalUnitDropdown(false), 200)}
              placeholder="Select unit..."
              className={`pr-10 ${totalUnit ? 'border-blue-500 bg-blue-50' : ''}`}
              disabled={!!totalUnit || !totalAmount}
              aria-label="Total unit"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <AutocompleteDropdown
            isOpen={showTotalUnitDropdown && !totalUnit && !!totalAmount}
            items={filteredTotalUnits}
            inputRef={totalUnitInputContainerRef}
            onSelect={(unit) => {
              onTotalUnitChange(unit);
              setTotalUnitInput(unit);
              setShowTotalUnitDropdown(false);
            }}
            getItemKey={(unit) => unit}
            isItemHighlighted={isTotalUnitHighlighted}
            testId="total-unit-dropdown"
            modalId="total-unit-dropdown"
            renderItem={(unit, index) => (
              <div data-testid={`total-unit-option-${index}`}>
                {unit}
              </div>
            )}
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
              id="dosage-frequency"
              data-testid="dosage-frequency-input"
              type="text"
              value={frequency || frequencyInput}
              onChange={(e) => {
                setFrequencyInput(e.target.value);
                if (!frequency) {
                  setShowFrequencyDropdown(true);
                  onDropdownOpen?.('dosage-frequency-container');
                }
              }}
              onFocus={() => !frequency && setShowFrequencyDropdown(true)}
              onBlur={() => setTimeout(() => setShowFrequencyDropdown(false), 200)}
              placeholder="Select frequency..."
              className={`pr-10 ${frequency ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('frequency') ? 'border-red-500' : ''}`}
              disabled={!!frequency}
              aria-label="Dosage frequency"
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
            }}
            getItemKey={(freq) => freq}
            isItemHighlighted={isFrequencyHighlighted}
            testId="dosage-frequency-dropdown"
            modalId="frequency-dropdown"
            renderItem={(freq, index) => (
              <div data-testid={`dosage-frequency-option-${index}`}>
                {freq}
              </div>
            )}
          />
          
          {errors.get('frequency') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('frequency')}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="dosage-condition" className="text-base font-medium">
            Condition <span className="text-gray-500 text-sm">(Optional)</span>
          </Label>
          <div ref={conditionInputContainerRef} id="dosage-condition-container" className="relative mt-2">
            <Input
              id="dosage-condition"
              data-testid="dosage-condition-input"
              type="text"
              value={condition || conditionInput}
              onChange={(e) => {
                setConditionInput(e.target.value);
                if (!condition) {
                  setShowConditionDropdown(true);
                  onDropdownOpen?.('dosage-condition-container');
                }
              }}
              onFocus={() => !condition && setShowConditionDropdown(true)}
              onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
              placeholder="Select condition..."
              className={`pr-10 ${condition ? 'border-blue-500 bg-blue-50' : ''}`}
              disabled={!!condition}
              aria-label="Dosage condition"
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
            }}
            getItemKey={(cond) => cond}
            isItemHighlighted={isConditionHighlighted}
            testId="dosage-condition-dropdown"
            modalId="condition-dropdown"
            renderItem={(cond, index) => (
              <div data-testid={`dosage-condition-option-${index}`}>
                {cond}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
});