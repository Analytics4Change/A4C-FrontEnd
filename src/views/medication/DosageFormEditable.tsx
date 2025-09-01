import React from 'react';
import { observer } from 'mobx-react-lite';
import { DosageFormInputsEditable } from './DosageFormInputsEditable';
import { TotalAmountInputs } from './TotalAmountInputs';
import { FrequencyConditionInputsEditable } from './FrequencyConditionInputsEditable';

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
  availableUnits: string[];
  availableTotalUnits: string[];
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

export const DosageFormEditable = observer((props: DosageFormProps) => {
  const {
    dosageFormCategory,
    dosageFormType,
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
    onAmountChange,
    onUnitChange,
    onTotalAmountChange,
    onTotalUnitChange,
    onFrequencyChange,
    onConditionChange,
    onDropdownOpen
  } = props;

  return (
    <div className="space-y-6">
      {/* Dosage Form and Unit Inputs - Using Editable Version */}
      <DosageFormInputsEditable
        dosageFormCategory={dosageFormCategory}
        dosageFormType={dosageFormType}
        dosageAmount={dosageAmount}
        dosageUnit={dosageUnit}
        availableFormTypes={availableFormTypes}
        availableUnits={availableUnits}
        errors={errors}
        onCategoryChange={onCategoryChange}
        onFormTypeChange={onFormTypeChange}
        onAmountChange={onAmountChange}
        onUnitChange={onUnitChange}
        onDropdownOpen={onDropdownOpen}
      />

      {/* Total Amount Inputs - Keep existing as it's already editable */}
      <TotalAmountInputs
        totalAmount={totalAmount}
        totalUnit={totalUnit}
        availableTotalUnits={availableTotalUnits}
        errors={errors}
        onTotalAmountChange={onTotalAmountChange}
        onTotalUnitChange={onTotalUnitChange}
        onDropdownOpen={onDropdownOpen}
      />

      {/* Frequency and Condition Inputs - Using Editable Version */}
      <FrequencyConditionInputsEditable
        frequency={frequency}
        condition={condition}
        errors={errors}
        onFrequencyChange={onFrequencyChange}
        onConditionChange={onConditionChange}
        onDropdownOpen={onDropdownOpen}
      />
    </div>
  );
});