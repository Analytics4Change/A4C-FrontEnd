import React from 'react';
import { observer } from 'mobx-react-lite';
import { UnifiedDropdown } from '@/components/ui/unified-dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropdownManager } from '@/hooks/useDropdownManager';
import { 
  dosageFormCategories, 
  dosageFormsByCategory, 
  dosageUnitsByCategory 
} from '@/constants/medication';
import { filterStringItems, isItemHighlighted } from '@/utils/dropdown';

interface DosageFormInputsRefactoredProps {
  category: string;
  formType: string;
  amount: string;
  unit: string;
  onCategoryChange: (value: string) => void;
  onFormTypeChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  errors?: Map<string, string>;
  onFieldComplete?: () => void;
  disabled?: boolean;
}

/**
 * Refactored DosageFormInputs using new design patterns:
 * - useDropdownManager for centralized state management
 * - UnifiedDropdown for consistent dropdown behavior
 * - Reduced code duplication and improved maintainability
 */
export const DosageFormInputsRefactored: React.FC<DosageFormInputsRefactoredProps> = observer(({
  category,
  formType,
  amount,
  unit,
  onCategoryChange,
  onFormTypeChange,
  onAmountChange,
  onUnitChange,
  errors = new Map(),
  onFieldComplete,
  disabled = false
}) => {
  // Use centralized dropdown manager instead of multiple useState calls
  const { handlers, closeAll } = useDropdownManager(
    ['category', 'formType', 'unit'],
    { 
      allowMultiple: false,
      onClose: (field) => {
        // Auto-advance focus when a dropdown closes
        if (field === 'category' && category) {
          setTimeout(() => document.getElementById('form-type')?.focus(), 50);
        } else if (field === 'formType' && formType) {
          setTimeout(() => document.getElementById('dosage-amount')?.focus(), 50);
        } else if (field === 'unit' && unit) {
          onFieldComplete?.();
        }
      }
    }
  );
  
  // Get available options based on selection
  const availableFormTypes = category ? dosageFormsByCategory[category] || [] : [];
  const availableUnits = category ? dosageUnitsByCategory[category] || [] : [];
  
  return (
    <div className="space-y-4">
      {/* Dosage Form Category - Using UnifiedDropdown */}
      <UnifiedDropdown
        variant="autocomplete"
        value={category || null}
        onChange={(value) => {
          onCategoryChange(value);
          closeAll();
        }}
        items={dosageFormCategories}
        filterItems={(items, query) => filterStringItems(items, query, 'contains')}
        isItemHighlighted={(item, query) => isItemHighlighted(item, query, 'startsWith')}
        renderItem={(item, _, isHighlighted) => (
          <span className={isHighlighted ? 'font-medium' : ''}>{item}</span>
        )}
        getItemKey={(item) => item}
        getItemText={(item) => item}
        placeholder="Select category..."
        label="Dosage Form Category"
        required
        error={errors.get('category')}
        id="dosage-category"
        testId="dosage-category"
        dropdownTestId="dosage-category-dropdown"
        clearable
        autoSelectOnBlur
        config={{
          enableTabAsArrows: true,
          closeOnSelect: true
        }}
      />
      
      {/* Form Type - Using UnifiedDropdown */}
      {category && (
        <UnifiedDropdown
          variant="autocomplete"
          value={formType || null}
          onChange={(value) => {
            onFormTypeChange(value);
            closeAll();
          }}
          items={availableFormTypes}
          filterItems={(items, query) => filterStringItems(items, query, 'contains')}
          isItemHighlighted={(item, query) => isItemHighlighted(item, query, 'startsWith')}
          renderItem={(item, _, isHighlighted) => (
            <span className={isHighlighted ? 'font-medium' : ''}>{item}</span>
          )}
          getItemKey={(item) => item}
          getItemText={(item) => item}
          placeholder="Select form type..."
          label="Type"
          required
          error={errors.get('formType')}
          disabled={!category || disabled}
          id="form-type"
          testId="form-type"
          dropdownTestId="form-type-dropdown"
          clearable
          autoSelectOnBlur
          config={{
            enableTabAsArrows: true,
            closeOnSelect: true
          }}
        />
      )}
      
      {/* Dosage Amount - Regular input */}
      {formType && (
        <div className="space-y-2">
          <Label htmlFor="dosage-amount" className="text-sm font-medium">
            Dosage Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dosage-amount"
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Enter amount..."
            className={errors.get('amount') ? 'border-red-500' : ''}
            disabled={!formType || disabled}
            aria-invalid={!!errors.get('amount')}
            aria-describedby={errors.get('amount') ? 'amount-error' : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && amount) {
                e.preventDefault();
                document.getElementById('dosage-unit')?.focus();
              }
            }}
          />
          {errors.get('amount') && (
            <p id="amount-error" className="text-red-600 text-sm">
              {errors.get('amount')}
            </p>
          )}
        </div>
      )}
      
      {/* Dosage Unit - Using UnifiedDropdown */}
      {amount && (
        <UnifiedDropdown
          variant="autocomplete"
          value={unit || null}
          onChange={(value) => {
            onUnitChange(value);
            closeAll();
          }}
          items={availableUnits}
          filterItems={(items, query) => filterStringItems(items, query, 'contains')}
          isItemHighlighted={(item, query) => isItemHighlighted(item, query, 'startsWith')}
          renderItem={(item, _, isHighlighted) => (
            <span className={isHighlighted ? 'font-medium' : ''}>{item}</span>
          )}
          getItemKey={(item) => item}
          getItemText={(item) => item}
          placeholder="Select unit..."
          label="Unit"
          required
          error={errors.get('unit')}
          disabled={!amount || disabled}
          id="dosage-unit"
          testId="dosage-unit"
          dropdownTestId="dosage-unit-dropdown"
          clearable
          autoSelectOnBlur
          config={{
            enableTabAsArrows: true,
            closeOnSelect: true
          }}
        />
      )}
    </div>
  );
});

export default DosageFormInputsRefactored;