import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutocompleteDropdown } from '@/components/ui/autocomplete-dropdown';
import { dosageFormCategories } from '@/mocks/data/dosages.mock';
import { useDropdownBlur } from '@/hooks/useDropdownBlur';

interface DosageFormInputsProps {
  dosageFormCategory: string;
  dosageFormType: string;
  dosageAmount: string;
  dosageUnit: string;
  availableFormTypes: string[];
  availableUnits: string[];
  errors: Map<string, string>;
  onCategoryChange: (category: string) => void;
  onFormTypeChange: (formType: string) => void;
  onAmountChange: (amount: string) => void;
  onUnitChange: (unit: string) => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const DosageFormInputs: React.FC<DosageFormInputsProps> = ({
  dosageFormCategory,
  dosageFormType,
  dosageAmount,
  dosageUnit,
  availableFormTypes,
  availableUnits,
  errors,
  onCategoryChange,
  onFormTypeChange,
  onAmountChange,
  onUnitChange,
  onDropdownOpen
}) => {
  const [categoryInput, setCategoryInput] = useState('');
  const [formTypeInput, setFormTypeInput] = useState('');
  const [unitInput, setUnitInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFormTypeDropdown, setShowFormTypeDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const categoryInputContainerRef = useRef<HTMLDivElement>(null);
  const formTypeInputContainerRef = useRef<HTMLDivElement>(null);
  const unitInputContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown blur handlers using abstracted timing logic
  const handleCategoryBlur = useDropdownBlur(setShowCategoryDropdown);
  const handleFormTypeBlur = useDropdownBlur(setShowFormTypeDropdown);
  const handleUnitBlur = useDropdownBlur(setShowUnitDropdown);

  const filteredCategories = dosageFormCategories.filter(cat => 
    cat.toLowerCase().includes(categoryInput.toLowerCase())
  );
  
  const isCategoryHighlighted = (category: string) => {
    if (!categoryInput) return false;
    return category.toLowerCase().startsWith(categoryInput.toLowerCase());
  };

  const filteredFormTypes = availableFormTypes.filter(type =>
    type.toLowerCase().includes(formTypeInput.toLowerCase())
  );
  
  const isFormTypeHighlighted = (formType: string) => {
    if (!formTypeInput) return false;
    return formType.toLowerCase().startsWith(formTypeInput.toLowerCase());
  };

  const filteredUnits = availableUnits;
  const isUnitHighlighted = (unit: string) => {
    if (!unitInput) return false;
    return unit.toLowerCase().startsWith(unitInput.toLowerCase());
  };

  return (
    <>
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
              onBlur={handleCategoryBlur}
              placeholder="Select dosage form..."
              className={`pr-10 ${dosageFormCategory ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormCategory') ? 'border-red-500' : ''}`}
              disabled={!!dosageFormCategory}
              aria-label="Dosage form category"
              aria-describedby={errors.get('dosageFormCategory') ? 'dosage-category-error' : undefined}
              tabIndex={3}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={() => {
                if (!dosageFormCategory) {
                  setShowCategoryDropdown(true);
                  categoryInputContainerRef.current?.querySelector('input')?.focus();
                  onDropdownOpen?.('dosage-category-container');
                }
              }}
              aria-label="Open dosage form dropdown"
              disabled={!!dosageFormCategory}
              tabIndex={4}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
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
            Type
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
              onBlur={handleFormTypeBlur}
              placeholder="Select type..."
              className={`pr-10 ${dosageFormType ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormType') ? 'border-red-500' : ''}`}
              disabled={!dosageFormCategory || !!dosageFormType}
              aria-label="Dosage form type"
              aria-describedby={errors.get('dosageFormType') ? 'form-type-error' : undefined}
              tabIndex={5}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={() => {
                if (dosageFormCategory && !dosageFormType) {
                  setShowFormTypeDropdown(true);
                  formTypeInputContainerRef.current?.querySelector('input')?.focus();
                  onDropdownOpen?.('form-type-container');
                }
              }}
              aria-label="Open form type dropdown"
              disabled={!dosageFormCategory || !!dosageFormType}
              tabIndex={6}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          </div>
          
          <AutocompleteDropdown
            isOpen={showFormTypeDropdown && !!dosageFormCategory && !dosageFormType}
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
            <p id="form-type-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageFormType')}
            </p>
          )}
        </div>
      </div>

      {/* Second Row: Dosage Amount and Unit */}
      <div className="grid grid-cols-2 gap-6">
        {/* Dosage Amount */}
        <div>
          <Label htmlFor="dosage-amount" className="text-base font-medium">
            Dosage Amount
          </Label>
          <Input
            id="dosage-amount"
            data-testid="dosage-amount-input"
            type="text"
            value={dosageAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="e.g., 500"
            className={`mt-2 ${dosageAmount ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageAmount') ? 'border-red-500' : ''}`}
            aria-label="Dosage amount"
            aria-describedby={errors.get('dosageAmount') ? 'dosage-amount-error' : undefined}
            tabIndex={7}
          />
          {errors.get('dosageAmount') && (
            <p id="dosage-amount-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageAmount')}
            </p>
          )}
        </div>

        {/* Dosage Unit */}
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
              onBlur={handleUnitBlur}
              placeholder="Select unit..."
              className={`pr-10 ${dosageUnit ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageUnit') ? 'border-red-500' : ''}`}
              disabled={!dosageFormType || !!dosageUnit}
              aria-label="Dosage unit"
              aria-describedby={errors.get('dosageUnit') ? 'dosage-unit-error' : undefined}
              tabIndex={8}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
              onClick={() => {
                if (dosageFormType && !dosageUnit) {
                  setShowUnitDropdown(true);
                  unitInputContainerRef.current?.querySelector('input')?.focus();
                  onDropdownOpen?.('dosage-unit-container');
                }
              }}
              aria-label="Open unit dropdown"
              disabled={!dosageFormType || !!dosageUnit}
              tabIndex={9}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          </div>
          
          <AutocompleteDropdown
            isOpen={showUnitDropdown && !!dosageFormType && !dosageUnit}
            items={filteredUnits}
            inputRef={unitInputContainerRef}
            onSelect={(unit) => {
              onUnitChange(unit);
              setUnitInput(unit);
              setShowUnitDropdown(false);
            }}
            getItemKey={(unit) => unit}
            isItemHighlighted={(unit) => isUnitHighlighted(unit)}
            testId="dosage-unit-dropdown"
            modalId="dosage-unit-dropdown"
            renderItem={(unit, index) => (
              <div data-testid={`dosage-unit-option-${index}`}>
                {unit}
              </div>
            )}
          />
          
          {errors.get('dosageUnit') && (
            <p id="dosage-unit-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.get('dosageUnit')}
            </p>
          )}
        </div>
      </div>
    </>
  );
};