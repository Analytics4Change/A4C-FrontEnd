/**
 * TypeScript Declarations for Memory-Safe Component Testing Utilities
 * 
 * Phase 5.1 - Component Testing Utilities Type Definitions
 * 
 * Provides TypeScript support for all memory-safe component testing utilities
 * with comprehensive type safety and IntelliSense support.
 */

import type { ReactElement, ReactNode } from 'react';
import type { RenderOptions, RenderResult } from '@testing-library/react';

/**
 * Configuration options for component lifecycle tracking
 */
export interface LifecycleTrackingOptions {
  /** Enable verbose lifecycle logging */
  verbose?: boolean;
  
  /** Warn if component isn't unmounted within timeout (ms) */
  unmountTimeout?: number;
  
  /** Track async operations (timers, promises, etc.) */
  trackAsync?: boolean;
  
  /** Component identifier for debugging */
  componentName?: string;
}

/**
 * Configuration options for cleanup operations
 */
export interface CleanupOptions {
  /** Automatically unmount in afterEach hooks */
  autoUnmount?: boolean;
  
  /** Track component lifecycle for debugging */
  trackLifecycle?: boolean;
  
  /** Force garbage collection after cleanup (if available) */
  forceGC?: boolean;
  
  /** Use aggressive cleanup mode for stubborn components */
  aggressiveCleanup?: boolean;
  
  /** Component name for debugging */
  componentName?: string;
}

/**
 * Configuration options for isolated rendering
 */
export interface IsolationOptions extends RenderOptions {
  /** Create iframe for complete DOM isolation */
  useIframe?: boolean;
  
  /** Timeout for isolation cleanup (ms) */
  cleanupTimeout?: number;
  
  /** Copy parent styles to isolated context */
  copyStyles?: boolean;
  
  /** Component name for debugging */
  componentName?: string;
}

/**
 * Options for force cleanup operations
 */
export interface ForceCleanupOptions {
  /** Remove all event listeners by cloning elements */
  removeEventListeners?: boolean;
  
  /** Clear all data attributes and custom properties */
  clearDataAttributes?: boolean;
  
  /** Remove portal elements from document body */
  clearPortals?: boolean;
  
  /** Clear React fiber references (dangerous - use with caution) */
  clearReactFibers?: boolean;
  
  /** Force DOM mutation observer disconnect */
  clearObservers?: boolean;
  
  /** Clear window/global references */
  clearGlobalRefs?: boolean;
}

/**
 * Options for memory leak detection
 */
export interface MemoryLeakDetectionOptions {
  /** Memory threshold for leak detection (in MB) */
  memoryThreshold?: number;
  
  /** Number of test iterations to run */
  iterations?: number;
  
  /** Force GC between iterations */
  forceGC?: boolean;
  
  /** Component name for reporting */
  componentName?: string;
}

/**
 * Results from memory leak detection
 */
export interface MemoryLeakDetectionResults {
  /** Individual iteration results */
  iterations: Array<{
    iteration: number;
    memoryBefore: NodeJS.MemoryUsage;
    memoryAfter: NodeJS.MemoryUsage;
    memoryGrowth: number;
  }>;
  
  /** Whether a memory leak was detected */
  memoryLeak: boolean;
  
  /** Average memory growth across iterations */
  averageMemoryGrowth: number;
  
  /** Recommendations for fixing memory leaks */
  recommendations: string[];
}

/**
 * Enhanced render result with cleanup tracking
 */
export interface EnhancedRenderResult extends RenderResult {
  /** Internal lifecycle tracker (for debugging) */
  _tracker?: ComponentLifecycleTracker;
  
  /** Cleanup configuration used */
  _cleanupConfig?: CleanupOptions;
  
  /** Isolated container element (for isolated renders) */
  _isolatedContainer?: HTMLElement;
  
  /** Iframe element (for iframe-based isolation) */
  _iframe?: HTMLIFrameElement;
  
  /** Isolation configuration */
  _config?: IsolationOptions;
  
  /** Lifecycle tracker instance */
  _lifecycleTracker?: ComponentLifecycleTracker;
  
  /** Track a timer for cleanup */
  trackTimer?: (id: number | NodeJS.Timeout) => void;
  
  /** Track an observer for cleanup */
  trackObserver?: (observer: { disconnect(): void }) => void;
  
  /** Track a subscription for cleanup */
  trackSubscription?: (subscription: { unsubscribe(): void } | (() => void)) => void;
  
  /** Add custom cleanup callback */
  addCleanup?: (callback: () => void) => void;
}

/**
 * Component lifecycle tracker
 */
export declare class ComponentLifecycleTracker {
  constructor(componentName: string);
  
  /** Component name */
  readonly componentName: string;
  
  /** Mount timestamp */
  readonly mountTime: number | null;
  
  /** Unmount timestamp */
  readonly unmountTime: number | null;
  
  /** Called when component mounts */
  onMount(): void;
  
  /** Called when component unmounts */
  onUnmount(): void;
  
  /** Add cleanup callback */
  addCleanupCallback(callback: () => void): void;
  
  /** Track timer for cleanup */
  trackTimer(timerId: number | NodeJS.Timeout): void;
  
  /** Track observer for cleanup */
  trackObserver(observer: { disconnect(): void }): void;
  
  /** Track subscription for cleanup */
  trackSubscription(subscription: { unsubscribe(): void } | (() => void)): void;
  
  /** Warn if component not unmounted */
  warnIfNotUnmounted(): void;
}

/**
 * Enhanced Render Utilities
 */

/**
 * Render with automatic unmounting and cleanup
 */
export declare function renderWithCleanup(
  ui: ReactElement,
  options?: RenderOptions,
  cleanupOptions?: CleanupOptions
): EnhancedRenderResult;

/**
 * Render in isolated container
 */
export declare function renderInIsolation(
  ui: ReactElement,
  options?: IsolationOptions
): EnhancedRenderResult;

/**
 * Monitor component mount/unmount cycles
 */
export declare function trackComponentLifecycle(
  ui: ReactElement,
  options?: LifecycleTrackingOptions
): EnhancedRenderResult;

/**
 * Aggressive cleanup for stubborn components
 */
export declare function forceComponentCleanup(
  container: HTMLElement,
  options?: ForceCleanupOptions
): void;

/**
 * Memory-safe render function (drop-in replacement for RTL render)
 */
export declare function render(
  ui: ReactElement,
  options?: RenderOptions & { memorySafe?: boolean; trackLifecycle?: boolean; autoCleanup?: boolean }
): EnhancedRenderResult;

/**
 * React 18 Concurrent Features Support
 */

/**
 * Render with React 18 concurrent features support
 */
export declare function renderConcurrent(
  ui: ReactElement,
  options?: RenderOptions & {
    concurrent?: boolean;
    suspenseTimeout?: number;
    enableTransitions?: boolean;
  }
): EnhancedRenderResult;

/**
 * Cleanup Suspense and Error boundaries
 */
export declare function cleanupSuspenseAndErrorBoundaries(): void;

/**
 * Memory Leak Detection
 */

/**
 * Detect component memory leaks
 */
export declare function detectComponentMemoryLeaks(
  testFunction: () => void | Promise<void>,
  options?: MemoryLeakDetectionOptions
): Promise<MemoryLeakDetectionResults>;

/**
 * Enhanced Cleanup
 */

/**
 * Enhanced cleanup that goes beyond RTL cleanup
 */
export declare function cleanup(): void;

/**
 * Re-exports from @testing-library/react
 */
export { act, cleanup as rtlCleanup } from '@testing-library/react';

/**
 * Default export (memory-safe render function)
 */
declare const _default: typeof render;
export default _default;