import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutocompleteDropdown, SelectionMethod } from '@/components/ui/autocomplete-dropdown';
import { dosageFormCategories } from '@/mocks/data/dosages.mock';
import { useDropdownBlur } from '@/hooks/useDropdownBlur';
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';
import { useEnterAsTab } from '@/hooks/useEnterAsTab';
import { filterStringItems, isItemHighlighted } from '@/utils/dropdown-filter';

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

  const categoryInputRef = useRef<HTMLInputElement>(null);
  const formTypeInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);

  // Dropdown blur handlers using abstracted timing logic
  const handleCategoryBlur = useDropdownBlur(setShowCategoryDropdown);
  const handleFormTypeBlur = useDropdownBlur(setShowFormTypeDropdown);
  const handleUnitBlur = useDropdownBlur(setShowUnitDropdown);

  // Focus advancement hooks for keyboard navigation
  const categoryFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 5, // Move to Form Type input
    enabled: true
  });

  const formTypeFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 7, // Move to Dosage Amount input
    enabled: true
  });

  const unitFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 10, // Move to Total Amount input
    enabled: true
  });

  // Hook for Enter key navigation in amount field
  const handleAmountEnterKey = useEnterAsTab(8); // Move to Unit field

  // Use generic filtering utilities
  const filteredCategories = filterStringItems(dosageFormCategories, categoryInput, 'contains');
  const filteredFormTypes = filterStringItems(availableFormTypes, formTypeInput, 'contains');
  const filteredUnits = filterStringItems(availableUnits, unitInput, 'contains');
  
  // Highlighting functions using the utility
  const isCategoryHighlighted = (category: string) => 
    isItemHighlighted(category, categoryInput, 'startsWith');
  
  const isFormTypeHighlighted = (formType: string) => 
    isItemHighlighted(formType, formTypeInput, 'startsWith');
  
  const isUnitHighlighted = (unit: string) => 
    isItemHighlighted(unit, unitInput, 'startsWith');

  return (
    <>
      {/* First Row: Dosage Form Category and Form Type */}
      <div className="grid grid-cols-2 gap-6">
        {/* Dosage Form Category */}
        <div className="relative">
          <Label htmlFor="dosage-category" className="text-base font-medium">
            Dosage Form
          </Label>
          <div id="dosage-category-container" className="relative mt-2">
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
              onFocus={() => !dosageFormCategory && setShowCategoryDropdown(true)}
              onBlur={handleCategoryBlur}
              placeholder="Select dosage form..."
              className={`pr-10 ${dosageFormCategory ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormCategory') ? 'border-red-500' : ''}`}
              readOnly={!!dosageFormCategory}
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
                  categoryInputRef.current?.focus();
                  onDropdownOpen?.('dosage-category-container');
                }
              }}
              aria-label="Open dosage form dropdown"
              disabled={!!dosageFormCategory}
              tabIndex={dosageFormCategory ? -1 : 4}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          </div>
          
          <AutocompleteDropdown
            isOpen={showCategoryDropdown && !dosageFormCategory}
            items={filteredCategories}
            inputRef={categoryInputRef}
            onSelect={(category, method) => {
              onCategoryChange(category);
              setCategoryInput(category);
              setShowCategoryDropdown(false);
              
              // Use hook for focus advancement
              categoryFocusAdvancement.handleSelection(category, method);
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
          <div id="form-type-container" className="relative mt-2">
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
              onFocus={() => !dosageFormType && setShowFormTypeDropdown(true)}
              onBlur={handleFormTypeBlur}
              placeholder="Select type..."
              className={`pr-10 ${dosageFormType ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('dosageFormType') ? 'border-red-500' : ''}`}
              readOnly={!!dosageFormType}
              disabled={!dosageFormCategory}
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
                  formTypeInputRef.current?.focus();
                  onDropdownOpen?.('form-type-container');
                }
              }}
              aria-label="Open form type dropdown"
              disabled={!dosageFormCategory || !!dosageFormType}
              tabIndex={dosageFormType ? -1 : 6}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          </div>
          
          <AutocompleteDropdown
            isOpen={showFormTypeDropdown && !!dosageFormCategory && !dosageFormType}
            items={filteredFormTypes}
            inputRef={formTypeInputRef}
            onSelect={(formType, method) => {
              onFormTypeChange(formType);
              setFormTypeInput(formType);
              setShowFormTypeDropdown(false);
              
              // Use hook for focus advancement
              formTypeFocusAdvancement.handleSelection(formType, method);
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
            onKeyDown={handleAmountEnterKey}
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
          <div id="dosage-unit-container" className="relative mt-2">
            <Input
              ref={unitInputRef}
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
              readOnly={!!dosageUnit}
              disabled={!dosageFormType}
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
                  unitInputRef.current?.focus();
                  onDropdownOpen?.('dosage-unit-container');
                }
              }}
              aria-label="Open unit dropdown"
              disabled={!dosageFormType || !!dosageUnit}
              tabIndex={dosageUnit ? -1 : 9}
            >
              <ChevronDown className="text-gray-400" size={20} />
            </button>
          </div>
          
          <AutocompleteDropdown
            isOpen={showUnitDropdown && !!dosageFormType && !dosageUnit}
            items={filteredUnits}
            inputRef={unitInputRef}
            onSelect={(unit, method) => {
              onUnitChange(unit);
              setUnitInput(unit);
              setShowUnitDropdown(false);
              
              // Use hook for focus advancement
              unitFocusAdvancement.handleSelection(unit, method);
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