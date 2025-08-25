/**
 * Test Isolation Framework - TypeScript Implementation
 * 
 * TypeScript version of the isolation framework with full type safety
 * and enhanced IDE support. Provides the same functionality as the
 * JavaScript version but with compile-time type checking.
 */

// Re-export the types for convenience
export type {
  IsolationConfig,
  IsolationContext,
  TestContext,
  IsolationStats,
  IsolatedTestFunction,
  IsolatedTestRunner,
  TestSuiteFunction
} from './isolation.d.ts';

import type {
  IsolationConfig,
  IsolationContext,
  TestContext,
  IsolationStats,
  IsolatedTestFunction
} from './isolation.d.ts';

// Import the JavaScript implementation and re-export with types
import {
  createIsolatedEnvironment as jsCreateIsolatedEnvironment,
  runInIsolation as jsRunInIsolation,
  cleanupIsolation as jsCleanupIsolation,
  isolatedTestSuite as jsIsolatedTestSuite,
  getIsolationStats as jsGetIsolationStats,
  resetIsolationStats as jsResetIsolationStats
} from './isolation.js';

/**
 * TypeScript wrapper for createIsolatedEnvironment with proper typing
 */
export const createIsolatedEnvironment = (
  config: IsolationConfig = {}
): Promise<IsolationContext> => {
  return jsCreateIsolatedEnvironment(config);
};

/**
 * TypeScript wrapper for runInIsolation with proper typing and generics
 */
export const runInIsolation = <T = any>(
  testName: string,
  testFunction: IsolatedTestFunction,
  config: IsolationConfig = {}
): Promise<T> => {
  return jsRunInIsolation(testName, testFunction, config);
};

/**
 * TypeScript wrapper for cleanupIsolation with proper typing
 */
export const cleanupIsolation = (
  isolationContext: IsolationContext
): Promise<void> => {
  return jsCleanupIsolation(isolationContext);
};

/**
 * TypeScript wrapper for isolatedTestSuite with proper typing
 */
export const isolatedTestSuite = (
  suiteName: string,
  config: IsolationConfig,
  suiteFunction: (isolatedTest: (testName: string, testFunction: IsolatedTestFunction) => Promise<void>) => Promise<void>
): Promise<void> => {
  return jsIsolatedTestSuite(suiteName, config, suiteFunction);
};

/**
 * TypeScript wrapper for getIsolationStats with proper typing
 */
export const getIsolationStats = (): IsolationStats => {
  return jsGetIsolationStats();
};

/**
 * TypeScript wrapper for resetIsolationStats with proper typing
 */
export const resetIsolationStats = (): void => {
  return jsResetIsolationStats();
};

/**
 * Type-safe helper for creating test utilities
 * 
 * This helper provides compile-time type checking for test utilities
 * that will be injected into the isolated environment.
 */
export const createTestUtils = <T extends Record<string, any>>(utils: T): T => {
  return utils;
};

/**
 * Type-safe configuration builder
 * 
 * Provides a fluent interface for building isolation configuration
 * with compile-time validation.
 */
export class IsolationConfigBuilder {
  private config: IsolationConfig = {};

  timeout(ms: number): IsolationConfigBuilder {
    this.config.timeout = ms;
    return this;
  }

  enableConsoleProxy(enable: boolean = true): IsolationConfigBuilder {
    this.config.enableConsoleProxy = enable;
    return this;
  }

  enableErrorHandling(enable: boolean = true): IsolationConfigBuilder {
    this.config.enableErrorHandling = enable;
    return this;
  }

  testUtils<T extends Record<string, any>>(utils: T): IsolationConfigBuilder {
    this.config.testUtils = utils;
    return this;
  }

  baseHTML(html: string): IsolationConfigBuilder {
    this.config.baseHTML = html;
    return this;
  }

  scripts(scripts: string[]): IsolationConfigBuilder {
    this.config.scripts = scripts;
    return this;
  }

  styles(styles: string[]): IsolationConfigBuilder {
    this.config.styles = styles;
    return this;
  }

  build(): IsolationConfig {
    return { ...this.config };
  }
}

/**
 * Creates a new isolation configuration builder
 */
export const configBuilder = (): IsolationConfigBuilder => {
  return new IsolationConfigBuilder();
};

/**
 * Type-safe isolated test decorator
 * 
 * Provides a decorator pattern for easily creating isolated tests
 * with TypeScript support.
 */
export const withIsolation = <T = any>(
  config: IsolationConfig = {}
) => {
  return (testFunction: IsolatedTestFunction): ((testName: string) => Promise<T>) => {
    return async (testName: string): Promise<T> => {
      return runInIsolation<T>(testName, testFunction, config);
    };
  };
};

/**
 * Async iterator for batch isolation testing
 * 
 * Allows for efficient batch testing with isolation using async iterators.
 */
export async function* isolatedTestBatch<T>(
  tests: Array<{ name: string; test: IsolatedTestFunction }>,
  config: IsolationConfig = {}
): AsyncGenerator<{ name: string; result: T; error?: Error }, void, unknown> {
  for (const { name, test } of tests) {
    try {
      const result = await runInIsolation<T>(name, test, config);
      yield { name, result };
    } catch (error) {
      yield { name, result: undefined as any, error: error as Error };
    }
  }
}

/**
 * Memory monitoring hook for isolation tests
 * 
 * Provides detailed memory monitoring capabilities with TypeScript support.
 */
export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  testName?: string;
}

export class IsolationMemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private monitoring = false;

  startMonitoring(): void {
    this.monitoring = true;
    this.snapshots = [];
  }

  stopMonitoring(): void {
    this.monitoring = false;
  }

  captureSnapshot(testName?: string): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      testName,
      ...process.memoryUsage()
    };

    if (this.monitoring) {
      this.snapshots.push(snapshot);
    }

    return snapshot;
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  getMemoryDelta(baseline: MemorySnapshot, current: MemorySnapshot): Partial<MemorySnapshot> {
    return {
      timestamp: current.timestamp - baseline.timestamp,
      heapUsed: current.heapUsed - baseline.heapUsed,
      heapTotal: current.heapTotal - baseline.heapTotal,
      external: current.external - baseline.external,
      rss: current.rss - baseline.rss
    };
  }

  generateReport(): {
    snapshots: MemorySnapshot[];
    summary: {
      totalSnapshots: number;
      averageHeapUsed: number;
      peakHeapUsed: number;
      totalMemoryGrowth: number;
    };
  } {
    if (this.snapshots.length === 0) {
      return {
        snapshots: [],
        summary: {
          totalSnapshots: 0,
          averageHeapUsed: 0,
          peakHeapUsed: 0,
          totalMemoryGrowth: 0
        }
      };
    }

    const averageHeapUsed = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length;
    const peakHeapUsed = Math.max(...this.snapshots.map(s => s.heapUsed));
    const totalMemoryGrowth = this.snapshots[this.snapshots.length - 1].heapUsed - this.snapshots[0].heapUsed;

    return {
      snapshots: [...this.snapshots],
      summary: {
        totalSnapshots: this.snapshots.length,
        averageHeapUsed,
        peakHeapUsed,
        totalMemoryGrowth
      }
    };
  }
}

/**
 * Global memory monitor instance
 */
export const memoryMonitor = new IsolationMemoryMonitor();

/**
 * Higher-order function for memory-monitored isolated tests
 */
export const withMemoryMonitoring = <T = any>(
  config: IsolationConfig = {}
) => {
  return (testFunction: IsolatedTestFunction): ((testName: string) => Promise<{ result: T; memory: MemorySnapshot[] }>) => {
    return async (testName: string): Promise<{ result: T; memory: MemorySnapshot[] }> => {
      const monitor = new IsolationMemoryMonitor();
      monitor.startMonitoring();
      
      const beforeSnapshot = monitor.captureSnapshot(`${testName}-before`);
      
      try {
        const result = await runInIsolation<T>(testName, async (context) => {
          // Capture memory during test execution
          monitor.captureSnapshot(`${testName}-during`);
          return testFunction(context);
        }, config);
        
        const afterSnapshot = monitor.captureSnapshot(`${testName}-after`);
        monitor.stopMonitoring();
        
        return {
          result,
          memory: monitor.getSnapshots()
        };
      } catch (error) {
        monitor.captureSnapshot(`${testName}-error`);
        monitor.stopMonitoring();
        throw error;
      }
    };
  };
};