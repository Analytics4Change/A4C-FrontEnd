import React from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CategorySelectionProps {
  selectedBroadCategories: string[];
  selectedSpecificCategories: string[];
  onToggleBroadCategory: (category: string) => void;
  onToggleSpecificCategory: (category: string) => void;
  categoriesCompleted: boolean;
}

const broadCategories = [
  'Pain Relief',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Mental Health',
  'Diabetes',
  'Antibiotics',
  'Vitamins & Supplements'
];

const specificCategories = [
  'Chronic Condition',
  'As Needed (PRN)',
  'Short-term Treatment',
  'Preventive',
  'Emergency Use',
  'Post-operative',
  'Maintenance Therapy'
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  selectedBroadCategories,
  selectedSpecificCategories,
  onToggleBroadCategory,
  onToggleSpecificCategory,
  categoriesCompleted
}) => {
  const [showBroadCategories, setShowBroadCategories] = React.useState(false);
  const [showSpecificCategories, setShowSpecificCategories] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Broad Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Medication Categories</Label>
        
        <Button
          id="broad-categories-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowBroadCategories(!showBroadCategories)}
          aria-expanded={showBroadCategories}
          aria-controls="broad-categories-list"
          aria-label={`Select medication categories. ${selectedBroadCategories.length} selected`}
        >
          <span className="flex items-center gap-2">
            {selectedBroadCategories.length > 0 ? (
              <>
                <Check size={16} className="text-green-600" />
                <span>{selectedBroadCategories.length} categories selected</span>
              </>
            ) : (
              <span className="text-gray-600">Select categories...</span>
            )}
          </span>
          {showBroadCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {showBroadCategories && (
          <div 
            id="broad-categories-list"
            data-modal-id="broad-categories-list"
            className="bg-white border rounded-lg p-4 space-y-3"
            role="group"
            aria-label="Medication categories"
          >
            {broadCategories.map((category) => (
              <label 
                key={category} 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedBroadCategories.includes(category)}
                  onCheckedChange={() => onToggleBroadCategory(category)}
                  aria-label={category}
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Specific Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Usage Categories</Label>
        
        <Button
          id="specific-categories-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowSpecificCategories(!showSpecificCategories)}
          aria-expanded={showSpecificCategories}
          aria-controls="specific-categories-list"
          aria-label={`Select usage categories. ${selectedSpecificCategories.length} selected`}
        >
          <span className="flex items-center gap-2">
            {selectedSpecificCategories.length > 0 ? (
              <>
                <Check size={16} className="text-green-600" />
                <span>{selectedSpecificCategories.length} usage types selected</span>
              </>
            ) : (
              <span className="text-gray-600">Select usage types...</span>
            )}
          </span>
          {showSpecificCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {showSpecificCategories && (
          <div 
            id="specific-categories-list"
            data-modal-id="specific-categories-list"
            className="bg-white border rounded-lg p-4 space-y-3"
            role="group"
            aria-label="Usage categories"
          >
            {specificCategories.map((category) => (
              <label 
                key={category} 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedSpecificCategories.includes(category)}
                  onCheckedChange={() => onToggleSpecificCategory(category)}
                  aria-label={category}
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        )}
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
};