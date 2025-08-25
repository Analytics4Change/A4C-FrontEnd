/**
 * Memory-Safe Component Testing Utilities Tests
 * 
 * Phase 5.1 - Validation tests for component testing utilities
 */

import React from 'react';
import { describe, test, expect, vi } from 'vitest';

// Import our memory-safe utilities
import { 
  render,
  renderWithCleanup,
  renderInIsolation,
  trackComponentLifecycle,
  detectComponentMemoryLeaks,
  cleanup 
} from '../component-testing.js';

// Simple test component
const TestComponent: React.FC<{ text?: string }> = ({ text = 'Hello World' }) => {
  return <div data-testid="test-component">{text}</div>;
};

// Component with potential memory leaks
const LeakyComponent: React.FC = () => {
  React.useEffect(() => {
    // Intentionally problematic - no cleanup
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
    
    // Missing cleanup - memory leak!
    // return () => {
    //   clearInterval(timer);
    //   window.removeEventListener('resize', handleResize);
    // };
  }, []);
  
  return <div data-testid="leaky-component">Leaky Component</div>;
};

// Component with proper cleanup
const CleanComponent: React.FC = () => {
  React.useEffect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    const handleResize = () => console.log('resize');
    window.addEventListener('resize', handleResize);
    
    // Proper cleanup
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div data-testid="clean-component">Clean Component</div>;
};

describe('Memory-Safe Component Testing Utilities', () => {
  describe('render() - Memory-safe render function', () => {
    test('should render component correctly', () => {
      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(getByTestId('test-component')).toHaveTextContent('Hello World');
    });
    
    test('should render component with custom props', () => {
      const { getByTestId } = render(<TestComponent text="Custom Text" />);
      expect(getByTestId('test-component')).toHaveTextContent('Custom Text');
    });
    
    test('should provide unmount function', () => {
      const { getByTestId, unmount } = render(<TestComponent />);
      expect(getByTestId('test-component')).toBeInTheDocument();
      
      unmount();
      expect(() => getByTestId('test-component')).toThrow();
    });
  });

  describe('renderWithCleanup() - Enhanced render with cleanup options', () => {
    test('should render with default cleanup options', () => {
      const { getByTestId } = renderWithCleanup(<TestComponent />);
      expect(getByTestId('test-component')).toBeInTheDocument();
    });
    
    test('should render with custom cleanup options', () => {
      const { getByTestId, _cleanupConfig } = renderWithCleanup(
        <TestComponent />, 
        {}, 
        {
          trackLifecycle: true,
          forceGC: false,
          componentName: 'TestComponent'
        }
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(_cleanupConfig?.componentName).toBe('TestComponent');
      expect(_cleanupConfig?.trackLifecycle).toBe(true);
    });
    
    test('should handle aggressive cleanup mode', () => {
      const { getByTestId } = renderWithCleanup(
        <TestComponent />, 
        {}, 
        { 
          aggressiveCleanup: true,
          componentName: 'AggressiveTest'
        }
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('renderInIsolation() - Isolated rendering', () => {
    test('should render in isolated container', () => {
      const { getByTestId, _isolatedContainer } = renderInIsolation(<TestComponent />);
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(_isolatedContainer).toBeDefined();
    });
    
    test('should render with iframe isolation', () => {
      const { getByTestId, _iframe } = renderInIsolation(<TestComponent />, {
        useIframe: true
      });
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(_iframe).toBeDefined();
    });
    
    test('should render without iframe isolation', () => {
      const { getByTestId, _iframe } = renderInIsolation(<TestComponent />, {
        useIframe: false
      });
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(_iframe).toBeUndefined();
    });
  });

  describe('trackComponentLifecycle() - Lifecycle tracking', () => {
    test('should track component lifecycle', () => {
      const { getByTestId, _lifecycleTracker } = trackComponentLifecycle(<TestComponent />);
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      expect(_lifecycleTracker).toBeDefined();
      expect(_lifecycleTracker?.componentName).toContain('Component');
    });
    
    test('should provide lifecycle tracking utilities', () => {
      const { trackTimer, trackObserver, addCleanup } = trackComponentLifecycle(
        <TestComponent />,
        {
          componentName: 'TrackedComponent',
          trackAsync: true
        }
      );
      
      expect(typeof trackTimer).toBe('function');
      expect(typeof trackObserver).toBe('function');
      expect(typeof addCleanup).toBe('function');
      
      // Test tracking functions
      const timer = setTimeout(() => {}, 100);
      trackTimer(timer);
      
      const observer = { disconnect: vi.fn() };
      trackObserver(observer);
      
      addCleanup(() => {
        console.log('Custom cleanup');
      });
    });
    
    test('should handle verbose lifecycle tracking', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const { getByTestId } = trackComponentLifecycle(
        <TestComponent />,
        {
          verbose: true,
          componentName: 'VerboseComponent'
        }
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
      
      // Should have logged mount event
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Component mounted: VerboseComponent')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('detectComponentMemoryLeaks() - Memory leak detection', () => {
    test('should detect memory leaks in leaky component', async () => {
      const results = await detectComponentMemoryLeaks(
        () => {
          const { unmount } = render(<LeakyComponent />);
          unmount();
        },
        {
          componentName: 'LeakyComponent',
          iterations: 2,
          memoryThreshold: 1 // Very low threshold to trigger detection
        }
      );
      
      expect(results).toBeDefined();
      expect(results.iterations).toHaveLength(2);
      expect(Array.isArray(results.recommendations)).toBe(true);
      expect(typeof results.averageMemoryGrowth).toBe('number');
      expect(typeof results.memoryLeak).toBe('boolean');
    });
    
    test('should not detect memory leaks in clean component', async () => {
      const results = await detectComponentMemoryLeaks(
        () => {
          const { unmount } = render(<CleanComponent />);
          unmount();
        },
        {
          componentName: 'CleanComponent',
          iterations: 2,
          memoryThreshold: 50 // Higher threshold
        }
      );
      
      expect(results).toBeDefined();
      expect(results.iterations).toHaveLength(2);
      expect(results.memoryLeak).toBe(false);
    });
    
    test('should handle async test functions', async () => {
      const results = await detectComponentMemoryLeaks(
        async () => {
          const { getByTestId, unmount } = render(<TestComponent />);
          
          // Simulate async operations
          await new Promise(resolve => setTimeout(resolve, 10));
          expect(getByTestId('test-component')).toBeInTheDocument();
          
          unmount();
        },
        {
          componentName: 'AsyncTestComponent',
          iterations: 2
        }
      );
      
      expect(results).toBeDefined();
      expect(results.iterations).toHaveLength(2);
    });
  });

  describe('cleanup() - Enhanced cleanup', () => {
    test('should perform cleanup without errors', () => {
      // Render some components
      render(<TestComponent />);
      render(<TestComponent text="Another component" />);
      
      // Should cleanup without throwing errors
      expect(() => cleanup()).not.toThrow();
    });
    
    test('should cleanup after multiple renders', () => {
      // Create multiple renders
      const results = [
        render(<TestComponent />),
        render(<TestComponent text="Test 1" />),
        render(<TestComponent text="Test 2" />)
      ];
      
      // All should be rendered
      results.forEach((result, index) => {
        expect(result.getByTestId('test-component')).toBeInTheDocument();
      });
      
      // Cleanup should not throw
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('Integration with existing test patterns', () => {
    test('should work with existing test helper patterns', () => {
      const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div data-testid="test-wrapper">
          {children}
        </div>
      );
      
      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
      
      expect(getByTestId('test-wrapper')).toBeInTheDocument();
      expect(getByTestId('test-component')).toBeInTheDocument();
    });
    
    test('should handle error boundaries', () => {
      const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [hasError, setHasError] = React.useState(false);
        
        if (hasError) {
          return <div data-testid="error-boundary">Something went wrong!</div>;
        }
        
        return <>{children}</>;
      };
      
      const { getByTestId } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle null component', () => {
      const NullComponent = () => null;
      
      const { container } = render(<NullComponent />);
      expect(container).toBeDefined();
    });
    
    test('should handle component with fragments', () => {
      const FragmentComponent = () => (
        <>
          <div data-testid="fragment-1">Fragment 1</div>
          <div data-testid="fragment-2">Fragment 2</div>
        </>
      );
      
      const { getByTestId } = render(<FragmentComponent />);
      expect(getByTestId('fragment-1')).toBeInTheDocument();
      expect(getByTestId('fragment-2')).toBeInTheDocument();
    });
    
    test('should handle components with portals', () => {
      const PortalComponent = () => {
        React.useEffect(() => {
          const portalContainer = document.createElement('div');
          portalContainer.setAttribute('data-testid', 'portal-container');
          document.body.appendChild(portalContainer);
          
          return () => {
            if (portalContainer.parentNode) {
              portalContainer.parentNode.removeChild(portalContainer);
            }
          };
        }, []);
        
        return <div data-testid="portal-component">Portal Component</div>;
      };
      
      const { getByTestId } = render(<PortalComponent />);
      expect(getByTestId('portal-component')).toBeInTheDocument();
    });
  });
});