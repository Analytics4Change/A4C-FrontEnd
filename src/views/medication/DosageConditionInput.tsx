import React from 'react';
import { EditableDropdown } from '@/components/ui/EditableDropdown';
import { dosageConditions } from '@/mocks/data/dosages.mock';

interface DosageConditionInputProps {
  condition: string;
  onConditionChange: (cond: string) => void;
  onDropdownOpen?: (elementId: string) => void;
}

/**
 * Dosage condition input using the reusable EditableDropdown component
 */
export const DosageConditionInput: React.FC<DosageConditionInputProps> = ({
  condition,
  onConditionChange,
  onDropdownOpen
}) => {
  return (
    <EditableDropdown
      id="dosage-condition"
      label="Condition"
      value={condition}
      options={dosageConditions}
      placeholder="Select condition..."
      error={undefined} // No error handling in original
      tabIndex={11}
      targetTabIndex={12}
      onChange={onConditionChange}
      onDropdownOpen={onDropdownOpen}
      testIdPrefix="dosage-condition"
    />
  );
};