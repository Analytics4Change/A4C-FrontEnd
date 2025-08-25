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
        // Note: Auto-focus removed per architectural requirements
        // Focus control must remain with user interaction, not automatic
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
        // Note: Auto-focus removed per architectural requirements
        // Focus control must remain with user interaction, not automatic
        break;
      }
    }
  }, []);

  const focusFirst = useCallback(() => {
    const firstIncomplete = focusOrder.current.find(f => !f.isComplete && f.ref.current);
    // Note: Auto-focus removed per architectural requirements
    // Focus control must remain with user interaction, not automatic
  }, []);

  return {
    registerField,
    focusNext,
    focusPrevious,
    focusFirst
  };
}