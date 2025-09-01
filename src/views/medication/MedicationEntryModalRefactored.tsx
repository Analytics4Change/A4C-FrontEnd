import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewModel } from '@/hooks/useViewModel';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useScrollToElement } from '@/hooks/useScrollToElement';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { DosageFormCategory } from '@/types/models/Dosage';
// Use editable versions with click-to-edit functionality
import { MedicationSearch } from './MedicationSearchWithSearchableDropdown';
import { DosageFormEditable } from './DosageFormEditable';
import { CategorySelection } from './CategorySelectionSimplified';
import { DateSelection } from './DateSelectionSimplified';
import { MobXDebugger } from '@/components/debug/MobXDebugger';
// Using editable components for flexible field editing and keyboard navigation

interface MedicationEntryModalProps {
  clientId: string;
  onClose: () => void;
  onSave: (medication: any) => void;
}

// Modal component with simplified focus management using tabIndex
const MedicationEntryModalContent = observer(({ clientId, onClose, onSave }: MedicationEntryModalProps) => {
  // Use the proper hook to initialize the ViewModel with dependencies
  const vm = useViewModel(MedicationEntryViewModel);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollToCenter, scrollWhenVisible } = useAutoScroll(contentRef);
  
  // Use abstracted scroll timing logic
  const handleScrollToElement = useScrollToElement(scrollWhenVisible);
  
  // State to control when dosage fields are shown (after Continue is clicked)
  const [showDosageFields, setShowDosageFields] = useState(false);
  
  // Track completed fields for save button
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  // Handle continue - advance to dosage form
  const handleContinue = () => {
    if (vm.selectedMedication) {
      setShowDosageFields(true);
      // Focus will be handled by useEffect to avoid setTimeout
    }
  };

  // Check if all required fields are complete
  const isFormComplete = () => {
    // Check required fields based on what we know is needed
    return vm.selectedMedication &&
           vm.dosageFormCategory &&
           vm.dosageFormType &&
           vm.dosageAmount &&
           vm.dosageUnit &&
           vm.frequency &&
           vm.selectedTherapeuticClasses.length > 0 &&
           vm.startDate;
  };

  // Handle save
  const handleSave = async () => {
    if (isFormComplete()) {
      await vm.save();
      onSave(vm.selectedMedication);
      onClose();
    } else {
      console.warn('Form not complete, cannot save');
    }
  };

  // Track when medication is selected for focus management
  const [shouldFocusContinue, setShouldFocusContinue] = useState(false);
  
  // Handle medication selection
  const handleMedicationSelect = (medication: any) => {
    vm.selectMedication(medication);
    setCompletedFields(prev => new Set([...prev, 'medication']));
    // Trigger focus in useEffect instead of setTimeout
    setShouldFocusContinue(true);
  };

  // Handle field completions
  const handleFieldComplete = (fieldId: string) => {
    setCompletedFields(prev => new Set([...prev, fieldId]));
  };

  // Focus management for Continue button after medication selection
  useEffect(() => {
    if (shouldFocusContinue && vm.selectedMedication && !showDosageFields) {
      const continueButton = document.getElementById('medication-continue-button');
      if (continueButton) {
        continueButton.focus();
        setShouldFocusContinue(false);
      }
    }
  }, [shouldFocusContinue, vm.selectedMedication, showDosageFields]);

  // Focus management for dosage category input after clicking Continue
  useEffect(() => {
    if (showDosageFields) {
      const dosageCategoryInput = document.getElementById('dosage-category');
      if (dosageCategoryInput) {
        dosageCategoryInput.focus();
      }
    }
  }, [showDosageFields]);

  // Use keyboard navigation hook for focus trap and escape handling
  useKeyboardNavigation({
    containerRef: modalRef as React.RefObject<HTMLElement>,
    enabled: true,
    trapFocus: true,
    restoreFocus: false, // We don't need to restore focus on unmount
    onEscape: onClose,
    checkEscapeCondition: () => {
      // Only close modal if no sub-contexts are open
      const openContexts = modalRef.current?.querySelectorAll('[data-focus-context="open"]');
      return !openContexts || openContexts.length === 0;
    }
  });



  return (
    <>
      {/* MobX Debug Monitor */}
      <MobXDebugger viewModel={vm} show={true} />
      
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
        data-testid="add-new-prescribed-medication-modal"
        data-modal-id="add-new-prescribed-medication"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medication-modal-title"
      >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-white border-b px-8 py-6 flex justify-between items-center flex-shrink-0">
          <h2 id="medication-modal-title" className="text-2xl font-semibold">
            Add New Prescribed Medication
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full min-w-[44px] min-h-[44px]"
            data-testid="medication-modal-close"
            aria-label="Close medication modal"
            tabIndex={showDosageFields ? 23 : 3}
          >
            <X size={24} />
          </Button>
        </div>

        
        {/* Content */}
        <div 
          ref={contentRef}
          className="p-8 space-y-8 overflow-visible invisible-scrollbar flex-1 min-h-[500px]"
        >
          {/* Medication Search - Always visible as it's the first step */}
          <div id="medication-search" data-flow-node="true">
            <MedicationSearch
              value={vm.medicationName}
              searchResults={vm.searchResults}
              isLoading={vm.isLoading}
              showDropdown={vm.showMedicationDropdown}
              selectedMedication={vm.selectedMedication}
              error={vm.errors.get('medication')}
              onSearch={(query) => vm.searchMedications(query)}
              onSelect={handleMedicationSelect}
              onClear={() => {
                vm.clearMedication();
                setShowDosageFields(false);
              }}
              onFieldComplete={() => handleFieldComplete('medication-search')}
              onDropdownOpen={(elementId) => {
                handleScrollToElement(elementId);
              }}
            />
          </div>

          {/* Dosage Form - Show after Continue button is clicked */}
          {showDosageFields && vm.selectedMedication && (
            <div 
              className={`transition-all duration-300 ease-in-out ${
                showDosageFields ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <div data-flow-node="true">
                <DosageFormEditable
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
                  onCategoryChange={(category) => {
                    vm.setDosageFormCategory(category as DosageFormCategory);
                    handleFieldComplete('dosage-category');
                  }}
                  onFormTypeChange={(formType) => {
                    vm.setDosageFormType(formType);
                    handleFieldComplete('form-type');
                  }}
                  onFormChange={(form) => vm.setDosageForm(form)}
                  onAmountChange={(amount) => {
                    vm.updateDosageAmount(amount);
                    if (amount && !isNaN(parseFloat(amount))) {
                      handleFieldComplete('dosage-amount');
                    }
                  }}
                  onUnitChange={(unit) => {
                    vm.setDosageUnit(unit);
                    handleFieldComplete('dosage-unit');
                  }}
                  onTotalAmountChange={(amount) => {
                    vm.updateTotalAmount(amount);
                    if (amount) {
                      handleFieldComplete('total-amount');
                    }
                  }}
                  onTotalUnitChange={(unit) => {
                    vm.setTotalUnit(unit);
                    handleFieldComplete('total-unit');
                  }}
                  onFrequencyChange={(freq) => {
                    vm.setFrequency(freq);
                    handleFieldComplete('frequency');
                  }}
                  onConditionChange={(cond) => {
                    vm.setCondition(cond);
                    handleFieldComplete('condition');
                  }}
                  onDropdownOpen={(elementId) => {
                    handleScrollToElement(elementId);
                  }}
                />
              </div>

              {/* Category Selection */}
              <div data-flow-node="true">
                <CategorySelection
                  selectedTherapeuticClasses={vm.selectedTherapeuticClasses}
                  selectedRegimenCategories={vm.selectedRegimenCategories}
                  onTherapeuticClassesChange={(classes) => {
                    vm.setTherapeuticClasses(classes);
                    if (classes.length > 0) {
                      handleFieldComplete('therapeutic-classes-button');
                    }
                  }}
                  onRegimenCategoriesChange={(categories) => {
                    vm.setRegimenCategories(categories);
                    if (categories.length > 0) {
                      handleFieldComplete('regimen-categories-button');
                    }
                  }}
                  categoriesCompleted={vm.categoriesCompleted}
                />
              </div>

              {/* Date Selection */}
              <div data-flow-node="true">
                <DateSelection
                  startDate={vm.startDate ? vm.startDate.toISOString().split('T')[0] : ''}
                  discontinueDate={vm.discontinueDate ? vm.discontinueDate.toISOString().split('T')[0] : ''}
                  onStartDateChange={(date) => {
                    vm.setStartDate(date ? new Date(date) : null);
                    if (date) {
                      handleFieldComplete('start-date');
                    }
                  }}
                  onDiscontinueDateChange={(date) => {
                    vm.setDiscontinueDate(date ? new Date(date) : null);
                    if (date) {
                      handleFieldComplete('discontinue-date');
                    }
                  }}
                  error={vm.errors.get('discontinueDate')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-8 py-6 flex justify-end items-center flex-shrink-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
              tabIndex={showDosageFields ? 24 : 4}
            >
              Cancel
            </Button>
            
            {/* Two-state logic: Either in search state OR configuration state */}
            {!showDosageFields ? (
              /* Medication Search State - Show Continue button */
              <Button
                id="medication-continue-button"
                onClick={handleContinue}
                disabled={!vm.selectedMedication}
                className="min-w-[100px]"
                data-testid="medication-continue-button"
                tabIndex={vm.selectedMedication ? 5 : -1}
              >
                Continue
              </Button>
            ) : (
              /* Dosage Configuration State - Show Save button */
              <Button
                id="medication-save-button"
                onClick={handleSave}
                disabled={!isFormComplete() || vm.isLoading}
                className="min-w-[100px]"
                data-testid="medication-save-button"
                tabIndex={25}
              >
                {vm.isLoading ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
});

// Export the modal component directly
export const MedicationEntryModal = MedicationEntryModalContent;