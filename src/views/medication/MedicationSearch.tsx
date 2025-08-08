import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AutocompleteDropdown } from '@/components/ui/autocomplete-dropdown';
import { Medication } from '@/types/models';

interface MedicationSearchProps {
  value: string;
  searchResults: Medication[];
  isLoading: boolean;
  showDropdown: boolean;
  selectedMedication: Medication | null;
  error?: string;
  onSearch: (query: string) => void;
  onSelect: (medication: Medication) => void;
  onClear?: () => void;
  onFieldComplete?: () => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const MedicationSearch = observer(({
  value,
  searchResults,
  isLoading,
  showDropdown,
  selectedMedication,
  error,
  onSearch,
  onSelect,
  onClear,
  onFieldComplete,
  onDropdownOpen
}: MedicationSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (!selectedMedication) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMedication]);

  const handleSelection = (medication: Medication) => {
    onSelect(medication);
    if (onFieldComplete) {
      setTimeout(() => onFieldComplete(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && !selectedMedication && searchResults.length > 0) {
      const exactMatch = searchResults.find(med => 
        med.name.toLowerCase() === value.toLowerCase()
      );
      
      if (exactMatch) {
        handleSelection(exactMatch);
        if (e.key === 'Tab') {
          e.preventDefault(); // Prevent default tab to allow our focus management
        }
      } else {
        const highlightedOptions = searchResults.filter(med =>
          med.name.toLowerCase().startsWith(value.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleSelection(highlightedOptions[0]);
          if (e.key === 'Tab') {
            e.preventDefault(); // Prevent default tab to allow our focus management
          }
        } else if (highlightedOptions.length === 0 && searchResults.length === 1) {
          // If no highlights but only one result, select it
          handleSelection(searchResults[0]);
          if (e.key === 'Tab') {
            e.preventDefault();
          }
        } else if (e.key === 'Enter' && searchResults.length > 0) {
          // Enter key selects first result if multiple exist
          handleSelection(searchResults[0]);
        }
      }
    }
  };

  const isMedicationHighlighted = (medication: Medication) => {
    if (!value) return false;
    return medication.name.toLowerCase().startsWith(value.toLowerCase());
  };

  return (
    <div className="relative" id="medication-search-container" data-testid="medication-search-container">
      <Label htmlFor="medication-name" className="text-base font-medium">
        Medication Name
      </Label>
      <div ref={inputContainerRef} id="medication-search-input-container" className="relative mt-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          ref={inputRef}
          id="medication-name"
          data-testid="medication-search-input"
          type="text"
          value={value}
          onChange={(e) => {
            onSearch(e.target.value);
            if (!selectedMedication && e.target.value) {
              onDropdownOpen?.('medication-search-input-container');
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => {}, 200)}
          placeholder="Start typing medication name..."
          className={`pl-10 ${selectedMedication ? 'border-blue-500 bg-blue-50' : ''} ${error ? 'border-red-500' : ''}`}
          disabled={!!selectedMedication}
          aria-label="Search for medication"
          aria-describedby={error ? "medication-search-error" : undefined}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {selectedMedication && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2 items-center">
            {selectedMedication.flags.isPsychotropic && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Psychotropic
              </Badge>
            )}
            {selectedMedication.flags.isControlled && (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                Controlled
              </Badge>
            )}
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                data-testid="medication-clear-button"
                className="h-8 w-8 p-0"
                aria-label="Clear medication selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id="medication-search-error" className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
      
      {isLoading && (
        <div className="mt-2 text-sm text-gray-600" data-testid="medication-search-loading">
          <span className="inline-block animate-pulse">Searching medications...</span>
        </div>
      )}
      
      <AutocompleteDropdown
        isOpen={showDropdown && !selectedMedication}
        items={searchResults}
        inputRef={inputContainerRef}
        onSelect={handleSelection}
        getItemKey={(med) => med.id}
        isItemHighlighted={isMedicationHighlighted}
        testId="medication-search-dropdown"
        renderItem={(medication, index) => (
          <div className="flex justify-between items-start" data-testid={`medication-search-result-${index}`}>
            <div>
              <div className="font-medium">{medication.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {medication.categories.broad} - {medication.categories.specific}
              </div>
            </div>
            <div className="flex gap-2">
              {medication.flags.isPsychotropic && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  Psychotropic
                </Badge>
              )}
              {medication.flags.isControlled && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  Controlled
                </Badge>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
});