/**
 * FocusManagerProviderWithErrorBoundary
 * 
 * Enhanced FocusManagerProvider wrapped with comprehensive error handling
 * Provides automatic error recovery and graceful degradation
 * 
 * @contract
 * Preconditions:
 * - Must be used at the root of the component tree
 * - Children must be valid React elements
 * 
 * Postconditions:
 * - Focus management is available to all children
 * - Errors are caught and handled gracefully
 * - Recovery mechanisms are in place
 * 
 * Invariants:
 * - Application remains functional even with focus errors
 * - Error information is logged and accessible
 * - User can always navigate using standard methods
 */

import React from 'react';
import { FocusManagerProvider } from './FocusManagerContext';
import { FocusErrorBoundary } from '../../components/focus/FocusErrorBoundary';
import { FocusErrorLogger } from '../../components/focus/FocusErrorLogger';
import { FocusManagerProviderProps } from './types';

/**
 * Extended props for provider with error boundary
 */
export interface FocusManagerProviderWithErrorBoundaryProps extends FocusManagerProviderProps {
  /**
   * Enable error boundary protection
   * @default true
   */
  enableErrorBoundary?: boolean;
  
  /**
   * Enable automatic error recovery
   * @default true
   */
  enableAutoRecovery?: boolean;
  
  /**
   * Maximum recovery attempts before giving up
   * @default 3
   */
  maxRecoveryAttempts?: number;
  
  /**
   * Custom error handler callback
   */
  onFocusError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /**
   * Enable error logging to console/remote
   * @default true
   */
  enableErrorLogging?: boolean;
  
  /**
   * Remote endpoint for error reporting
   */
  errorReportingEndpoint?: string;
  
  /**
   * Custom fallback component for errors
   */
  errorFallbackComponent?: React.ComponentType<any>;
}

/**
 * Create singleton error logger instance
 */
const createErrorLogger = (config: {
  enabled: boolean;
  debug?: boolean;
  remoteEndpoint?: string;
}) => {
  return new FocusErrorLogger({
    enabled: config.enabled,
    logLevel: config.debug ? 'debug' : 'error',
    persistLogs: true,
    remoteEndpoint: config.remoteEndpoint,
    sanitizeData: true,
    includePerformanceMetrics: true
  });
};

/**
 * FocusManagerProviderWithErrorBoundary Component
 * 
 * Provides focus management with comprehensive error handling
 */
export const FocusManagerProviderWithErrorBoundary: React.FC<FocusManagerProviderWithErrorBoundaryProps> = ({
  children,
  enableErrorBoundary = true,
  enableAutoRecovery = true,
  maxRecoveryAttempts = 3,
  onFocusError,
  enableErrorLogging = true,
  errorReportingEndpoint,
  errorFallbackComponent,
  ...focusManagerProps
}) => {
  // Create error logger
  const errorLogger = React.useMemo(() => 
    createErrorLogger({
      enabled: enableErrorLogging,
      debug: focusManagerProps.debug,
      remoteEndpoint: errorReportingEndpoint
    }),
    [enableErrorLogging, focusManagerProps.debug, errorReportingEndpoint]
  );

  // Error handler that combines logging and custom handler
  const handleError = React.useCallback((
    error: Error,
    errorInfo: React.ErrorInfo,
    context: any
  ) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Focus Management Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', context);
      console.groupEnd();
    }

    // Call custom handler if provided
    if (onFocusError) {
      onFocusError(error, errorInfo);
    }

    // Send telemetry in production
    if (process.env.NODE_ENV === 'production' && errorReportingEndpoint) {
      // Send error report asynchronously
      fetch(errorReportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          errorInfo,
          context,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }, [onFocusError, errorReportingEndpoint]);

  // Render with or without error boundary based on configuration
  if (!enableErrorBoundary) {
    return (
      <FocusManagerProvider {...focusManagerProps}>
        {children}
      </FocusManagerProvider>
    );
  }

  return (
    <FocusErrorBoundary
      enableAutoRecovery={enableAutoRecovery}
      maxRecoveryAttempts={maxRecoveryAttempts}
      onError={handleError}
      errorLogger={errorLogger}
      fallbackComponent={errorFallbackComponent}
      debugMode={focusManagerProps.debug}
    >
      <FocusManagerProvider {...focusManagerProps}>
        {children}
      </FocusManagerProvider>
    </FocusErrorBoundary>
  );
};

/**
 * Hook to access error statistics from within the provider
 */
export const useFocusErrorStatistics = () => {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    const handleCriticalError = (event: CustomEvent) => {
      setStats(event.detail);
    };

    window.addEventListener('focus-critical-error', handleCriticalError as EventListener);
    return () => {
      window.removeEventListener('focus-critical-error', handleCriticalError as EventListener);
    };
  }, []);

  return stats;
};

/**
 * HOC to wrap any component with focus error boundary
 */
export function withFocusErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<FocusManagerProviderWithErrorBoundaryProps>
): React.ComponentType<P> {
  return React.forwardRef<any, P>((props, ref) => (
    <FocusErrorBoundary
      enableAutoRecovery={errorBoundaryProps?.enableAutoRecovery ?? true}
      maxRecoveryAttempts={errorBoundaryProps?.maxRecoveryAttempts ?? 3}
      debugMode={errorBoundaryProps?.debug}
    >
      <Component {...props} ref={ref} />
    </FocusErrorBoundary>
  ));
}

// Export for convenience
export default FocusManagerProviderWithErrorBoundary;