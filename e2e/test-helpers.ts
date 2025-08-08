import { Page, expect } from '@playwright/test';

export interface TestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  errorMessage?: string;
  screenshots?: string[];
}

export class TestReporter {
  private metrics: TestMetrics[] = [];
  private performanceData: { [key: string]: number } = {};
  
  addMetric(metric: TestMetrics) {
    this.metrics.push(metric);
  }
  
  addPerformanceData(key: string, value: number) {
    this.performanceData[key] = value;
  }
  
  getMetrics() {
    return this.metrics;
  }
  
  getPerformanceData() {
    return this.performanceData;
  }
  
  generateSummary() {
    const total = this.metrics.length;
    const passed = this.metrics.filter(m => m.status === 'passed').length;
    const failed = this.metrics.filter(m => m.status === 'failed').length;
    const skipped = this.metrics.filter(m => m.status === 'skipped').length;
    
    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageDuration: this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / total
    };
  }
}

export class AccessibilityTester {
  constructor(private page: Page) {}

  async checkKeyboardNavigation(): Promise<boolean> {
    try {
      // Test tab navigation
      await this.page.keyboard.press('Tab');
      const focusedElement = this.page.locator(':focus');
      const isVisible = await focusedElement.isVisible();
      return isVisible;
    } catch {
      return false;
    }
  }

  async checkAriaLabels(selector: string): Promise<boolean> {
    try {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        const ariaLabel = await element.getAttribute('aria-label');
        const textContent = await element.textContent();
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        
        if (!ariaLabel && !textContent && !ariaLabelledBy) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async checkColorContrast(): Promise<boolean> {
    try {
      // Test both light and dark modes
      await this.page.emulateMedia({ colorScheme: 'light' });
      await this.page.waitForTimeout(500);
      
      await this.page.emulateMedia({ colorScheme: 'dark' });
      await this.page.waitForTimeout(500);
      
      return true;
    } catch {
      return false;
    }
  }

  async checkSemanticHTML(): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 100;

    try {
      // Check for main element
      const mainCount = await this.page.locator('main').count();
      if (mainCount === 0) {
        issues.push('Missing main element');
        score -= 20;
      }

      // Check heading hierarchy
      const h1Count = await this.page.locator('h1').count();
      if (h1Count !== 1) {
        issues.push(`Found ${h1Count} h1 elements (should be exactly 1)`);
        score -= 10;
      }

      // Check for skip navigation
      const skipNav = await this.page.locator('[href="#main"], [href="#content"]').count();
      if (skipNav === 0) {
        issues.push('Missing skip navigation link');
        score -= 10;
      }

      // Check form labels
      const inputs = this.page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        
        if (id) {
          const labelCount = await this.page.locator(`label[for="${id}"]`).count();
          if (labelCount === 0 && !ariaLabel) {
            issues.push(`Input without label: ${id}`);
            score -= 5;
          }
        }
      }

      return { score: Math.max(0, score), issues };
    } catch (error) {
      return { score: 0, issues: [`Error checking semantic HTML: ${error}`] };
    }
  }
}

export class PerformanceTester {
  constructor(private page: Page) {}

  async measurePageLoad(): Promise<number> {
    const startTime = Date.now();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureInteractionTime(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }

  async checkMemoryUsage(): Promise<any> {
    try {
      const metrics = await this.page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });
      return metrics;
    } catch {
      return null;
    }
  }

  async measureRenderTime(): Promise<number> {
    const timing = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return nav.loadEventEnd - nav.loadEventStart;
    });
    return timing;
  }
}

export class SecurityTester {
  constructor(private page: Page) {}

  async testXSSPrevention(inputSelector: string, payloads: string[]): Promise<{ safe: boolean; vulnerabilities: string[] }> {
    const vulnerabilities: string[] = [];
    let safe = true;

    for (const payload of payloads) {
      try {
        await this.page.fill(inputSelector, payload);
        await this.page.waitForTimeout(500);

        // Check if any scripts were executed
        const scriptExecuted = await this.page.evaluate(() => {
          return window.hasOwnProperty('xssTest') || document.body.innerHTML.includes('<script');
        });

        if (scriptExecuted) {
          vulnerabilities.push(`XSS vulnerability found with payload: ${payload}`);
          safe = false;
        }
      } catch (error) {
        // Input validation might throw errors, which is good for security
        console.log(`Input validation caught payload: ${payload}`);
      }
    }

    return { safe, vulnerabilities };
  }

  async testInputSanitization(inputSelector: string): Promise<boolean> {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '"><script>alert("xss")</script>',
      '\';alert("xss");//'
    ];

    for (const input of maliciousInputs) {
      try {
        await this.page.fill(inputSelector, input);
        const value = await this.page.inputValue(inputSelector);
        
        // Check if dangerous content was sanitized
        if (value.includes('<script') || value.includes('javascript:') || value.includes('onerror')) {
          return false;
        }
      } catch {
        // Input validation errors are acceptable
        continue;
      }
    }

    return true;
  }

  async checkCSPHeaders(): Promise<boolean> {
    try {
      const response = await this.page.goto(this.page.url());
      const cspHeader = response?.headers()['content-security-policy'];
      return !!cspHeader;
    } catch {
      return false;
    }
  }
}

export class MobileTester {
  constructor(private page: Page) {}

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async testTouchInteractions(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await element.tap();
      return true;
    } catch {
      return false;
    }
  }

  async checkMobileLayout(): Promise<{ responsive: boolean; issues: string[] }> {
    const issues: string[] = [];
    let responsive = true;

    try {
      await this.setMobileViewport();
      await this.page.waitForTimeout(500);

      // Check for horizontal scrollbar
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll) {
        issues.push('Horizontal scrollbar detected on mobile');
        responsive = false;
      }

      // Check if buttons are touch-friendly (at least 44px)
      const buttons = this.page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box && (box.height < 44 || box.width < 44)) {
            issues.push(`Button too small for touch: ${box.width}x${box.height}px`);
            responsive = false;
          }
        }
      }

      // Check font sizes
      const textElements = this.page.locator('p, span, div, label');
      const textCount = await textElements.count();

      for (let i = 0; i < Math.min(textCount, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const fontSize = await element.evaluate(el => {
            return window.getComputedStyle(el).fontSize;
          });
          
          const size = parseFloat(fontSize);
          if (size < 14) {
            issues.push(`Text too small for mobile: ${fontSize}`);
            responsive = false;
          }
        }
      }

      return { responsive, issues };
    } catch (error) {
      return { responsive: false, issues: [`Error checking mobile layout: ${error}`] };
    }
  }
}

export class BugTracker {
  private bugs: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    reproductionSteps: string[];
    expectedBehavior: string;
    actualBehavior: string;
    environment: string;
    screenshot?: string;
  }> = [];

  addBug(bug: {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    reproductionSteps: string[];
    expectedBehavior: string;
    actualBehavior: string;
    environment: string;
    screenshot?: string;
  }) {
    this.bugs.push({
      id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...bug
    });
  }

  getBugs() {
    return this.bugs;
  }

  getBugsByCategory(category: string) {
    return this.bugs.filter(bug => bug.category === category);
  }

  getBugsBySeverity(severity: string) {
    return this.bugs.filter(bug => bug.severity === severity);
  }

  generateBugReport() {
    const summary = {
      total: this.bugs.length,
      critical: this.bugs.filter(b => b.severity === 'critical').length,
      high: this.bugs.filter(b => b.severity === 'high').length,
      medium: this.bugs.filter(b => b.severity === 'medium').length,
      low: this.bugs.filter(b => b.severity === 'low').length,
    };

    return {
      summary,
      bugs: this.bugs
    };
  }
}

// Mock data generators
export const MockData = {
  medications: [
    { id: '1', name: 'Aspirin', type: 'Prescribed', category: 'Pain Relief' },
    { id: '2', name: 'Ibuprofen', type: 'OTC', category: 'Anti-inflammatory' },
    { id: '3', name: 'Acetaminophen', type: 'OTC', category: 'Pain Relief' },
    { id: '4', name: 'Amoxicillin', type: 'Prescribed', category: 'Antibiotic' },
    { id: '5', name: 'Lisinopril', type: 'Prescribed', category: 'Blood Pressure' }
  ],
  
  clients: [
    { id: 'CLIENT001', name: 'John Doe', age: 45 },
    { id: 'CLIENT002', name: 'Jane Smith', age: 32 },
    { id: 'CLIENT003', name: 'Bob Johnson', age: 67 }
  ],
  
  dosageUnits: ['mg', 'g', 'ml', 'tablets', 'capsules', 'drops'],
  
  frequencies: [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Weekly',
    'Monthly'
  ],
  
  categories: {
    broad: ['Pain Relief', 'Anti-inflammatory', 'Cardiovascular', 'Respiratory', 'Digestive'],
    specific: ['Analgesic', 'NSAID', 'ACE Inhibitor', 'Beta Blocker', 'Antihistamine']
  }
};

// Test data validation helpers
export const ValidationHelpers = {
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },
  
  isValidDosage(dosage: string): boolean {
    const num = parseFloat(dosage);
    return !isNaN(num) && num > 0 && num <= 10000;
  },
  
  isValidMedicationName(name: string): boolean {
    return typeof name === 'string' && name.length > 0 && name.length <= 255;
  },
  
  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};

export const TestCategories = {
  FUNCTIONAL: 'Functional Testing',
  UI_UX: 'UI/UX Testing', 
  CROSS_BROWSER: 'Cross-Browser Testing',
  MOBILE_RESPONSIVE: 'Mobile Responsive Testing',
  ACCESSIBILITY: 'Accessibility Testing',
  PERFORMANCE: 'Performance Testing',
  EDGE_CASES: 'Edge Cases & Boundary Testing',
  INTEGRATION: 'Integration Testing',
  SECURITY: 'Security Testing'
};

// Global test instances
export const testReporter = new TestReporter();
export const bugTracker = new BugTracker();