import React, { useEffect, useState } from 'react';
import { NavigationMode } from '../../contexts/focus/types';
import { useNavigationMode } from '../../hooks/useNavigationMode';
import './NavigationModeIndicator.css';

export interface NavigationModeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showHistory?: boolean;
  showLastInteraction?: boolean;
  showShortcuts?: boolean;
  compact?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
  onModeClick?: () => void;
}

const modeIcons = {
  [NavigationMode.KEYBOARD]: '⌨️',
  [NavigationMode.MOUSE]: '🖱️',
  [NavigationMode.HYBRID]: '🔄',
  [NavigationMode.AUTO]: '🤖'
};

const modeLabels = {
  [NavigationMode.KEYBOARD]: 'Keyboard',
  [NavigationMode.MOUSE]: 'Mouse',
  [NavigationMode.HYBRID]: 'Hybrid',
  [NavigationMode.AUTO]: 'Auto'
};

const modeDescriptions = {
  [NavigationMode.KEYBOARD]: 'Use Tab, Enter, and arrow keys to navigate',
  [NavigationMode.MOUSE]: 'Click on elements to navigate',
  [NavigationMode.HYBRID]: 'Use keyboard or mouse to navigate',
  [NavigationMode.AUTO]: 'Mode switches automatically based on input'
};

const shortcuts = {
  toggle: 'Alt+M',
  keyboard: 'Alt+K',
  mouse: 'Alt+Shift+M',
  hybrid: 'Alt+H'
};

export const NavigationModeIndicator: React.FC<NavigationModeIndicatorProps> = ({
  position = 'bottom-right',
  showHistory = false,
  showLastInteraction = true,
  showShortcuts = false,
  compact = false,
  autoHide = false,
  autoHideDelay = 5000,
  className = '',
  onModeClick
}) => {
  const {
    currentMode,
    setMode,
    lastInteraction,
    modeHistory,
    toggleMode
  } = useNavigationMode();

  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    setLastActivity(Date.now());
    setIsVisible(true);
  }, [currentMode, lastInteraction]);

  useEffect(() => {
    if (!autoHide) return;

    const checkVisibility = setInterval(() => {
      if (Date.now() - lastActivity > autoHideDelay) {
        setIsVisible(false);
      }
    }, 1000);

    return () => clearInterval(checkVisibility);
  }, [autoHide, autoHideDelay, lastActivity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleMode();
      } else if (e.altKey && e.key === 'k') {
        e.preventDefault();
        setMode(NavigationMode.KEYBOARD);
      } else if (e.altKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setMode(NavigationMode.MOUSE);
      } else if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setMode(NavigationMode.HYBRID);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setMode, toggleMode]);

  const handleClick = () => {
    if (onModeClick) {
      onModeClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleModeSelect = (mode: NavigationMode) => {
    setMode(mode);
    setIsExpanded(false);
  };

  if (!isVisible && autoHide) {
    return null;
  }

  return (
    <div 
      className={`navigation-mode-indicator ${position} ${compact ? 'compact' : ''} ${className}`}
      data-mode={currentMode}
      data-expanded={isExpanded}
    >
      <div 
        className="mode-indicator-main"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Navigation mode: ${modeLabels[currentMode]}`}
        aria-expanded={isExpanded}
      >
        <span className="mode-icon">{modeIcons[currentMode]}</span>
        {!compact && (
          <>
            <span className="mode-label">{modeLabels[currentMode]}</span>
            {showLastInteraction && lastInteraction !== 'none' && (
              <span className="last-interaction">
                ({lastInteraction})
              </span>
            )}
          </>
        )}
      </div>

      {isExpanded && (
        <div className="mode-indicator-dropdown">
          <div className="mode-description">
            {modeDescriptions[currentMode]}
          </div>

          <div className="mode-options">
            <h4>Switch Mode:</h4>
            {Object.values(NavigationMode).map(mode => (
              <button
                key={mode}
                className={`mode-option ${mode === currentMode ? 'active' : ''}`}
                onClick={() => handleModeSelect(mode)}
                aria-pressed={mode === currentMode}
              >
                <span className="mode-icon">{modeIcons[mode]}</span>
                <span className="mode-label">{modeLabels[mode]}</span>
              </button>
            ))}
          </div>

          {showShortcuts && (
            <div className="mode-shortcuts">
              <h4>Keyboard Shortcuts:</h4>
              <ul>
                <li><kbd>{shortcuts.toggle}</kbd> Toggle mode</li>
                <li><kbd>{shortcuts.keyboard}</kbd> Keyboard mode</li>
                <li><kbd>{shortcuts.mouse}</kbd> Mouse mode</li>
                <li><kbd>{shortcuts.hybrid}</kbd> Hybrid mode</li>
              </ul>
            </div>
          )}

          {showHistory && modeHistory.length > 1 && (
            <div className="mode-history">
              <h4>Recent Modes:</h4>
              <div className="history-list">
                {modeHistory.slice(-5).reverse().map((mode, index) => (
                  <span key={index} className="history-item">
                    {modeIcons[mode]}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mode-tips">
            <h4>Tips:</h4>
            <ul>
              <li>Use <kbd>Ctrl+Click</kbd> to jump directly to any field</li>
              <li>Mode switches automatically based on your input</li>
              <li>Press <kbd>Alt+M</kbd> to quickly toggle modes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export const CompactNavigationModeIndicator: React.FC<Omit<NavigationModeIndicatorProps, 'compact'>> = (props) => {
  return <NavigationModeIndicator {...props} compact={true} />;
};

export const FloatingNavigationModeIndicator: React.FC<NavigationModeIndicatorProps> = (props) => {
  return (
    <NavigationModeIndicator 
      {...props}
      className={`floating ${props.className || ''}`}
      autoHide={true}
      autoHideDelay={props.autoHideDelay || 5000}
    />
  );
};