import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTabAsArrows } from '@/hooks/useTabAsArrows';

interface RegimenCategoriesDropdownProps {
  regimenCategories: string[];
  selectedRegimenCategories: string[];
  onToggleRegimenCategory: (category: string) => void;
  onClose: (advanceFocus: boolean) => void;
}

/**
 * Regimen Categories dropdown content with isolated keyboard navigation
 * This component must be wrapped in FocusBehaviorProvider to work properly
 */
export const RegimenCategoriesDropdown: React.FC<RegimenCategoriesDropdownProps> = observer(({
  regimenCategories,
  selectedRegimenCategories,
  onToggleRegimenCategory,
  onClose
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const checkboxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Tab as Arrows hook - now inside the FocusBehaviorProvider context
  const { handleKeyDown: handleTabArrows, isActive: tabActive } = useTabAsArrows({
    items: regimenCategories,
    currentIndex: focusedIndex,
    onIndexChange: setFocusedIndex,
    onSelect: () => {
      // Don't close on select, Space will handle toggle
    },
    onEscape: () => onClose(false),
    enabled: true
  });

  // Debug logging
  useEffect(() => {
    console.log('[RegimenCategoriesDropdown] Mounted, tabActive:', tabActive);
  }, [tabActive]);

  // Combined keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggleRegimenCategory(regimenCategories[focusedIndex]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onClose(true); // Advance to next field
    } else if (e.key === 'Escape') {
      // Stop propagation so modal doesn't close
      e.preventDefault();
      e.stopPropagation();
      onClose(false);
    } else {
      handleTabArrows(e);
    }
  }, [focusedIndex, onToggleRegimenCategory, handleTabArrows, onClose, regimenCategories]);

  // Auto-focus first checkbox when opened
  useEffect(() => {
    setTimeout(() => {
      checkboxRefs.current[0]?.focus();
    }, 50);
  }, []);

  // Add keyboard handler in capture phase to intercept before modal
  useEffect(() => {
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      // Only handle if we're inside the dropdown
      const target = e.target as HTMLElement;
      if (!target?.closest('#regimen-categories-list')) return;
      
      // Handle Tab to prevent modal from intercepting
      if (e.key === 'Tab') {
        console.log('[RegimenCategoriesDropdown] Intercepting Tab in capture phase');
        e.preventDefault();
        e.stopPropagation();
        
        const newIndex = e.shiftKey 
          ? (focusedIndex > 0 ? focusedIndex - 1 : regimenCategories.length - 1)
          : (focusedIndex < regimenCategories.length - 1 ? focusedIndex + 1 : 0);
        
        setFocusedIndex(newIndex);
        setTimeout(() => {
          checkboxRefs.current[newIndex]?.focus();
        }, 0);
      }
      // Handle Space for selection
      else if (e.key === ' ' || e.key === 'Space') {
        console.log('[RegimenCategoriesDropdown] Intercepting Space in capture phase for:', regimenCategories[focusedIndex]);
        e.preventDefault();
        e.stopPropagation();
        onToggleRegimenCategory(regimenCategories[focusedIndex]);
      }
    };
    
    // Use capture phase to intercept before bubbling handlers
    document.addEventListener('keydown', handleKeyDownCapture, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDownCapture, true);
    };
  }, [focusedIndex, regimenCategories, onToggleRegimenCategory]);

  return (
    <div className="space-y-2">
      {/* Navigation Instructions */}
      {tabActive && (
        <div className="text-xs text-gray-500 px-4 py-2 bg-gray-50 rounded">
          Tab to navigate • Space to select • Enter to continue • Escape to close
        </div>
      )}
      
      <div 
        ref={listRef}
        id="regimen-categories-list"
        data-modal-id="regimen-categories-list"
        data-focus-context="isolated"
        className="bg-white border rounded-lg p-4 space-y-3"
        role="group"
        aria-label="Regimen categories"
        onKeyDown={handleKeyDown}
      >
        {regimenCategories.map((category, index) => (
          <div
            key={category}
            ref={el => { checkboxRefs.current[index] = el; }}
            className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors ${
              index === focusedIndex ? 'bg-blue-50 outline outline-2 outline-blue-500' : 'hover:bg-gray-50'
            }`}
            role="checkbox"
            aria-checked={selectedRegimenCategories.includes(category)}
            tabIndex={index === focusedIndex ? 0 : -1}
            onClick={(e) => {
              // Prevent double toggle when Space/Enter triggers both click and keydown
              // event.detail is 0 for keyboard-triggered clicks, >0 for mouse clicks
              if (e.detail > 0) {
                onToggleRegimenCategory(category);
              }
            }}
            onFocus={() => setFocusedIndex(index)}
          >
            <Checkbox
              checked={selectedRegimenCategories.includes(category)}
              onCheckedChange={() => onToggleRegimenCategory(category)}
              aria-label={category}
              tabIndex={-1} // Managed by parent div
            />
            <span className="text-sm select-none">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
});