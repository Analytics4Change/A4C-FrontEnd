import React from 'react';
import { UnifiedDropdown } from './UnifiedDropdown';
import type { 
  UnifiedDropdownProps, 
  AutocompleteDropdownProps as UnifiedAutocompleteProps,
  SearchDropdownProps as UnifiedSearchProps,
  SelectionMethod,
  DropdownConfig 
} from './types';
import type { SearchableDropdownProps } from '../searchable-dropdown';

// Define the AutocompleteDropdownProps type based on actual usage
interface AutocompleteDropdownProps<T> {
  isOpen: boolean;
  items: T[];
  inputRef: React.RefObject<HTMLDivElement | HTMLInputElement | null>;
  onSelect: (item: T, method: 'keyboard' | 'mouse') => void;
  renderItem: (item: T, index: number, isHighlighted: boolean) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  isItemHighlighted?: (item: T) => boolean;
  className?: string;
  testId?: string;
  modalId?: string;
}

/**
 * Migration wrapper for AutocompleteDropdown
 * Maps old AutocompleteDropdown props to UnifiedDropdown
 */
export function AutocompleteDropdownMigration<T>(
  props: AutocompleteDropdownProps<T>
): React.ReactElement {
  const {
    isOpen,
    items,
    inputRef,
    onSelect,
    renderItem,
    getItemKey,
    isItemHighlighted,
    className,
    testId,
    modalId,
    ...rest
  } = props;
  
  // Map to unified props
  const unifiedProps: UnifiedAutocompleteProps<T> = {
    variant: 'autocomplete',
    value: null, // AutocompleteDropdown doesn't track selected value
    onChange: (item, method) => {
      // Map our SelectionMethod to the expected type
      const mappedMethod = method === 'touch' ? 'mouse' : method === 'programmatic' ? 'keyboard' : method;
      onSelect(item, mappedMethod as 'keyboard' | 'mouse');
    },
    items,
    renderItem,
    getItemKey,
    getItemText: (item) => String(item),
    isItemHighlighted: isItemHighlighted ? 
      (item: T, query: string) => isItemHighlighted(item) : 
      undefined,
    className,
    testId,
    clearable: false,
    autoSelectOnBlur: true,
    ...rest
  };
  
  return <UnifiedDropdown {...unifiedProps} />;
}

/**
 * Migration wrapper for SearchableDropdown
 * Maps old SearchableDropdown props to UnifiedDropdown
 */
export function SearchableDropdownMigration<T>(
  props: SearchableDropdownProps<T>
): React.ReactElement {
  const {
    value,
    selectedItem,
    searchResults,
    isLoading,
    showDropdown,
    onSearch,
    onSelect,
    onClear,
    minSearchLength = 2,
    debounceMs,
    placeholder,
    error,
    renderItem,
    renderSelectedItem,
    getItemKey,
    getItemText = (item) => String(item),
    className,
    dropdownClassName,
    inputClassName,
    onFieldComplete,
    onDropdownOpen,
    inputId,
    dropdownId,
    label,
    required,
    tabIndex,
    autoFocus,
    enableTabAsArrows,
    ...rest
  } = props;
  
  // Map to unified props  
  const unifiedProps: UnifiedSearchProps<T> & { config?: DropdownConfig } = {
    variant: 'search',
    value: selectedItem || null,
    onChange: (item, method) => {
      // Map our SelectionMethod to the expected type
      const mappedMethod = method === 'touch' ? 'mouse' : method as 'keyboard' | 'mouse';
      onSelect(item, mappedMethod);
      onFieldComplete?.();
    },
    onSearch: async (query) => {
      onSearch(query);
      // SearchableDropdown expects results to be passed as prop
      // This is handled differently in UnifiedDropdown
      return searchResults || [];
    },
    searchResults,
    isLoading,
    debounceMs,
    minSearchLength,
    placeholder,
    error,
    renderItem,
    renderSelectedItem,
    getItemKey,
    getItemText,
    className,
    dropdownClassName,
    inputClassName,
    id: inputId,
    label,
    required,
    tabIndex,
    autoFocus,
    onDropdownOpen: onDropdownOpen ? () => onDropdownOpen('') : undefined,
    clearable: true,
    testId: inputId,
    dropdownTestId: dropdownId,
    config: {
      enableTabAsArrows,
      closeOnSelect: true,
      closeOnEscape: true
    },
    ...rest
  };
  
  return <UnifiedDropdown {...unifiedProps} />;
}

/**
 * Helper function to determine which migration wrapper to use
 */
export function migrateDropdownProps<T>(
  component: 'autocomplete' | 'searchable',
  props: any
): UnifiedDropdownProps<T> {
  if (component === 'autocomplete') {
    return AutocompleteDropdownMigration(props) as any;
  } else {
    return SearchableDropdownMigration(props) as any;
  }
}

/**
 * Drop-in replacement for AutocompleteDropdown
 * Use this to gradually migrate without changing imports
 */
export const AutocompleteDropdown = AutocompleteDropdownMigration;

/**
 * Drop-in replacement for SearchableDropdown
 * Use this to gradually migrate without changing imports
 */
export const SearchableDropdown = SearchableDropdownMigration;