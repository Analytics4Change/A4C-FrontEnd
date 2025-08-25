/**
 * FocusFallbackUI Component
 * 
 * Accessible fallback user interface displayed when focus management encounters errors
 * Provides recovery options and maintains usability during error states
 * 
 * @contract
 * Preconditions:
 * - Error information must be provided
 * - Component must be rendered within error boundary
 * 
 * Postconditions:
 * - User-friendly error message is displayed
 * - Recovery options are accessible
 * - Keyboard navigation remains functional
 * 
 * Invariants:
 * - UI remains accessible to screen readers
 * - Color contrast meets WCAG standards
 * - Focus is manageable within error UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { ErrorInfo } from 'react';
import { FocusErrorContext, ErrorSeverity } from './FocusErrorBoundary';
import './FocusFallbackUI.css';

/**
 * Props for FocusFallbackUI component
 */
export interface FocusFallbackUIProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorContext: FocusErrorContext | null;
  isRecovering: boolean;
  recoveryFailed: boolean;
  onRetry: () => void;
  onReset: () => void;
  onReload: () => void;
}

/**
 * FocusFallbackUI Component
 * 
 * Provides accessible error interface with recovery options
 */
export const FocusFallbackUI: React.FC<FocusFallbackUIProps> = ({
  error,
  errorInfo,
  errorContext,
  isRecovering,
  recoveryFailed,
  onRetry,
  onReset,
  onReload
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for error UI
  useEffect(() => {
    // Focus first button when component mounts
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }

    // Set up keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetails) {
        setShowDetails(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDetails]);

  /**
   * Gets user-friendly error message based on severity
   */
  const getUserMessage = (): string => {
    const severity = errorContext?.severity || ErrorSeverity.MEDIUM;
    
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'A minor issue occurred with keyboard navigation. You can continue using the application.';
      case ErrorSeverity.MEDIUM:
        return 'The focus management system encountered an issue. Some navigation features may be limited.';
      case ErrorSeverity.HIGH:
        return 'A significant error occurred in the navigation system. Please try the recovery options below.';
      case ErrorSeverity.CRITICAL:
        return 'A critical error has occurred. The application needs to be reloaded to continue.';
      default:
        return 'An unexpected error occurred. Please try again or reload the page.';
    }
  };

  /**
   * Gets severity badge color
   */
  const getSeverityColor = (): string => {
    const severity = errorContext?.severity || ErrorSeverity.MEDIUM;
    
    switch (severity) {
      case ErrorSeverity.LOW:
        return '#0066cc'; // Blue
      case ErrorSeverity.MEDIUM:
        return '#ff9800'; // Orange
      case ErrorSeverity.HIGH:
        return '#ff5722'; // Deep Orange
      case ErrorSeverity.CRITICAL:
        return '#d32f2f'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  /**
   * Copies error details to clipboard
   */
  const copyErrorDetails = async (): Promise<void> => {
    const details = `
Focus Management Error Report
=============================
Time: ${new Date(errorContext?.timestamp || Date.now()).toISOString()}
Severity: ${errorContext?.severity || 'Unknown'}
Error: ${error.name}: ${error.message}
Component: ${errorContext?.component || 'Unknown'}
User Action: ${errorContext?.userAction || 'Unknown'}

Stack Trace:
${error.stack || 'No stack trace available'}

Focus State:
${JSON.stringify(errorContext?.focusState, null, 2)}

Browser: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
    }
  };

  /**
   * Renders recovery options based on state
   */
  const renderRecoveryOptions = () => {
    if (isRecovering) {
      return (
        <div className="focus-fallback-recovering" role="status" aria-live="polite">
          <div className="focus-fallback-spinner" aria-hidden="true" />
          <span>Attempting automatic recovery...</span>
        </div>
      );
    }

    if (recoveryFailed) {
      return (
        <div className="focus-fallback-actions">
          <button
            ref={firstButtonRef}
            onClick={onReset}
            className="focus-fallback-button focus-fallback-button-primary"
            aria-label="Reset focus system and continue"
          >
            Reset and Continue
          </button>
          <button
            onClick={onReload}
            className="focus-fallback-button focus-fallback-button-danger"
            aria-label="Reload the entire page"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return (
      <div className="focus-fallback-actions">
        <button
          ref={firstButtonRef}
          onClick={onRetry}
          className="focus-fallback-button focus-fallback-button-primary"
          aria-label="Retry the failed operation"
        >
          Try Again
        </button>
        <button
          onClick={onReset}
          className="focus-fallback-button focus-fallback-button-secondary"
          aria-label="Reset focus system"
        >
          Reset Focus
        </button>
        <button
          onClick={onReload}
          className="focus-fallback-button focus-fallback-button-text"
          aria-label="Reload page as last resort"
        >
          Reload Page
        </button>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="focus-fallback-container"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="focus-fallback-content">
        {/* Error Icon */}
        <div className="focus-fallback-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"
              fill={getSeverityColor()}
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="focus-fallback-title">
          Navigation System Error
        </h1>

        {/* Severity Badge */}
        <div 
          className="focus-fallback-severity"
          style={{ backgroundColor: getSeverityColor() }}
          role="status"
        >
          {errorContext?.severity?.toUpperCase() || 'UNKNOWN'} SEVERITY
        </div>

        {/* User Message */}
        <p className="focus-fallback-message">
          {getUserMessage()}
        </p>

        {/* Recovery Options */}
        {renderRecoveryOptions()}

        {/* Manual Navigation Hint */}
        <div className="focus-fallback-hint" role="complementary">
          <strong>Alternative Navigation:</strong>
          <ul>
            <li>Use Tab key to move forward through elements</li>
            <li>Use Shift+Tab to move backward</li>
            <li>Use arrow keys within groups</li>
            <li>Press Escape to close dialogs</li>
          </ul>
        </div>

        {/* Technical Details Toggle */}
        <div className="focus-fallback-details-section">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="focus-fallback-button-link"
            aria-expanded={showDetails}
            aria-controls="error-details"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>

          {showDetails && (
            <div
              id="error-details"
              className="focus-fallback-details"
              role="region"
              aria-label="Technical error details"
            >
              <div className="focus-fallback-detail-content">
                <h2>Error Information</h2>
                <dl>
                  <dt>Error Type:</dt>
                  <dd>{error.name}</dd>
                  
                  <dt>Message:</dt>
                  <dd>{error.message}</dd>
                  
                  <dt>Component:</dt>
                  <dd>{errorContext?.component || 'Unknown'}</dd>
                  
                  <dt>Timestamp:</dt>
                  <dd>{new Date(errorContext?.timestamp || Date.now()).toLocaleString()}</dd>
                  
                  <dt>User Action:</dt>
                  <dd>{errorContext?.userAction || 'None detected'}</dd>
                  
                  <dt>Recovery Attempts:</dt>
                  <dd>{errorContext?.recoveryAttempts || 0}</dd>
                </dl>

                {error.stack && (
                  <>
                    <h3>Stack Trace</h3>
                    <pre className="focus-fallback-stack">
                      {error.stack}
                    </pre>
                  </>
                )}

                <button
                  onClick={copyErrorDetails}
                  className="focus-fallback-button focus-fallback-button-small"
                  aria-label="Copy error details to clipboard"
                >
                  {copiedToClipboard ? 'Copied!' : 'Copy Error Details'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Link */}
        <div className="focus-fallback-support">
          <p>
            If this problem persists, please{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                console.log('Support requested for error:', error);
              }}
              aria-label="Contact support for help with this error"
            >
              contact support
            </a>{' '}
            with the error details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusFallbackUI;