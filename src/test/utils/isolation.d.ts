/**
 * Type definitions for Test Isolation Framework
 * Provides TypeScript support and IDE intellisense for isolation utilities
 */

export interface IsolationConfig {
  /** Maximum time to wait for iframe setup (default: 5000ms) */
  timeout?: number;
  /** Whether to proxy console output from iframe to parent (default: true) */
  enableConsoleProxy?: boolean;
  /** Whether to catch and proxy errors from iframe (default: true) */
  enableErrorHandling?: boolean;
  /** Test utilities to inject into iframe global scope */
  testUtils?: Record<string, any>;
  /** Base HTML content for iframe (default: minimal HTML5) */
  baseHTML?: string;
  /** External scripts to load in iframe */
  scripts?: string[];
  /** CSS styles to apply in iframe */
  styles?: string[];
}

export interface IsolationContext {
  /** The iframe element containing the isolated environment */
  iframe: HTMLIFrameElement;
  /** The iframe's window object */
  window: Window;
  /** The iframe's document object */
  document: Document;
  /** Unique identifier for this isolation instance */
  id: string;
  /** Timestamp when isolation was created */
  created: number;
  /** Function to cleanup this isolation environment */
  cleanup: () => Promise<void>;
}

export interface TestContext {
  /** The iframe's window object */
  window: Window;
  /** The iframe's document object */
  document: Document;
  /** The full isolation context */
  isolation: IsolationContext;
  /** Function to cleanup isolation environment */
  cleanup: () => Promise<void>;
}

export interface IsolationStats {
  /** Total isolation environments created */
  created: number;
  /** Total isolation environments destroyed */
  destroyed: number;
  /** Currently active isolation environments */
  currentActive: number;
  /** Total tests run in isolation */
  totalTests: number;
  /** Number of errors during isolation setup/cleanup */
  errors: number;
  /** Memory efficiency percentage (destroyed/created * 100) */
  memoryEfficiency: number;
  /** Average lifetime per isolation environment */
  averageLifetime: number;
}

export type IsolatedTestFunction = (context: TestContext) => any | Promise<any>;

export type IsolatedTestRunner = (testName: string, testFunction: IsolatedTestFunction) => Promise<void>;

export type TestSuiteFunction = (isolatedTest: IsolatedTestRunner) => Promise<void>;

/**
 * Creates an isolated test environment using iframe sandboxing
 */
export function createIsolatedEnvironment(config?: IsolationConfig): Promise<IsolationContext>;

/**
 * Executes a test function in complete isolation
 */
export function runInIsolation<T = any>(
  testName: string, 
  testFunction: IsolatedTestFunction,
  config?: IsolationConfig
): Promise<T>;

/**
 * Destroys an isolated environment and cleans up all references
 */
export function cleanupIsolation(isolationContext: IsolationContext): Promise<void>;

/**
 * High-level wrapper for creating isolated test suites
 */
export function isolatedTestSuite(
  suiteName: string,
  config: IsolationConfig,
  suiteFunction: TestSuiteFunction
): Promise<void>;

/**
 * Gets current isolation statistics
 */
export function getIsolationStats(): IsolationStats;

/**
 * Resets isolation statistics
 */
export function resetIsolationStats(): void;