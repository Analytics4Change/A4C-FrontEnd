import React from 'react';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';

interface CategorySelectionProps {
  selectedTherapeuticClasses: string[];
  onTherapeuticClassesChange?: (classes: string[]) => void;
  onToggleTherapeuticClass?: (category: string) => void;
  categoriesCompleted: boolean;
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
 * Simplified CategorySelection using unified MultiSelectDropdown
 * - Cleaner implementation with less complexity
 * - Full keyboard and mouse support
 * - WCAG and ARIA compliant
 */
export const CategorySelection: React.FC<CategorySelectionProps> = observer(({
  selectedTherapeuticClasses,
  onTherapeuticClassesChange,
  onToggleTherapeuticClass,
  categoriesCompleted
}) => {
  // Debug: Log every render
  console.log('[CategorySelection] Rendering with:', {
    therapeutic: selectedTherapeuticClasses.slice()
  });
  // Handle therapeutic classes changes
  const handleTherapeuticClassesChange = (selected: string[]) => {
    console.log('[CategorySelection] handleTherapeuticClassesChange called with:', selected);
    if (onTherapeuticClassesChange) {
      // Use setter method if available
      console.log('[CategorySelection] Calling onTherapeuticClassesChange');
      onTherapeuticClassesChange(selected);
    } else if (onToggleTherapeuticClass) {
      // Fall back to toggle method
      const added = selected.filter(s => !selectedTherapeuticClasses.includes(s));
      const removed = selectedTherapeuticClasses.filter(s => !selected.includes(s));
      
      added.forEach(item => onToggleTherapeuticClass(item));
      removed.forEach(item => onToggleTherapeuticClass(item));
    }
  };


  return (
    <div className="space-y-6">
      {/* Therapeutic Classes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Therapeutic Classes</Label>
        <MultiSelectDropdown
          id="therapeutic-classes"
          label="Therapeutic Classes"
          options={therapeuticClasses}
          selected={selectedTherapeuticClasses}
          onChange={handleTherapeuticClassesChange}
          placeholder="Select therapeutic classes..."
          buttonTabIndex={18}
        />
      </div>

      {/* Completion Indicator */}
      {categoriesCompleted && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check size={16} />
          <span>Categories selection complete</span>
        </div>
      )}
    </div>
  );
});