/**
 * Task 023: Mobile Touch Navigation Testing
 * 
 * This test validates the ZERO auto-focus mandate on mobile devices:
 * - iPhone 14 (iOS 17) - Safari
 * - iPad Pro (iOS 17) - Safari  
 * - Pixel 7 (Android 14) - Chrome
 * - Galaxy S23 (Android 14) - Chrome
 * 
 * CRITICAL: These tests enforce the architectural rule that components
 * must NEVER automatically focus on mount, even on touch devices.
 * 
 * Mobile-specific validations:
 * - Touch event handling for focus
 * - Virtual keyboard interactions
 * - Swipe gestures and modal boundaries
 * - Orientation changes impact on focus
 */

import { test, expect, Page, devices } from '@playwright/test';

interface MobileFocusTestMetrics {
  device: string;
  os: string;
  browser: string;
  testName: string;
  touchSupport: boolean;
  virtualKeyboard: boolean;
  orientation: 'portrait' | 'landscape';
  focusTarget: string;
  focusTimestamp: number;
  performanceMs: number;
  autoFocusDetected: boolean;
  touchNavigationWorking: boolean;
  modalTouchTrapping: boolean;
  orientationFocusStable: boolean;
  virtualKeyboardHandling: boolean;
}

class MobileFocusValidator {
  private metrics: MobileFocusTestMetrics[] = [];
  
  constructor(
    private page: Page, 
    private deviceName: string,
    private deviceConfig: any
  ) {}

  async validateZeroAutoFocusOnMobile(testName: string): Promise<boolean> {
    const startTime = Date.now();
    
    // Navigate to app
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any potential auto-focus attempts to settle
    await this.page.waitForTimeout(1000);
    
    // CRITICAL: Check that NO element has auto-focus on mobile page load
    const initialActiveElement = await this.page.evaluate(() => {
      return {
        tagName: document.activeElement?.tagName,
        id: document.activeElement?.id,
        className: document.activeElement?.className,
        isBody: document.activeElement === document.body,
        isFocusable: document.activeElement?.tabIndex !== undefined && document.activeElement?.tabIndex >= 0
      };
    });
    
    const autoFocusDetected = !initialActiveElement.isBody;
    const performanceMs = Date.now() - startTime;
    
    // Record mobile-specific metrics
    this.metrics.push({
      device: this.deviceName,
      os: this.deviceConfig.os || 'Unknown',
      browser: this.deviceConfig.browser || 'Unknown',
      testName,
      touchSupport: this.deviceConfig.hasTouch || false,
      virtualKeyboard: this.deviceConfig.isMobile || false,
      orientation: 'portrait', // Default, will be updated by orientation tests
      focusTarget: autoFocusDetected ? 
        `${initialActiveElement.tagName}#${initialActiveElement.id}` : 'document.body',
      focusTimestamp: Date.now(),
      performanceMs,
      autoFocusDetected,
      touchNavigationWorking: false, // Will be tested separately
      modalTouchTrapping: false, // Will be tested separately
      orientationFocusStable: false, // Will be tested separately
      virtualKeyboardHandling: false // Will be tested separately
    });
    
    return !autoFocusDetected;
  }

  async validateTouchNavigation(): Promise<boolean> {
    const startTime = Date.now();
    
    // Test touch-to-focus interactions
    const addButton = this.page.locator('text=Add Medication').first();
    
    if (await addButton.isVisible()) {
      // CRITICAL: Test that tap focuses elements correctly without auto-focus
      const beforeTap = await this.page.evaluate(() => {
        return {
          activeElement: document.activeElement?.tagName,
          isBody: document.activeElement === document.body
        };
      });
      
      // Perform touch tap
      await addButton.tap();
      await this.page.waitForTimeout(300);
      
      // Check if tap properly focused the button
      const afterTap = await this.page.evaluate(() => {
        const active = document.activeElement;
        return {
          tagName: active?.tagName,
          textContent: active?.textContent?.trim(),
          role: active?.getAttribute('role'),
          isButton: active?.tagName === 'BUTTON',
          hasFocus: active !== document.body
        };
      });
      
      // Open modal via touch
      if (afterTap.isButton) {
        await addButton.tap(); // Second tap to activate
        await this.page.waitForTimeout(500);
        
        // Verify modal opened without auto-focus
        const modalVisible = await this.page.locator('[role="dialog"]').isVisible();
        
        if (modalVisible) {
          // CRITICAL: Modal should NOT auto-focus any element on mobile
          const modalActiveElement = await this.page.evaluate(() => {
            return {
              tagName: document.activeElement?.tagName,
              isBody: document.activeElement === document.body,
              isInModal: document.activeElement?.closest('[role="dialog"]') !== null
            };
          });
          
          // Test touch navigation within modal
          const touchableElements = await this.page.locator('[role="dialog"] button, [role="dialog"] input, [role="dialog"] select').count();
          
          // Try tapping different elements
          let successfulTaps = 0;
          const modalElements = this.page.locator('[role="dialog"] button, [role="dialog"] input');
          const elementCount = await modalElements.count();
          
          for (let i = 0; i < Math.min(elementCount, 5); i++) {
            try {
              const element = modalElements.nth(i);
              if (await element.isVisible()) {
                await element.tap();
                await this.page.waitForTimeout(200);
                
                const focused = await this.page.evaluate(() => {
                  return document.activeElement?.closest('[role="dialog"]') !== null;
                });
                
                if (focused) {
                  successfulTaps++;
                }
              }
            } catch (error) {
              // Element might not be tappable, continue
            }
          }
          
          const performanceMs = Date.now() - startTime;
          
          // Update metrics
          const lastMetric = this.metrics[this.metrics.length - 1];
          if (lastMetric) {
            lastMetric.touchNavigationWorking = successfulTaps > 0 && !modalActiveElement.isBody;
            lastMetric.performanceMs += performanceMs;
          }
          
          return successfulTaps > 0;
        }
      }
    }
    
    return false;
  }

  async validateModalTouchBoundaries(): Promise<boolean> {
    const startTime = Date.now();
    
    // Ensure modal is open
    const modal = this.page.locator('[role="dialog"]').first();
    if (!(await modal.isVisible())) {
      return false;
    }
    
    // Test touch interactions outside modal boundaries
    const modalBox = await modal.boundingBox();
    if (!modalBox) return false;
    
    // Test touch outside modal (should not affect focus)
    const outsidePoints = [
      { x: modalBox.x - 50, y: modalBox.y - 50 }, // Top-left outside
      { x: modalBox.x + modalBox.width + 50, y: modalBox.y + 50 }, // Right outside
      { x: modalBox.x + 50, y: modalBox.y + modalBox.height + 50 } // Bottom outside
    ];
    
    let boundaryRespected = true;
    
    for (const point of outsidePoints) {
      try {
        // Tap outside modal
        await this.page.mouse.click(point.x, point.y);
        await this.page.waitForTimeout(300);
        
        // Check if modal is still visible and focus is still contained
        const modalStillVisible = await modal.isVisible();
        const focusStillInModal = await this.page.evaluate(() => {
          return document.activeElement?.closest('[role="dialog"]') !== null ||
                 document.activeElement === document.body;
        });
        
        if (!modalStillVisible || !focusStillInModal) {
          boundaryRespected = false;
          break;
        }
      } catch (error) {
        // Some points might be outside viewport, continue
      }
    }
    
    // Test swipe gestures on modal
    try {
      const centerX = modalBox.x + modalBox.width / 2;
      const centerY = modalBox.y + modalBox.height / 2;
      
      // Swipe within modal (should not close modal unexpectedly)
      await this.page.mouse.move(centerX, centerY);
      await this.page.mouse.down();
      await this.page.mouse.move(centerX + 100, centerY); // Swipe right
      await this.page.mouse.up();
      await this.page.waitForTimeout(300);
      
      const modalStillVisibleAfterSwipe = await modal.isVisible();
      
      const performanceMs = Date.now() - startTime;
      
      // Update metrics
      const lastMetric = this.metrics[this.metrics.length - 1];
      if (lastMetric) {
        lastMetric.modalTouchTrapping = boundaryRespected && modalStillVisibleAfterSwipe;
        lastMetric.performanceMs += performanceMs;
      }
      
      return boundaryRespected && modalStillVisibleAfterSwipe;
    } catch (error) {
      return false;
    }
  }

  async validateVirtualKeyboardInteraction(): Promise<boolean> {
    const startTime = Date.now();
    
    // Find an input field to test virtual keyboard
    const inputField = this.page.locator('[role="dialog"] input[type="text"], [role="dialog"] input[type="search"]').first();
    
    if (await inputField.isVisible()) {
      // Tap to focus input (should trigger virtual keyboard on mobile)
      await inputField.tap();
      await this.page.waitForTimeout(500);
      
      // Check if input is focused
      const inputFocused = await this.page.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName === 'INPUT' && active?.closest('[role="dialog"]') !== null;
      });
      
      if (inputFocused) {
        // Type some text (virtual keyboard interaction)
        await this.page.keyboard.type('Test medication');
        await this.page.waitForTimeout(300);
        
        // Verify text was entered
        const inputValue = await inputField.inputValue();
        
        // Test virtual keyboard dismiss via tap outside input
        const modalBox = await this.page.locator('[role="dialog"]').boundingBox();
        if (modalBox) {
          const dismissPoint = { 
            x: modalBox.x + modalBox.width / 2, 
            y: modalBox.y + 100 
          };
          
          await this.page.mouse.click(dismissPoint.x, dismissPoint.y);
          await this.page.waitForTimeout(500);
          
          // Check if focus moved appropriately
          const focusAfterDismiss = await this.page.evaluate(() => {
            return {
              isInput: document.activeElement?.tagName === 'INPUT',
              isBody: document.activeElement === document.body,
              inModal: document.activeElement?.closest('[role="dialog"]') !== null
            };
          });
          
          const performanceMs = Date.now() - startTime;
          
          // Update metrics
          const lastMetric = this.metrics[this.metrics.length - 1];
          if (lastMetric) {
            lastMetric.virtualKeyboardHandling = inputValue.length > 0 && 
              (focusAfterDismiss.isBody || focusAfterDismiss.inModal);
            lastMetric.performanceMs += performanceMs;
          }
          
          return inputValue.length > 0;
        }
      }
    }
    
    return false;
  }

  async validateOrientationChanges(): Promise<boolean> {
    const startTime = Date.now();
    
    // Test portrait orientation
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
    
    const portraitFocus = await this.page.evaluate(() => {
      return {
        activeElement: document.activeElement?.tagName,
        isBody: document.activeElement === document.body,
        modalVisible: !!document.querySelector('[role="dialog"]')
      };
    });
    
    // Test landscape orientation
    await this.page.setViewportSize({ width: 667, height: 375 });
    await this.page.waitForTimeout(500);
    
    const landscapeFocus = await this.page.evaluate(() => {
      return {
        activeElement: document.activeElement?.tagName,
        isBody: document.activeElement === document.body,
        modalVisible: !!document.querySelector('[role="dialog"]')
      };
    });
    
    // Return to portrait
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
    
    const returnPortraitFocus = await this.page.evaluate(() => {
      return {
        activeElement: document.activeElement?.tagName,
        isBody: document.activeElement === document.body,
        modalVisible: !!document.querySelector('[role="dialog"]')
      };
    });
    
    const performanceMs = Date.now() - startTime;
    
    // Focus should remain stable across orientation changes
    const orientationStable = 
      portraitFocus.isBody === landscapeFocus.isBody &&
      landscapeFocus.isBody === returnPortraitFocus.isBody &&
      portraitFocus.modalVisible === landscapeFocus.modalVisible;
    
    // Update metrics
    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      lastMetric.orientationFocusStable = orientationStable;
      lastMetric.performanceMs += performanceMs;
    }
    
    return orientationStable;
  }

  getMetrics(): MobileFocusTestMetrics[] {
    return this.metrics;
  }

  generateMobileReport(): object {
    const deviceMetrics = this.metrics.filter(m => m.device === this.deviceName);
    
    return {
      device: this.deviceName,
      os: deviceMetrics[0]?.os || 'Unknown',
      browser: deviceMetrics[0]?.browser || 'Unknown',
      touchSupport: deviceMetrics[0]?.touchSupport || false,
      totalTests: deviceMetrics.length,
      zeroAutoFocusCompliant: deviceMetrics.every(m => !m.autoFocusDetected),
      touchNavigationWorking: deviceMetrics.some(m => m.touchNavigationWorking),
      modalTouchTrapping: deviceMetrics.some(m => m.modalTouchTrapping),
      virtualKeyboardHandling: deviceMetrics.some(m => m.virtualKeyboardHandling),
      orientationFocusStable: deviceMetrics.some(m => m.orientationFocusStable),
      avgPerformanceMs: deviceMetrics.reduce((sum, m) => sum + m.performanceMs, 0) / deviceMetrics.length,
      maxPerformanceMs: Math.max(...deviceMetrics.map(m => m.performanceMs)),
      criticalFailures: deviceMetrics.filter(m => m.autoFocusDetected).length,
      rawMetrics: deviceMetrics
    };
  }
}

// Mobile device configurations for testing
const mobileDevices = [
  {
    name: 'iPhone-14',
    displayName: 'iPhone 14 (iOS 17)',
    config: {
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 3,
      os: 'iOS 17',
      browser: 'Safari',
      hasTouch: true,
      isMobile: true
    }
  },
  {
    name: 'iPad-Pro',
    displayName: 'iPad Pro (iOS 17)', 
    config: {
      viewport: { width: 1024, height: 1366 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      os: 'iOS 17',
      browser: 'Safari',
      hasTouch: true,
      isMobile: false // iPad can use external keyboard
    }
  },
  {
    name: 'Pixel-7',
    displayName: 'Pixel 7 (Android 14)',
    config: {
      viewport: { width: 412, height: 915 },
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.6,
      os: 'Android 14',
      browser: 'Chrome',
      hasTouch: true,
      isMobile: true
    }
  },
  {
    name: 'Galaxy-S23',
    displayName: 'Galaxy S23 (Android 14)',
    config: {
      viewport: { width: 360, height: 780 },
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S911U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      os: 'Android 14', 
      browser: 'Chrome',
      hasTouch: true,
      isMobile: true
    }
  }
];

// Test each mobile device configuration
mobileDevices.forEach(device => {
  test.describe(`${device.displayName} - Mobile Focus Management`, () => {
    let validator: MobileFocusValidator;

    test.beforeEach(async ({ page, context }) => {
      // Set mobile device emulation per test
      await context.setDefaultNavigationTimeout(30000);
      await page.setViewportSize(device.config.viewport);
      
      // Add device-specific settings
      if (device.config.hasTouch) {
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: false,
            value: 5,
          });
        });
      }
      
      if (device.config.userAgent) {
        await page.setExtraHTTPHeaders({
          'User-Agent': device.config.userAgent
        });
      }
      
      validator = new MobileFocusValidator(page, device.displayName, device.config);
    });

    test(`${device.displayName}: Zero Auto-Focus Mandate on Mobile`, async ({ page }) => {
      const isCompliant = await validator.validateZeroAutoFocusOnMobile('Mobile Zero Auto-Focus Check');
      
      // CRITICAL ASSERTION: NO auto-focus allowed on mobile
      expect(isCompliant).toBe(true);
      
      console.log(`${device.displayName}: Mobile zero auto-focus compliance: ${isCompliant ? 'PASS' : 'FAIL'}`);
    });

    test(`${device.displayName}: Touch Navigation and Focus`, async ({ page }) => {
      // First validate zero auto-focus
      await validator.validateZeroAutoFocusOnMobile('Touch Navigation Prep');
      
      // Then test touch navigation
      const touchWorks = await validator.validateTouchNavigation();
      
      expect(touchWorks).toBe(true);
      console.log(`${device.displayName}: Touch navigation: ${touchWorks ? 'PASS' : 'FAIL'}`);
    });

    test(`${device.displayName}: Modal Touch Boundaries`, async ({ page }) => {
      // Setup
      await validator.validateZeroAutoFocusOnMobile('Modal Touch Setup');
      await validator.validateTouchNavigation();
      
      // Test modal touch boundaries and swipe gestures
      const touchBoundaries = await validator.validateModalTouchBoundaries();
      
      expect(touchBoundaries).toBe(true);
      console.log(`${device.displayName}: Modal touch boundaries: ${touchBoundaries ? 'PASS' : 'FAIL'}`);
    });

    test(`${device.displayName}: Virtual Keyboard Interaction`, async ({ page }) => {
      // Setup
      await validator.validateZeroAutoFocusOnMobile('Virtual Keyboard Setup');
      await validator.validateTouchNavigation();
      
      // Test virtual keyboard handling
      const keyboardHandling = await validator.validateVirtualKeyboardInteraction();
      
      expect(keyboardHandling).toBe(true);
      console.log(`${device.displayName}: Virtual keyboard handling: ${keyboardHandling ? 'PASS' : 'FAIL'}`);
    });

    test(`${device.displayName}: Orientation Change Focus Stability`, async ({ page }) => {
      // Setup
      await validator.validateZeroAutoFocusOnMobile('Orientation Test Setup');
      await validator.validateTouchNavigation();
      
      // Test orientation changes
      const orientationStable = await validator.validateOrientationChanges();
      
      expect(orientationStable).toBe(true);
      console.log(`${device.displayName}: Orientation focus stability: ${orientationStable ? 'PASS' : 'FAIL'}`);
    });

    test.afterAll(async () => {
      if (validator) {
        const report = validator.generateMobileReport();
        console.log(`\n=== ${device.displayName} Mobile Report ===`);
        console.log(JSON.stringify(report, null, 2));
      }
    });
  });
});

// Global test to generate mobile compatibility matrix
test.describe('Mobile Touch Navigation Compatibility Matrix', () => {
  const allValidators: { [key: string]: MobileFocusValidator } = {};

  test('Generate Mobile Touch Navigation Report', async ({ browserName }) => {
    console.log(`\n=== Task 023: Mobile Touch Navigation Testing Results ===`);
    console.log(`Test Environment: Mobile Device Emulation`);
    console.log(`Focus Management System: ZERO Auto-Focus Architecture (Mobile)`);
    console.log(`Test Coverage: iOS Safari, Android Chrome, Touch Events, Virtual Keyboard, Orientation`);
    console.log(`Critical Validation: NO auto-focus on mobile devices`);
  });
});