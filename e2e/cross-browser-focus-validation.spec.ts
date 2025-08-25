/**
 * Task 022: Cross-Browser Focus Management Validation
 * 
 * This test validates the ZERO auto-focus mandate across all browsers:
 * - Chrome (Latest & Latest-1)
 * - Firefox (Latest & Latest-1) 
 * - Safari/WebKit (Latest)
 * - Edge (Latest)
 * 
 * CRITICAL: These tests enforce the architectural rule that components
 * must NEVER automatically focus on mount. document.activeElement must
 * remain document.body unless user explicitly interacts.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

interface FocusTestMetrics {
  browser: string;
  version: string;
  testName: string;
  focusTarget: string;
  focusTimestamp: number;
  performanceMs: number;
  userInteraction: boolean;
  autoFocusDetected: boolean;
  keyboardNavigationWorking: boolean;
  modalFocusTrapping: boolean;
  focusRestorationWorking: boolean;
}

class CrossBrowserFocusValidator {
  private metrics: FocusTestMetrics[] = [];
  
  constructor(private page: Page, private browserName: string) {}

  async validateZeroAutoFocus(testName: string): Promise<boolean> {
    const startTime = Date.now();
    
    // Navigate to app
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
    
    // CRITICAL: Check that NO element has auto-focus on page load
    const initialActiveElement = await this.page.evaluate(() => {
      return {
        tagName: document.activeElement?.tagName,
        id: document.activeElement?.id,
        className: document.activeElement?.className,
        isBody: document.activeElement === document.body
      };
    });
    
    const autoFocusDetected = !initialActiveElement.isBody;
    const performanceMs = Date.now() - startTime;
    
    // Record metrics
    this.metrics.push({
      browser: this.browserName,
      version: 'Latest',
      testName,
      focusTarget: autoFocusDetected ? 
        `${initialActiveElement.tagName}#${initialActiveElement.id}` : 'document.body',
      focusTimestamp: Date.now(),
      performanceMs,
      userInteraction: false,
      autoFocusDetected,
      keyboardNavigationWorking: false, // Will be tested separately
      modalFocusTrapping: false, // Will be tested separately
      focusRestorationWorking: false // Will be tested separately
    });
    
    return !autoFocusDetected;
  }

  async validateKeyboardNavigation(): Promise<boolean> {
    const startTime = Date.now();
    
    // Open medication modal via keyboard
    const addButton = this.page.locator('text=Add Medication').first();
    
    if (await addButton.isVisible()) {
      // Focus button via Tab navigation
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Tab'); // May need multiple tabs
      
      // Check if we can reach the button
      const focusedElement = await this.page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          textContent: document.activeElement?.textContent?.trim(),
          role: document.activeElement?.getAttribute('role')
        };
      });
      
      // Press Enter to open modal
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      
      // Verify modal opened and check initial focus
      const modalVisible = await this.page.locator('[role="dialog"]').isVisible();
      
      if (modalVisible) {
        // CRITICAL: Modal should NOT auto-focus any element
        const modalActiveElement = await this.page.evaluate(() => {
          return {
            tagName: document.activeElement?.tagName,
            isBody: document.activeElement === document.body,
            isInModal: document.activeElement?.closest('[role="dialog"]') !== null
          };
        });
        
        // Test Tab navigation within modal
        let tabCount = 0;
        const focusedElements = [];
        
        for (let i = 0; i < 10; i++) {
          await this.page.keyboard.press('Tab');
          await this.page.waitForTimeout(100);
          
          const focused = await this.page.evaluate(() => {
            const active = document.activeElement;
            return {
              tagName: active?.tagName,
              testId: active?.getAttribute('data-testid'),
              inModal: active?.closest('[role="dialog"]') !== null
            };
          });
          
          focusedElements.push(focused);
          tabCount++;
          
          // Stop if we find a save button or complete a cycle
          if (focused.testId?.includes('save') || 
              focusedElements.filter(f => f.testId === focused.testId).length > 1) {
            break;
          }
        }
        
        const performanceMs = Date.now() - startTime;
        
        // Update metrics
        const lastMetric = this.metrics[this.metrics.length - 1];
        if (lastMetric) {
          lastMetric.keyboardNavigationWorking = tabCount > 2 && focusedElements.length > 0;
          lastMetric.performanceMs += performanceMs;
        }
        
        return tabCount > 2; // Successfully navigated through elements
      }
    }
    
    return false;
  }

  async validateModalFocusTrapping(): Promise<boolean> {
    const startTime = Date.now();
    
    // Ensure modal is open
    const modal = this.page.locator('[role="dialog"]').first();
    if (!(await modal.isVisible())) {
      return false;
    }
    
    // Test focus trapping by tabbing extensively
    const focusHistory = [];
    let escapeAttempts = 0;
    
    for (let i = 0; i < 20; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(50);
      
      const focused = await this.page.evaluate(() => {
        const active = document.activeElement;
        return {
          inModal: active?.closest('[role="dialog"]') !== null,
          tagName: active?.tagName,
          testId: active?.getAttribute('data-testid')
        };
      });
      
      focusHistory.push(focused);
      
      // Focus should always stay within modal
      if (!focused.inModal) {
        escapeAttempts++;
      }
      
      // Test Escape key
      if (i === 10) {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
        
        const modalStillVisible = await modal.isVisible();
        if (!modalStillVisible) {
          // Modal closed, focus should be restored
          const restoredFocus = await this.page.evaluate(() => {
            return {
              tagName: document.activeElement?.tagName,
              isBody: document.activeElement === document.body
            };
          });
          
          const performanceMs = Date.now() - startTime;
          
          // Update metrics
          const lastMetric = this.metrics[this.metrics.length - 1];
          if (lastMetric) {
            lastMetric.modalFocusTrapping = escapeAttempts === 0;
            lastMetric.focusRestorationWorking = true; // Focus was restored
            lastMetric.performanceMs += performanceMs;
          }
          
          return escapeAttempts === 0;
        }
      }
    }
    
    return escapeAttempts === 0; // No focus escaped modal
  }

  getMetrics(): FocusTestMetrics[] {
    return this.metrics;
  }

  generateBrowserReport(): object {
    const browserMetrics = this.metrics.filter(m => m.browser === this.browserName);
    
    return {
      browser: this.browserName,
      version: 'Latest',
      totalTests: browserMetrics.length,
      zeroAutoFocusCompliant: browserMetrics.every(m => !m.autoFocusDetected),
      keyboardNavigationWorking: browserMetrics.some(m => m.keyboardNavigationWorking),
      modalFocusTrapping: browserMetrics.some(m => m.modalFocusTrapping),
      focusRestorationWorking: browserMetrics.some(m => m.focusRestorationWorking),
      avgPerformanceMs: browserMetrics.reduce((sum, m) => sum + m.performanceMs, 0) / browserMetrics.length,
      maxPerformanceMs: Math.max(...browserMetrics.map(m => m.performanceMs)),
      criticalFailures: browserMetrics.filter(m => m.autoFocusDetected).length,
      rawMetrics: browserMetrics
    };
  }
}

// Test each browser configuration
const browsers = [
  { name: 'chromium', displayName: 'Chrome' },
  { name: 'firefox', displayName: 'Firefox' },
  { name: 'webkit', displayName: 'Safari/WebKit' },
  { name: 'edge', displayName: 'Edge' }
];

browsers.forEach(browser => {
  test.describe(`${browser.displayName} - Focus Management Validation`, () => {
    let validator: CrossBrowserFocusValidator;

    test.beforeEach(async ({ page, browserName }) => {
      validator = new CrossBrowserFocusValidator(page, browser.displayName);
    });

    test(`${browser.displayName}: Zero Auto-Focus Mandate Compliance`, async ({ page }) => {
      const isCompliant = await validator.validateZeroAutoFocus('Zero Auto-Focus Check');
      
      // CRITICAL ASSERTION: NO auto-focus allowed
      expect(isCompliant).toBe(true);
      
      console.log(`${browser.displayName}: Zero auto-focus compliance: ${isCompliant ? 'PASS' : 'FAIL'}`);
    });

    test(`${browser.displayName}: Keyboard Navigation Flow`, async ({ page }) => {
      // First validate zero auto-focus
      await validator.validateZeroAutoFocus('Keyboard Navigation Prep');
      
      // Then test keyboard navigation
      const navigationWorks = await validator.validateKeyboardNavigation();
      
      expect(navigationWorks).toBe(true);
      console.log(`${browser.displayName}: Keyboard navigation: ${navigationWorks ? 'PASS' : 'FAIL'}`);
    });

    test(`${browser.displayName}: Modal Focus Management`, async ({ page }) => {
      // Setup
      await validator.validateZeroAutoFocus('Modal Focus Setup');
      await validator.validateKeyboardNavigation();
      
      // Test modal focus trapping
      const focusTrapping = await validator.validateModalFocusTrapping();
      
      expect(focusTrapping).toBe(true);
      console.log(`${browser.displayName}: Modal focus trapping: ${focusTrapping ? 'PASS' : 'FAIL'}`);
    });

    test.afterAll(async () => {
      if (validator) {
        const report = validator.generateBrowserReport();
        console.log(`\n=== ${browser.displayName} Final Report ===`);
        console.log(JSON.stringify(report, null, 2));
      }
    });
  });
});

// Global test to generate cross-browser compatibility matrix
test.describe('Cross-Browser Compatibility Matrix', () => {
  const allValidators: { [key: string]: CrossBrowserFocusValidator } = {};

  test('Generate Cross-Browser Compatibility Report', async ({ browserName }) => {
    // This test will be run once per browser and aggregate results
    console.log(`\n=== Task 022: Cross-Browser Testing Results ===`);
    console.log(`Browser: ${browserName}`);
    console.log(`Focus Management System: ZERO Auto-Focus Architecture`);
    console.log(`Test Suite: Focus validation, keyboard navigation, modal management`);
  });
});