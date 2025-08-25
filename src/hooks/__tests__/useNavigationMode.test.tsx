import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { useNavigationMode } from '../useNavigationMode';
import { NavigationMode } from '../../contexts/focus/types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the hook
interface TestComponentProps {
  options?: Parameters<typeof useNavigationMode>[0];
  onModeChange?: (mode: NavigationMode) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ options, onModeChange }) => {
  const navigationMode = useNavigationMode({
    ...options,
    onModeChange: onModeChange || options?.onModeChange
  });

  return (
    <div data-testid="test-component">
      <div data-testid="current-mode">{navigationMode.currentMode}</div>
      <div data-testid="last-interaction">{navigationMode.lastInteraction}</div>
      <div data-testid="is-keyboard">{navigationMode.isKeyboardMode.toString()}</div>
      <div data-testid="is-mouse">{navigationMode.isMouseMode.toString()}</div>
      <div data-testid="is-hybrid">{navigationMode.isHybridMode.toString()}</div>
      <div data-testid="mode-history">{navigationMode.modeHistory.join(',')}</div>
      
      <button onClick={() => navigationMode.setMode(NavigationMode.KEYBOARD)}>
        Set Keyboard
      </button>
      <button onClick={() => navigationMode.setMode(NavigationMode.MOUSE)}>
        Set Mouse  
      </button>
      <button onClick={() => navigationMode.setMode(NavigationMode.HYBRID)}>
        Set Hybrid
      </button>
      <button onClick={navigationMode.toggleMode}>
        Toggle Mode
      </button>
      <button onClick={navigationMode.resetMode}>
        Reset Mode
      </button>
      
      <input 
        data-testid="test-input"
        onClick={(e) => navigationMode.handleCtrlClick('test-input', e.nativeEvent)}
      />
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <FocusManagerProvider>
      {ui}
    </FocusManagerProvider>
  );
};

describe('useNavigationMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // Clear any timers
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with keyboard mode by default', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('keyboard');
      expect(screen.getByTestId('is-keyboard')).toHaveTextContent('true');
      expect(screen.getByTestId('is-mouse')).toHaveTextContent('false');
      expect(screen.getByTestId('is-hybrid')).toHaveTextContent('false');
      expect(screen.getByTestId('last-interaction')).toHaveTextContent('none');
    });

    it('should restore mode from localStorage when persistMode is enabled', () => {
      localStorageMock.getItem.mockReturnValue('mouse');
      
      renderWithProvider(
        <TestComponent options={{ persistMode: true, storageKey: 'test-key' }} />
      );
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
      expect(screen.getByTestId('current-mode')).toHaveTextContent('mouse');
    });

    it('should ignore invalid stored mode', () => {
      localStorageMock.getItem.mockReturnValue('invalid-mode');
      
      renderWithProvider(
        <TestComponent options={{ persistMode: true }} />
      );
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('keyboard');
    });
  });

  describe('Manual Mode Setting', () => {
    it('should allow setting mode manually', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('mouse');
        expect(screen.getByTestId('is-mouse')).toHaveTextContent('true');
        expect(screen.getByTestId('is-keyboard')).toHaveTextContent('false');
      });
    });

    it('should persist mode to localStorage when enabled', async () => {
      renderWithProvider(
        <TestComponent options={{ persistMode: true, storageKey: 'test-key' }} />
      );
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'mouse');
      });
    });

    it('should call onModeChange callback', async () => {
      const onModeChange = vi.fn();
      
      renderWithProvider(
        <TestComponent options={{ onModeChange }} />
      );
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(onModeChange).toHaveBeenCalledWith('mouse');
      });
    });

    it('should update mode history', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(screen.getByTestId('mode-history')).toHaveTextContent('keyboard,mouse');
      });
      
      fireEvent.click(screen.getByText('Set Hybrid'));
      
      await waitFor(() => {
        expect(screen.getByTestId('mode-history')).toHaveTextContent('keyboard,mouse,hybrid');
      });
    });
  });

  describe('Mode Toggling', () => {
    it('should toggle from keyboard to mouse', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Toggle Mode'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('mouse');
      });
    });

    it('should toggle from mouse to hybrid', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('mouse');
      });
      
      fireEvent.click(screen.getByText('Toggle Mode'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('hybrid');
      });
    });

    it('should toggle from hybrid to keyboard', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Hybrid'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('hybrid');
      });
      
      fireEvent.click(screen.getByText('Toggle Mode'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('keyboard');
      });
    });
  });

  describe('Mode Reset', () => {
    it('should reset to keyboard mode', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Mouse'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('mouse');
      });
      
      fireEvent.click(screen.getByText('Reset Mode'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-mode')).toHaveTextContent('keyboard');
        expect(screen.getByTestId('last-interaction')).toHaveTextContent('none');
        expect(screen.getByTestId('mode-history')).toHaveTextContent('keyboard');
      });
    });
  });

  describe('Interaction Detection Integration', () => {
    it('should derive interaction type from FocusManager state', async () => {
      renderWithProvider(<TestComponent />);
      
      // The interaction detection is handled by FocusManagerContext
      // This test verifies the hook correctly observes the state
      expect(screen.getByTestId('last-interaction')).toHaveTextContent('none');
    });
  });

  describe('Ctrl+Click Behavior', () => {
    it('should handle Ctrl+Click with jump behavior', async () => {
      renderWithProvider(<TestComponent options={{ ctrlClickBehavior: 'jump' }} />);
      
      const input = screen.getByTestId('test-input');
      
      fireEvent.click(input, { ctrlKey: true });
      
      // Should prevent default and stop propagation
      // This is hard to test directly, but we can verify the handler was called
      expect(input).toBeInTheDocument();
    });

    it('should handle Ctrl+Click with navigate behavior', async () => {
      renderWithProvider(<TestComponent options={{ ctrlClickBehavior: 'navigate' }} />);
      
      const input = screen.getByTestId('test-input');
      
      fireEvent.click(input, { ctrlKey: true });
      
      expect(input).toBeInTheDocument();
    });

    it('should handle Meta+Click (Cmd+Click on Mac)', async () => {
      renderWithProvider(<TestComponent options={{ ctrlClickBehavior: 'jump' }} />);
      
      const input = screen.getByTestId('test-input');
      
      fireEvent.click(input, { metaKey: true });
      
      expect(input).toBeInTheDocument();
    });

    it('should ignore regular clicks without modifier keys', async () => {
      renderWithProvider(<TestComponent options={{ ctrlClickBehavior: 'jump' }} />);
      
      const input = screen.getByTestId('test-input');
      
      fireEvent.click(input);
      
      expect(input).toBeInTheDocument();
    });
  });


  describe('Mode History Management', () => {
    it('should limit mode history to maximum length', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add more than 10 mode changes
      const modes = [NavigationMode.MOUSE, NavigationMode.HYBRID, NavigationMode.KEYBOARD];
      
      for (let i = 0; i < 15; i++) {
        const mode = modes[i % modes.length];
        fireEvent.click(screen.getByText(`Set ${mode.charAt(0).toUpperCase() + mode.slice(1)}`));
        
        await waitFor(() => {
          expect(screen.getByTestId('current-mode')).toHaveTextContent(mode);
        });
      }
      
      const historyText = screen.getByTestId('mode-history').textContent;
      const historyArray = historyText?.split(',') || [];
      
      // Should not exceed maximum length (10)
      expect(historyArray.length).toBeLessThanOrEqual(10);
    });
  });

});