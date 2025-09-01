import { DropdownStrategy, UnifiedDropdownProps, FilterMode, SelectionMethod } from './types';

/**
 * Base strategy class with common functionality
 */
export abstract class BaseDropdownStrategy<T> implements DropdownStrategy<T> {
  protected props: UnifiedDropdownProps<T>;
  protected searchQuery: string = '';
  protected highlightedIndex: number = -1;
  protected filteredItems: T[] = [];
  
  constructor(props: UnifiedDropdownProps<T>) {
    this.props = props;
  }
  
  initialize(): void {
    this.searchQuery = '';
    this.highlightedIndex = -1;
    this.updateFilteredItems();
  }
  
  abstract handleInputChange(value: string): void;
  abstract updateFilteredItems(): void;
  
  getFilteredItems(): T[] {
    return this.filteredItems;
  }
  
  isItemHighlighted(item: T, index: number): boolean {
    return index === this.highlightedIndex;
  }
  
  handleSelect(item: T, method: SelectionMethod): void {
    this.props.onChange(item, method);
    this.searchQuery = '';
    this.highlightedIndex = -1;
    this.filteredItems = [];
  }
  
  handleBlur(): void {
    // Base implementation - can be overridden
  }
  
  cleanup(): void {
    this.searchQuery = '';
    this.highlightedIndex = -1;
    this.filteredItems = [];
  }
  
  setHighlightedIndex(index: number): void {
    this.highlightedIndex = index;
  }
}

/**
 * Strategy for static dropdown (no search)
 */
export class StaticDropdownStrategy<T> extends BaseDropdownStrategy<T> {
  handleInputChange(value: string): void {
    // Static dropdown doesn't handle input changes
  }
  
  updateFilteredItems(): void {
    if (this.props.variant === 'static') {
      this.filteredItems = this.props.items;
    }
  }
  
  initialize(): void {
    super.initialize();
    this.updateFilteredItems();
  }
}

/**
 * Strategy for autocomplete dropdown (client-side filtering)
 */
export class AutocompleteDropdownStrategy<T> extends BaseDropdownStrategy<T> {
  private filterMode: FilterMode = 'contains';
  
  handleInputChange(value: string): void {
    this.searchQuery = value;
    this.updateFilteredItems();
    this.highlightedIndex = -1;
  }
  
  updateFilteredItems(): void {
    if (this.props.variant !== 'autocomplete') return;
    
    const { items, filterItems, minSearchLength = 0 } = this.props;
    
    if (this.searchQuery.length < minSearchLength) {
      this.filteredItems = [];
      return;
    }
    
    if (filterItems) {
      this.filteredItems = filterItems(items, this.searchQuery);
    } else {
      // Default filtering (contains)
      this.filteredItems = this.defaultFilter(items, this.searchQuery);
    }
  }
  
  private defaultFilter(items: T[], query: string): T[] {
    if (!query) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const text = this.props.getItemText(item).toLowerCase();
      return text.includes(lowerQuery);
    });
  }
  
  isItemHighlighted(item: T, index: number): boolean {
    // Check both keyboard navigation and visual highlighting
    if (index === this.highlightedIndex) return true;
    
    if (this.props.variant === 'autocomplete' && this.props.isItemHighlighted) {
      return this.props.isItemHighlighted(item, this.searchQuery);
    }
    
    return false;
  }
  
  handleBlur(): void {
    if (this.props.variant !== 'autocomplete') return;
    
    const { autoSelectOnBlur = true } = this.props;
    
    if (autoSelectOnBlur && this.searchQuery && this.filteredItems.length > 0) {
      // Check for exact match
      const exactMatch = this.filteredItems.find(item => {
        const text = this.props.getItemText(item);
        return text.toLowerCase() === this.searchQuery.toLowerCase();
      });
      
      if (exactMatch) {
        this.handleSelect(exactMatch, 'keyboard');
      } else if (this.filteredItems.length === 1) {
        // Auto-select single result
        this.handleSelect(this.filteredItems[0], 'keyboard');
      }
    }
  }
}

/**
 * Strategy for search dropdown (server-side search)
 */
export class SearchDropdownStrategy<T> extends BaseDropdownStrategy<T> {
  private searchPromise: Promise<void> | null = null;
  private searchCache: Map<string, T[]> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  
  handleInputChange(value: string): void {
    this.searchQuery = value;
    
    if (this.props.variant !== 'search') return;
    
    const { debounceMs = 300, minSearchLength = 2 } = this.props;
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    if (value.length < minSearchLength) {
      this.filteredItems = [];
      return;
    }
    
    // Check cache first
    if (this.props.cacheResults && this.searchCache.has(value)) {
      this.filteredItems = this.searchCache.get(value) || [];
      return;
    }
    
    // Debounced search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(value);
    }, debounceMs);
  }
  
  private async performSearch(query: string): Promise<void> {
    if (this.props.variant !== 'search') return;
    
    try {
      const results = await this.props.onSearch(query);
      
      // Only update if this is still the current query
      if (this.searchQuery === query) {
        this.filteredItems = results;
        
        // Cache results if enabled
        if (this.props.cacheResults) {
          this.searchCache.set(query, results);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      this.filteredItems = [];
    }
  }
  
  updateFilteredItems(): void {
    if (this.props.variant === 'search' && this.props.searchResults) {
      this.filteredItems = this.props.searchResults;
    }
  }
  
  cleanup(): void {
    super.cleanup();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.searchCache.clear();
  }
}

/**
 * Factory function to create the appropriate strategy
 */
export function createDropdownStrategy<T>(props: UnifiedDropdownProps<T>): DropdownStrategy<T> {
  switch (props.variant) {
    case 'static':
      return new StaticDropdownStrategy(props);
    case 'autocomplete':
      return new AutocompleteDropdownStrategy(props);
    case 'search':
      return new SearchDropdownStrategy(props);
    default:
      throw new Error(`Unknown dropdown variant: ${(props as any).variant}`);
  }
}