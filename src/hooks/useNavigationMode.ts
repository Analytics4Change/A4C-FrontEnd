import { useCallback, useEffect, useState } from 'react';
import { NavigationMode } from '../contexts/focus/types';
import { useFocusManager } from '../contexts/focus/useFocusManager';

export interface NavigationModeOptions {
  persistMode?: boolean;
  storageKey?: string;
  onModeChange?: (mode: NavigationMode) => void;
  ctrlClickBehavior?: 'jump' | 'navigate' | 'ignore';
}

export interface UseNavigationModeReturn {
  currentMode: NavigationMode;
  setMode: (mode: NavigationMode) => void;
  isKeyboardMode: boolean;
  isMouseMode: boolean;
  isHybridMode: boolean;
  isAutoMode: boolean;
  lastInteraction: 'keyboard' | 'mouse' | 'none';
  modeHistory: NavigationMode[];
  handleCtrlClick: (elementId: string, event: MouseEvent) => void;
  resetMode: () => void;
  toggleMode: () => void;
}

const STORAGE_KEY_PREFIX = 'focus-navigation-mode';
const MAX_HISTORY_LENGTH = 10;

export function useNavigationMode(options: NavigationModeOptions = {}): UseNavigationModeReturn {
  const {
    persistMode = false,
    storageKey = STORAGE_KEY_PREFIX,
    onModeChange,
    ctrlClickBehavior = 'jump'
  } = options;

  const { getNavigationMode, setNavigationMode, focusField, canJumpToNode, state } = useFocusManager();
  
  const [currentMode, setCurrentMode] = useState<NavigationMode>(() => {
    if (persistMode && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && Object.values(NavigationMode).includes(stored as NavigationMode)) {
        return stored as NavigationMode;
      }
    }
    return getNavigationMode();
  });

  // Apply stored mode after first render
  useEffect(() => {
    if (persistMode && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && Object.values(NavigationMode).includes(stored as NavigationMode) && stored !== currentMode) {
        setNavigationMode(stored as NavigationMode);
      }
    }
  }, [persistMode, storageKey, currentMode, setNavigationMode]);

  const [modeHistory, setModeHistory] = useState<NavigationMode[]>([currentMode]);
  const [lastInteraction, setLastInteraction] = useState<'keyboard' | 'mouse' | 'none'>('none');

  const setMode = useCallback((mode: NavigationMode) => {
    setNavigationMode(mode);
    setCurrentMode(mode);
    
    setModeHistory(prev => {
      const updated = [...prev, mode];
      return updated.slice(-MAX_HISTORY_LENGTH);
    });

    if (persistMode && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, mode);
    }

    onModeChange?.(mode);
  }, [setNavigationMode, persistMode, storageKey, onModeChange]);

  const resetMode = useCallback(() => {
    setMode(NavigationMode.KEYBOARD);
    setLastInteraction('none');
    setModeHistory([NavigationMode.KEYBOARD]);
  }, [setMode]);

  const toggleMode = useCallback(() => {
    const newMode = currentMode === NavigationMode.KEYBOARD 
      ? NavigationMode.MOUSE 
      : currentMode === NavigationMode.MOUSE 
      ? NavigationMode.HYBRID
      : NavigationMode.KEYBOARD;
    
    setMode(newMode);
  }, [currentMode, setMode]);

  const handleCtrlClick = useCallback((elementId: string, event: MouseEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    switch (ctrlClickBehavior) {
      case 'jump':
        if (canJumpToNode && canJumpToNode(elementId)) {
          focusField(elementId);
        }
        break;
      case 'navigate':
        focusField(elementId);
        break;
      case 'ignore':
      default:
        break;
    }
  }, [ctrlClickBehavior, canJumpToNode, focusField]);

  // Sync with FocusManager state
  useEffect(() => {
    const managerMode = getNavigationMode();
    if (managerMode !== currentMode) {
      setCurrentMode(managerMode);
      setModeHistory(prev => {
        const updated = [...prev, managerMode];
        return updated.slice(-MAX_HISTORY_LENGTH);
      });
    }
  }, [getNavigationMode, currentMode]);

  // Derive interaction type from mouse interaction history
  useEffect(() => {
    if (state.mouseInteractionHistory && state.mouseInteractionHistory.length > 0) {
      const recent = state.mouseInteractionHistory[state.mouseInteractionHistory.length - 1];
      const timeDiff = Date.now() - recent.timestamp;
      if (timeDiff < 1000) { // Within last second
        setLastInteraction('mouse');
      }
    }
  }, [state.mouseInteractionHistory]);

  return {
    currentMode,
    setMode,
    isKeyboardMode: currentMode === NavigationMode.KEYBOARD,
    isMouseMode: currentMode === NavigationMode.MOUSE,
    isHybridMode: currentMode === NavigationMode.HYBRID,
    isAutoMode: currentMode === NavigationMode.AUTO,
    lastInteraction,
    modeHistory,
    handleCtrlClick,
    resetMode,
    toggleMode
  };
}