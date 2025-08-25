/**
 * Simplified FocusManager Test to diagnose hanging issue
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi, describe, it, expect } from 'vitest';

// Simple test component
const TestComponent: React.FC = () => {
  return (
    <div>
      <input data-testid="input1" placeholder="Input 1" />
      <button data-testid="button1">Submit</button>
    </div>
  );
};

// Setup test environment
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.runAllTimers();
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('Simple FocusManager Test', () => {
  it('should render without hanging', () => {
    render(<TestComponent />);
    
    const input = screen.getByTestId('input1');
    const button = screen.getByTestId('button1');
    
    expect(input).toBeDefined();
    expect(button).toBeDefined();
  });
  
  it('should handle timer operations', () => {
    render(<TestComponent />);
    
    // Advance timers without async operations
    vi.advanceTimersByTime(100);
    
    const input = screen.getByTestId('input1');
    expect(input).toBeDefined();
  });
});