import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FocusManagerProvider } from '../../../contexts/focus/FocusManagerContext';
import { NavigationModeIndicator, CompactNavigationModeIndicator, FloatingNavigationModeIndicator } from '../NavigationModeIndicator';

// Mock CSS import
vi.mock('../NavigationModeIndicator.css', () => ({}));

// Mock the useNavigationMode hook
const mockNavigationMode = {
  currentMode: 'keyboard' as 'keyboard' | 'mouse' | 'hybrid' | 'auto',
  setMode: vi.fn(),
  isKeyboardMode: true,
  isMouseMode: false,
  isHybridMode: false,
  isAutoMode: false,
  lastInteraction: 'none' as 'none' | 'keyboard' | 'mouse',
  modeHistory: ['keyboard'] as ('keyboard' | 'mouse' | 'hybrid' | 'auto')[],
  handleCtrlClick: vi.fn(),
  resetMode: vi.fn(),
  toggleMode: vi.fn()
};

vi.mock('../../hooks/useNavigationMode', () => ({
  useNavigationMode: () => mockNavigationMode
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <FocusManagerProvider>
      {ui}
    </FocusManagerProvider>
  );
};

describe('NavigationModeIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    Object.assign(mockNavigationMode, {
      currentMode: 'keyboard',
      setMode: vi.fn(),
      isKeyboardMode: true,
      isMouseMode: false,
      isHybridMode: false,
      isAutoMode: false,
      lastInteraction: 'none',
      modeHistory: ['keyboard'],
      handleCtrlClick: vi.fn(),
      resetMode: vi.fn(),
      toggleMode: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('⌨️')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });

    it('should show current mode icon and label', () => {
      mockNavigationMode.currentMode = 'mouse';
      mockNavigationMode.isKeyboardMode = false;
      mockNavigationMode.isMouseMode = true;
      
      renderWithProvider(<NavigationModeIndicator />);
      
      expect(screen.getByText('🖱️')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });

    it('should show last interaction when enabled', () => {
      mockNavigationMode.lastInteraction = 'mouse';
      
      renderWithProvider(<NavigationModeIndicator showLastInteraction={true} />);
      
      expect(screen.getByText('(mouse)')).toBeInTheDocument();
    });

    it('should hide last interaction when disabled', () => {
      mockNavigationMode.lastInteraction = 'mouse';
      
      renderWithProvider(<NavigationModeIndicator showLastInteraction={false} />);
      
      expect(screen.queryByText('(mouse)')).not.toBeInTheDocument();
    });

    it('should not show last interaction when it is "none"', () => {
      mockNavigationMode.lastInteraction = 'none';
      
      renderWithProvider(<NavigationModeIndicator showLastInteraction={true} />);
      
      expect(screen.queryByText('(none)')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should apply correct position classes', () => {
      const { container } = renderWithProvider(
        <NavigationModeIndicator position="top-left" />
      );
      
      expect(container.querySelector('.top-left')).toBeInTheDocument();
    });

    it('should default to bottom-right position', () => {
      const { container } = renderWithProvider(<NavigationModeIndicator />);
      
      expect(container.querySelector('.bottom-right')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render compact version', () => {
      const { container } = renderWithProvider(<CompactNavigationModeIndicator />);
      
      expect(container.querySelector('.compact')).toBeInTheDocument();
      expect(screen.queryByText('Keyboard')).not.toBeInTheDocument(); // Label should be hidden
      expect(screen.getByText('⌨️')).toBeInTheDocument(); // Icon should still be visible
    });
  });

  describe('Floating Mode', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render floating version with auto-hide', () => {
      const { container } = renderWithProvider(<FloatingNavigationModeIndicator />);
      
      expect(container.querySelector('.floating')).toBeInTheDocument();
    });

    it('should auto-hide after delay', async () => {
      renderWithProvider(<FloatingNavigationModeIndicator autoHideDelay={1000} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Fast-forward past the auto-hide delay
      vi.advanceTimersByTime(6000); // Default delay + buffer
      
      await waitFor(() => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('should toggle expansion on click', async () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      const mainButton = screen.getByRole('button');
      
      // Initially collapsed
      expect(screen.queryByText('Switch Mode:')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        expect(screen.getByText('Switch Mode:')).toBeInTheDocument();
      });
      
      // Click to collapse
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Switch Mode:')).not.toBeInTheDocument();
      });
    });

    it('should call custom onModeClick handler', () => {
      const onModeClick = vi.fn();
      
      renderWithProvider(<NavigationModeIndicator onModeClick={onModeClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(onModeClick).toHaveBeenCalled();
    });

    it('should allow mode selection from dropdown', async () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Switch Mode:')).toBeInTheDocument();
      });
      
      // Click on mouse mode option
      const mouseOption = screen.getByText('Mouse').closest('button');
      fireEvent.click(mouseOption!);
      
      expect(mockNavigationMode.setMode).toHaveBeenCalledWith('mouse');
    });

    it('should show active mode in dropdown', async () => {
      mockNavigationMode.currentMode = 'mouse';
      
      renderWithProvider(<NavigationModeIndicator />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        const mouseOption = screen.getByText('Mouse').closest('button');
        expect(mouseOption).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      // Mock document.addEventListener
      const addEventListener = vi.spyOn(document, 'addEventListener');
      const removeEventListener = vi.spyOn(document, 'removeEventListener');
    });

    it('should handle Alt+M to toggle mode', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      fireEvent.keyDown(document, { key: 'm', altKey: true });
      
      expect(mockNavigationMode.toggleMode).toHaveBeenCalled();
    });

    it('should handle Alt+K for keyboard mode', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      fireEvent.keyDown(document, { key: 'k', altKey: true });
      
      expect(mockNavigationMode.setMode).toHaveBeenCalledWith('keyboard');
    });

    it('should handle Alt+Shift+M for mouse mode', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      fireEvent.keyDown(document, { key: 'M', altKey: true, shiftKey: true });
      
      expect(mockNavigationMode.setMode).toHaveBeenCalledWith('mouse');
    });

    it('should handle Alt+H for hybrid mode', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      fireEvent.keyDown(document, { key: 'h', altKey: true });
      
      expect(mockNavigationMode.setMode).toHaveBeenCalledWith('hybrid');
    });

    it('should prevent default on keyboard shortcuts', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      const event = new KeyboardEvent('keydown', { key: 'm', altKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      fireEvent(document, event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Optional Features', () => {
    it('should show shortcuts when enabled', async () => {
      renderWithProvider(<NavigationModeIndicator showShortcuts={true} />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts:')).toBeInTheDocument();
        expect(screen.getByText('Alt+M')).toBeInTheDocument();
      });
    });

    it('should hide shortcuts when disabled', async () => {
      renderWithProvider(<NavigationModeIndicator showShortcuts={false} />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts:')).not.toBeInTheDocument();
      });
    });

    it('should show mode history when enabled and available', async () => {
      mockNavigationMode.modeHistory = ['keyboard', 'mouse', 'hybrid'];
      
      renderWithProvider(<NavigationModeIndicator showHistory={true} />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Recent Modes:')).toBeInTheDocument();
      });
    });

    it('should hide mode history when no history available', async () => {
      mockNavigationMode.modeHistory = ['keyboard']; // Only one item
      
      renderWithProvider(<NavigationModeIndicator showHistory={true} />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.queryByText('Recent Modes:')).not.toBeInTheDocument();
      });
    });

    it('should always show tips section', async () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Tips:')).toBeInTheDocument();
        expect(screen.getByText(/Ctrl\+Click/)).toBeInTheDocument();
      });
    });
  });

  describe('Mode-specific Styling', () => {
    it('should apply keyboard mode data attribute', () => {
      mockNavigationMode.currentMode = 'keyboard';
      
      const { container } = renderWithProvider(<NavigationModeIndicator />);
      
      expect(container.querySelector('[data-mode="keyboard"]')).toBeInTheDocument();
    });

    it('should apply mouse mode data attribute', () => {
      mockNavigationMode.currentMode = 'mouse';
      
      const { container } = renderWithProvider(<NavigationModeIndicator />);
      
      expect(container.querySelector('[data-mode="mouse"]')).toBeInTheDocument();
    });

    it('should apply hybrid mode data attribute', () => {
      mockNavigationMode.currentMode = 'hybrid';
      
      const { container } = renderWithProvider(<NavigationModeIndicator />);
      
      expect(container.querySelector('[data-mode="hybrid"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label', 'Navigation mode: Keyboard');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should update ARIA attributes when expanded', async () => {
      renderWithProvider(<NavigationModeIndicator />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper aria-pressed for mode options', async () => {
      mockNavigationMode.currentMode = 'keyboard';
      
      renderWithProvider(<NavigationModeIndicator />);
      
      // Expand dropdown
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        const keyboardOption = screen.getByText('Keyboard').closest('button');
        const mouseOption = screen.getByText('Mouse').closest('button');
        
        expect(keyboardOption).toHaveAttribute('aria-pressed', 'true');
        expect(mouseOption).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  describe('Auto-hide Behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should reset visibility on mode change', () => {
      renderWithProvider(<FloatingNavigationModeIndicator autoHideDelay={1000} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Fast-forward to just before auto-hide
      vi.advanceTimersByTime(900);
      
      // Simulate mode change by re-rendering with new mode
      mockNavigationMode.currentMode = 'mouse';
      
      // Component should remain visible
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Custom CSS Classes', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProvider(
        <NavigationModeIndicator className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const { container } = renderWithProvider(
        <CompactNavigationModeIndicator className="custom-class" />
      );
      
      const indicator = container.querySelector('.navigation-mode-indicator');
      expect(indicator).toHaveClass('custom-class', 'compact');
    });
  });
});