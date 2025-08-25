import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FocusManagerProvider } from '../FocusManagerContext';
import { FocusableField } from '../../../components/FocusableField';
import { useFocusManager } from '../useFocusManager';
import { NavigationMode } from '../types';

// Mock console methods for testing
const originalConsole = console;
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  vi.clearAllMocks();
});

// Simple test component
const SimpleMouseTestForm: React.FC = () => {
  return (
    <div data-testid="simple-form">
      <FocusableField
        id="field1"
        order={1}
        scope="main-form"
        mouseNavigation={{
          clickAdvancesBehavior: 'next',
          clickHandler: () => {
            console.log('Field 1 clicked');
          }
        }}
      >
        <input data-testid="field1" placeholder="Field 1" />
      </FocusableField>

      <FocusableField
        id="field2"
        order={2}
        scope="main-form"
      >
        <input data-testid="field2" placeholder="Field 2" />
      </FocusableField>
    </div>
  );
};

const renderWithFocusManager = (component: React.ReactNode) => {
  return render(
    <FocusManagerProvider 
      initialState={{ 
        enabled: true, 
        debug: true,
        navigationMode: NavigationMode.KEYBOARD
      }}
    >
      {component}
    </FocusManagerProvider>
  );
};

describe('Task 032: Basic Mouse Navigation Testing', () => {
  it('should render focusable fields with mouse navigation', async () => {
    renderWithFocusManager(<SimpleMouseTestForm />);

    const field1 = screen.getByTestId('field1');
    const field2 = screen.getByTestId('field2');

    expect(field1).toBeInTheDocument();
    expect(field2).toBeInTheDocument();
  });

  it('should handle mouse clicks on fields', async () => {
    const user = userEvent.setup();
    renderWithFocusManager(<SimpleMouseTestForm />);

    const field1 = screen.getByTestId('field1');
    
    // Click on field
    await user.click(field1);

    // Verify click handler was called
    expect(console.log).toHaveBeenCalledWith('Field 1 clicked');
  });

  it('should focus field when clicked', async () => {
    const user = userEvent.setup();
    renderWithFocusManager(<SimpleMouseTestForm />);

    const field1 = screen.getByTestId('field1');
    
    // Click on field
    await user.click(field1);

    // Field should be focused
    expect(document.activeElement).toBe(field1);
  });

  it('should handle typing in focused field', async () => {
    const user = userEvent.setup();
    renderWithFocusManager(<SimpleMouseTestForm />);

    const field1 = screen.getByTestId('field1');
    
    // Click and type
    await user.click(field1);
    await user.type(field1, 'test input');

    // Field should contain typed text
    expect(field1).toHaveValue('test input');
  });

  it('should call click handler via handleMouseNavigation in hybrid mode', async () => {
    // Test component that manually calls handleMouseNavigation
    const MouseNavTestComponent = () => {
      const { handleMouseNavigation, setNavigationMode } = useFocusManager();
      
      React.useEffect(() => {
        // Set to hybrid mode to enable mouse navigation
        setNavigationMode(NavigationMode.HYBRID);
      }, [setNavigationMode]);
      
      return (
        <div>
          <FocusableField
            id="test-field"
            order={1}
            scope="main-form"
            mouseNavigation={{
              clickHandler: () => {
                console.log('Mouse navigation handler called');
              }
            }}
          >
            <input data-testid="test-field" />
          </FocusableField>
          <button 
            data-testid="trigger-mouse-nav"
            onClick={(e) => {
              handleMouseNavigation('test-field', e.nativeEvent);
            }}
          >
            Trigger Mouse Nav
          </button>
        </div>
      );
    };

    const user = userEvent.setup();
    renderWithFocusManager(<MouseNavTestComponent />);

    const triggerButton = screen.getByTestId('trigger-mouse-nav');
    
    // Click trigger button to call handleMouseNavigation
    await user.click(triggerButton);

    // Verify mouse navigation handler was called
    expect(console.log).toHaveBeenCalledWith('Mouse navigation handler called');
  });

  it('should test navigation mode switching', async () => {
    const NavigationModeTestComponent = () => {
      const { getNavigationMode, setNavigationMode } = useFocusManager();
      const [currentMode, setCurrentMode] = React.useState('');
      
      React.useEffect(() => {
        setCurrentMode(getNavigationMode());
      }, [getNavigationMode]);
      
      return (
        <div>
          <div data-testid="current-mode">{currentMode}</div>
          <button 
            data-testid="set-hybrid"
            onClick={() => setNavigationMode(NavigationMode.HYBRID)}
          >
            Set Hybrid
          </button>
          <button 
            data-testid="set-mouse"
            onClick={() => setNavigationMode(NavigationMode.MOUSE)}
          >
            Set Mouse
          </button>
        </div>
      );
    };

    const user = userEvent.setup();
    renderWithFocusManager(<NavigationModeTestComponent />);

    const currentModeDisplay = screen.getByTestId('current-mode');
    const setHybridButton = screen.getByTestId('set-hybrid');
    const setMouseButton = screen.getByTestId('set-mouse');
    
    // Should start in keyboard mode
    expect(currentModeDisplay).toHaveTextContent('keyboard');
    
    // Switch to hybrid
    await user.click(setHybridButton);
    await waitFor(() => {
      expect(currentModeDisplay).toHaveTextContent('hybrid');
    });
    
    // Switch to mouse
    await user.click(setMouseButton);
    await waitFor(() => {
      expect(currentModeDisplay).toHaveTextContent('mouse');
    });
  });

  it('should clean up without errors', () => {
    const { unmount } = renderWithFocusManager(<SimpleMouseTestForm />);
    
    expect(() => unmount()).not.toThrow();
  });
});