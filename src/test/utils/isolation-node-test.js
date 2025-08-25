/**
 * Node.js Test for Isolation Framework
 * 
 * Simple Node.js test to validate the isolation framework functionality
 */

// Mock a minimal DOM environment for Node.js testing
if (typeof window === 'undefined') {
  try {
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLIFrameElement = dom.window.HTMLIFrameElement;
  } catch (error) {
    console.log('⚠️  jsdom not available, using mock DOM');
    // Create minimal DOM mock
    global.window = {
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    global.document = {
      body: {
        appendChild: () => {},
        removeChild: () => {},
        innerHTML: '',
        children: { length: 0 },
        setAttribute: () => {},
        hasAttribute: () => false,
        getAttribute: () => null
      },
      head: { appendChild: () => {} },
      createElement: (tag) => ({
        style: { cssText: '' },
        setAttribute: () => {},
        addEventListener: () => {},
        appendChild: () => {},
        remove: () => {},
        textContent: '',
        innerHTML: '',
        parentNode: { removeChild: () => {} },
        contentWindow: global.window,
        contentDocument: global.document,
        onload: null,
        onerror: null
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => []
    };
    global.HTMLElement = function() {};
    global.HTMLIFrameElement = function() {};
  }
}

// Import the isolation framework
import { 
  runInIsolation, 
  createIsolatedEnvironment, 
  cleanupIsolation,
  getIsolationStats,
  resetIsolationStats
} from './isolation.js';

async function runTests() {
  console.log('🧪 Testing Isolation Framework...');
  
  resetIsolationStats();
  
  try {
    // Test 1: Basic isolation
    console.log('\n📝 Test 1: Basic isolated execution');
    const result1 = await runInIsolation('node-test-1', ({ document, window }) => {
      document.body.innerHTML = '<div id="test">Node Test</div>';
      const element = document.getElementById('test');
      return {
        success: true,
        content: element ? element.textContent : null,
        bodyChildren: document.body.children.length
      };
    });
    
    console.log('✅ Result:', result1);
    if (result1.success && result1.content === 'Node Test' && result1.bodyChildren === 1) {
      console.log('✅ Test 1 PASSED');
    } else {
      console.log('❌ Test 1 FAILED');
      return;
    }
    
    // Test 2: Memory isolation
    console.log('\n📝 Test 2: Memory isolation verification');
    
    await runInIsolation('node-test-2a', ({ document, window }) => {
      window.testVariable = 'first-value';
      document.body.setAttribute('data-test', 'first');
    });
    
    const result2 = await runInIsolation('node-test-2b', ({ document, window }) => {
      const hasVariable = typeof window.testVariable !== 'undefined';
      const hasAttribute = document.body.hasAttribute('data-test');
      return { hasVariable, hasAttribute };
    });
    
    console.log('✅ Isolation check:', result2);
    if (!result2.hasVariable && !result2.hasAttribute) {
      console.log('✅ Test 2 PASSED - Memory is properly isolated');
    } else {
      console.log('❌ Test 2 FAILED - Memory leakage detected');
      return;
    }
    
    // Test 3: Manual environment management
    console.log('\n📝 Test 3: Manual environment management');
    
    const isolation = await createIsolatedEnvironment({
      baseHTML: '<!DOCTYPE html><html><body><h1>Custom</h1></body></html>'
    });
    
    const heading = isolation.document.querySelector('h1');
    const customContent = heading ? heading.textContent : null;
    
    await cleanupIsolation(isolation);
    
    console.log('✅ Custom environment result:', { customContent });
    if (customContent === 'Custom') {
      console.log('✅ Test 3 PASSED');
    } else {
      console.log('❌ Test 3 FAILED');
      return;
    }
    
    // Test 4: Statistics tracking
    console.log('\n📝 Test 4: Statistics tracking');
    const stats = getIsolationStats();
    console.log('✅ Final stats:', stats);
    
    if (stats.totalTests > 0 && stats.created > 0) {
      console.log('✅ Test 4 PASSED - Statistics are working');
    } else {
      console.log('❌ Test 4 FAILED - Statistics not tracking');
      return;
    }
    
    console.log('\n🎉 All tests PASSED! Isolation framework is working correctly.');
    console.log('📊 Final Statistics:', getIsolationStats());
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error(error.stack);
  }
}

// Auto-run if this is the main module
runTests().then(() => {
  console.log('🏁 Test execution completed');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});

export { runTests };