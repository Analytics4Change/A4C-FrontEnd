import React from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CategorySelectionProps {
  selectedTherapeuticClasses: string[];
  selectedRegimenCategories: string[];
  onToggleTherapeuticClass: (category: string) => void;
  onToggleRegimenCategory: (category: string) => void;
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

const regimenCategories = [
  'Chronic Condition',
  'As Needed (PRN)',
  'Short-term Treatment',
  'Preventive',
  'Emergency Use',
  'Post-operative',
  'Maintenance Therapy'
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  selectedTherapeuticClasses,
  selectedRegimenCategories,
  onToggleTherapeuticClass,
  onToggleRegimenCategory,
  categoriesCompleted
}) => {
  const [showTherapeuticClasses, setShowTherapeuticClasses] = React.useState(false);
  const [showRegimenCategories, setShowRegimenCategories] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Therapeutic Classes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Therapeutic Classes</Label>
        
        <Button
          id="therapeutic-classes-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowTherapeuticClasses(!showTherapeuticClasses)}
          aria-expanded={showTherapeuticClasses}
          aria-controls="therapeutic-classes-list"
          aria-label={`Select therapeutic classes. ${selectedTherapeuticClasses.length} selected`}
          tabIndex={17}
        >
          <span className="flex items-center gap-2">
            {selectedTherapeuticClasses.length > 0 ? (
              <>
                <Check size={16} className="text-green-600" />
                <span>{selectedTherapeuticClasses.length} classes selected</span>
              </>
            ) : (
              <span className="text-gray-600">Select classes...</span>
            )}
          </span>
          {showTherapeuticClasses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {showTherapeuticClasses && (
          <div 
            id="therapeutic-classes-list"
            data-modal-id="therapeutic-classes-list"
            className="bg-white border rounded-lg p-4 space-y-3"
            role="group"
            aria-label="Therapeutic classes"
          >
            {therapeuticClasses.map((category) => (
              <label 
                key={category} 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedTherapeuticClasses.includes(category)}
                  onCheckedChange={() => onToggleTherapeuticClass(category)}
                  aria-label={category}
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Regimen Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Regimen Categories</Label>
        
        <Button
          id="regimen-categories-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowRegimenCategories(!showRegimenCategories)}
          aria-expanded={showRegimenCategories}
          aria-controls="regimen-categories-list"
          aria-label={`Select regimen categories. ${selectedRegimenCategories.length} selected`}
          tabIndex={18}
        >
          <span className="flex items-center gap-2">
            {selectedRegimenCategories.length > 0 ? (
              <>
                <Check size={16} className="text-green-600" />
                <span>{selectedRegimenCategories.length} regimen types selected</span>
              </>
            ) : (
              <span className="text-gray-600">Select regimen types...</span>
            )}
          </span>
          {showRegimenCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {showRegimenCategories && (
          <div 
            id="regimen-categories-list"
            data-modal-id="regimen-categories-list"
            className="bg-white border rounded-lg p-4 space-y-3"
            role="group"
            aria-label="Regimen categories"
          >
            {regimenCategories.map((category) => (
              <label 
                key={category} 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <Checkbox
                  checked={selectedRegimenCategories.includes(category)}
                  onCheckedChange={() => onToggleRegimenCategory(category)}
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