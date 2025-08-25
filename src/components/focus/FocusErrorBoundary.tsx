/**
 * FocusErrorBoundary Component
 * 
 * Design by Contract Error Boundary for Focus Management System
 * Provides comprehensive error handling, recovery, and logging for focus operations
 * 
 * @contract
 * Preconditions:
 * - Must wrap FocusManagerProvider or components using focus management
 * - Children must be valid React elements
 * - Error logger must be configured (optional)
 * 
 * Postconditions:
 * - All focus-related errors are caught and handled
 * - Error state is logged with full context
 * - Fallback UI is rendered on error
 * - Recovery mechanisms are available to users
 * 
 * Invariants:
 * - Application remains functional even when focus system fails
 * - Accessibility is maintained in error states
 * - Error information is preserved for debugging
 * 
 * Performance:
 * - Error detection: < 1ms
 * - Recovery initiation: < 10ms
 * - Fallback render: < 50ms
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FocusErrorLogger } from './FocusErrorLogger';
import { FocusRecoveryService } from './FocusRecoveryService';
import { FocusFallbackUI } from './FocusFallbackUI';

/**
 * Error severity levels for categorization
 */
export enum ErrorSeverity {
  LOW = 'low',        // Recoverable, minimal impact
  MEDIUM = 'medium',  // Recoverable, some features affected
  HIGH = 'high',      // Recoverable, major features affected
  CRITICAL = 'critical' // Non-recoverable, requires reload
}

/**
 * Error context for debugging and recovery
 */
export interface FocusErrorContext {
  timestamp: number;
  errorType: string;
  severity: ErrorSeverity;
  component: string;
  focusState?: {
    currentFocusId?: string;
    activeScope?: string;
    elementCount?: number;
    modalStackDepth?: number;
  };
  userAction?: string;
  browserInfo?: {
    userAgent: string;
    viewport: { width: number; height: number };
  };
  stackTrace?: string;
  recoveryAttempts: number;
}

/**
 * Props for FocusErrorBoundary component
 */
export interface FocusErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<FocusErrorBoundaryState>;
  onError?: (error: Error, errorInfo: ErrorInfo, context: FocusErrorContext) => void;
  enableAutoRecovery?: boolean;
  maxRecoveryAttempts?: number;
  errorLogger?: FocusErrorLogger;
  debugMode?: boolean;
}

/**
 * State for FocusErrorBoundary component
 */
export interface FocusErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorContext: FocusErrorContext | null;
  isRecovering: boolean;
  recoveryFailed: boolean;
}

/**
 * FocusErrorBoundary Class Component
 * 
 * Implements React Error Boundary pattern with focus-specific recovery logic
 */
export class FocusErrorBoundary extends Component<
  FocusErrorBoundaryProps,
  FocusErrorBoundaryState
> {
  private recoveryService: FocusRecoveryService;
  private errorLogger: FocusErrorLogger;
  private recoveryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: FocusErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: null,
      isRecovering: false,
      recoveryFailed: false
    };

    // Initialize services
    this.errorLogger = props.errorLogger || new FocusErrorLogger({
      enabled: props.debugMode || false,
      logLevel: props.debugMode ? 'debug' : 'error'
    });

    this.recoveryService = new FocusRecoveryService({
      maxAttempts: props.maxRecoveryAttempts || 3,
      autoRecover: props.enableAutoRecovery !== false
    });
  }

  /**
   * Static method to derive state from error
   * Called when an error is thrown in a descendant component
   * 
   * @contract
   * Precondition: error is a valid Error object
   * Postcondition: Returns new state with error information
   */
  static getDerivedStateFromError(error: Error): Partial<FocusErrorBoundaryState> {
    return {
      hasError: true,
      error,
      recoveryFailed: false
    };
  }

  /**
   * Lifecycle method called after an error is caught
   * Handles error logging and initiates recovery
   * 
   * @contract
   * Precondition: error and errorInfo are valid
   * Postcondition: Error is logged and recovery is initiated if enabled
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Create error context
    const errorContext = this.createErrorContext(error, errorInfo);

    // Log the error
    this.errorLogger.logError(error, errorContext);

    // Update state with error details
    this.setState({
      errorInfo,
      errorContext
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorContext);
    }

    // Initiate auto-recovery if enabled
    if (this.props.enableAutoRecovery !== false) {
      this.initiateRecovery();
    }
  }

  /**
   * Creates comprehensive error context for debugging
   * 
   * @contract
   * Precondition: error and errorInfo are valid
   * Postcondition: Returns complete error context object
   */
  private createErrorContext(error: Error, errorInfo: ErrorInfo): FocusErrorContext {
    const severity = this.categorizeErrorSeverity(error);
    
    return {
      timestamp: Date.now(),
      errorType: error.name || 'UnknownError',
      severity,
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      focusState: this.extractFocusState(),
      userAction: this.detectUserAction(),
      browserInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      stackTrace: error.stack,
      recoveryAttempts: this.state.errorContext?.recoveryAttempts || 0
    };
  }

  /**
   * Categorizes error severity based on error type and impact
   * 
   * @contract
   * Precondition: error is valid
   * Postcondition: Returns appropriate severity level
   */
  private categorizeErrorSeverity(error: Error): ErrorSeverity {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Critical errors that require page reload
    if (
      errorName.includes('syntaxerror') ||
      errorName.includes('referenceerror') ||
      errorMessage.includes('maximum call stack') ||
      errorMessage.includes('out of memory')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity - major functionality affected
    if (
      errorMessage.includes('cannot read') ||
      errorMessage.includes('cannot access') ||
      errorMessage.includes('undefined is not')
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity - some features affected
    if (
      errorMessage.includes('focus') ||
      errorMessage.includes('element') ||
      errorMessage.includes('dom')
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity - minor issues
    return ErrorSeverity.LOW;
  }

  /**
   * Extracts current focus state for debugging
   * 
   * @contract
   * Postcondition: Returns focus state or undefined if unavailable
   */
  private extractFocusState(): FocusErrorContext['focusState'] {
    try {
      // Try to get focus state from context if available
      const focusManager = (window as any).__focusManagerState;
      if (focusManager) {
        return {
          currentFocusId: focusManager.currentFocusId,
          activeScope: focusManager.activeScopeId,
          elementCount: focusManager.elements?.size,
          modalStackDepth: focusManager.modalStack?.length
        };
      }

      // Fallback to DOM inspection
      const activeElement = document.activeElement;
      return {
        currentFocusId: activeElement?.id || activeElement?.getAttribute('data-focus-id') || undefined,
        activeScope: activeElement?.getAttribute('data-focus-scope') || undefined
      };
    } catch {
      return undefined;
    }
  }

  /**
   * Detects the user action that triggered the error
   * 
   * @contract
   * Postcondition: Returns detected action or 'unknown'
   */
  private detectUserAction(): string {
    try {
      const event = (window as any).__lastFocusEvent;
      if (event) {
        return `${event.type} on ${event.target?.tagName}`;
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Initiates automatic recovery process
   * 
   * @contract
   * Precondition: Recovery service is initialized
   * Postcondition: Recovery is attempted or marked as failed
   */
  private async initiateRecovery(): Promise<void> {
    const { errorContext } = this.state;
    const maxAttempts = this.props.maxRecoveryAttempts || 3;

    if (errorContext && errorContext.recoveryAttempts >= maxAttempts) {
      this.setState({ recoveryFailed: true });
      return;
    }

    this.setState({ isRecovering: true });

    try {
      // Attempt recovery based on severity
      const recovered = await this.recoveryService.attemptRecovery(
        this.state.error!,
        errorContext?.severity || ErrorSeverity.MEDIUM
      );

      if (recovered) {
        // Clear error state after successful recovery
        this.recoveryTimeoutId = setTimeout(() => {
          this.resetErrorBoundary();
        }, 500);
      } else {
        // Update recovery attempts
        this.setState(prevState => ({
          isRecovering: false,
          errorContext: {
            ...prevState.errorContext!,
            recoveryAttempts: (prevState.errorContext?.recoveryAttempts || 0) + 1
          }
        }));
      }
    } catch (recoveryError) {
      this.errorLogger.logError(recoveryError as Error, {
        ...errorContext!,
        errorType: 'RecoveryError'
      });
      this.setState({ isRecovering: false, recoveryFailed: true });
    }
  }

  /**
   * Manually reset the error boundary
   * 
   * @contract
   * Postcondition: Error state is cleared and normal rendering resumes
   */
  public resetErrorBoundary = (): void => {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: null,
      isRecovering: false,
      recoveryFailed: false
    });
  };

  /**
   * Handle manual recovery attempt by user
   * 
   * @contract
   * Postcondition: Recovery is attempted with user interaction logged
   */
  public handleManualRecovery = (): void => {
    this.errorLogger.logInfo('Manual recovery initiated by user');
    this.initiateRecovery();
  };

  /**
   * Handle page reload request
   * 
   * @contract
   * Postcondition: Page is reloaded after logging
   */
  public handleReload = (): void => {
    this.errorLogger.logInfo('Page reload initiated due to error');
    window.location.reload();
  };

  /**
   * Component cleanup
   */
  componentWillUnmount(): void {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }

  /**
   * Render method
   * 
   * @contract
   * Postcondition: Returns either children or fallback UI
   */
  render(): ReactNode {
    const { hasError, error, errorInfo, errorContext, isRecovering, recoveryFailed } = this.state;
    const { children, fallbackComponent: FallbackComponent } = this.props;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent {...this.state} />;
      }

      // Use default fallback UI
      return (
        <FocusFallbackUI
          error={error}
          errorInfo={errorInfo}
          errorContext={errorContext}
          isRecovering={isRecovering}
          recoveryFailed={recoveryFailed}
          onRetry={this.handleManualRecovery}
          onReset={this.resetErrorBoundary}
          onReload={this.handleReload}
        />
      );
    }

    return children;
  }
}

// Export default instance for convenience
export default FocusErrorBoundary;