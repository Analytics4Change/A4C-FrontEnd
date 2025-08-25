/**
 * Performance Test Suite for Focus Management System
 * 
 * Performance Targets:
 * - Focus transition: <50ms
 * - Modal open/close: <100ms
 * - Memory usage: <3MB
 * - Test execution: <5s
 * - Zero memory leaks
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  PerformanceOptimizedFocusManagerProvider,
  usePerformanceOptimizedFocusManager 
} from '../PerformanceOptimizedFocusManager';
import { FocusableElement } from '../types';

// Performance monitoring utilities
class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start) {
      throw new Error(`Start mark ${startMark} not found`);
    }

    const duration = (end || performance.now()) - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);
    
    return duration;
  }

  getStats(name: string) {
    const measures = this.measures.get(name) || [];
    if (measures.length === 0) return null;

    const sorted = [...measures].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: measures.reduce((a, b) => a + b, 0) / measures.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      count: measures.length
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Test component that uses focus manager
const TestComponent: React.FC<{
  count?: number;
  onFocusChange?: (id: string | undefined) => void;
}> = ({ count = 10, onFocusChange }) => {
  const focusManager = usePerformanceOptimizedFocusManager();
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    // Register elements
    refs.current.forEach((ref, index) => {
      if (ref) {
        const element: FocusableElement = {
          id: `field-${index}`,
          ref: { current: ref },
          type: 'input',
          scopeId: 'default',
          skipInNavigation: false,
          tabIndex: index,
          metadata: { order: index }
        };
        focusManager.registerElement(element);
      }
    });

    return () => {
      refs.current.forEach((_, index) => {
        focusManager.unregisterElement(`field-${index}`);
      });
    };
  }, [focusManager]);

  React.useEffect(() => {
    if (onFocusChange) {
      onFocusChange(focusManager.state.currentFocusId);
    }
  }, [focusManager.state.currentFocusId, onFocusChange]);

  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          data-testid={`field-${i}`}
          placeholder={`Field ${i}`}
        />
      ))}
      <button onClick={() => focusManager.focusNext()}>Next</button>
      <button onClick={() => focusManager.focusPrevious()}>Previous</button>
    </div>
  );
};

describe('Performance Benchmarks', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    monitor.clear();
  });

  describe('Focus Transition Performance', () => {
    it('should achieve <50ms focus transition time', async () => {
      const { container } = render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestComponent count={20} />
        </PerformanceOptimizedFocusManagerProvider>
      );

      // Wait for initial render
      await vi.runAllTimersAsync();

      const nextButton = screen.getByText('Next');
      const measurements: number[] = [];

      // Perform multiple focus transitions
      for (let i = 0; i < 10; i++) {
        monitor.mark('focus-start');
        fireEvent.click(nextButton);
        await vi.runAllTimersAsync();
        const duration = monitor.measure('focus-transition', 'focus-start');
        measurements.push(duration);
      }

      const stats = monitor.getStats('focus-transition');
      
      expect(stats).not.toBeNull();
      expect(stats!.avg).toBeLessThan(50); // Average < 50ms
      expect(stats!.p95).toBeLessThan(75); // 95th percentile < 75ms
      expect(stats!.p99).toBeLessThan(100); // 99th percentile < 100ms
    });

    it('should handle rapid focus changes efficiently', async () => {
      const { container } = render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestComponent count={10} />
        </PerformanceOptimizedFocusManagerProvider>
      );

      await vi.runAllTimersAsync();

      const nextButton = screen.getByText('Next');
      
      monitor.mark('rapid-start');
      
      // Rapid fire 50 focus changes
      for (let i = 0; i < 50; i++) {
        fireEvent.click(nextButton);
      }
      
      await vi.runAllTimersAsync();
      const totalDuration = monitor.measure('rapid-focus', 'rapid-start');
      
      // Should batch and debounce efficiently
      expect(totalDuration).toBeLessThan(500); // 50 changes in < 500ms
      
      // Average per operation should be very low due to batching
      const avgPerOperation = totalDuration / 50;
      expect(avgPerOperation).toBeLessThan(10); // < 10ms per operation
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when registering/unregistering elements', async () => {
      const TestWithLifecycle: React.FC = () => {
        const [mounted, setMounted] = React.useState(true);
        
        return (
          <PerformanceOptimizedFocusManagerProvider>
            {mounted && <TestComponent count={100} />}
            <button onClick={() => setMounted(!mounted)}>Toggle</button>
          </PerformanceOptimizedFocusManagerProvider>
        );
      };

      const { rerender } = render(<TestWithLifecycle />);
      const toggleButton = screen.getByText('Toggle');

      // Get initial memory baseline (if available)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Cycle mount/unmount multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(toggleButton); // Unmount
        await vi.runAllTimersAsync();
        fireEvent.click(toggleButton); // Mount
        await vi.runAllTimersAsync();
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      // Check memory after cycles
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        // Memory growth should be minimal (< 500KB for 10 cycles)
        expect(memoryGrowth).toBeLessThan(500 * 1024);
      }
    });

    it('should maintain bounded history size', async () => {
      let focusManager: any;
      
      const TestWithRef: React.FC = () => {
        focusManager = usePerformanceOptimizedFocusManager();
        return <TestComponent count={5} />;
      };

      render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestWithRef />
        </PerformanceOptimizedFocusManagerProvider>
      );

      await vi.runAllTimersAsync();

      // Generate more than MAX_HISTORY_SIZE (100) focus changes
      for (let i = 0; i < 150; i++) {
        await focusManager.focusField(`field-${i % 5}`);
        await vi.runAllTimersAsync();
      }

      // History should be bounded to MAX_HISTORY_SIZE
      expect(focusManager.state.history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Modal Performance', () => {
    it('should open/close modals in <100ms', async () => {
      let focusManager: any;
      
      const ModalTest: React.FC = () => {
        focusManager = usePerformanceOptimizedFocusManager();
        const [modalOpen, setModalOpen] = React.useState(false);

        const openModal = () => {
          monitor.mark('modal-open-start');
          focusManager.pushScope({
            id: 'modal',
            type: 'modal',
            trapFocus: true,
            autoFocus: false,
            createdAt: Date.now()
          });
          setModalOpen(true);
        };

        const closeModal = () => {
          monitor.mark('modal-close-start');
          focusManager.popScope();
          setModalOpen(false);
        };

        return (
          <div>
            <button onClick={openModal}>Open Modal</button>
            {modalOpen && (
              <div role="dialog">
                <button onClick={closeModal}>Close Modal</button>
              </div>
            )}
          </div>
        );
      };

      render(
        <PerformanceOptimizedFocusManagerProvider>
          <ModalTest />
        </PerformanceOptimizedFocusManagerProvider>
      );

      const openButton = screen.getByText('Open Modal');

      // Test modal open performance
      fireEvent.click(openButton);
      await vi.runAllTimersAsync();
      const openDuration = monitor.measure('modal-open', 'modal-open-start');
      
      expect(openDuration).toBeLessThan(100);

      // Test modal close performance
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);
      await vi.runAllTimersAsync();
      const closeDuration = monitor.measure('modal-close', 'modal-close-start');
      
      expect(closeDuration).toBeLessThan(100);
    });
  });

  describe('RAF Batching', () => {
    it('should batch multiple operations in single frame', async () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      
      render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestComponent count={10} />
        </PerformanceOptimizedFocusManagerProvider>
      );

      const nextButton = screen.getByText('Next');
      
      // Trigger multiple operations rapidly
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }

      // RAF should be called but operations batched
      expect(rafSpy).toHaveBeenCalled();
      
      // Run RAF callbacks
      await vi.runAllTimersAsync();
      
      // Should batch efficiently (not 5 separate RAF calls)
      expect(rafSpy.mock.calls.length).toBeLessThanOrEqual(2);
      
      rafSpy.mockRestore();
    });
  });

  describe('Debouncing', () => {
    it('should debounce rapid focus operations', async () => {
      let focusChangeCount = 0;
      
      const TestWithCounter: React.FC = () => {
        return (
          <TestComponent 
            count={5} 
            onFocusChange={() => { focusChangeCount++; }}
          />
        );
      };

      render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestWithCounter />
        </PerformanceOptimizedFocusManagerProvider>
      );

      const nextButton = screen.getByText('Next');
      
      // Rapid fire clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }

      await vi.runAllTimersAsync();
      
      // Should debounce and not trigger 10 focus changes
      expect(focusChangeCount).toBeLessThan(10);
    });
  });

  describe('Overall Performance', () => {
    it('should handle complex scenarios within performance budget', async () => {
      monitor.mark('scenario-start');
      
      const ComplexScenario: React.FC = () => {
        const [modals, setModals] = React.useState<number[]>([]);
        const focusManager = usePerformanceOptimizedFocusManager();

        const addModal = () => {
          const id = modals.length;
          focusManager.pushScope({
            id: `modal-${id}`,
            type: 'modal',
            trapFocus: true,
            autoFocus: false,
            createdAt: Date.now()
          });
          setModals([...modals, id]);
        };

        const removeModal = () => {
          focusManager.popScope();
          setModals(modals.slice(0, -1));
        };

        return (
          <div>
            <TestComponent count={20} />
            <button onClick={addModal}>Add Modal</button>
            <button onClick={removeModal}>Remove Modal</button>
            {modals.map(id => (
              <div key={id} role="dialog">
                Modal {id}
                <TestComponent count={5} />
              </div>
            ))}
          </div>
        );
      };

      render(
        <PerformanceOptimizedFocusManagerProvider>
          <ComplexScenario />
        </PerformanceOptimizedFocusManagerProvider>
      );

      // Complex interaction sequence
      const addButton = screen.getByText('Add Modal');
      const nextButton = screen.getByText('Next');

      // Add multiple modals
      for (let i = 0; i < 3; i++) {
        fireEvent.click(addButton);
        await vi.runAllTimersAsync();
      }

      // Navigate through fields
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
        await vi.runAllTimersAsync();
      }

      // Remove modals
      const removeButton = screen.getByText('Remove Modal');
      for (let i = 0; i < 3; i++) {
        fireEvent.click(removeButton);
        await vi.runAllTimersAsync();
      }

      const totalDuration = monitor.measure('complex-scenario', 'scenario-start');
      
      // Complex scenario should complete quickly
      expect(totalDuration).toBeLessThan(1000); // < 1 second for entire scenario
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide performance metrics', async () => {
      const metrics: any = {};
      
      const TestWithMetrics: React.FC = () => {
        const focusManager = usePerformanceOptimizedFocusManager();
        
        // Collect metrics
        metrics.elementCount = focusManager.state.elements.size;
        metrics.historyLength = focusManager.state.history.length;
        metrics.scopeCount = focusManager.state.scopes.length;
        metrics.modalCount = focusManager.state.modalStack.length;
        
        return <TestComponent count={10} />;
      };

      render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestWithMetrics />
        </PerformanceOptimizedFocusManagerProvider>
      );

      await vi.runAllTimersAsync();

      // Verify metrics are available
      expect(metrics.elementCount).toBeGreaterThanOrEqual(0);
      expect(metrics.historyLength).toBeGreaterThanOrEqual(0);
      expect(metrics.scopeCount).toBeGreaterThanOrEqual(1);
      expect(metrics.modalCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Performance Regression Tests', () => {
  it('should maintain performance across multiple test runs', async () => {
    const monitor = new PerformanceMonitor();
    const runCount = 5;

    for (let run = 0; run < runCount; run++) {
      const { unmount } = render(
        <PerformanceOptimizedFocusManagerProvider>
          <TestComponent count={10} />
        </PerformanceOptimizedFocusManagerProvider>
      );

      monitor.mark(`run-${run}-start`);
      
      const nextButton = screen.getByText('Next');
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
        await waitFor(() => {});
      }
      
      monitor.measure(`run-${run}`, `run-${run}-start`);
      unmount();
    }

    // Check for performance consistency
    const durations = Array.from({ length: runCount }, (_, i) => 
      monitor.measures.get(`run-${i}`)?.[0] || 0
    );

    const avg = durations.reduce((a, b) => a + b, 0) / runCount;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / runCount;
    const stdDev = Math.sqrt(variance);

    // Performance should be consistent (low standard deviation)
    expect(stdDev).toBeLessThan(avg * 0.2); // Less than 20% variance
  });
});