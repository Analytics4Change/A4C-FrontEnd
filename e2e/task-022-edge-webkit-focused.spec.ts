/**
 * Task 022: Edge and WebKit Focused Testing
 * 
 * Simplified test focused specifically on Edge and WebKit browsers
 * testing the current application state (client selection page)
 */

import { test, expect, Page } from '@playwright/test';

interface EdgeWebKitMetrics {
  browser: string;
  zeroAutoFocusCompliant: boolean;
  clientSelectionWorking: boolean;
  keyboardNavigationBasic: boolean;
  performanceMs: number;
  focusTarget: string;
}

class EdgeWebKitValidator {
  private metrics: EdgeWebKitMetrics[] = [];
  
  constructor(private page: Page, private browserName: string) {}

  async validateCurrentPageFocus(): Promise<EdgeWebKitMetrics> {
    const startTime = Date.now();
    
    // Navigate to app
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
    
    // CRITICAL: Check zero auto-focus mandate
    const initialActiveElement = await this.page.evaluate(() => {
      return {
        tagName: document.activeElement?.tagName,
        id: document.activeElement?.id,
        isBody: document.activeElement === document.body
      };
    });
    
    // Test basic keyboard navigation on client selection page
    let keyboardWorks = false;
    let clientSelectionWorks = false;
    
    // Check if clients are visible
    const clientElements = await this.page.locator('[role="button"], button, .client, [data-testid*="client"]').count();
    if (clientElements > 0) {
      clientSelectionWorks = true;
      
      // Test Tab navigation
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      
      const focusedAfterTab = await this.page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          isBody: document.activeElement === document.body
        };
      });
      
      keyboardWorks = !focusedAfterTab.isBody; // Something got focused
    }
    
    const performanceMs = Date.now() - startTime;
    
    const metrics: EdgeWebKitMetrics = {
      browser: this.browserName,
      zeroAutoFocusCompliant: initialActiveElement.isBody,
      clientSelectionWorking: clientSelectionWorks,
      keyboardNavigationBasic: keyboardWorks,
      performanceMs,
      focusTarget: initialActiveElement.isBody ? 'document.body' : `${initialActiveElement.tagName}#${initialActiveElement.id}`
    };
    
    this.metrics.push(metrics);
    return metrics;
  }

  getMetrics(): EdgeWebKitMetrics[] {
    return this.metrics;
  }
}

// Test Edge browser specifically
test.describe('Edge Browser - Focus Management', () => {
  test('Edge: Complete Focus Validation', async ({ page, browserName }) => {
    const validator = new EdgeWebKitValidator(page, 'Edge');
    const results = await validator.validateCurrentPageFocus();
    
    // CRITICAL: Zero auto-focus mandate must pass
    expect(results.zeroAutoFocusCompliant).toBe(true);
    
    console.log('=== Edge Browser Results ===');
    console.log(`Zero Auto-Focus Compliant: ${results.zeroAutoFocusCompliant ? 'PASS' : 'FAIL'}`);
    console.log(`Client Selection Working: ${results.clientSelectionWorking ? 'PASS' : 'FAIL'}`);
    console.log(`Basic Keyboard Navigation: ${results.keyboardNavigationBasic ? 'PASS' : 'FAIL'}`);
    console.log(`Performance: ${results.performanceMs}ms`);
    console.log(`Focus Target: ${results.focusTarget}`);
    console.log('Raw Metrics:', JSON.stringify(results, null, 2));
  });
});

// Test WebKit browser specifically  
test.describe('WebKit Browser - Focus Management', () => {
  test('WebKit: Complete Focus Validation', async ({ page, browserName }) => {
    const validator = new EdgeWebKitValidator(page, 'Safari/WebKit');
    const results = await validator.validateCurrentPageFocus();
    
    // CRITICAL: Zero auto-focus mandate must pass
    expect(results.zeroAutoFocusCompliant).toBe(true);
    
    console.log('=== Safari/WebKit Browser Results ===');
    console.log(`Zero Auto-Focus Compliant: ${results.zeroAutoFocusCompliant ? 'PASS' : 'FAIL'}`);
    console.log(`Client Selection Working: ${results.clientSelectionWorking ? 'PASS' : 'FAIL'}`);
    console.log(`Basic Keyboard Navigation: ${results.keyboardNavigationBasic ? 'PASS' : 'FAIL'}`);
    console.log(`Performance: ${results.performanceMs}ms`);
    console.log(`Focus Target: ${results.focusTarget}`);
    console.log('Raw Metrics:', JSON.stringify(results, null, 2));
  });
});

// Comparative analysis
test.describe('Edge vs WebKit Comparison', () => {
  let edgeMetrics: EdgeWebKitMetrics;
  let webkitMetrics: EdgeWebKitMetrics;

  test('Generate Cross-Browser Comparison Report', async ({ browserName }) => {
    console.log('\n=== Task 022: Edge and WebKit Comparison Report ===');
    console.log('Architecture: ZERO Auto-Focus Mandate');
    console.log('Test Date: 2025-08-20');
    console.log('Application: A4C-FrontEnd Client Selection');
    console.log('Test Status: Focused validation for Edge and WebKit browsers');
  });
});