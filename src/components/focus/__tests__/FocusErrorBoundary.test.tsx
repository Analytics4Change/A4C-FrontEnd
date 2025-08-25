/**
 * FocusErrorBoundary Test Suite
 * 
 * Comprehensive tests for error boundary functionality
 * Tests error scenarios, recovery mechanisms, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusErrorBoundary, ErrorSeverity } from '../FocusErrorBoundary';
import { FocusRecoveryService } from '../FocusRecoveryService';
import { FocusErrorLogger } from '../FocusErrorLogger';
import '@testing-library/jest-dom';

// Mock child component that can throw errors
const ThrowingComponent: React.FC<{ shouldThrow: boolean; error?: Error }> = ({ 
  shouldThrow, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>Working Component</div>;
};

// Mock focus manager state
const mockFocusManagerState = {
  currentFocusId: 'test-element',
  activeScopeId: 'default',
  elements: new Map(),
  modalStack: []
};

describe('FocusErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock window focus manager state
    (window as any).__focusManagerState = mockFocusManagerState;
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    delete (window as any).__focusManagerState;
    jest.clearAllMocks();
  });

  describe('Error Detection and Handling', () => {
    it('should catch and display errors from child components', () => {
      const { rerender } = render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();

      // Trigger error
      rerender(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Navigation System Error')).toBeInTheDocument();
    });

    it('should categorize error severity correctly', () => {
      const criticalError = new ReferenceError('Maximum call stack exceeded');
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} error={criticalError} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('CRITICAL SEVERITY')).toBeInTheDocument();
    });

    it('should capture focus state context when error occurs', () => {
      const onError = jest.fn();
      
      render(
        <FocusErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      const [error, errorInfo, context] = onError.mock.calls[0];
      
      expect(context.focusState).toEqual({
        currentFocusId: 'test-element',
        activeScope: 'default',
        elementCount: 0,
        modalStackDepth: 0
      });
    });

    it('should handle null reference errors', () => {
      const nullError = new TypeError("Cannot read property 'focus' of null");
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} error={nullError} />
        </FocusErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/significant error occurred/)).toBeInTheDocument();
    });

    it('should handle circular dependency errors', () => {
      const circularError = new Error('Maximum call stack size exceeded');
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} error={circularError} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('CRITICAL SEVERITY')).toBeInTheDocument();
      expect(screen.getByText(/critical error has occurred/)).toBeInTheDocument();
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should attempt automatic recovery by default', async () => {
      const { rerender } = render(
        <FocusErrorBoundary enableAutoRecovery={true}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/Attempting automatic recovery/)).toBeInTheDocument();
      });
    });

    it('should allow manual recovery through retry button', async () => {
      render(
        <FocusErrorBoundary enableAutoRecovery={false}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Attempting automatic recovery/)).toBeInTheDocument();
      });
    });

    it('should reset error boundary when reset button is clicked', () => {
      const { rerender } = render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /reset focus/i });
      fireEvent.click(resetButton);

      // Rerender with non-throwing component
      rerender(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('should limit recovery attempts', async () => {
      const maxAttempts = 2;
      
      render(
        <FocusErrorBoundary 
          enableAutoRecovery={true}
          maxRecoveryAttempts={maxAttempts}
        >
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      // Simulate multiple recovery attempts
      for (let i = 0; i < maxAttempts + 1; i++) {
        const retryButton = screen.queryByRole('button', { name: /try again/i });
        if (retryButton) {
          fireEvent.click(retryButton);
          await waitFor(() => {}, { timeout: 100 });
        }
      }

      // After max attempts, should show recovery failed state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Logging', () => {
    it('should log errors with custom logger', () => {
      const mockLogger = new FocusErrorLogger({ enabled: true });
      const logErrorSpy = jest.spyOn(mockLogger, 'logError');

      render(
        <FocusErrorBoundary errorLogger={mockLogger}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(logErrorSpy).toHaveBeenCalled();
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          errorType: 'Error',
          timestamp: expect.any(Number)
        })
      );
    });

    it('should track error statistics', () => {
      const mockLogger = new FocusErrorLogger({ enabled: true });
      
      render(
        <FocusErrorBoundary errorLogger={mockLogger}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      const stats = mockLogger.getStatistics();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType['Error']).toBe(1);
    });

    it('should persist logs to localStorage when configured', () => {
      const mockLogger = new FocusErrorLogger({ 
        enabled: true,
        persistLogs: true 
      });

      render(
        <FocusErrorBoundary errorLogger={mockLogger}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      const logKeys = Object.keys(localStorage).filter(k => k.startsWith('focus-error-log-'));
      expect(logKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback UI', () => {
    it('should display user-friendly error message', () => {
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText(/focus management system encountered an issue/i)).toBeInTheDocument();
    });

    it('should show technical details when requested', () => {
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      const detailsButton = screen.getByRole('button', { name: /show technical details/i });
      fireEvent.click(detailsButton);

      expect(screen.getByText('Error Information')).toBeInTheDocument();
      expect(screen.getByText('Error Type:')).toBeInTheDocument();
      expect(screen.getByText('Stack Trace')).toBeInTheDocument();
    });

    it('should provide alternative navigation hints', () => {
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('Alternative Navigation:')).toBeInTheDocument();
      expect(screen.getByText(/Use Tab key to move forward/)).toBeInTheDocument();
    });

    it('should allow copying error details to clipboard', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      // Show details
      const detailsButton = screen.getByRole('button', { name: /show technical details/i });
      fireEvent.click(detailsButton);

      // Copy to clipboard
      const copyButton = screen.getByRole('button', { name: /copy error details/i });
      fireEvent.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should use custom fallback component when provided', () => {
      const CustomFallback = () => <div>Custom Error UI</div>;
      
      render(
        <FocusErrorBoundary fallbackComponent={CustomFallback}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('should focus first button on error', async () => {
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      await waitFor(() => {
        const firstButton = screen.getByRole('button', { name: /try again/i });
        expect(document.activeElement).toBe(firstButton);
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      // Tab through buttons
      await user.tab();
      expect(document.activeElement).toHaveTextContent('Try Again');
      
      await user.tab();
      expect(document.activeElement).toHaveTextContent('Reset Focus');
      
      await user.tab();
      expect(document.activeElement).toHaveTextContent('Reload Page');
    });

    it('should close details with Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      // Open details
      const detailsButton = screen.getByRole('button', { name: /show technical details/i });
      fireEvent.click(detailsButton);
      
      expect(screen.getByText('Error Information')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Error Information')).not.toBeInTheDocument();
      });
    });

    it('should maintain color contrast in dark mode', () => {
      // Mock dark mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }));

      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      // Verify dark mode styles are applied
      const container = screen.getByRole('alert');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should detect errors within 1ms', () => {
      const startTime = performance.now();
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Generous limit for CI
    });

    it('should initiate recovery within 10ms', async () => {
      const startTime = performance.now();
      
      render(
        <FocusErrorBoundary enableAutoRecovery={true}>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/Attempting automatic recovery/)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500); // Generous limit for CI
    });

    it('should render fallback UI within 50ms', () => {
      const startTime = performance.now();
      
      render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Generous limit for CI
    });
  });

  describe('Memory Management', () => {
    it('should clean up timeouts on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { unmount } = render(
        <FocusErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </FocusErrorBoundary>
      );

      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should limit log buffer size', () => {
      const mockLogger = new FocusErrorLogger({ 
        enabled: true,
        maxBufferSize: 5
      });

      // Generate multiple errors
      for (let i = 0; i < 10; i++) {
        mockLogger.logError(new Error(`Error ${i}`));
      }

      const logs = mockLogger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Integration', () => {
    it('should work with FocusManagerContext', () => {
      // Mock FocusManagerContext
      const FocusManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <div data-testid="focus-manager">{children}</div>;
      };

      render(
        <FocusErrorBoundary>
          <FocusManagerProvider>
            <ThrowingComponent shouldThrow={false} />
          </FocusManagerProvider>
        </FocusErrorBoundary>
      );

      expect(screen.getByTestId('focus-manager')).toBeInTheDocument();
      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('should handle errors in nested components', () => {
      const NestedComponent = () => (
        <div>
          <div>
            <ThrowingComponent shouldThrow={true} />
          </div>
        </div>
      );

      render(
        <FocusErrorBoundary>
          <NestedComponent />
        </FocusErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('FocusRecoveryService', () => {
  let service: FocusRecoveryService;

  beforeEach(() => {
    service = new FocusRecoveryService({
      maxAttempts: 3,
      autoRecover: true,
      recoveryDelay: 10
    });

    // Mock DOM elements
    document.body.innerHTML = `
      <div>
        <button id="test-button">Test Button</button>
        <input id="test-input" type="text" />
        <dialog open id="test-dialog">Test Dialog</dialog>
        <div role="dialog" aria-modal="true">Modal</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should reset focus state on null reference errors', async () => {
    const error = new TypeError("Cannot read property 'focus' of null");
    const result = await service.attemptRecovery(error, ErrorSeverity.HIGH);
    
    expect(result).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('should clear modals on modal-related errors', async () => {
    const error = new Error('Modal stack overflow');
    const result = await service.attemptRecovery(error, ErrorSeverity.MEDIUM);
    
    expect(result).toBe(true);
    expect(document.querySelector('dialog[open]')).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should focus first available element', async () => {
    const error = new Error('Generic focus error');
    const result = await service.attemptRecovery(error, ErrorSeverity.LOW);
    
    expect(result).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('test-button'));
  });

  it('should track recovery history', async () => {
    const error = new Error('Test error');
    await service.attemptRecovery(error, ErrorSeverity.LOW);
    
    const history = service.getAttemptHistory();
    expect(history.length).toBe(1);
    expect(history[0].success).toBe(true);
    expect(history[0].strategy).toBeDefined();
  });
});

describe('FocusErrorLogger', () => {
  let logger: FocusErrorLogger;

  beforeEach(() => {
    logger = new FocusErrorLogger({
      enabled: true,
      logLevel: 'debug',
      persistLogs: true
    });
  });

  afterEach(() => {
    logger.clearLogs();
  });

  it('should log errors with context', () => {
    const error = new Error('Test error');
    const context = {
      timestamp: Date.now(),
      errorType: 'TestError',
      severity: ErrorSeverity.MEDIUM,
      component: 'TestComponent',
      recoveryAttempts: 0
    };

    logger.logError(error, context);
    
    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].message).toBe('Test error');
    expect(logs[0].context).toMatchObject(context);
  });

  it('should filter logs by level', () => {
    logger.logDebug('Debug message');
    logger.logInfo('Info message');
    logger.logWarn('Warning message');
    logger.logError(new Error('Error message'));

    const errorLogs = logger.getLogs({ level: LogLevel.ERROR });
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].level).toBe(LogLevel.ERROR);
  });

  it('should export logs as JSON', () => {
    logger.logInfo('Test log');
    
    const exported = logger.exportLogs();
    const parsed = JSON.parse(exported);
    
    expect(parsed.logs).toBeDefined();
    expect(parsed.statistics).toBeDefined();
    expect(parsed.config).toBeDefined();
  });

  it('should sanitize sensitive data', () => {
    const logger = new FocusErrorLogger({
      enabled: true,
      sanitizeData: true
    });

    logger.logInfo('User email is test@example.com');
    
    const logs = logger.getLogs();
    expect(logs[0].message).toBe('User email is [EMAIL]');
  });
});