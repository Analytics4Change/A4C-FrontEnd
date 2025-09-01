import React, { useRef, useEffect } from 'react';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { DropdownPortal } from './dropdown-portal';
import { cn } from './utils';

export type SelectionMethod = 'keyboard' | 'mouse';

interface AutocompleteDropdownProps<T> {
  isOpen: boolean;
  items: T[];
  inputRef: React.RefObject<HTMLDivElement | HTMLInputElement | null>;
  onSelect: (item: T, method: SelectionMethod) => void;
  renderItem: (item: T, index: number, isHighlighted: boolean) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  isItemHighlighted?: (item: T) => boolean;
  className?: string;
  testId?: string;
  modalId?: string;
}

export function AutocompleteDropdown<T>({
  isOpen,
  items,
  inputRef,
  onSelect,
  renderItem,
  getItemKey,
  isItemHighlighted = () => false,
  className,
  testId = 'autocomplete-dropdown',
  modalId
}: AutocompleteDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const dropdownPosition = useDropdownPosition(inputRef, isOpen && items.length > 0);

  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const handleKeyDown = (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      switch (keyEvent.key) {
        case 'ArrowDown':
          keyEvent.preventDefault();
          setHighlightedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          keyEvent.preventDefault();
          setHighlightedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
          break;
        case 'Enter':
          keyEvent.preventDefault();
          // Auto-select if only one item or if an item is highlighted
          if (items.length === 1) {
            onSelect(items[0], 'keyboard');
          } else if (highlightedIndex >= 0 && highlightedIndex < items.length) {
            onSelect(items[highlightedIndex], 'keyboard');
          } else {
            // If no item is highlighted via keyboard navigation (highlightedIndex is -1),
            // check if there's a visually highlighted item (via isItemHighlighted)
            const visuallyHighlightedItem = items.find(item => isItemHighlighted?.(item));
            if (visuallyHighlightedItem) {
              onSelect(visuallyHighlightedItem, 'keyboard');
            }
          }
          break;
        case 'Escape':
          keyEvent.preventDefault();
          // Let the parent component handle closing
          inputRef.current?.blur();
          break;
        case 'Tab':
          // Allow tab to move focus naturally, which will trigger blur
          // The blur handler will auto-select if there's an exact match
          break;
      }
    };

    // Add event listener to the input element
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
      return () => inputElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, items, highlightedIndex, onSelect, inputRef]);

  // Auto-select exact match on blur (Tab key behavior)
  useEffect(() => {
    if (!inputRef.current) return;

    const handleBlur = (e: Event) => {
      // Only auto-select if dropdown is open and we have items
      if (!isOpen || items.length === 0) return;

      // Get the current input value
      const inputElement = e.target as HTMLInputElement;
      const inputValue = inputElement.value?.trim();
      
      if (!inputValue) return;

      // Check for exact match (case-insensitive)
      const exactMatch = items.find(item => {
        // Convert item to string for comparison
        const itemString = typeof item === 'string' 
          ? item 
          : (item as any).toString?.() || '';
        return itemString.toLowerCase() === inputValue.toLowerCase();
      });

      if (exactMatch) {
        // Auto-select the exact match
        // Use a small delay to ensure blur handlers in parent components run after selection
        setTimeout(() => {
          onSelect(exactMatch, 'keyboard');
        }, 0);
      } else if (items.length === 1) {
        // If only one item matches the filter and user typed something, select it
        // This handles cases like typing "m" when only "mg" is available
        setTimeout(() => {
          onSelect(items[0], 'keyboard');
        }, 0);
      }
    };

    const inputElement = inputRef.current;
    inputElement.addEventListener('blur', handleBlur);
    
    return () => {
      inputElement.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, items, onSelect, inputRef]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (isOpen && dropdownRef.current && highlightedIndex >= 0) {
      const highlightedItem = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  if (!isOpen || items.length === 0) return null;

  return (
    <DropdownPortal isOpen={isOpen && items.length > 0}>
      <div
        ref={dropdownRef}
        data-testid={testId}
        {...(modalId && { 'data-modal-id': modalId })}
        className={cn(
          "fixed bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[10000]",
          className
        )}
        style={{
          top: `${dropdownPosition.top + 4}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
        role="listbox"
        aria-label="Search results"
      >
        {items.map((item, index) => {
        const isHighlighted = highlightedIndex === index || isItemHighlighted(item);
        return (
          <div
            key={getItemKey(item, index)}
            className={cn(
              "px-4 py-3 cursor-pointer transition-all duration-200 min-h-[44px] border-b border-gray-100 last:border-b-0",
              isHighlighted 
                ? "highlighted-item bg-blue-50 text-blue-700 font-medium border-l-4 border-l-blue-500" 
                : "hover:bg-gray-50"
            )}
            onMouseDown={(e) => {
              // Prevent the blur event from firing
              e.preventDefault();
              onSelect(item, 'mouse');
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            role="option"
            aria-selected={isHighlighted}
            tabIndex={-1}
          >
            {renderItem(item, index, isHighlighted)}
          </div>
        );
      })}
      </div>
    </DropdownPortal>
  );
}