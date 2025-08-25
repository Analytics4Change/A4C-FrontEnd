import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewModel } from '@/hooks/useViewModel';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useFocusFlowSimple } from '@/hooks/useFocusFlowSimple';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { DosageFormCategory } from '@/types/models/Dosage';
import { medicationEntryFlow } from '@/config/focusFlows/medicationEntryFlow';
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

// Inner component that uses the focus flow hook (must be inside FocusManagerProvider)
const MedicationEntryModalContent = observer(({ clientId, onClose, onSave }: MedicationEntryModalProps) => {
  // Use the proper hook to initialize the ViewModel with dependencies
  const vm = useViewModel(MedicationEntryViewModel);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollToCenter, scrollWhenVisible } = useAutoScroll(contentRef);
  
  // Track if we've initialized the flow to prevent multiple starts
  const flowInitializedRef = useRef(false);

  // Use the declarative focus flow - now safely inside FocusManagerProvider
  const {
    state: flowState,
    navigateNext,
    navigatePrevious,
    startFlow,
    completeFlow,
    markNodeComplete,
    isFlowComplete
  } = useFocusFlowSimple(medicationEntryFlow, {
    autoStart: false, // Don't auto-start, we'll start manually once
    validateOnNavigate: true,
    onEvent: (event) => {
      console.log('Focus flow event:', event);
      
      // Handle auto-scroll for dropdown/modal opens
      if (event.type === 'node:enter' && event.data?.opensModal) {
        setTimeout(() => {
          const element = document.getElementById(event.nodeId || '');
          if (element) {
            scrollWhenVisible(element, { behavior: 'smooth' });
          }
        }, 100);
      }
    }
  });
  
  // Start flow only once when component mounts
  useEffect(() => {
    if (!flowInitializedRef.current) {
      flowInitializedRef.current = true;
      console.log('✅ Starting focus flow for MedicationEntryModal');
      startFlow();
    }
  }, []); // Empty dependency array - run only once

  // Handle save
  const handleSave = async () => {
    if (isFlowComplete()) {
      await vm.save();
      onSave(vm.selectedMedication);
      onClose();
    } else {
      console.warn('Flow not complete, cannot save');
    }
  };

  // Handle medication selection - mark node as complete
  const handleMedicationSelect = (medication: any) => {
    vm.selectMedication(medication);
    markNodeComplete('medication-search');
    // Auto-advance to next field
    navigateNext();
  };

  // Handle field completions
  const handleFieldComplete = (nodeId: string) => {
    markNodeComplete(nodeId);
    if (medicationEntryFlow.nodes.find(n => n.id === nodeId)?.autoAdvance) {
      navigateNext();
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Global navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigatePrevious();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, navigateNext, navigatePrevious]);

  // Debug focus flow in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // The MutationObserver in focusFlowDebug.ts will handle this automatically
      // No need to call it manually here
    }
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
          >
            <X size={24} />
          </Button>
        </div>

        {/* Flow Progress Indicator */}
        <div className="px-8 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Step {flowState.currentIndex + 1} of {medicationEntryFlow.nodes.filter(n => n.required).length}
            </span>
            <span className="text-gray-900 font-medium">
              {medicationEntryFlow.nodes.find(n => n.id === flowState.currentNodeId)?.label || 'Loading...'}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ 
                width: `${((flowState.completedNodes.size) / medicationEntryFlow.nodes.filter(n => n.required).length) * 100}%` 
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="p-8 space-y-8 overflow-y-auto invisible-scrollbar flex-1"
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
              onClear={() => vm.clearMedication()}
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

          {/* Dosage Form - Show after medication is selected */}
          {vm.selectedMedication && (
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
        <div className="bg-white border-t px-8 py-6 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-600">
            {flowState.completedNodes.size} of {medicationEntryFlow.nodes.filter(n => n.required).length} required fields complete
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              id="medication-save-button"
              onClick={handleSave}
              disabled={!isFlowComplete() || vm.isLoading}
              className="min-w-[100px]"
              data-testid="medication-save-button"
            >
              {vm.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Export the modal component directly - FocusManagerProvider is now at App level
export const MedicationEntryModal = MedicationEntryModalContent;