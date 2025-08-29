import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewModel } from '@/hooks/useViewModel';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { DosageFormCategory } from '@/types/models/Dosage';
// Use simplified versions without FocusableField wrappers
import { MedicationSearch } from './MedicationSearchSimplified';
import { DosageForm } from './DosageFormSimplified';
import { CategorySelection } from './CategorySelectionSimplified';
import { DateSelection } from './DateSelectionSimplified';
// Using simplified components for clean focus management

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
  
  // State to control when dosage fields are shown (after Continue is clicked)
  const [showDosageFields, setShowDosageFields] = useState(false);
  
  // Track completed fields for save button
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  // Handle continue - advance to dosage form
  const handleContinue = () => {
    if (vm.selectedMedication) {
      setShowDosageFields(true);
      // Focus the first dosage form field after navigation
      setTimeout(() => {
        const dosageCategoryButton = document.getElementById('dosage-category-button');
        if (dosageCategoryButton) {
          dosageCategoryButton.focus();
        }
      }, 100);
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
           vm.selectedBroadCategories.length > 0 &&
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

  // Handle medication selection
  const handleMedicationSelect = (medication: any) => {
    vm.selectMedication(medication);
    setCompletedFields(prev => new Set([...prev, 'medication']));
  };

  // Handle field completions
  const handleFieldComplete = (fieldId: string) => {
    setCompletedFields(prev => new Set([...prev, fieldId]));
  };

  // Handle escape key to close modal and implement focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Implement focus trap for the modal
      if (e.key === 'Tab') {
        // Get all focusable elements within the modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          // Check if we're at the boundaries
          if (e.shiftKey) {
            // Shift+Tab: If focus is on first element, move to last
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab: If focus is on last element, move to first
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Set initial focus to the medication search input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchInput = document.getElementById('medication-search');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
      data-testid="medication-entry-modal"
      data-modal-id="medication-entry"
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
            tabIndex={2}
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
                setTimeout(() => {
                  const element = document.getElementById(elementId);
                  if (element) {
                    scrollWhenVisible(element, { behavior: 'smooth' });
                  }
                }, 100);
              }}
            />
          </div>

          {/* Dosage Form - Show after Continue button is clicked */}
          {showDosageFields && vm.selectedMedication && (
            <>
              <div data-flow-node="true">
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
                    setTimeout(() => {
                      const element = document.getElementById(elementId);
                      if (element) {
                        scrollWhenVisible(element, { behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                />
              </div>

              {/* Category Selection */}
              <div id="broad-categories-button" data-flow-node="true">
                <CategorySelection
                  selectedBroadCategories={vm.selectedBroadCategories}
                  selectedSpecificCategories={vm.selectedSpecificCategories}
                  onToggleBroadCategory={(cat) => {
                    vm.toggleBroadCategory(cat);
                    if (vm.selectedBroadCategories.length > 0) {
                      handleFieldComplete('broad-categories-button');
                    }
                  }}
                  onToggleSpecificCategory={(cat) => {
                    vm.toggleSpecificCategory(cat);
                    if (vm.selectedSpecificCategories.length > 0) {
                      handleFieldComplete('specific-categories-button');
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
                  showStartDateCalendar={vm.showStartDateCalendar}
                  showDiscontinueDateCalendar={vm.showDiscontinueDateCalendar}
                  onToggleStartDateCalendar={() => vm.showStartDateCalendar = !vm.showStartDateCalendar}
                  onToggleDiscontinueDateCalendar={() => vm.showDiscontinueDateCalendar = !vm.showDiscontinueDateCalendar}
                  error={vm.errors.get('discontinueDate')}
                  onCalendarOpen={(elementId) => {
                    setTimeout(() => {
                      const element = document.getElementById(elementId);
                      if (element) {
                        scrollWhenVisible(element, { behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-8 py-6 flex justify-end items-center flex-shrink-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
              tabIndex={3}
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
                tabIndex={vm.selectedMedication ? 4 : -1}
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
                tabIndex={4}
              >
                {vm.isLoading ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Export the modal component directly
export const MedicationEntryModal = MedicationEntryModalContent;