import React, { useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFocusAdvancement } from '@/hooks/useFocusAdvancement';
import { FocusBehaviorProvider } from '@/contexts/FocusBehaviorContext';
import { TherapeuticClassesDropdown } from './TherapeuticClassesDropdown';
import { RegimenCategoriesDropdown } from './RegimenCategoriesDropdown';

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

/**
 * Enhanced CategorySelection with keyboard navigation using Tab as Arrows
 * - Tab/Shift+Tab navigate between checkboxes
 * - Space toggles checkbox selection
 * - Enter closes dropdown and advances focus
 * - Escape closes dropdown and returns to button
 */
export const CategorySelectionEnhanced: React.FC<CategorySelectionProps> = observer(({
  selectedTherapeuticClasses,
  selectedRegimenCategories,
  onToggleTherapeuticClass,
  onToggleRegimenCategory,
  categoriesCompleted
}) => {
  const [showTherapeuticClasses, setShowTherapeuticClasses] = useState(false);
  const [showRegimenCategories, setShowRegimenCategories] = useState(false);

  const therapeuticButtonRef = useRef<HTMLButtonElement>(null);
  const regimenButtonRef = useRef<HTMLButtonElement>(null);

  // Focus advancement for buttons
  const therapeuticButtonFocus = useFocusAdvancement({
    targetTabIndex: 18, // Move to Regimen Categories button
    enabled: !showTherapeuticClasses
  });

  const regimenButtonFocus = useFocusAdvancement({
    targetTabIndex: 19, // Move to Start Date
    enabled: !showRegimenCategories
  });

  // Handle closing therapeutic classes dropdown
  const closeTherapeuticClasses = useCallback((advanceFocus: boolean = false) => {
    setShowTherapeuticClasses(false);
    
    if (advanceFocus) {
      // Advance to Regimen Categories button
      setTimeout(() => {
        regimenButtonRef.current?.focus();
      }, 0);
    } else {
      // Return focus to Therapeutic Classes button
      setTimeout(() => {
        therapeuticButtonRef.current?.focus();
      }, 0);
    }
  }, []);

  // Handle closing regimen categories dropdown
  const closeRegimenCategories = useCallback((advanceFocus: boolean = false) => {
    setShowRegimenCategories(false);
    
    if (advanceFocus) {
      // Advance to next field (Start Date - tabIndex 19)
      setTimeout(() => {
        const nextElement = document.querySelector('[tabIndex="19"]') as HTMLElement;
        nextElement?.focus();
      }, 0);
    } else {
      // Return focus to Regimen Categories button
      setTimeout(() => {
        regimenButtonRef.current?.focus();
      }, 0);
    }
  }, []);

  // No need for these hooks here anymore - they're in the child components

  // Handle button keyboard events
  const handleTherapeuticButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowTherapeuticClasses(!showTherapeuticClasses);
    }
  };

  const handleRegimenButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowRegimenCategories(!showRegimenCategories);
    }
  };

  return (
    <div className="space-y-6">
      {/* Therapeutic Classes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Therapeutic Classes</Label>
        
        <Button
          ref={therapeuticButtonRef}
          id="therapeutic-classes-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowTherapeuticClasses(!showTherapeuticClasses)}
          onKeyDown={handleTherapeuticButtonKeyDown}
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
          <FocusBehaviorProvider>
            <TherapeuticClassesDropdown
              therapeuticClasses={therapeuticClasses}
              selectedTherapeuticClasses={selectedTherapeuticClasses}
              onToggleTherapeuticClass={onToggleTherapeuticClass}
              onClose={closeTherapeuticClasses}
            />
          </FocusBehaviorProvider>
        )}
      </div>

      {/* Regimen Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Regimen Categories</Label>
        
        <Button
          ref={regimenButtonRef}
          id="regimen-categories-button"
          type="button"
          variant="outline"
          className="w-full justify-between min-h-[44px]"
          onClick={() => setShowRegimenCategories(!showRegimenCategories)}
          onKeyDown={handleRegimenButtonKeyDown}
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
          <FocusBehaviorProvider>
            <RegimenCategoriesDropdown
              regimenCategories={regimenCategories}
              selectedRegimenCategories={selectedRegimenCategories}
              onToggleRegimenCategory={onToggleRegimenCategory}
              onClose={closeRegimenCategories}
            />
          </FocusBehaviorProvider>
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
});