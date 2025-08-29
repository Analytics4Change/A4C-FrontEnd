import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface MedicationSearchProps {
  value: string;
  searchResults: any[];
  isLoading: boolean;
  showDropdown: boolean;
  selectedMedication: any;
  error?: string;
  onSearch: (query: string) => void;
  onSelect: (medication: any) => void;
  onClear: () => void;
  onFieldComplete?: () => void;
  onDropdownOpen?: (elementId: string) => void;
}

export const MedicationSearch: React.FC<MedicationSearchProps> = ({
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
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Handle search with debouncing
  const handleSearch = (searchValue: string) => {
    setLocalValue(searchValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      if (searchValue.length >= 2) {
        onSearch(searchValue);
        if (onDropdownOpen) {
          onDropdownOpen('medication-dropdown');
        }
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab trapping even when dropdown is open
    if (e.key === 'Tab' && showDropdown && searchResults.length > 0) {
      e.preventDefault();
      // Move selection like arrow keys
      if (e.shiftKey) {
        // Shift+Tab - move up
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else {
        // Tab - move down
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }
    
    if (!showDropdown || searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (searchResults[highlightedIndex]) {
          handleSelect(searchResults[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        if (showDropdown && searchResults.length > 0) {
          // If dropdown is open, just close it without propagating
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex(0);
          // Clear search but keep focus
          setLocalValue('');
          onSearch('');
        }
        // If dropdown is not open, let the event bubble up to close the modal
        break;
      
      // Prevent other navigation keys from leaving focus context
      case 'PageUp':
      case 'PageDown':
      case 'Home':
      case 'End':
        if (showDropdown && searchResults.length > 0) {
          e.preventDefault();
          if (e.key === 'Home') {
            setHighlightedIndex(0);
          } else if (e.key === 'End') {
            setHighlightedIndex(searchResults.length - 1);
          }
        }
        break;
    }
  };

  const handleSelect = (medication: any) => {
    onSelect(medication);
    setLocalValue('');
    setHighlightedIndex(0);
    if (onFieldComplete) {
      onFieldComplete();
    }
    // After selection, focus moves naturally through tab order
    // No need to force focus since the modal will handle the flow
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (showDropdown && listItemRefs.current[highlightedIndex]) {
      listItemRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [highlightedIndex, showDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is outside both the input and dropdown
      if (
        showDropdown && 
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        // Close dropdown on outside click
        setLocalValue('');
        onSearch('');
        setHighlightedIndex(0);
      }
    };

    if (showDropdown && searchResults.length > 0) {
      // Add a small delay to avoid immediate triggering
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown, searchResults.length, onSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <Label htmlFor="medication-search" className="text-sm font-medium">
        Medication Name <span className="text-red-500">*</span>
      </Label>
      
      {/* Selected Medication Display */}
      {selectedMedication && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Check className="text-green-600" size={20} />
                <span className="font-semibold text-gray-900">
                  {selectedMedication.name}
                </span>
              </div>
              {selectedMedication.genericName && (
                <p className="text-sm text-gray-600 mb-1">
                  Generic: {selectedMedication.genericName}
                </p>
              )}
              {selectedMedication.dosageStrength && (
                <p className="text-sm text-gray-600">
                  Strength: {selectedMedication.dosageStrength}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Clear medication selection"
              tabIndex={1}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!selectedMedication && (
        <>
          <div className="relative z-40">
            <Input
              ref={inputRef}
              id="medication-search"
              type="text"
              value={localValue}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type medication name..."
              className={`pr-10 relative z-50 ${error ? 'border-red-500' : ''}`}
              aria-label="Search for medication"
              aria-describedby={error ? 'medication-error' : undefined}
              aria-invalid={!!error}
              aria-autocomplete="list"
              aria-controls={showDropdown ? 'medication-dropdown' : undefined}
              aria-expanded={showDropdown}
              aria-activedescendant={showDropdown && searchResults.length > 0 ? `medication-option-${highlightedIndex}` : undefined}
              autoComplete="off"
              tabIndex={1}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-50">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <Search size={16} className="text-gray-400" />
              )}
            </div>
            
            {/* Search Results Dropdown - Positioned below input */}
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                id="medication-dropdown"
                data-modal-id="medication-search-results"
                className="absolute z-30 w-full left-0 right-0 mt-12 bg-white border rounded-lg shadow-xl max-h-[400px] overflow-y-auto"
                role="listbox"
                aria-label="Medication search results"
              >
              {searchResults.map((result, index) => (
                <button
                  key={result.id || index}
                  ref={el => { listItemRefs.current[index] = el; }}
                  id={`medication-option-${index}`}
                  type="button"
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 transition-colors ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  } ${index !== searchResults.length - 1 ? 'border-b' : ''}`}
                  onClick={() => handleSelect(result)}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <div className="font-medium text-gray-900">{result.name}</div>
                  {result.genericName && (
                    <div className="text-sm text-gray-600">
                      Generic: {result.genericName}
                    </div>
                  )}
                  {result.dosageStrength && (
                    <div className="text-sm text-gray-500">
                      {result.dosageStrength}
                    </div>
                  )}
                </button>
              ))}
            </div>
            )}

            {/* No Results Message - Positioned below input */}
            {showDropdown && searchResults.length === 0 && !isLoading && localValue.length >= 2 && (
              <div className="absolute z-30 w-full left-0 right-0 mt-12 bg-white border rounded-lg shadow-xl p-4">
                <p className="text-gray-500 text-sm text-center">
                  No medications found matching "{localValue}"
                </p>
              </div>
            )}
          </div>

          {/* Error Display - Outside relative container */}
          {error && (
            <p id="medication-error" className="text-red-600 text-sm mt-1">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
};