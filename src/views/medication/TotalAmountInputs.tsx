import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutocompleteDropdown, SelectionMethod } from '@/components/ui/autocomplete-dropdown';
import { useDropdownBlur } from '@/hooks/useDropdownBlur';
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';
import { useEnterAsTab } from '@/hooks/useEnterAsTab';
import { filterStringItems, isItemHighlighted } from '@/utils/dropdown-filter';
interface TotalAmountInputsProps {
  totalAmount: string;
  totalUnit: string;
  availableTotalUnits: string[];
  errors: Map<string, string>;
  onTotalAmountChange: (amount: string) => void;
  onTotalUnitChange: (unit: string) => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const TotalAmountInputs: React.FC<TotalAmountInputsProps> = ({
  totalAmount,
  totalUnit,
  availableTotalUnits,
  errors,
  onTotalAmountChange,
  onTotalUnitChange,
  onDropdownOpen
}) => {
  const [totalUnitInput, setTotalUnitInput] = useState('');
  const [showTotalUnitDropdown, setShowTotalUnitDropdown] = useState(false);
  const totalUnitInputRef = useRef<HTMLInputElement>(null);

  // Dropdown blur handler using abstracted timing logic
  const handleTotalUnitBlur = useDropdownBlur(setShowTotalUnitDropdown);

  // Focus advancement hook for keyboard navigation
  const totalUnitFocusAdvancement = useFocusAdvancement({
    targetTabIndex: 13, // Move to Frequency input
    enabled: true
  });

  // Hook for Enter key navigation in total amount field
  const handleTotalAmountEnterKey = useEnterAsTab(11); // Move to Total Unit field

  // Use generic filtering utilities
  const filteredTotalUnits = filterStringItems(availableTotalUnits, totalUnitInput, 'contains');
  const isTotalUnitHighlighted = (unit: string) => 
    isItemHighlighted(unit, totalUnitInput, 'startsWith');

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Total Amount */}
      <div>
        <Label htmlFor="total-amount" className="text-base font-medium">
          Total Amount in Bottle/Package
        </Label>
        <Input
          id="total-amount"
          data-testid="total-amount-input"
          type="text"
          value={totalAmount}
          onChange={(e) => onTotalAmountChange(e.target.value)}
          onKeyDown={handleTotalAmountEnterKey}
          placeholder="e.g., 30"
          className={`mt-2 ${totalAmount ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('totalAmount') ? 'border-red-500' : ''}`}
          aria-label="Total amount in bottle or package"
          aria-describedby={errors.get('totalAmount') ? 'total-amount-error' : undefined}
          tabIndex={10}
        />
        {errors.get('totalAmount') && (
          <p id="total-amount-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.get('totalAmount')}
          </p>
        )}
      </div>

      {/* Total Unit */}
      <div className="relative">
        <Label htmlFor="total-unit" className="text-base font-medium">
          Total Unit
        </Label>
        <div id="total-unit-container" className="relative mt-2">
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
            onFocus={() => !totalUnit && setShowTotalUnitDropdown(true)}
            onBlur={handleTotalUnitBlur}
            placeholder="Select total unit..."
            className={`pr-10 ${totalUnit ? 'border-blue-500 bg-blue-50' : ''} ${errors.get('totalUnit') ? 'border-red-500' : ''}`}
            readOnly={!!totalUnit}
            aria-label="Total unit"
            aria-describedby={errors.get('totalUnit') ? 'total-unit-error' : undefined}
            tabIndex={11}
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
            onClick={() => {
              if (!totalUnit) {
                setShowTotalUnitDropdown(true);
                totalUnitInputRef.current?.focus();
                onDropdownOpen?.('total-unit-container');
              }
            }}
            aria-label="Open total unit dropdown"
            disabled={!!totalUnit}
            tabIndex={totalUnit ? -1 : 12}
          >
            <ChevronDown className="text-gray-400" size={20} />
          </button>
        </div>
        
        <AutocompleteDropdown
          isOpen={showTotalUnitDropdown && !totalUnit}
          items={filteredTotalUnits}
          inputRef={totalUnitInputRef}
          onSelect={(unit, method) => {
            onTotalUnitChange(unit);
            setTotalUnitInput(unit);
            setShowTotalUnitDropdown(false);
            
            // Use hook for focus advancement
            totalUnitFocusAdvancement.handleSelection(unit, method);
          }}
          getItemKey={(unit) => unit}
          isItemHighlighted={(unit) => isTotalUnitHighlighted(unit)}
          testId="total-unit-dropdown"
          modalId="total-unit-dropdown"
          renderItem={(unit, index) => (
            <div data-testid={`total-unit-option-${index}`}>
              {unit}
            </div>
          )}
        />
        
        {errors.get('totalUnit') && (
          <p id="total-unit-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.get('totalUnit')}
          </p>
        )}
      </div>
    </div>
  );
};