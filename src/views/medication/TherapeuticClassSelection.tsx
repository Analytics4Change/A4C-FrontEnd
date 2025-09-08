import React from 'react';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface TherapeuticClassSelectionProps {
  selectedClasses: string[];
  onClassToggle: (className: string) => void;
}

const therapeuticClasses = [
  'Pain Relief',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Mental Health',
  'Diabetes',
  'Antibiotics',
  'Vitamins & Supplements'
];

/**
 * Therapeutic Class Selection as checkbox grid
 * - Replaces dropdown with more intuitive checkbox interface
 * - All checkboxes share tabIndex 12 for proper keyboard navigation
 */
export const TherapeuticClassSelection: React.FC<TherapeuticClassSelectionProps> = observer(({
  selectedClasses,
  onClassToggle
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Therapeutic Classes</Label>
      <div className="grid grid-cols-2 gap-3">
        {therapeuticClasses.map((className) => (
          <label 
            key={className}
            className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
          >
            <Checkbox
              checked={selectedClasses.includes(className)}
              onCheckedChange={() => onClassToggle(className)}
              tabIndex={12}
              aria-label={`Therapeutic class: ${className}`}
            />
            <span className="text-sm select-none">{className}</span>
          </label>
        ))}
      </div>
    </div>
  );
});