import React, { useState, useCallback } from 'react';
import { FocusTrappedCheckboxGroup } from '@/components/ui/FocusTrappedCheckboxGroup';
import { CheckboxItem } from '@/components/ui/FocusTrappedCheckboxGroup/types';

interface DosageTimingsInputProps {
  selectedTimings: string[];
  onTimingsChange: (timings: string[]) => void;
  onClose?: () => void;
  errors?: Map<string, string>;
}

// Define the dosage timing options
const dosageTimingItems: CheckboxItem[] = [
  { 
    id: 'qxh', 
    label: 'Every X Hours - QxH',
    description: 'Medication taken at regular hourly intervals'
  },
  { 
    id: 'qam', 
    label: 'Every Morning - QAM',
    description: 'Once daily in the morning'
  },
  { 
    id: 'qpm', 
    label: 'Every Evening - QPM',
    description: 'Once daily in the evening'
  },
  { 
    id: 'qhs', 
    label: 'Every Night at Bedtime - QHS',
    description: 'Once daily at bedtime'
  }
];

/**
 * Dosage timings input using the FocusTrappedCheckboxGroup component
 * Replaces the previous DosageConditionInput dropdown with a more accessible checkbox group
 */
export const DosageTimingsInput: React.FC<DosageTimingsInputProps> = ({
  selectedTimings,
  onTimingsChange,
  onClose,
  errors
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCancel = useCallback(() => {
    // Reset to empty selection on cancel
    onTimingsChange([]);
    setIsExpanded(false);
    onClose?.();
  }, [onTimingsChange, onClose]);

  const handleContinue = useCallback((timings: string[]) => {
    // Save the selected timings
    onTimingsChange(timings);
    setIsExpanded(false);
    onClose?.();
  }, [onTimingsChange, onClose]);

  // Get error message if exists
  const errorMessage = errors?.get('dosageTimings');
  const hasError = !!errorMessage;

  return (
    <div className="col-span-2">
      <FocusTrappedCheckboxGroup
        id="dosage-timings"
        title="Dosage Timings"
        items={dosageTimingItems}
        selectedIds={selectedTimings}
        onSelectionChange={onTimingsChange}
        onCancel={handleCancel}
        onContinue={handleContinue}
        baseTabIndex={11}
        nextTabIndex={12}
        isCollapsible={true}
        initialExpanded={false}  // Always start collapsed, expand only on focus
        
        // ARIA and validation support
        ariaLabel="Select dosage timing schedule"
        helpText="Select when the medication should be taken. Multiple selections allowed."
        isRequired={false}
        hasError={hasError}
        errorMessage={errorMessage}
        
        className="mt-2"
      />
    </div>
  );
};