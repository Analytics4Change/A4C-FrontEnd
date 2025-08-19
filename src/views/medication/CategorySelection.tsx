import React from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FocusableField } from '@/components/FocusableField';
import { ManagedDialog, ManagedDialogClose } from '@/components/focus/ManagedDialog';
import * as Dialog from '@radix-ui/react-dialog';

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

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Medication Categories</Label>
      
      <div className="grid grid-cols-2 gap-4">
        <FocusableField
          id="broad-categories"
          order={11}
          scope="medication-entry"
          validators={{
            canLeaveFocus: () => selectedBroadCategories.length > 0
          }}
        >
          <ManagedDialog
            id="broad-categories-modal"
            focusRestorationId="specific-categories"
            trigger={
              <Button
                id="broad-categories-button"
                type="button"
                variant={selectedBroadCategories.length > 0 ? 'default' : 'outline'}
                className="w-full justify-between"
              >
                <span>
                  {selectedBroadCategories.length > 0
                    ? `${selectedBroadCategories.length} Broad Categories`
                    : 'Select Broad Categories'}
                </span>
                <ChevronDown size={20} />
              </Button>
            }
            title="Select Broad Categories"
          >
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
              <ManagedDialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </ManagedDialogClose>
              <ManagedDialogClose asChild>
                <Button>Done</Button>
              </ManagedDialogClose>
            </div>
          </ManagedDialog>
        </FocusableField>

        <FocusableField
          id="specific-categories"
          order={12}
          scope="medication-entry"
          validators={{
            canReceiveFocus: () => selectedBroadCategories.length > 0,
            canLeaveFocus: () => selectedSpecificCategories.length > 0
          }}
        >
          <ManagedDialog
            id="specific-categories-modal"
            focusRestorationId="start-date"
            trigger={
              <Button
                id="specific-categories-button"
                type="button"
                variant={selectedSpecificCategories.length > 0 ? 'default' : 'outline'}
                className="w-full justify-between"
                disabled={selectedBroadCategories.length === 0}
              >
                <span>
                  {selectedSpecificCategories.length > 0
                    ? `${selectedSpecificCategories.length} Specific Categories`
                    : 'Select Specific Categories'}
                </span>
                <ChevronDown size={20} />
              </Button>
            }
            title="Select Specific Categories"
          >
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
              <ManagedDialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </ManagedDialogClose>
              <ManagedDialogClose asChild>
                <Button>Done</Button>
              </ManagedDialogClose>
            </div>
          </ManagedDialog>
        </FocusableField>
      </div>

      {categoriesCompleted && (
        <div className="flex items-center gap-2 text-green-600">
          <Check size={20} />
          <span className="text-sm font-medium">Categories completed</span>
        </div>
      )}

    </div>
  );
});