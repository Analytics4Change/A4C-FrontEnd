import { ReactNode } from 'react';

/**
 * Selection method for tracking how an item was selected
 */
export type SelectionMethod = 'keyboard' | 'mouse' | 'touch' | 'programmatic';

/**
 * Base props shared by all dropdown variants
 */
export interface BaseDropdownProps<T> {
  /** Current value */
  value: T | null;
  
  /** Callback when value changes */
  onChange: (value: T, method: SelectionMethod) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Label for the field */
  label?: string;
  
  /** CSS class names */
  className?: string;
  dropdownClassName?: string;
  inputClassName?: string;
  
  /** Accessibility */
  id?: string;
  name?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  /** Rendering */
  renderItem: (item: T, index: number, isHighlighted: boolean) => ReactNode;
  renderSelectedItem?: (item: T) => ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  getItemText: (item: T) => string;
  
  /** Callbacks */
  onFocus?: () => void;
  onBlur?: () => void;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
  
  /** Test IDs */
  testId?: string;
  dropdownTestId?: string;
}

/**
 * Props for static dropdown (no search)
 */
export interface StaticDropdownProps<T> extends BaseDropdownProps<T> {
  variant: 'static';
  
  /** List of items to display */
  items: T[];
  
  /** Allow clearing selection */
  clearable?: boolean;
}

/**
 * Props for autocomplete dropdown (client-side filtering)
 */
export interface AutocompleteDropdownProps<T> extends BaseDropdownProps<T> {
  variant: 'autocomplete';
  
  /** List of all items */
  items: T[];
  
  /** Filter function (defaults to contains) */
  filterItems?: (items: T[], query: string) => T[];
  
  /** Highlight function for visual emphasis */
  isItemHighlighted?: (item: T, query: string) => boolean;
  
  /** Minimum characters before showing results */
  minSearchLength?: number;
  
  /** Allow clearing selection */
  clearable?: boolean;
  
  /** Auto-select on blur if exact match */
  autoSelectOnBlur?: boolean;
}

/**
 * Props for search dropdown (server-side search)
 */
export interface SearchDropdownProps<T> extends BaseDropdownProps<T> {
  variant: 'search';
  
  /** Search function (async) */
  onSearch: (query: string) => Promise<T[]> | T[];
  
  /** Current search results */
  searchResults?: T[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Debounce delay in ms */
  debounceMs?: number;
  
  /** Minimum characters before searching */
  minSearchLength?: number;
  
  /** Allow clearing selection */
  clearable?: boolean;
  
  /** Cache search results */
  cacheResults?: boolean;
}

/**
 * Union type for all dropdown variants
 */
export type UnifiedDropdownProps<T> = 
  | StaticDropdownProps<T>
  | AutocompleteDropdownProps<T>
  | SearchDropdownProps<T>;

/**
 * Strategy interface for dropdown behavior
 */
export interface DropdownStrategy<T> {
  /** Initialize the strategy */
  initialize(): void;
  
  /** Handle input change */
  handleInputChange(value: string): void;
  
  /** Get filtered items to display */
  getFilteredItems(): T[];
  
  /** Check if item is highlighted */
  isItemHighlighted(item: T, index: number): boolean;
  
  /** Handle item selection */
  handleSelect(item: T, method: SelectionMethod): void;
  
  /** Handle blur event */
  handleBlur(): void;
  
  /** Set highlighted index */
  setHighlightedIndex(index: number): void;
  
  /** Clean up */
  cleanup(): void;
}

/**
 * Configuration for dropdown behavior
 */
export interface DropdownConfig {
  /** Enable Tab to navigate like arrows */
  enableTabAsArrows?: boolean;
  
  /** Enable Enter to move to next field */
  enableEnterAsTab?: boolean;
  
  /** Trap focus within dropdown */
  trapFocus?: boolean;
  
  /** Close on selection */
  closeOnSelect?: boolean;
  
  /** Close on escape */
  closeOnEscape?: boolean;
  
  /** Position strategy */
  position?: 'absolute' | 'fixed' | 'portal';
  
  /** Maximum height of dropdown */
  maxHeight?: number | string;
  
  /** Virtual scrolling for large lists */
  virtualScroll?: boolean;
  virtualScrollThreshold?: number;
}

/**
 * Filter modes for autocomplete
 */
export type FilterMode = 'startsWith' | 'contains' | 'fuzzy' | 'custom';

/**
 * Highlight modes for visual emphasis
 */
export type HighlightMode = 'startsWith' | 'exact' | 'none';

/**
 * Dropdown state for external control
 */
export interface DropdownState {
  isOpen: boolean;
  highlightedIndex: number;
  searchQuery: string;
  filteredItems: any[];
}