import React, { useRef, useEffect } from 'react';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { cn } from './utils';

interface AutocompleteDropdownProps<T> {
  isOpen: boolean;
  items: T[];
  inputRef: React.RefObject<HTMLDivElement | HTMLInputElement | null>;
  onSelect: (item: T) => void;
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
  const dropdownPosition = useDropdownPosition(inputRef, isOpen && items.length > 0);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedItem = dropdownRef.current.querySelector('.highlighted-item');
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isOpen, items]);

  if (!isOpen || items.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      data-testid={testId}
      {...(modalId && { 'data-modal-id': modalId })}
      className={cn(
        "fixed bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[100]",
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
        const isHighlighted = isItemHighlighted(item);
        return (
          <div
            key={getItemKey(item, index)}
            className={cn(
              "px-4 py-3 cursor-pointer transition-all duration-200 min-h-[44px] border-b border-gray-100 last:border-b-0",
              isHighlighted 
                ? "highlighted-item bg-blue-50 text-blue-700 font-medium border-l-4 border-l-blue-500" 
                : "hover:bg-gray-50"
            )}
            onClick={() => onSelect(item)}
            role="option"
            aria-selected={isHighlighted}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(item);
              }
            }}
          >
            {renderItem(item, index, isHighlighted)}
          </div>
        );
      })}
    </div>
  );
}