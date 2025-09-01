import { useCallback, useEffect } from 'react';
import { useFocusBehavior } from '@/contexts/FocusBehaviorContext';

/**
 * Options for useTabAsArrows hook
 */
interface UseTabAsArrowsOptions<T> {
  items: T[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSelect: (item: T, method: 'keyboard' | 'mouse') => void;
  onEscape?: () => void;
  enabled?: boolean;
  wrap?: boolean; // Whether to wrap around at start/end
}

/**
 * Hook that makes Tab/Shift+Tab behave like arrow keys in dropdowns
 * Tab → Next item (like Arrow Down)
 * Shift+Tab → Previous item (like Arrow Up)
 * Enter → Select current item
 * Escape → Close dropdown
 * 
 * This hook is mutually exclusive with useEnterAsTab - they cannot be used
 * in the same focus context.
 */
export function useTabAsArrows<T>({
  items,
  currentIndex,
  onIndexChange,
  onSelect,
  onEscape,
  enabled = true,
  wrap = true
}: UseTabAsArrowsOptions<T>) {
  // Register this behavior with the focus context
  const isActive = useFocusBehavior('tab-as-arrows', enabled && items.length > 0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Debug logging for Tab key
    if (e.key === 'Tab') {
      console.log(`[useTabAsArrows] Tab pressed: isActive=${isActive}, enabled=${enabled}, items=${items.length}`);
    }
    
    // Only handle if behavior is active
    if (!isActive || !enabled || items.length === 0) {
      if (e.key === 'Tab') {
        console.log(`[useTabAsArrows] Tab NOT handled due to: isActive=${isActive}, enabled=${enabled}, items=${items.length}`);
      }
      return;
    }

    switch (e.key) {
      case 'Tab':
        console.log(`[useTabAsArrows] Preventing Tab default!`);
        e.preventDefault();
        e.stopPropagation();
        
        if (e.shiftKey) {
          // Shift+Tab - move up like Arrow Up
          const prevIndex = currentIndex > 0 
            ? currentIndex - 1 
            : wrap ? items.length - 1 : currentIndex;
          
          if (prevIndex !== currentIndex) {
            onIndexChange(prevIndex);
          }
        } else {
          // Tab - move down like Arrow Down
          const nextIndex = currentIndex < items.length - 1 
            ? currentIndex + 1 
            : wrap ? 0 : currentIndex;
          
          if (nextIndex !== currentIndex) {
            onIndexChange(nextIndex);
          }
        }
        break;

      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        
        if (items[currentIndex]) {
          onSelect(items[currentIndex], 'keyboard');
        }
        break;

      case 'Escape':
        console.log(`[useTabAsArrows] Escape pressed, onEscape defined: ${!!onEscape}`);
        e.preventDefault();
        e.stopPropagation();
        
        if (onEscape) {
          console.log(`[useTabAsArrows] Calling onEscape`);
          try {
            onEscape();
            console.log(`[useTabAsArrows] onEscape completed`);
          } catch (error) {
            console.error(`[useTabAsArrows] Error calling onEscape:`, error);
          }
        }
        break;

      // Also handle arrow keys for consistency
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 
          ? currentIndex + 1 
          : wrap ? 0 : currentIndex;
        
        if (nextIndex !== currentIndex) {
          onIndexChange(nextIndex);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 
          ? currentIndex - 1 
          : wrap ? items.length - 1 : currentIndex;
        
        if (prevIndex !== currentIndex) {
          onIndexChange(prevIndex);
        }
        break;

      case 'Home':
        e.preventDefault();
        if (currentIndex !== 0) {
          onIndexChange(0);
        }
        break;

      case 'End':
        e.preventDefault();
        const lastIndex = items.length - 1;
        if (currentIndex !== lastIndex) {
          onIndexChange(lastIndex);
        }
        break;
    }
  }, [isActive, enabled, items, currentIndex, onIndexChange, onSelect, onEscape, wrap]);

  // Log when behavior conflicts occur
  useEffect(() => {
    if (enabled && items.length > 0 && !isActive) {
      // Temporarily disabled - false positive with isolated FocusBehaviorProvider
      // console.warn(
      //   '[useTabAsArrows] Hook is enabled but behavior is not active. ' +
      //   'This may be due to a conflict with useEnterAsTab in the same focus context.'
      // );
    }
  }, [enabled, items.length, isActive]);

  return {
    handleKeyDown,
    isActive,
    behaviorType: 'tab-as-arrows' as const
  };
}

/**
 * Simplified version that returns just the keydown handler
 * for backward compatibility
 */
export function useTabAsArrowsSimple<T>(
  options: UseTabAsArrowsOptions<T>
): (e: React.KeyboardEvent) => void {
  const { handleKeyDown } = useTabAsArrows(options);
  return handleKeyDown;
}