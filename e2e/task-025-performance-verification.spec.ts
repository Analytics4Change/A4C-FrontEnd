/**
 * Task 025: Cross-Browser Performance Verification
 * 
 * E2E tests to verify performance improvements across all browsers
 * Validates Task 024 optimizations in real browser environments
 */

import { test, expect, Page, Browser } from '@playwright/test';

interface PerformanceMetrics {
  focusTransitionTime: number;
  modalOperationTime: number;
  memoryUsage: number;
  renderTime: number;
  rafCallCount: number;
}

class CrossBrowserPerformanceValidator {
  private page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async setupPerformanceMonitoring(): Promise<void> {
    await this.page.addInitScript(() => {
      (window as any).performanceMetrics = {
        marks: new Map(),
        measures: [],
        rafCalls: 0
      };

      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function(callback) {
        (window as any).performanceMetrics.rafCalls++;
        return originalRAF(callback);
      };

      (window as any).measurePerformance = {
        mark: (name: string) => {
          (window as any).performanceMetrics.marks.set(name, performance.now());
        },
        measure: (name: string, startMark: string) => {
          const start = (window as any).performanceMetrics.marks.get(startMark);
          if (start) {
            const duration = performance.now() - start;
            (window as any).performanceMetrics.measures.push({
              name,
              duration,
              timestamp: performance.now()
            });
            return duration;
          }
          return 0;
        },
        getRAFCount: () => (window as any).performanceMetrics.rafCalls,
        reset: () => {
          (window as any).performanceMetrics.rafCalls = 0;
          (window as any).performanceMetrics.marks.clear();
          (window as any).performanceMetrics.measures = [];
        }
      };
    });
  }

  async measureFocusTransition(): Promise<number> {
    await this.page.evaluate(() => {
      (window as any).measurePerformance.mark('focus-start');
    });

    await this.page.click('[data-testid="load-next-btn"]');
    await this.page.waitForTimeout(50); // Allow for transition

    return await this.page.evaluate(() => {
      return (window as any).measurePerformance.measure('focus-transition', 'focus-start');
    });
  }

  async measureModalOperation(): Promise<number> {
    await this.page.evaluate(() => {
      (window as any).measurePerformance.mark('modal-start');
    });

    // Simulate modal open operation
    await this.page.evaluate(() => {
      const focusManager = (window as any).focusManager;
      if (focusManager) {
        focusManager.pushScope({
          id: 'perf-test-modal',
          type: 'modal',
          trapFocus: true,
          autoFocus: false,
          createdAt: Date.now()
        });
      }
    });

    await this.page.waitForTimeout(50);

    return await this.page.evaluate(() => {
      return (window as any).measurePerformance.measure('modal-operation', 'modal-start');
    });
  }

  async getMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
  }

  async measureRenderTime(elementCount: number): Promise<number> {
    await this.page.evaluate((count) => {
      (window as any).measurePerformance.mark('render-start');
    }, elementCount);

    await this.page.waitForSelector(`[data-testid="load-field-${elementCount - 1}"]`);

    return await this.page.evaluate(() => {
      return (window as any).measurePerformance.measure('render-time', 'render-start');
    });
  }

  async getRAFCallCount(): Promise<number> {
    return await this.page.evaluate(() => {
      return (window as any).measurePerformance.getRAFCount();
    });
  }

  async resetMetrics(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).measurePerformance.reset();
    });
  }
}

test.describe('Task 025: Cross-Browser Performance Verification', () => {
  let validator: CrossBrowserPerformanceValidator;

  test.beforeEach(async ({ page }) => {
    validator = new CrossBrowserPerformanceValidator(page);
    await validator.setupPerformanceMonitoring();
    
    // Navigate to performance test page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Chrome Performance Validation', () => {
    test('should achieve performance targets in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chrome-specific test');
      
      await validator.resetMetrics();
      
      // Load test component with 20 elements
      await page.goto('/?test=performance&elements=20');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      const renderTime = await validator.measureRenderTime(20);
      expect(renderTime).toBeLessThan(500); // < 500ms render time
      
      // Test focus transitions (10 measurements)
      const focusTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        const focusTime = await validator.measureFocusTransition();
        focusTimes.push(focusTime);
        await page.waitForTimeout(100); // Space out measurements
      }
      
      const avgFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
      expect(avgFocusTime).toBeLessThan(40); // < 40ms average
      expect(Math.max(...focusTimes)).toBeLessThan(60); // Max < 60ms
      
      // Test modal operations
      const modalTime = await validator.measureModalOperation();
      expect(modalTime).toBeLessThan(75); // < 75ms modal operation
      
      // Check memory usage
      const memoryUsage = await validator.getMemoryUsage();
      if (memoryUsage > 0) {
        expect(memoryUsage / (1024 * 1024)).toBeLessThan(2.5); // < 2.5MB
      }
      
      // Verify RAF usage
      const rafCalls = await validator.getRAFCallCount();
      expect(rafCalls).toBeGreaterThan(0); // RAF is being used
    });
  });

  test.describe('Firefox Performance Validation', () => {
    test('should achieve performance targets in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox-specific test');
      
      await validator.resetMetrics();
      
      await page.goto('/?test=performance&elements=20');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      // Firefox-specific performance validation
      const focusTimes: number[] = [];
      for (let i = 0; i < 8; i++) {
        const focusTime = await validator.measureFocusTransition();
        focusTimes.push(focusTime);
        await page.waitForTimeout(120); // Slightly longer wait for Firefox
      }
      
      const avgFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
      expect(avgFocusTime).toBeLessThan(45); // Slightly relaxed for Firefox
      
      const modalTime = await validator.measureModalOperation();
      expect(modalTime).toBeLessThan(80); // Slightly relaxed for Firefox
      
      const memoryUsage = await validator.getMemoryUsage();
      if (memoryUsage > 0) {
        expect(memoryUsage / (1024 * 1024)).toBeLessThan(3.0); // Relaxed for Firefox
      }
    });
  });

  test.describe('Safari/WebKit Performance Validation', () => {
    test('should achieve performance targets in Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Safari-specific test');
      
      await validator.resetMetrics();
      
      await page.goto('/?test=performance&elements=20');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      // Safari-specific performance validation
      const focusTimes: number[] = [];
      for (let i = 0; i < 8; i++) {
        const focusTime = await validator.measureFocusTransition();
        focusTimes.push(focusTime);
        await page.waitForTimeout(100);
      }
      
      const avgFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
      expect(avgFocusTime).toBeLessThan(42); // Safari often performs well
      
      const modalTime = await validator.measureModalOperation();
      expect(modalTime).toBeLessThan(75);
      
      // Safari memory checking (if available)
      const memoryUsage = await validator.getMemoryUsage();
      if (memoryUsage > 0) {
        expect(memoryUsage / (1024 * 1024)).toBeLessThan(2.8);
      }
    });
  });

  test.describe('Edge Performance Validation', () => {
    test('should achieve performance targets in Edge', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium' || !process.env.EDGE_TEST, 'Edge-specific test');
      
      await validator.resetMetrics();
      
      await page.goto('/?test=performance&elements=20');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      const focusTimes: number[] = [];
      for (let i = 0; i < 8; i++) {
        const focusTime = await validator.measureFocusTransition();
        focusTimes.push(focusTime);
        await page.waitForTimeout(110);
      }
      
      const avgFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
      expect(avgFocusTime).toBeLessThan(50); // Slightly relaxed for Edge
      
      const modalTime = await validator.measureModalOperation();
      expect(modalTime).toBeLessThan(85); // Slightly relaxed for Edge
    });
  });

  test.describe('Load Testing Across Browsers', () => {
    test('should handle 100 elements with acceptable performance', async ({ page }) => {
      await validator.resetMetrics();
      
      await page.goto('/?test=performance&elements=100');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      const renderTime = await validator.measureRenderTime(100);
      expect(renderTime).toBeLessThan(2000); // < 2s for 100 elements
      
      // Test navigation with 100 elements
      const focusTime = await validator.measureFocusTransition();
      expect(focusTime).toBeLessThan(60); // < 60ms with 100 elements
      
      const memoryUsage = await validator.getMemoryUsage();
      if (memoryUsage > 0) {
        expect(memoryUsage / (1024 * 1024)).toBeLessThan(3.5); // < 3.5MB with 100 elements
      }
    });

    test('should handle 500 elements within boundary conditions', async ({ page }) => {
      await validator.resetMetrics();
      
      await page.goto('/?test=performance&elements=500');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      const renderTime = await validator.measureRenderTime(500);
      expect(renderTime).toBeLessThan(5000); // < 5s for 500 elements
      
      const focusTime = await validator.measureFocusTransition();
      expect(focusTime).toBeLessThan(100); // < 100ms with 500 elements
      
      const memoryUsage = await validator.getMemoryUsage();
      if (memoryUsage > 0) {
        expect(memoryUsage / (1024 * 1024)).toBeLessThan(5.0); // < 5MB with 500 elements
      }
    });
  });

  test.describe('Performance Regression Detection', () => {
    test('should maintain consistent performance across multiple runs', async ({ page }) => {
      const runCount = 5;
      const focusTimes: number[] = [];
      
      for (let run = 0; run < runCount; run++) {
        await page.reload();
        await validator.setupPerformanceMonitoring();
        await page.goto('/?test=performance&elements=20');
        await page.waitForSelector('[data-testid="load-test-container"]');
        
        const focusTime = await validator.measureFocusTransition();
        focusTimes.push(focusTime);
        
        await page.waitForTimeout(200); // Cool down between runs
      }
      
      const avgTime = focusTimes.reduce((a, b) => a + b, 0) / runCount;
      const variance = focusTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / runCount;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgTime;
      
      // Performance should be consistent across runs
      expect(coefficientOfVariation).toBeLessThan(0.3); // < 30% variation
      expect(avgTime).toBeLessThan(45); // Average still meets target
    });

    test('should show no performance degradation over extended use', async ({ page }) => {
      await page.goto('/?test=performance&elements=30');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      // Baseline performance
      await validator.resetMetrics();
      const baselineFocusTime = await validator.measureFocusTransition();
      
      // Extended use simulation
      for (let i = 0; i < 50; i++) {
        await page.click('[data-testid="load-next-btn"]');
        await page.waitForTimeout(20);
      }
      
      // Performance after extended use
      const extendedFocusTime = await validator.measureFocusTransition();
      
      // Should not degrade significantly
      const degradationRatio = extendedFocusTime / baselineFocusTime;
      expect(degradationRatio).toBeLessThan(1.5); // < 50% degradation
      expect(extendedFocusTime).toBeLessThan(60); // Still within bounds
    });
  });

  test.describe('Memory Leak Validation', () => {
    test('should not leak memory during extended operations', async ({ page }) => {
      await page.goto('/?test=performance&elements=50');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      const initialMemory = await validator.getMemoryUsage();
      
      // Perform 200 operations
      for (let i = 0; i < 200; i++) {
        await page.click('[data-testid="load-next-btn"]');
        if (i % 20 === 0) {
          await page.waitForTimeout(50); // Periodic pause
        }
      }
      
      // Force garbage collection if possible
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await validator.getMemoryUsage();
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);
        expect(memoryGrowth).toBeLessThan(1.0); // < 1MB growth
      }
    });
  });

  test.describe('RAF Batching Verification', () => {
    test('should use RAF for smooth operations', async ({ page }) => {
      await page.goto('/?test=performance&elements=20');
      await page.waitForSelector('[data-testid="load-test-container"]');
      
      await validator.resetMetrics();
      
      // Trigger multiple rapid operations
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="load-next-btn"]');
      }
      
      await page.waitForTimeout(200);
      
      const rafCalls = await validator.getRAFCallCount();
      
      // Should use RAF for batching
      expect(rafCalls).toBeGreaterThan(0);
      expect(rafCalls).toBeLessThanOrEqual(15); // Efficient batching
    });
  });
});

test.describe('Task 025: Performance Variance Analysis', () => {
  test('should document performance variance across browsers', async ({ page, browserName }) => {
    const validator = new CrossBrowserPerformanceValidator(page);
    await validator.setupPerformanceMonitoring();
    
    await page.goto('/?test=performance&elements=25');
    await page.waitForSelector('[data-testid="load-test-container"]');
    
    // Collect multiple measurements
    const measurements: PerformanceMetrics[] = [];
    
    for (let i = 0; i < 5; i++) {
      await validator.resetMetrics();
      
      const focusTime = await validator.measureFocusTransition();
      const modalTime = await validator.measureModalOperation();
      const memoryUsage = await validator.getMemoryUsage();
      const renderTime = await validator.measureRenderTime(25);
      const rafCalls = await validator.getRAFCallCount();
      
      measurements.push({
        focusTransitionTime: focusTime,
        modalOperationTime: modalTime,
        memoryUsage: memoryUsage / (1024 * 1024), // Convert to MB
        renderTime,
        rafCallCount: rafCalls
      });
      
      await page.waitForTimeout(300); // Cool down
    }
    
    // Calculate statistics
    const avgFocus = measurements.reduce((sum, m) => sum + m.focusTransitionTime, 0) / measurements.length;
    const avgModal = measurements.reduce((sum, m) => sum + m.modalOperationTime, 0) / measurements.length;
    const avgMemory = measurements.reduce((sum, m) => sum + m.memoryUsage, 0) / measurements.length;
    
    // Browser-specific expectations
    const browserExpectations = {
      chromium: { maxFocus: 40, maxModal: 75, maxMemory: 2.5 },
      firefox: { maxFocus: 45, maxModal: 80, maxMemory: 3.0 },
      webkit: { maxFocus: 42, maxModal: 75, maxMemory: 2.8 }
    };
    
    const expectations = browserExpectations[browserName as keyof typeof browserExpectations] || browserExpectations.chromium;
    
    expect(avgFocus).toBeLessThan(expectations.maxFocus);
    expect(avgModal).toBeLessThan(expectations.maxModal);
    if (avgMemory > 0) {
      expect(avgMemory).toBeLessThan(expectations.maxMemory);
    }
    
    // Log performance data for reporting
    console.log(`${browserName} Performance:`, {
      avgFocusTime: avgFocus.toFixed(2),
      avgModalTime: avgModal.toFixed(2),
      avgMemoryMB: avgMemory.toFixed(2),
      measurements: measurements.length
    });
  });
});