import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Check, X, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useSingleDropdown } from '@/hooks/useDropdownManager';
import { DropdownPortal } from '@/components/ui/dropdown-portal';
import { 
  UnifiedDropdownProps, 
  SelectionMethod,
  DropdownConfig 
} from './types';
import { createDropdownStrategy } from './strategies';

/**
 * Unified dropdown component that handles static, autocomplete, and search variants
 * Uses strategy pattern to encapsulate variant-specific behavior
 */
type UnifiedDropdownWithConfig<T> = UnifiedDropdownProps<T> & {
  config?: DropdownConfig;
};

export function UnifiedDropdown<T>(
  props: UnifiedDropdownWithConfig<T>
) {
  // Extract common props that exist in all variants
  const baseProps = props as any; // Type assertion to work with union
  const {
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    error,
    required = false,
    label,
    className,
    dropdownClassName,
    inputClassName,
    id,
    name,
    tabIndex = 0,
    autoFocus = false,
    renderItem,
    renderSelectedItem,
    getItemKey,
    getItemText,
    onFocus,
    onBlur,
    onDropdownOpen,
    onDropdownClose,
    testId = 'unified-dropdown',
    dropdownTestId = 'unified-dropdown-list',
    config = {}
  } = baseProps;
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // State
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Create strategy based on variant
  const strategy = useMemo(() => {
    const strat = createDropdownStrategy(props);
    strat.initialize();
    return strat;
  }, [props.variant]);
  
  // Dropdown state management
  const dropdown = useSingleDropdown({
    onOpen: () => onDropdownOpen?.(),
    onClose: () => onDropdownClose?.()
  });
  
  // Get filtered items from strategy
  const filteredItems = strategy.getFilteredItems();
  
  // Track dropdown position
  const shouldShowDropdown = dropdown.isOpen && filteredItems.length > 0;
  const dropdownPosition = useDropdownPosition(inputRef, shouldShowDropdown);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    strategy.handleInputChange(value);
    
    // Open dropdown if we have results
    if (value && !dropdown.isOpen) {
      dropdown.open();
    }
  }, [strategy, dropdown]);
  
  // Handle item selection
  const handleSelect = useCallback((item: T, method: SelectionMethod) => {
    strategy.handleSelect(item, method);
    setInputValue('');
    setHighlightedIndex(-1);
    dropdown.close();
  }, [strategy, dropdown]);
  
  // Handle clear selection
  const handleClear = useCallback(() => {
    onChange(null as T, 'programmatic');
    setInputValue('');
    strategy.cleanup();
    dropdown.close();
  }, [onChange, strategy, dropdown]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!dropdown.isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        dropdown.open();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex], 'keyboard');
        } else if (filteredItems.length === 1) {
          handleSelect(filteredItems[0], 'keyboard');
        } else {
          // Check for visually highlighted item
          const visuallyHighlighted = filteredItems.find((item, index) => 
            strategy.isItemHighlighted(item, index)
          );
          if (visuallyHighlighted) {
            handleSelect(visuallyHighlighted, 'keyboard');
          }
        }
        break;
        
      case 'Escape':
        if (config.closeOnEscape !== false) {
          e.preventDefault();
          dropdown.close();
          setInputValue('');
        }
        break;
        
      case 'Tab':
        if (config.enableTabAsArrows && dropdown.isOpen) {
          e.preventDefault();
          if (e.shiftKey) {
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredItems.length - 1
            );
          } else {
            setHighlightedIndex(prev => 
              prev < filteredItems.length - 1 ? prev + 1 : 0
            );
          }
        }
        break;
    }
  }, [dropdown, filteredItems, highlightedIndex, handleSelect, strategy, config]);
  
  // Update strategy's highlighted index
  useEffect(() => {
    strategy.setHighlightedIndex(highlightedIndex);
  }, [highlightedIndex, strategy]);
  
  // Scroll highlighted item into view
  useEffect(() => {
    if (shouldShowDropdown && listItemRefs.current[highlightedIndex]) {
      listItemRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [highlightedIndex, shouldShowDropdown]);
  
  // Handle blur
  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    strategy.handleBlur();
    dropdown.blur(e);
    onBlur?.();
  }, [strategy, dropdown, onBlur]);
  
  // Determine if clearable
  const isClearable = () => {
    if ('clearable' in props) {
      return props.clearable && value !== null;
    }
    return false;
  };
  
  // Determine if we should show search input
  const showSearchInput = () => {
    return props.variant !== 'static' && !value;
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      {/* Selected value display */}
      {value && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {renderSelectedItem ? (
                renderSelectedItem(value)
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  <span className="font-semibold text-gray-900">
                    {getItemText(value)}
                  </span>
                </div>
              )}
            </div>
            {isClearable() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={tabIndex + 1}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Input field */}
      {(!value || props.variant === 'static') && (
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              dropdown.open();
              onFocus?.();
            }}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={props.variant === 'static'}
            className={cn(
              'pr-10',
              error && 'border-red-500 focus:border-red-500',
              inputClassName
            )}
            aria-label={props['aria-label'] || label}
            aria-describedby={error ? `${id}-error` : props['aria-describedby']}
            aria-invalid={!!error}
            aria-autocomplete={props.variant === 'static' ? undefined : 'list'}
            aria-controls={shouldShowDropdown ? dropdownTestId : undefined}
            aria-expanded={shouldShowDropdown}
            autoComplete="off"
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            data-testid={testId}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {props.variant === 'search' && props.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
            ) : props.variant === 'static' ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <Search size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
      
      {/* Dropdown */}
      {shouldShowDropdown && (
        <DropdownPortal isOpen={true}>
          <div
            ref={dropdownRef}
            data-testid={dropdownTestId}
            className={cn(
              'fixed bg-white border border-gray-200 rounded-lg shadow-xl',
              'max-h-60 overflow-y-auto z-[10000]',
              dropdownClassName
            )}
            style={{
              top: `${dropdownPosition.top + 4}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: config.maxHeight || '240px'
            }}
            role="listbox"
            aria-label="Options"
          >
            {filteredItems.map((item, index) => {
              const isHighlighted = highlightedIndex === index || 
                                   strategy.isItemHighlighted(item, index);
              return (
                <div
                  key={getItemKey(item, index)}
                  ref={el => { listItemRefs.current[index] = el; }}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50',
                    index !== filteredItems.length - 1 && 'border-b border-gray-100'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item, 'mouse');
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={isHighlighted}
                >
                  {renderItem(item, index, isHighlighted)}
                </div>
              );
            })}
          </div>
        </DropdownPortal>
      )}
    </div>
  );
}

export default UnifiedDropdown;