import { useState, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoCompleteOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minChars?: number;
  onSelect?: (item: T) => void;
}

export function useAutoComplete<T>({
  searchFn,
  debounceMs = 300,
  minChars = 2,
  onSelect
}: UseAutoCompleteOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const items = await searchFn(searchQuery);
      setResults(items);
      setShowDropdown(true);
      setHighlightedIndex(-1);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Autocomplete search failed:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchFn, minChars]);

  const debouncedSearch = useDebounce(performSearch, debounceMs);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSelect = useCallback((item: T) => {
    setShowDropdown(false);
    setHighlightedIndex(-1);
    onSelect?.(item);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        } else if (results.length === 1) {
          handleSelect(results[0]);
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [showDropdown, results, highlightedIndex, handleSelect]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }, 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (results.length > 0 && query.length >= minChars) {
      setShowDropdown(true);
    }
  }, [results, query, minChars]);

  return {
    query,
    results,
    isLoading,
    showDropdown,
    highlightedIndex,
    handleInputChange,
    handleSelect,
    handleKeyDown,
    handleBlur,
    handleFocus,
    setShowDropdown
  };
}