/**
 * Performance Monitor Component
 * Real-time performance metrics dashboard for focus management system
 * 
 * Displays:
 * - Focus transition times
 * - Memory usage
 * - Operation counts
 * - Performance trends
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformanceOptimizedFocusManager } from '../../contexts/focus/PerformanceOptimizedFocusManager';
import './performance-monitor.css';

interface PerformanceMetrics {
  focusTransitionTime: number;
  modalOperationTime: number;
  memoryUsage: number;
  elementCount: number;
  historySize: number;
  scopeCount: number;
  rafBatchSize: number;
  lastUpdate: number;
}

interface PerformanceHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
}

const HISTORY_SIZE = 50;
const UPDATE_INTERVAL = 1000; // Update every second

export const PerformanceMonitor: React.FC<{
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  expanded?: boolean;
}> = ({ 
  enabled = true, 
  position = 'bottom-right',
  expanded: initialExpanded = false 
}) => {
  const focusManager = usePerformanceOptimizedFocusManager();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    focusTransitionTime: 0,
    modalOperationTime: 0,
    memoryUsage: 0,
    elementCount: 0,
    historySize: 0,
    scopeCount: 0,
    rafBatchSize: 0,
    lastUpdate: Date.now()
  });
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const lastFocusTime = useRef<number>(0);
  const lastModalTime = useRef<number>(0);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);

  // Measure focus transition performance
  const measureFocusTransition = useCallback(() => {
    const entries = performance.getEntriesByType('measure');
    const focusEntries = entries.filter(e => e.name.includes('focus'));
    
    if (focusEntries.length > 0) {
      const latest = focusEntries[focusEntries.length - 1];
      lastFocusTime.current = latest.duration;
    }
  }, []);

  // Measure modal operation performance
  const measureModalOperation = useCallback(() => {
    const entries = performance.getEntriesByType('measure');
    const modalEntries = entries.filter(e => e.name.includes('modal'));
    
    if (modalEntries.length > 0) {
      const latest = modalEntries[modalEntries.length - 1];
      lastModalTime.current = latest.duration;
    }
  }, []);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      focusTransitionTime: lastFocusTime.current,
      modalOperationTime: lastModalTime.current,
      memoryUsage: getMemoryUsage(),
      elementCount: focusManager.state.elements.size,
      historySize: focusManager.state.history.length,
      scopeCount: focusManager.state.scopes.length,
      rafBatchSize: 0, // Would need to expose from RAF batcher
      lastUpdate: Date.now()
    };

    setMetrics(newMetrics);
    
    // Update history
    setHistory(prev => {
      const newHistory = [...prev, { timestamp: Date.now(), metrics: newMetrics }];
      if (newHistory.length > HISTORY_SIZE) {
        newHistory.shift();
      }
      return newHistory;
    });
  }, [focusManager.state, getMemoryUsage]);

  // Setup performance observer
  useEffect(() => {
    if (!enabled) return;

    // Create performance observer for custom measurements
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            if (entry.name.includes('focus')) {
              lastFocusTime.current = entry.duration;
            } else if (entry.name.includes('modal')) {
              lastModalTime.current = entry.duration;
            }
          }
        }
      });

      performanceObserver.current.observe({ entryTypes: ['measure'] });
    }

    // Setup update timer
    updateTimer.current = setInterval(updateMetrics, UPDATE_INTERVAL);

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      if (updateTimer.current) {
        clearInterval(updateTimer.current);
      }
    };
  }, [enabled, updateMetrics]);

  // Calculate performance score
  const getPerformanceScore = (): number => {
    let score = 100;
    
    // Deduct points for slow operations
    if (metrics.focusTransitionTime > 50) score -= 20;
    else if (metrics.focusTransitionTime > 30) score -= 10;
    
    if (metrics.modalOperationTime > 100) score -= 20;
    else if (metrics.modalOperationTime > 75) score -= 10;
    
    if (metrics.memoryUsage > 3) score -= 20;
    else if (metrics.memoryUsage > 2) score -= 10;
    
    if (metrics.historySize > 100) score -= 10;
    
    return Math.max(0, score);
  };

  // Get performance grade
  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Get status color
  const getStatusColor = (value: number, threshold: number, warning: number): string => {
    if (value <= threshold) return 'green';
    if (value <= warning) return 'yellow';
    return 'red';
  };

  if (!enabled) return null;

  const score = getPerformanceScore();
  const grade = getPerformanceGrade(score);

  return (
    <div className={`performance-monitor performance-monitor--${position}`}>
      <div className="performance-monitor__header">
        <span className="performance-monitor__title">Performance Monitor</span>
        <button 
          className="performance-monitor__toggle"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="performance-monitor__body">
          <div className="performance-monitor__score">
            <div className={`performance-monitor__grade performance-monitor__grade--${grade.toLowerCase()}`}>
              {grade}
            </div>
            <div className="performance-monitor__score-value">
              Score: {score}/100
            </div>
          </div>

          <div className="performance-monitor__metrics">
            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">Focus Transition</span>
              <span 
                className={`performance-monitor__metric-value performance-monitor__metric-value--${
                  getStatusColor(metrics.focusTransitionTime, 50, 75)
                }`}
              >
                {metrics.focusTransitionTime.toFixed(2)}ms
              </span>
            </div>

            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">Modal Operation</span>
              <span 
                className={`performance-monitor__metric-value performance-monitor__metric-value--${
                  getStatusColor(metrics.modalOperationTime, 100, 125)
                }`}
              >
                {metrics.modalOperationTime.toFixed(2)}ms
              </span>
            </div>

            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">Memory Usage</span>
              <span 
                className={`performance-monitor__metric-value performance-monitor__metric-value--${
                  getStatusColor(metrics.memoryUsage, 3, 4)
                }`}
              >
                {metrics.memoryUsage.toFixed(2)}MB
              </span>
            </div>

            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">Elements</span>
              <span className="performance-monitor__metric-value">
                {metrics.elementCount}
              </span>
            </div>

            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">History Size</span>
              <span 
                className={`performance-monitor__metric-value performance-monitor__metric-value--${
                  getStatusColor(metrics.historySize, 100, 150)
                }`}
              >
                {metrics.historySize}/100
              </span>
            </div>

            <div className="performance-monitor__metric">
              <span className="performance-monitor__metric-label">Scopes</span>
              <span className="performance-monitor__metric-value">
                {metrics.scopeCount}
              </span>
            </div>
          </div>

          {history.length > 1 && (
            <div className="performance-monitor__chart">
              <svg width="100%" height="60" viewBox="0 0 200 60">
                {/* Focus transition trend line */}
                <polyline
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  points={history.map((h, i) => 
                    `${(i / (history.length - 1)) * 200},${60 - (h.metrics.focusTransitionTime / 100) * 60}`
                  ).join(' ')}
                />
                
                {/* Memory usage trend line */}
                <polyline
                  fill="none"
                  stroke="#2196F3"
                  strokeWidth="2"
                  points={history.map((h, i) => 
                    `${(i / (history.length - 1)) * 200},${60 - (h.metrics.memoryUsage / 5) * 60}`
                  ).join(' ')}
                />
              </svg>
              <div className="performance-monitor__chart-legend">
                <span className="performance-monitor__chart-legend-item performance-monitor__chart-legend-item--focus">
                  Focus
                </span>
                <span className="performance-monitor__chart-legend-item performance-monitor__chart-legend-item--memory">
                  Memory
                </span>
              </div>
            </div>
          )}

          <div className="performance-monitor__footer">
            <span className="performance-monitor__timestamp">
              Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Export a hook for programmatic access to performance metrics
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const focusManager = usePerformanceOptimizedFocusManager();

  useEffect(() => {
    const interval = setInterval(() => {
      const memoryUsage = 'memory' in performance 
        ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        : 0;

      setMetrics({
        focusTransitionTime: 0, // Would need to track this
        modalOperationTime: 0, // Would need to track this
        memoryUsage,
        elementCount: focusManager.state.elements.size,
        historySize: focusManager.state.history.length,
        scopeCount: focusManager.state.scopes.length,
        rafBatchSize: 0,
        lastUpdate: Date.now()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusManager.state]);

  return metrics;
};