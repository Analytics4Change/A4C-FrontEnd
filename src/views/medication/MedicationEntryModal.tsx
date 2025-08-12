import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewModel } from '@/hooks/useViewModel';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { DosageFormCategory } from '@/types/models/Dosage';
import { MedicationSearch } from './MedicationSearch';
import { DosageForm } from './DosageForm';
import { CategorySelection } from './CategorySelection';
import { DateSelection } from './DateSelection';

interface MedicationEntryModalProps {
  onClose: () => void;
}

export const MedicationEntryModal = observer(({ onClose }: MedicationEntryModalProps) => {
  const vm = useViewModel(MedicationEntryViewModel);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldFocusDosageForm, setShouldFocusDosageForm] = React.useState(false);
  const { scrollToCenter, scrollWhenVisible } = useAutoScroll(contentRef);

  const handleSave = async () => {
    await vm.save();
    onClose();
  };

  // Handle medication selection to trigger dosage form focus
  const handleMedicationSelect = (medication: any) => {
    vm.selectMedication(medication);
    setShouldFocusDosageForm(true);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
      data-testid="medication-entry-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medication-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-white border-b px-8 py-6 flex justify-between items-center flex-shrink-0">
          <h2 id="medication-modal-title" className="text-2xl font-semibold">Add New Prescribed Medication</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full min-w-[44px] min-h-[44px]"
            data-testid="medication-modal-close"
            aria-label="Close medication modal"
          >
            <X size={24} />
          </Button>
        </div>
        
        <div 
          ref={contentRef}
          className="p-8 space-y-8 overflow-y-auto invisible-scrollbar flex-1"
        >
          <MedicationSearch
            value={vm.medicationName}
            searchResults={vm.searchResults}
            isLoading={vm.isLoading}
            showDropdown={vm.showMedicationDropdown}
            selectedMedication={vm.selectedMedication}
            error={vm.errors.get('medication')}
            onSearch={(query) => vm.searchMedications(query)}
            onSelect={handleMedicationSelect}
            onClear={() => vm.clearMedication()}
            onDropdownOpen={(elementId) => {
              // Auto-scroll to center the dropdown when opened
              setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                  scrollWhenVisible(element, { behavior: 'smooth' });
                }
              }, 100);
            }}
          />

          {vm.selectedMedication && (
            <>
              <DosageForm
                dosageFormCategory={vm.dosageFormCategory}
                dosageFormType={vm.dosageFormType}
                dosageForm={vm.dosageForm}
                dosageAmount={vm.dosageAmount}
                dosageUnit={vm.dosageUnit}
                totalAmount={vm.totalAmount}
                totalUnit={vm.totalUnit}
                frequency={vm.frequency}
                condition={vm.condition}
                availableFormTypes={vm.availableFormTypes}
                availableUnits={vm.availableUnits}
                availableTotalUnits={vm.availableUnits}
                errors={vm.errors}
                onCategoryChange={(category) => vm.setDosageFormCategory(category as DosageFormCategory)}
                onFormTypeChange={(formType) => vm.setDosageFormType(formType)}
                onFormChange={(form) => vm.setDosageForm(form)}
                onAmountChange={(amount) => vm.updateDosageAmount(amount)}
                onUnitChange={(unit) => vm.setDosageUnit(unit)}
                onTotalAmountChange={(amount) => vm.updateTotalAmount(amount)}
                onTotalUnitChange={(unit) => vm.setTotalUnit(unit)}
                onFrequencyChange={(freq) => vm.setFrequency(freq)}
                onConditionChange={(cond) => vm.setCondition(cond)}
                focusOnMount={shouldFocusDosageForm}
                onConditionComplete={() => {
                  // Focus on broad categories button after condition selection
                  const broadCategoriesButton = document.getElementById('broad-categories-button') as HTMLButtonElement;
                  if (broadCategoriesButton) {
                    setTimeout(() => broadCategoriesButton.focus(), 50);
                  }
                }}
                onDropdownOpen={(elementId) => {
                  // Auto-scroll to center the dropdown when opened
                  setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                      scrollWhenVisible(element, { behavior: 'smooth' });
                    }
                  }, 100);
                }}
              />

              <CategorySelection
                selectedBroadCategories={vm.selectedBroadCategories}
                selectedSpecificCategories={vm.selectedSpecificCategories}
                onToggleBroadCategory={(cat) => vm.toggleBroadCategory(cat)}
                onToggleSpecificCategory={(cat) => vm.toggleSpecificCategory(cat)}
                categoriesCompleted={vm.categoriesCompleted}
              />

              <DateSelection
                startDate={vm.startDate}
                discontinueDate={vm.discontinueDate}
                onStartDateChange={(date) => vm.setStartDate(date)}
                onDiscontinueDateChange={(date) => vm.setDiscontinueDate(date)}
                showStartDateCalendar={vm.showStartDateCalendar}
                showDiscontinueDateCalendar={vm.showDiscontinueDateCalendar}
                onToggleStartDateCalendar={() => vm.showStartDateCalendar = !vm.showStartDateCalendar}
                onToggleDiscontinueDateCalendar={() => vm.showDiscontinueDateCalendar = !vm.showDiscontinueDateCalendar}
                error={vm.errors.get('discontinueDate')}
                onCalendarOpen={(elementId) => {
                  // Auto-scroll to center the calendar when opened
                  setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                      scrollWhenVisible(element, { behavior: 'smooth' });
                    }
                  }, 100);
                }}
                onStartDateComplete={() => {
                  // Focus on discontinue date button after start date selection
                  const discontinueDateButton = document.getElementById('discontinue-date') as HTMLButtonElement;
                  if (discontinueDateButton) {
                    setTimeout(() => discontinueDateButton.focus(), 50);
                  }
                }}
                onDiscontinueDateComplete={() => {
                  // Focus on save button after discontinue date selection
                  const saveButton = document.querySelector('[data-testid="medication-save-button"]') as HTMLButtonElement;
                  if (saveButton) {
                    setTimeout(() => saveButton.focus(), 50);
                  }
                }}
              />

              <div className="pt-6 border-t flex justify-center gap-6">
                <Button 
                  variant="outline" 
                  onClick={() => vm.reset()}
                  disabled={vm.isLoading}
                  className="px-8 min-h-[44px]"
                  data-testid="medication-discard-button"
                  aria-label="Discard medication changes"
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!vm.canSave || vm.isLoading}
                  className="px-8 min-h-[44px]"
                  data-testid="medication-save-button"
                  aria-label="Save medication"
                >
                  {vm.isLoading ? 'Saving...' : 'Save Medication'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});