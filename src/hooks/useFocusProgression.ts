import { useRef, useCallback } from 'react';

interface FocusableElement {
  id: string;
  ref: React.RefObject<HTMLElement>;
  isComplete: boolean;
}

export function useFocusProgression() {
  const focusOrder = useRef<FocusableElement[]>([]);

  const registerField = useCallback((
    id: string, 
    ref: React.RefObject<HTMLElement>, 
    isComplete: boolean
  ) => {
    const existingIndex = focusOrder.current.findIndex(f => f.id === id);
    if (existingIndex !== -1) {
      focusOrder.current[existingIndex] = { id, ref, isComplete };
    } else {
      focusOrder.current.push({ id, ref, isComplete });
    }
  }, []);

  const focusNext = useCallback((currentId: string) => {
    const currentIndex = focusOrder.current.findIndex(f => f.id === currentId);
    if (currentIndex === -1) return;

    // Find next incomplete field
    for (let i = currentIndex + 1; i < focusOrder.current.length; i++) {
      const field = focusOrder.current[i];
      if (!field.isComplete && field.ref.current) {
        // Focus the input element within the container if it exists
        const input = field.ref.current.querySelector('input, select, textarea') as HTMLElement;
        if (input) {
          setTimeout(() => {
            input.focus();
            // Trigger click to open dropdown if it's a dropdown field
            if (input.getAttribute('role') === 'combobox') {
              input.click();
            }
          }, 100);
        } else {
          setTimeout(() => field.ref.current?.focus(), 100);
        }
        break;
      }
    }
  }, []);

  const focusPrevious = useCallback((currentId: string) => {
    const currentIndex = focusOrder.current.findIndex(f => f.id === currentId);
    if (currentIndex <= 0) return;

    // Find previous field
    for (let i = currentIndex - 1; i >= 0; i--) {
      const field = focusOrder.current[i];
      if (field.ref.current) {
        const input = field.ref.current.querySelector('input, select, textarea') as HTMLElement;
        if (input) {
          setTimeout(() => input.focus(), 100);
        } else {
          setTimeout(() => field.ref.current?.focus(), 100);
        }
        break;
      }
    }
  }, []);

  const focusFirst = useCallback(() => {
    const firstIncomplete = focusOrder.current.find(f => !f.isComplete && f.ref.current);
    if (firstIncomplete?.ref.current) {
      const input = firstIncomplete.ref.current.querySelector('input, select, textarea') as HTMLElement;
      if (input) {
        setTimeout(() => input.focus(), 100);
      } else {
        setTimeout(() => firstIncomplete.ref.current?.focus(), 100);
      }
    }
  }, []);

  return {
    registerField,
    focusNext,
    focusPrevious,
    focusFirst
  };
}