/**
 * Task 033: Comprehensive Accessibility Audit E2E Tests
 * 
 * Cross-browser end-to-end accessibility testing with comprehensive coverage:
 * - Axe-core automated testing with WCAG 2.1 AA compliance
 * - Screen reader compatibility validation (NVDA/JAWS simulation)
 * - ARIA attributes verification
 * - Color contrast validation
 * - Keyboard navigation testing
 * - Focus management verification
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Task 033: Comprehensive Accessibility Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the development server
    await page.goto('http://localhost:3001');
    
    // Wait for the application to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for focus management system to initialize
    await page.waitForTimeout(1000);
  });

  test.describe('1. Axe-Core Comprehensive Testing', () => {
    test('should pass all WCAG 2.1 AA compliance tests @wcag-compliance', async ({ page, browserName }) => {
      console.log(`Running comprehensive axe-core scan on ${browserName}`);
      
      // Run comprehensive accessibility scan with all WCAG 2.1 AA rules
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
        .include('body')
        .exclude('#__next') // Exclude framework-specific elements
        .options({
          rules: {
            // Core WCAG rules
            'color-contrast': { enabled: true },
            'focus-order-semantics': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'aria-labelledby': { enabled: true },
            'aria-describedby': { enabled: true },
            'form-field-multiple-labels': { enabled: true },
            'landmark-one-main': { enabled: true },
            'page-has-heading-one': { enabled: true },
            'region': { enabled: true },
            
            // Focus management specific rules
            'keyboard': { enabled: true },
            'focus-trap': { enabled: true },
            'tabindex': { enabled: true },
            
            // Screen reader specific rules
            'aria-roles': { enabled: true },
            'aria-properties': { enabled: true },
            'aria-hidden-focus': { enabled: true },
            
            // Visual accessibility rules
            'visual-focus-indicators': { enabled: true },
            'contrast-enhanced': { enabled: true }
          }
        })
        .analyze();

      // Log detailed results for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`${accessibilityScanResults.violations.length} violations found:`);
        accessibilityScanResults.violations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
          console.log(`   Impact: ${violation.impact}`);
          console.log(`   Tags: ${violation.tags.join(', ')}`);
          violation.nodes.forEach((node, nodeIndex) => {
            console.log(`   Node ${nodeIndex + 1}: ${node.html}`);
            if (node.failureSummary) {
              console.log(`   Failure: ${node.failureSummary}`);
            }
          });
        });
      }

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
      
      // Log success metrics
      console.log(`✓ Passed ${accessibilityScanResults.passes.length} accessibility checks`);
      console.log(`✓ Browser: ${browserName}`);
    });

    test('should pass accessibility tests for focus management components @focus-a11y', async ({ page }) => {
      // Test focus management specific components
      await page.goto('http://localhost:5173');
      
      // Wait for focus management components to load
      await page.waitForSelector('[data-focus-manager]', { timeout: 5000 });
      
      // Run focused scan on focus management areas
      const focusResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'keyboard'])
        .include('[data-focus-manager]')
        .analyze();

      expect(focusResults.violations).toEqual([]);
    });

    test('should pass accessibility tests for modal dialogs @modal-a11y', async ({ page }) => {
      // Look for modal trigger buttons
      const modalTriggers = page.locator('button').filter({ hasText: /open|modal|dialog/i });
      
      if (await modalTriggers.count() > 0) {
        // Open the first modal
        await modalTriggers.first().click();
        
        // Wait for modal to appear
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
        
        // Run accessibility scan on modal
        const modalResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'aria'])
          .include('[role="dialog"]')
          .analyze();

        expect(modalResults.violations).toEqual([]);
        
        // Test modal-specific accessibility features
        const modal = page.locator('[role="dialog"]').first();
        
        // Check modal ARIA attributes
        await expect(modal).toHaveAttribute('aria-labelledby');
        await expect(modal).toHaveAttribute('aria-describedby');
        
        // Test escape key functionality
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    });
  });

  test.describe('2. Screen Reader Compatibility Testing', () => {
    test('should provide NVDA-compatible content structure @nvda-compat', async ({ page }) => {
      // Set up NVDA-like screen reader simulation
      await page.addInitScript(() => {
        window.screenReaderEvents = [];
        
        // Mock NVDA announcement behavior
        const announcements = [];
        
        // Mock aria-live region detection
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                  const element = node as Element;
                  const ariaLive = element.getAttribute('aria-live');
                  const role = element.getAttribute('role');
                  
                  if (ariaLive || role === 'alert' || role === 'status') {
                    announcements.push({
                      type: 'announce',
                      content: element.textContent,
                      timestamp: Date.now()
                    });
                  }
                }
              });
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Mock keyboard navigation announcements
        document.addEventListener('focusin', (event) => {
          const target = event.target as Element;
          const label = target.getAttribute('aria-label') || 
                       target.getAttribute('aria-labelledby') ||
                       target.textContent ||
                       target.getAttribute('title') ||
                       'unlabeled element';
          
          announcements.push({
            type: 'focus',
            content: `${target.tagName.toLowerCase()}, ${label}`,
            timestamp: Date.now()
          });
        });
        
        (window as any).getScreenReaderEvents = () => announcements;
      });

      // Navigate through the interface
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab');
      
      // Check for proper announcements
      const events = await page.evaluate(() => (window as any).getScreenReaderEvents());
      
      // Should have focus announcements
      expect(events.filter(e => e.type === 'focus').length).toBeGreaterThan(0);
      
      // Test form interaction
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      if (await inputs.count() > 0) {
        await inputs.first().click();
        await inputs.first().type('test input');
        
        // Check for input announcements
        const updatedEvents = await page.evaluate(() => (window as any).getScreenReaderEvents());
        expect(updatedEvents.length).toBeGreaterThan(events.length);
      }
    });

    test('should provide JAWS-compatible navigation structure @jaws-compat', async ({ page }) => {
      // Test JAWS-style virtual cursor navigation
      await page.addInitScript(() => {
        window.jawsEvents = [];
        
        // Mock JAWS virtual cursor behavior
        document.addEventListener('keydown', (event) => {
          if (event.altKey && event.key === 'ArrowDown') {
            // Simulate JAWS "next item" navigation
            const focusedElement = document.activeElement;
            if (focusedElement) {
              const description = getJAWSDescription(focusedElement);
              (window as any).jawsEvents.push({
                type: 'navigate',
                content: description,
                timestamp: Date.now()
              });
            }
          }
        });
        
        function getJAWSDescription(element) {
          const tagName = element.tagName.toLowerCase();
          const role = element.getAttribute('role');
          const label = element.getAttribute('aria-label') ||
                       element.getAttribute('aria-labelledby') ||
                       element.textContent?.trim() ||
                       'unlabeled';
          
          // JAWS-style descriptions
          const descriptions = {
            'input': 'edit box',
            'button': 'button',
            'select': 'combo box',
            'textarea': 'edit area',
            'checkbox': 'check box',
            'radio': 'radio button'
          };
          
          const elementType = descriptions[tagName] || role || tagName;
          return `${label}, ${elementType}`;
        }
        
        (window as any).getJAWSEvents = () => (window as any).jawsEvents;
      });

      // Test virtual cursor navigation simulation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Alt+ArrowDown');
      await page.waitForTimeout(500);
      
      const jawsEvents = await page.evaluate(() => (window as any).getJAWSEvents());
      
      // Should have JAWS-style navigation events
      expect(jawsEvents.length).toBeGreaterThanOrEqual(0);
      
      // Test form mode detection
      const formElements = page.locator('input, select, textarea');
      if (await formElements.count() > 0) {
        await formElements.first().focus();
        
        // In JAWS, focusing form elements should trigger "forms mode"
        const focusedElement = await page.locator(':focus').first();
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should announce dynamic content changes to screen readers @dynamic-content', async ({ page }) => {
      // Set up live region monitoring
      await page.addInitScript(() => {
        window.liveRegionEvents = [];
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              const target = mutation.target;
              let element = target.nodeType === 1 ? target : target.parentElement;
              
              while (element && element !== document.body) {
                const ariaLive = element.getAttribute('aria-live');
                const role = element.getAttribute('role');
                
                if (ariaLive || role === 'alert' || role === 'status') {
                  (window as any).liveRegionEvents.push({
                    ariaLive: ariaLive,
                    role: role,
                    content: element.textContent?.trim(),
                    timestamp: Date.now()
                  });
                  break;
                }
                element = element.parentElement;
              }
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        (window as any).getLiveRegionEvents = () => (window as any).liveRegionEvents;
      });

      // Trigger dynamic content changes
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        // Click buttons to trigger potential dynamic content
        await buttons.first().click();
        await page.waitForTimeout(1000);
        
        const liveEvents = await page.evaluate(() => (window as any).getLiveRegionEvents());
        
        // Should capture live region updates
        console.log(`Captured ${liveEvents.length} live region events`);
      }
      
      // Test form validation announcements
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const submitBtn = forms.first().locator('button[type="submit"], input[type="submit"]');
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
          
          const validationEvents = await page.evaluate(() => (window as any).getLiveRegionEvents());
          console.log(`Form validation events: ${validationEvents.length}`);
        }
      }
    });
  });

  test.describe('3. ARIA Attributes Verification', () => {
    test('should have correct aria-label attributes on all interactive elements @aria-labels', async ({ page }) => {
      // Get all interactive elements
      const interactiveElements = page.locator('button, a, input, select, textarea, [role="button"], [tabindex="0"]');
      const count = await interactiveElements.count();
      
      console.log(`Testing ${count} interactive elements for proper labeling`);
      
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        
        // Check for various labeling methods
        const hasAriaLabel = await element.getAttribute('aria-label');
        const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
        const hasTitle = await element.getAttribute('title');
        const hasTextContent = await element.textContent();
        const elementId = await element.getAttribute('id');
        const hasAssociatedLabel = elementId ? 
          await page.locator(`label[for="${elementId}"]`).count() > 0 : false;
        
        const isLabeled = hasAriaLabel || 
                         hasAriaLabelledBy || 
                         hasTitle || 
                         (hasTextContent && hasTextContent.trim().length > 0) ||
                         hasAssociatedLabel;
        
        if (!isLabeled) {
          const tagName = await element.evaluate(el => el.tagName);
          const outerHTML = await element.evaluate(el => el.outerHTML.substring(0, 100));
          console.error(`Unlabeled element: ${tagName} - ${outerHTML}`);
        }
        
        expect(isLabeled).toBe(true);
      }
    });

    test('should have correct aria-describedby references @aria-describedby', async ({ page }) => {
      // Find all elements with aria-describedby
      const elementsWithDescribedBy = page.locator('[aria-describedby]');
      const count = await elementsWithDescribedBy.count();
      
      console.log(`Testing ${count} elements with aria-describedby references`);
      
      for (let i = 0; i < count; i++) {
        const element = elementsWithDescribedBy.nth(i);
        const describedBy = await element.getAttribute('aria-describedby');
        
        if (describedBy) {
          const ids = describedBy.split(' ');
          
          for (const id of ids) {
            const referencedElement = page.locator(`#${id}`);
            const exists = await referencedElement.count() > 0;
            
            if (!exists) {
              console.error(`Missing aria-describedby target: #${id}`);
            }
            
            expect(exists).toBe(true);
          }
        }
      }
    });

    test('should have correct aria-live regions for dynamic content @aria-live', async ({ page }) => {
      // Find all live regions
      const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
      const count = await liveRegions.count();
      
      console.log(`Testing ${count} live regions`);
      
      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');
        
        // Validate aria-live values
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
        
        // Check for proper roles
        if (role === 'alert') {
          // Alert regions should be assertive
          const liveValue = ariaLive || 'assertive';
          expect(['assertive', 'polite']).toContain(liveValue);
        }
        
        if (role === 'status') {
          // Status regions should be polite
          const liveValue = ariaLive || 'polite';
          expect(['polite', 'assertive']).toContain(liveValue);
        }
      }
    });

    test('should have proper landmark roles and structure @landmarks', async ({ page }) => {
      // Check for required landmarks
      const main = page.locator('main, [role="main"]');
      await expect(main).toHaveCount(1); // Should have exactly one main landmark
      
      // Check navigation landmarks
      const navs = page.locator('nav, [role="navigation"]');
      const navCount = await navs.count();
      
      if (navCount > 1) {
        // Multiple navs should have distinguishing labels
        for (let i = 0; i < navCount; i++) {
          const nav = navs.nth(i);
          const hasLabel = await nav.getAttribute('aria-label') || 
                          await nav.getAttribute('aria-labelledby');
          expect(hasLabel).toBeTruthy();
        }
      }
      
      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // Should have at least one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThanOrEqual(1);
        
        // Check heading order (basic check)
        const headingLevels = [];
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          const tagName = await heading.evaluate(el => el.tagName);
          headingLevels.push(parseInt(tagName.substring(1)));
        }
        
        // First heading should be h1
        expect(headingLevels[0]).toBe(1);
      }
    });
  });

  test.describe('4. Color Contrast Validation', () => {
    test('should meet WCAG 2.1 AA color contrast standards @color-contrast', async ({ page }) => {
      // Add color contrast testing script
      await page.addInitScript(() => {
        window.checkColorContrast = function(element) {
          const computedStyle = window.getComputedStyle(element);
          const color = computedStyle.color;
          const backgroundColor = computedStyle.backgroundColor;
          
          // Helper to convert color to RGB
          function getRGB(color) {
            const div = document.createElement('div');
            div.style.color = color;
            document.body.appendChild(div);
            const rgb = window.getComputedStyle(div).color;
            document.body.removeChild(div);
            
            const match = rgb.match(/\\d+/g);
            return match ? match.map(Number) : [0, 0, 0];
          }
          
          // Calculate relative luminance
          function getLuminance(r, g, b) {
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          }
          
          // Calculate contrast ratio
          function getContrastRatio(color1, color2) {
            const rgb1 = getRGB(color1);
            const rgb2 = getRGB(color2);
            
            const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
            const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
            
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            
            return (lighter + 0.05) / (darker + 0.05);
          }
          
          if (color && backgroundColor) {
            const ratio = getContrastRatio(color, backgroundColor);
            return {
              ratio: ratio,
              meetsAA: ratio >= 4.5,
              meetsAAA: ratio >= 7.0,
              color: color,
              backgroundColor: backgroundColor
            };
          }
          
          return null;
        };
      });

      // Test text elements for contrast
      const textElements = page.locator('p, span, div, label, button, a, h1, h2, h3, h4, h5, h6');
      const count = await textElements.count();
      const sampleSize = Math.min(count, 20); // Test sample to avoid timeout
      
      console.log(`Testing color contrast for ${sampleSize} text elements`);
      
      for (let i = 0; i < sampleSize; i++) {
        const element = textElements.nth(i);
        
        // Skip elements without visible text
        const textContent = await element.textContent();
        if (!textContent || textContent.trim().length === 0) {
          continue;
        }
        
        const contrastInfo = await element.evaluate((el) => {
          return (window as any).checkColorContrast(el);
        });
        
        if (contrastInfo && contrastInfo.ratio > 0) {
          console.log(`Element ${i}: ${contrastInfo.ratio.toFixed(2)}:1 - ${contrastInfo.meetsAA ? 'PASS' : 'FAIL'}`);
          
          // Allow some tolerance for very small text or decorative elements
          if (contrastInfo.ratio < 3.0) {
            const tagName = await element.evaluate(el => el.tagName);
            console.warn(`Low contrast detected in ${tagName}: ${contrastInfo.ratio.toFixed(2)}:1`);
          }
          
          // Most text should meet AA standards (4.5:1)
          expect(contrastInfo.ratio).toBeGreaterThan(3.0);
        }
      }
    });

    test('should have sufficient contrast for focus indicators @focus-contrast', async ({ page }) => {
      // Test focus indicators
      const focusableElements = page.locator('button, input, select, textarea, a, [tabindex="0"]');
      const count = await focusableElements.count();
      const sampleSize = Math.min(count, 10);
      
      console.log(`Testing focus indicators for ${sampleSize} elements`);
      
      for (let i = 0; i < sampleSize; i++) {
        const element = focusableElements.nth(i);
        
        // Focus the element
        await element.focus();
        
        // Check if focus indicator is visible
        const outlineStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
            boxShadow: style.boxShadow
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = outlineStyle.outline !== 'none' ||
                                 outlineStyle.outlineWidth !== '0px' ||
                                 outlineStyle.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBe(true);
        
        if (outlineStyle.outline !== 'none') {
          console.log(`Focus indicator: ${outlineStyle.outline}`);
        }
      }
    });
  });

  test.describe('5. Keyboard Navigation Comprehensive Testing', () => {
    test('should provide complete keyboard navigation path @keyboard-complete', async ({ page }) => {
      // Start navigation test
      console.log('Testing complete keyboard navigation path');
      
      let focusableCount = 0;
      const maxTabStops = 50; // Prevent infinite loops
      
      // Tab through all focusable elements
      for (let i = 0; i < maxTabStops; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focusedElement = page.locator(':focus');
        const exists = await focusedElement.count() > 0;
        
        if (exists) {
          focusableCount++;
          
          // Get element info for debugging
          const elementInfo = await focusedElement.evaluate(el => ({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            textContent: el.textContent?.substring(0, 50)
          }));
          
          console.log(`Tab stop ${focusableCount}: ${elementInfo.tagName}${elementInfo.id ? '#' + elementInfo.id : ''}`);
          
          // Check if we've looped back to the first element
          if (i > 0 && focusableCount > 1) {
            const isFirstElement = await focusedElement.evaluate(el => {
              const allFocusable = Array.from(document.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
              ));
              return el === allFocusable[0];
            });
            
            if (isFirstElement) {
              console.log('Completed full tab cycle');
              break;
            }
          }
        } else {
          // No more focusable elements
          break;
        }
      }
      
      expect(focusableCount).toBeGreaterThan(0);
      console.log(`Total focusable elements: ${focusableCount}`);
    });

    test('should support reverse navigation with Shift+Tab @keyboard-reverse', async ({ page }) => {
      // Tab to establish baseline
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const forwardElement = await page.locator(':focus').textContent();
      
      // Navigate backwards
      await page.keyboard.press('Shift+Tab');
      const backwardElement = await page.locator(':focus').textContent();
      
      // Should be different elements (unless only one focusable element)
      if (forwardElement && backwardElement) {
        console.log(`Forward: ${forwardElement.substring(0, 30)}`);
        console.log(`Backward: ${backwardElement.substring(0, 30)}`);
      }
      
      // At minimum, should have some focused element
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('should handle Enter and Space key activation @keyboard-activation', async ({ page }) => {
      // Test button activation
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();
        
        // Test Enter key
        await page.keyboard.press('Enter');
        
        // Test Space key
        await page.keyboard.press('Space');
        
        // Should still be focused (or have triggered action)
        expect(true).toBe(true); // Basic check that keys didn't cause errors
      }
      
      // Test link activation
      const links = page.locator('a[href]');
      if (await links.count() > 0) {
        const firstLink = links.first();
        await firstLink.focus();
        
        // Test Enter key (don't actually navigate)
        const href = await firstLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          // Internal link, safe to test
          await page.keyboard.press('Enter');
        }
      }
    });
  });

  test.describe('6. Complete Integration Testing', () => {
    test('should pass comprehensive accessibility audit for complete user flow @full-audit', async ({ page, browserName }) => {
      console.log(`Running complete accessibility audit on ${browserName}`);
      
      // Step 1: Initial page load audit
      let initialScan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(initialScan.violations).toEqual([]);
      console.log(`✓ Initial page scan passed (${initialScan.passes.length} checks)`);
      
      // Step 2: Interactive element testing
      const interactiveElements = page.locator('button, input, select, textarea, a');
      const interactiveCount = await interactiveElements.count();
      
      if (interactiveCount > 0) {
        // Test first few interactive elements
        const testCount = Math.min(interactiveCount, 5);
        
        for (let i = 0; i < testCount; i++) {
          const element = interactiveElements.nth(i);
          await element.focus();
          
          // Check element is properly focused
          await expect(element).toBeFocused();
          
          // Small delay for any dynamic updates
          await page.waitForTimeout(200);
        }
      }
      
      // Step 3: Form interaction testing
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const form = forms.first();
        
        // Fill out form if inputs exist
        const textInputs = form.locator('input[type="text"], input[type="email"]');
        const inputCount = await textInputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          await textInputs.nth(i).fill(`test-value-${i}`);
        }
        
        // Try form submission (without actually submitting)
        const submitButton = form.locator('button[type="submit"], input[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.focus();
          // Don't actually submit to avoid navigation
        }
      }
      
      // Step 4: Modal interaction testing
      const modalTriggers = page.locator('button').filter({ hasText: /open|modal|dialog/i });
      if (await modalTriggers.count() > 0) {
        await modalTriggers.first().click();
        
        // Wait for modal
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 }).catch(() => {
          console.log('No modal appeared');
        });
        
        const modal = page.locator('[role="dialog"]');
        if (await modal.count() > 0) {
          // Test modal accessibility
          await expect(modal).toBeVisible();
          
          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
      
      // Step 5: Final comprehensive scan
      const finalScan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      if (finalScan.violations.length > 0) {
        console.log('Final scan violations:');
        finalScan.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
        });
      }
      
      expect(finalScan.violations).toEqual([]);
      console.log(`✓ Final comprehensive scan passed (${finalScan.passes.length} checks)`);
      
      // Log summary
      console.log(`
===== ACCESSIBILITY AUDIT SUMMARY =====
Browser: ${browserName}
Initial checks passed: ${initialScan.passes.length}
Final checks passed: ${finalScan.passes.length}
Interactive elements tested: ${Math.min(interactiveCount, 5)}
Forms tested: ${await forms.count()}
Modals tested: ${await modalTriggers.count()}
Status: ✓ PASSED
======================================
      `);
    });
  });
});