# Memory-Safe Component Testing Utilities

Phase 5.1 implementation from the Memory Leak Detection Plan - comprehensive React component testing utilities that prevent memory leaks and ensure proper cleanup during testing.

## Overview

This module provides memory-safe alternatives to standard React testing patterns. It addresses common React memory leak patterns that standard `@testing-library/react` cleanup doesn't handle:

- **Event Listener Leaks** - Persistent event listeners after unmount
- **Timer and Async Leaks** - Uncleared timers, promises, and animations  
- **Observer Leaks** - Unidisconnected observers (Mutation, Intersection, Resize)
- **Context and State Leaks** - Persistent subscriptions and context references
- **Portal and Modal Leaks** - Elements outside the React tree
- **Ref and Callback Leaks** - DOM references not nullified
- **React Fiber Leaks** - Internal React tree references

## Quick Start

```javascript
// Drop-in replacement for @testing-library/react
import { render } from '../test/utils/component-testing';

test('basic memory-safe rendering', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
  // Automatic cleanup prevents memory leaks
});
```

## Core Utilities

### `render(ui, options)`

Memory-safe drop-in replacement for `@testing-library/react` render:

```javascript
import { render } from '../test/utils/component-testing';

test('memory-safe rendering', () => {
  const { getByText, unmount } = render(<MyComponent />, {
    // Standard RTL options work
    container: document.createElement('div')
  });
  
  expect(getByText('Content')).toBeInTheDocument();
  
  // Manual unmount if needed (auto cleanup happens in afterEach)
  unmount();
});
```

### `renderWithCleanup(ui, options, cleanupOptions)`

Enhanced rendering with comprehensive cleanup options:

```javascript
import { renderWithCleanup } from '../test/utils/component-testing';

test('component with custom cleanup', () => {
  const { getByText } = renderWithCleanup(<TimerComponent />, {}, {
    // Auto unmount in afterEach (default: true)
    autoUnmount: true,
    
    // Track component lifecycle (default: true in test env)
    trackLifecycle: true,
    
    // Force garbage collection after cleanup
    forceGC: true,
    
    // Use aggressive cleanup for problematic components
    aggressiveCleanup: false,
    
    // Component name for debugging
    componentName: 'TimerComponent'
  });
  
  expect(getByText('Timer: 0')).toBeInTheDocument();
});
```

### `renderInIsolation(ui, options)`

Render in completely isolated DOM environment:

```javascript
import { renderInIsolation } from '../test/utils/component-testing';

test('isolated component testing', () => {
  const { getByText } = renderInIsolation(<ProblematicComponent />, {
    // Use iframe for complete isolation (default: true)
    useIframe: true,
    
    // Copy parent styles to isolated context
    copyStyles: false,
    
    // Cleanup timeout in ms
    cleanupTimeout: 100
  });
  
  expect(getByText('Isolated Content')).toBeInTheDocument();
  // Complete isolation prevents test interference
});
```

### `trackComponentLifecycle(ui, options)`

Monitor component lifecycle with detailed tracking:

```javascript
import { trackComponentLifecycle } from '../test/utils/component-testing';

test('component lifecycle tracking', () => {
  const { trackTimer, trackObserver, addCleanup } = trackComponentLifecycle(
    <AsyncComponent />, 
    {
      // Enable verbose lifecycle logging
      verbose: true,
      
      // Warn if not unmounted within 5 seconds
      unmountTimeout: 5000,
      
      // Track async operations automatically
      trackAsync: true,
      
      componentName: 'AsyncComponent'
    }
  );
  
  // Manually track async operations
  const timerId = setTimeout(() => {}, 1000);
  trackTimer(timerId);
  
  // Track observers
  const observer = new MutationObserver(() => {});
  trackObserver(observer);
  
  // Add custom cleanup
  addCleanup(() => {
    console.log('Custom cleanup executed');
  });
});
```

### `forceComponentCleanup(container, options)`

Aggressive cleanup for stubborn components:

```javascript
import { forceComponentCleanup } from '../test/utils/component-testing';

test('force cleanup stubborn component', () => {
  const { container, unmount } = render(<StubbornComponent />);
  
  // Simulate problematic behavior
  // Component doesn't clean up properly on unmount
  unmount();
  
  // Force aggressive cleanup
  forceComponentCleanup(container, {
    // Remove event listeners by cloning elements
    removeEventListeners: true,
    
    // Clear all data attributes
    clearDataAttributes: true,
    
    // Clear portals and modals
    clearPortals: true,
    
    // DANGEROUS: Clear React fiber references
    clearReactFibers: false,
    
    // Disconnect observers
    clearObservers: true,
    
    // Clear global references
    clearGlobalRefs: true
  });
});
```

## React 18 Concurrent Features

### `renderConcurrent(ui, options)`

Support for React 18 concurrent features:

```javascript
import { renderConcurrent } from '../test/utils/component-testing';

test('concurrent rendering', () => {
  const { getByText } = renderConcurrent(<SuspenseComponent />, {
    // Enable concurrent mode
    concurrent: true,
    
    // Timeout for Suspense boundaries
    suspenseTimeout: 5000,
    
    // Handle transitions
    enableTransitions: true
  });
  
  expect(getByText('Loaded')).toBeInTheDocument();
});
```

### `cleanupSuspenseAndErrorBoundaries()`

Clean up React 18 specific memory leaks:

```javascript
import { cleanupSuspenseAndErrorBoundaries } from '../test/utils/component-testing';

afterEach(() => {
  // This is already called automatically in our enhanced cleanup
  cleanupSuspenseAndErrorBoundaries();
});
```

## Memory Leak Detection

### `detectComponentMemoryLeaks(testFn, options)`

Detect memory leaks in component tests:

```javascript
import { detectComponentMemoryLeaks } from '../test/utils/component-testing';

test('component memory leak detection', async () => {
  const results = await detectComponentMemoryLeaks(
    async () => {
      // Test function that might leak memory
      const { getByText, unmount } = render(<LeakyComponent />);
      
      // Simulate user interactions
      fireEvent.click(getByText('Start Timer'));
      await waitFor(() => expect(getByText('Timer: 1')).toBeInTheDocument());
      
      // Unmount component
      unmount();
    },
    {
      // Memory threshold in MB
      memoryThreshold: 10,
      
      // Run test multiple times
      iterations: 5,
      
      // Force GC between iterations
      forceGC: true,
      
      componentName: 'LeakyComponent'
    }
  );
  
  // Check results
  expect(results.memoryLeak).toBe(false);
  
  if (results.memoryLeak) {
    console.log('Memory leak detected!');
    console.log('Average growth:', results.averageMemoryGrowth, 'bytes');
    console.log('Recommendations:', results.recommendations);
  }
});
```

## Integration Patterns

### With Focus Management System

```javascript
import { render } from '../test/utils/component-testing';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';

const renderWithFocusManager = (ui, options = {}) => {
  return render(
    <FocusManagerProvider>
      {ui}
    </FocusManagerProvider>,
    options
  );
};

test('focusable component', () => {
  const { getByTestId } = renderWithFocusManager(<FocusableField id="test" order={1} />);
  expect(getByTestId('field')).toBeInTheDocument();
});
```

### With Custom Providers

```javascript
import { renderWithCleanup } from '../test/utils/component-testing';

const TestWrapper = ({ children }) => (
  <Provider store={testStore}>
    <ThemeProvider theme={testTheme}>
      {children}
    </ThemeProvider>
  </Provider>
);

test('component with providers', () => {
  const { getByText } = renderWithCleanup(
    <TestWrapper>
      <MyComponent />
    </TestWrapper>,
    {},
    {
      componentName: 'MyComponent-with-providers',
      trackLifecycle: true
    }
  );
  
  expect(getByText('Content')).toBeInTheDocument();
});
```

### Memory Leak Testing Pattern

```javascript
// Create a dedicated test for memory leaks
describe('Memory Leak Tests', () => {
  test('MyComponent does not leak memory', async () => {
    const results = await detectComponentMemoryLeaks(
      () => {
        const { getByText, unmount } = render(<MyComponent />);
        
        // Simulate typical usage
        fireEvent.click(getByText('Button'));
        
        // Always unmount
        unmount();
      },
      {
        componentName: 'MyComponent',
        iterations: 10,
        memoryThreshold: 5 // 5MB threshold
      }
    );
    
    expect(results.memoryLeak).toBe(false);
  });
});
```

## Common Memory Leak Patterns and Solutions

### Event Listener Leaks

```javascript
// ❌ Problematic component
const ProblematicComponent = () => {
  useEffect(() => {
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
    // Missing cleanup!
  }, []);
  
  return <div>Content</div>;
};

// ✅ Fixed component  
const GoodComponent = () => {
  useEffect(() => {
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
    
    // Proper cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div>Content</div>;
};
```

### Timer Leaks

```javascript
// ❌ Problematic component
const TimerComponent = () => {
  useEffect(() => {
    setInterval(() => {
      console.log('tick');
    }, 1000);
    // Missing cleanup!
  }, []);
  
  return <div>Timer</div>;
};

// ✅ Fixed component
const GoodTimerComponent = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    // Proper cleanup
    return () => clearInterval(interval);
  }, []);
  
  return <div>Timer</div>;
};
```

### Observer Leaks

```javascript
// ❌ Problematic component
const ObserverComponent = ({ targetRef }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      console.log('intersection', entries);
    });
    
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    // Missing cleanup!
  }, []);
  
  return <div ref={targetRef}>Observed</div>;
};

// ✅ Fixed component
const GoodObserverComponent = ({ targetRef }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      console.log('intersection', entries);
    });
    
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    
    // Proper cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return <div ref={targetRef}>Observed</div>;
};
```

## Testing Best Practices

### 1. Always Use Memory-Safe Utilities

```javascript
// ✅ Good - Use memory-safe utilities by default
import { render } from '../test/utils/component-testing';

// ❌ Avoid - Direct RTL usage without memory safety
import { render } from '@testing-library/react';
```

### 2. Test Memory Leaks Explicitly

```javascript
// Add memory leak tests for complex components
describe('MyComplexComponent', () => {
  // Functional tests
  test('renders correctly', () => {
    const { getByText } = render(<MyComplexComponent />);
    expect(getByText('Hello')).toBeInTheDocument();
  });
  
  // Memory leak test
  test('does not leak memory', async () => {
    const results = await detectComponentMemoryLeaks(
      () => {
        const { unmount } = render(<MyComplexComponent />);
        unmount();
      }
    );
    
    expect(results.memoryLeak).toBe(false);
  });
});
```

### 3. Use Isolation for Problematic Components

```javascript
// Use isolation for components that interfere with other tests
test('problematic component in isolation', () => {
  const { getByText } = renderInIsolation(<ProblematicComponent />);
  expect(getByText('Content')).toBeInTheDocument();
});
```

### 4. Track Lifecycle for Debugging

```javascript
// Enable lifecycle tracking when debugging memory issues
test('debug component lifecycle', () => {
  const { getByText } = trackComponentLifecycle(<DebugComponent />, {
    verbose: true,
    trackAsync: true
  });
  
  expect(getByText('Debug Info')).toBeInTheDocument();
});
```

## Configuration

### Environment Variables

```bash
# Enable memory profiling
MEMORY_PROFILE=true

# Set memory thresholds
MEMORY_THRESHOLD_HEAP=300
MEMORY_THRESHOLD_RSS=1024
```

### Test Setup Integration

The utilities are automatically integrated with the test setup. No additional configuration required.

```javascript
// src/test/setup.ts automatically imports and configures these utilities
// They are available in all test files
```

## Troubleshooting

### Common Issues

1. **"Cannot read property 'unmount' of undefined"**
   - Ensure you're destructuring the render result correctly
   - Check that the component renders without errors

2. **"Memory leak detected but component seems fine"**
   - Some legitimate memory usage is expected
   - Adjust the `memoryThreshold` in detection options
   - Run tests in isolation to rule out interference

3. **"Tests are slower with memory-safe utilities"**
   - Memory safety has a small performance cost
   - Use `renderInIsolation` sparingly for critical tests only
   - Disable lifecycle tracking in performance-critical tests

4. **"Global variables are being cleared unexpectedly"**
   - Adjust `forceComponentCleanup` options
   - Some aggressive cleanup options may affect global state
   - Use less aggressive cleanup for most tests

### Debug Mode

Enable verbose logging for debugging:

```javascript
const { getByText } = trackComponentLifecycle(<MyComponent />, {
  verbose: true,
  componentName: 'MyComponent'
});
```

### Memory Analysis

Use the built-in memory leak detection:

```javascript
// Run this periodically to check for memory leaks
const results = await detectComponentMemoryLeaks(() => {
  // Your test code
});

console.log('Memory analysis:', results);
```

## Contributing

When adding new utilities:

1. Add TypeScript definitions in `component-testing.d.ts`
2. Include comprehensive JSDoc comments
3. Add usage examples in this README
4. Test memory safety with `detectComponentMemoryLeaks`
5. Update the test setup integration if needed

## See Also

- [Memory Leak Detection Plan](../../docs/testing/MEMORY_LEAK_DETECTION_PLAN.md)
- [Focus Management Testing](./focus-test-helper.ts)
- [Cleanup Utilities](./cleanup.js)
- [Timer Utilities](./timers.js)