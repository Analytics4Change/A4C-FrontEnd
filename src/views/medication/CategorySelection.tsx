import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, Check } from 'lucide-react';
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
  'Cardiovascular',
  'Diabetes',
  'Mental Health',
  'Pain Management',
  'Respiratory',
  'Gastrointestinal',
  'Neurological',
  'Infectious Disease'
];

const specificCategories = [
  'Hypertension',
  'Type 2 Diabetes',
  'Depression',
  'Anxiety',
  'Anti-inflammatory',
  'Asthma',
  'GERD',
  'Epilepsy'
];

export const CategorySelection = observer(({
  selectedBroadCategories,
  selectedSpecificCategories,
  onToggleBroadCategory,
  onToggleSpecificCategory,
  categoriesCompleted
}: CategorySelectionProps) => {
  const [showBroadCategories, setShowBroadCategories] = useState(false);
  const [showSpecificCategories, setShowSpecificCategories] = useState(false);
  const broadCategoriesButtonRef = React.useRef<HTMLButtonElement>(null);
  const specificCategoriesButtonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Medication Categories</Label>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Button
            id="broad-categories-button"
            ref={broadCategoriesButtonRef}
            type="button"
            variant={selectedBroadCategories.length > 0 ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => setShowBroadCategories(true)}
            onFocus={() => {
              // Auto-open dropdown when button receives focus
              setShowBroadCategories(true);
            }}
          >
            <span>
              {selectedBroadCategories.length > 0
                ? `${selectedBroadCategories.length} Broad Categories`
                : 'Select Broad Categories'}
            </span>
            <ChevronDown size={20} />
          </Button>
        </div>

        <div>
          <Button
            id="specific-categories-button"
            ref={specificCategoriesButtonRef}
            type="button"
            variant={selectedSpecificCategories.length > 0 ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => setShowSpecificCategories(true)}
            disabled={selectedBroadCategories.length === 0}
            onFocus={() => {
              // Auto-open dropdown when button receives focus and is enabled
              if (selectedBroadCategories.length > 0) {
                setShowSpecificCategories(true);
              }
            }}
          >
            <span>
              {selectedSpecificCategories.length > 0
                ? `${selectedSpecificCategories.length} Specific Categories`
                : 'Select Specific Categories'}
            </span>
            <ChevronDown size={20} />
          </Button>
        </div>
      </div>

      {categoriesCompleted && (
        <div className="flex items-center gap-2 text-green-600">
          <Check size={20} />
          <span className="text-sm font-medium">Categories completed</span>
        </div>
      )}

      {showBroadCategories && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Select Broad Categories</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {broadCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <Checkbox
                    checked={selectedBroadCategories.includes(category)}
                    onCheckedChange={() => onToggleBroadCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBroadCategories(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowBroadCategories(false);
                  // Focus on specific categories button after closing broad categories
                  setTimeout(() => {
                    if (specificCategoriesButtonRef.current) {
                      specificCategoriesButtonRef.current.focus();
                    }
                  }, 50);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSpecificCategories && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Select Specific Categories</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {specificCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <Checkbox
                    checked={selectedSpecificCategories.includes(category)}
                    onCheckedChange={() => onToggleSpecificCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSpecificCategories(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSpecificCategories(false);
                  // Focus on start date button after closing specific categories
                  setTimeout(() => {
                    const startDateButton = document.getElementById('start-date') as HTMLButtonElement;
                    if (startDateButton) {
                      startDateButton.focus();
                    }
                  }, 50);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});