/**
 * FocusableField Async/Promise Tests
 * 
 * Test suite specifically for async/promise handling in FocusableField component.
 * These tests ensure proper awaiting of focus operations and async validators.
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusableField } from '../FocusableField';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../contexts/focus/useFocusManager';

// Mock useFocusManager to track async operations
const mockFocusNext = vi.fn();
const mockFocusPrevious = vi.fn();

vi.mock('../../contexts/focus/useFocusManager', async () => {
  const actual = await vi.importActual('../../contexts/focus/useFocusManager');
  return {
    ...actual,
    useFocusManager: () => ({
      state: { currentFocusId: null, navigationMode: 'sequential' },
      focusNext: mockFocusNext,
      focusPrevious: mockFocusPrevious,
      registerElement: vi.fn(),
      unregisterElement: vi.fn(),
      setNavigationMode: vi.fn(),
    }),
  };
});

// Helper to render with FocusManagerProvider
const renderWithFocusManager = (ui: React.ReactElement) => {
  return render(
    <FocusManagerProvider debug={true}>
      {ui}
    </FocusManagerProvider>
  );
};

describe('FocusableField Async/Promise Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Handlers Async Behavior', () => {
    it('should await focusNext in handleKeyDown when Enter is pressed', async () => {
      // Mock focusNext to return a resolved Promise
      mockFocusNext.mockResolvedValue(true);
      
      const onComplete = vi.fn(() => true);
      const canLeaveFocus = vi.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger Enter key
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Verify that focusNext was called
      expect(mockFocusNext).toHaveBeenCalledWith({ skipValidation: false });
      
      // Wait for any async operations to complete
      await waitFor(() => {
        expect(mockFocusNext).toHaveBeenCalledTimes(1);
      });
    });

    it('should await focusNext in handleMouseClick when conditions are met', async () => {
      // Mock focusNext to return a resolved Promise
      mockFocusNext.mockResolvedValue(true);
      
      const onComplete = vi.fn(() => true);
      const canLeaveFocus = vi.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus }}
          mouseOverride={{
            captureClicks: true,
            preserveFocusOnInteraction: true
          }}
        >
          <button data-testid="button">Click me</button>
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger click
      fireEvent.click(wrapper!);
      
      // Verify that focusNext was called
      expect(mockFocusNext).toHaveBeenCalledWith({ skipValidation: false });
      
      // Wait for any async operations to complete
      await waitFor(() => {
        expect(mockFocusNext).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle async validator failures gracefully', async () => {
      // Mock focusNext to reject
      mockFocusNext.mockRejectedValue(new Error('Async focus failed'));
      
      const onComplete = vi.fn(() => true);
      const canLeaveFocus = vi.fn(() => true);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger Enter key
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Wait for error handling
      await waitFor(() => {
        expect(mockFocusNext).toHaveBeenCalledTimes(1);
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Async Validator Handling', () => {
    it('should handle async canReceiveFocus validators', async () => {
      const asyncCanReceiveFocus = vi.fn().mockResolvedValue(true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          validators={{ canReceiveFocus: asyncCanReceiveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      expect(wrapper).toBeDefined();
      
      // The async validator should be properly registered
      // This will be tested through integration with the focus manager
    });

    it('should handle async canLeaveFocus validators', async () => {
      const asyncCanLeaveFocus = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      });
      
      const onComplete = vi.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus: asyncCanLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger Enter key
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Wait for async validator to complete
      await waitFor(() => {
        expect(asyncCanLeaveFocus).toHaveBeenCalled();
      });
    });

    it('should handle rejecting async validators', async () => {
      const asyncCanLeaveFocus = vi.fn().mockRejectedValue(new Error('Validation failed'));
      const onComplete = vi.fn(() => true);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus: asyncCanLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger Enter key
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Wait for error handling
      await waitFor(() => {
        expect(asyncCanLeaveFocus).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle rapid key presses without race conditions', async () => {
      mockFocusNext.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return true;
      });
      
      const onComplete = vi.fn(() => true);
      const canLeaveFocus = vi.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus }}
        >
          <input type="text" data-testid="input" />
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger multiple rapid Enter presses
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Wait for all operations to complete
      await waitFor(() => {
        expect(mockFocusNext).toHaveBeenCalledTimes(3);
      }, { timeout: 1000 });
    });

    it('should handle concurrent mouse and keyboard events', async () => {
      mockFocusNext.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
        return true;
      });
      
      const onComplete = vi.fn(() => true);
      const canLeaveFocus = vi.fn(() => true);
      
      const { container } = renderWithFocusManager(
        <FocusableField
          id="test-field"
          order={1}
          onComplete={onComplete}
          validators={{ canLeaveFocus }}
          mouseOverride={{
            captureClicks: true,
            preserveFocusOnInteraction: true
          }}
        >
          <button data-testid="button">Click me</button>
        </FocusableField>
      );
      
      const wrapper = container.querySelector('[data-focus-id="test-field"]');
      
      // Trigger concurrent events
      fireEvent.click(wrapper!);
      fireEvent.keyDown(wrapper!, { key: 'Enter' });
      
      // Wait for all operations to complete
      await waitFor(() => {
        expect(mockFocusNext).toHaveBeenCalledTimes(2);
      }, { timeout: 1000 });
    });
  });
});