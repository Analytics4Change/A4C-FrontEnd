/**
 * Task 026: Cross-Browser Accessibility Compliance E2E Tests
 * 
 * End-to-end accessibility testing across different browsers
 * using Playwright and axe-core integration.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Cross-Browser Accessibility Compliance', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the development server
    await page.goto('http://localhost:5173');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should have no accessibility violations on main page @accessibility', async ({ page }) => {
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('#__next') // Exclude Next.js root if present
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard-only navigation @keyboard-nav', async ({ page }) => {
    // Test keyboard navigation through the main interface
    await page.keyboard.press('Tab');
    
    // Verify first focusable element receives focus
    const firstFocusable = await page.locator(':focus').first();
    await expect(firstFocusable).toBeVisible();
    
    // Continue tabbing through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test Shift+Tab reverse navigation
    await page.keyboard.press('Shift+Tab');
    
    // Verify focus moves backward
    const currentFocus = await page.locator(':focus').first();
    await expect(currentFocus).toBeVisible();
  });

  test('should provide visible focus indicators @focus-indicators', async ({ page }) => {
    // Navigate through focusable elements
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
    
    // Check that focus indicator styles are applied
    const outlineStyle = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    );
    
    // Verify focus indicator is present (not 'none')
    expect(outlineStyle).not.toBe('none');
    expect(outlineStyle).not.toBe('');
  });

  test('should handle modal accessibility correctly @modal-a11y', async ({ page }) => {
    // Look for a button that opens a modal
    const modalTrigger = page.locator('button').filter({ hasText: /open|modal/i }).first();
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Wait for modal to open
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();
      
      // Check modal ARIA attributes
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('role', 'dialog');
      
      // Verify modal is labeled
      const ariaLabelledBy = await modal.getAttribute('aria-labelledby');
      const ariaLabel = await modal.getAttribute('aria-label');
      
      expect(ariaLabelledBy || ariaLabel).toBeTruthy();
      
      // Test focus trap in modal
      await page.keyboard.press('Tab');
      const focusedInModal = await page.locator(':focus').first();
      const modalBounds = await modal.boundingBox();
      const focusBounds = await focusedInModal.boundingBox();
      
      // Focus should be within modal bounds
      if (modalBounds && focusBounds) {
        expect(focusBounds.x).toBeGreaterThanOrEqual(modalBounds.x);
        expect(focusBounds.y).toBeGreaterThanOrEqual(modalBounds.y);
        expect(focusBounds.x + focusBounds.width).toBeLessThanOrEqual(modalBounds.x + modalBounds.width);
        expect(focusBounds.y + focusBounds.height).toBeLessThanOrEqual(modalBounds.y + modalBounds.height);
      }
      
      // Test Escape key closes modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });

  test('should provide proper form accessibility @form-a11y', async ({ page }) => {
    // Look for form elements
    const forms = page.locator('form');
    
    if (await forms.count() > 0) {
      const form = forms.first();
      
      // Check all input elements have labels
      const inputs = form.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        
        if (inputId) {
          // Check for associated label
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await label.count() > 0;
          
          // Check for aria-label or aria-labelledby
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
      
      // Check required fields are properly marked
      const requiredInputs = form.locator('input[required], select[required], textarea[required]');
      const requiredCount = await requiredInputs.count();
      
      for (let i = 0; i < requiredCount; i++) {
        const requiredInput = requiredInputs.nth(i);
        
        // Should have aria-required or required attribute
        const ariaRequired = await requiredInput.getAttribute('aria-required');
        const required = await requiredInput.getAttribute('required');
        
        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
      }
    }
  });

  test('should respect reduced motion preferences @reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Navigate and interact with elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that animations are disabled/reduced
    // This would need specific implementation based on your CSS
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const count = await animatedElements.count();
    
    if (count > 0) {
      const firstAnimated = animatedElements.first();
      const transitionValue = await firstAnimated.evaluate(el => 
        window.getComputedStyle(el).transition
      );
      
      // Should have no transition or very short duration
      expect(transitionValue === 'none' || transitionValue.includes('0s')).toBeTruthy();
    }
  });

  test('should work with high contrast mode @high-contrast', async ({ page }) => {
    // Set high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    // Navigate through elements
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
    
    // In high contrast mode, focus indicators should still be visible
    const outlineStyle = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    );
    
    expect(outlineStyle).not.toBe('none');
    expect(outlineStyle).not.toBe('');
  });

  test('should have no auto-focus violations @no-auto-focus', async ({ page }) => {
    // Set up focus monitoring
    await page.addInitScript(() => {
      window.focusEvents = [];
      
      // Override focus method to track calls
      const originalFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function(options) {
        window.focusEvents.push({
          element: this.tagName + (this.id ? '#' + this.id : ''),
          timestamp: Date.now(),
          automatic: !document.hasFocus() || !document.querySelector(':focus')
        });
        return originalFocus.call(this, options);
      };
    });
    
    // Wait for page load and check for any automatic focus calls
    await page.waitForTimeout(2000);
    
    const focusEvents = await page.evaluate(() => window.focusEvents || []);
    
    // Filter out user-initiated focus events
    const autoFocusEvents = focusEvents.filter(event => event.automatic);
    
    // Should have no automatic focus events
    expect(autoFocusEvents).toEqual([]);
  });

  test('should provide screen reader compatible content @screen-reader', async ({ page }) => {
    // Run specific screen reader oriented accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.aria', 'cat.semantics', 'cat.structure'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check heading hierarchy
      const headingLevels = [];
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName);
        const level = parseInt(tagName.substring(1));
        headingLevels.push(level);
      }
      
      // Verify no heading level is skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        const levelDiff = currentLevel - previousLevel;
        
        // Should not skip more than one level
        expect(levelDiff).toBeLessThanOrEqual(1);
      }
    }
    
    // Check for skip links
    const skipLinks = page.locator('a[href*="#"], a[href*="skip"]').filter({ hasText: /skip/i });
    
    // If present, skip links should be properly implemented
    const skipLinkCount = await skipLinks.count();
    if (skipLinkCount > 0) {
      const firstSkipLink = skipLinks.first();
      await expect(firstSkipLink).toBeVisible();
      
      // Check skip link target exists
      const href = await firstSkipLink.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const target = page.locator(`#${targetId}`);
        await expect(target).toBeAttached();
      }
    }
  });

  test('should handle error states accessibly @error-handling', async ({ page }) => {
    // Look for form validation or error scenarios
    const forms = page.locator('form');
    
    if (await forms.count() > 0) {
      const form = forms.first();
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        // Try to submit form without filling required fields
        await submitButton.click();
        
        // Wait for potential error messages
        await page.waitForTimeout(1000);
        
        // Check for error messages with proper ARIA attributes
        const errorMessages = page.locator('[role="alert"], [aria-live], .error, [class*="error"]');
        const errorCount = await errorMessages.count();
        
        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            const error = errorMessages.nth(i);
            await expect(error).toBeVisible();
            
            // Error should have proper role or live region
            const role = await error.getAttribute('role');
            const ariaLive = await error.getAttribute('aria-live');
            
            expect(role === 'alert' || ariaLive !== null).toBeTruthy();
          }
        }
        
        // Check that invalid fields are properly marked
        const invalidInputs = form.locator('input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]');
        const invalidCount = await invalidInputs.count();
        
        if (invalidCount > 0) {
          for (let i = 0; i < invalidCount; i++) {
            const invalidInput = invalidInputs.nth(i);
            
            // Should be connected to error message
            const ariaDescribedBy = await invalidInput.getAttribute('aria-describedby');
            expect(ariaDescribedBy).toBeTruthy();
          }
        }
      }
    }
  });
});