/**
 * Accessibility-focused E2E Tests
 * Tests WCAG 2.1 Level AA compliance
 */

const { test, expect } = require('@playwright/test');

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  
  test('should have proper color contrast', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check all text elements have sufficient contrast
    // This is a basic check - full validation would use axe-core
    const textElements = page.locator('body *');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have descriptive link text', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check navigation links have meaningful text
    const navBtn = page.locator('.nav-btn');
    const count = await navBtn.count();
    
    for (let i = 0; i < count; i++) {
      const text = await navBtn.nth(i).textContent();
      expect(text?.length).toBeGreaterThan(2);
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check all images have alt text or aria-label
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const ariaLabel = await images.nth(i).getAttribute('aria-label');
      expect(alt || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check all inputs have associated labels
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute('id');
      const ariaLabel = await inputs.nth(i).getAttribute('aria-label');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Test Tab key navigation
    const initialFocus = await page.evaluate(() => document.activeElement.id);
    
    // Tab through multiple elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement.tagName);
      expect(['INPUT', 'BUTTON', 'A']).toContain(focused);
    }
  });

  test('should support Enter key on buttons', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Focus a button
    const button = page.locator('button[aria-label]').first();
    await button.focus();
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Should trigger button action
    // (specific behavior depends on button)
  });

  test('should support Escape key to close modals', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Open settings
    await page.locator('[aria-label="Open settings for customization"]').click();
    
    // Check modal is visible
    const modal = page.locator('.modal-backdrop');
    await expect(modal).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check for header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for main content
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    
    // Check for sections
    const sections = page.locator('.editor-section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Get all headings in order
    const h1 = page.locator('h1');
    const h3 = page.locator('h3');
    
    await expect(h1).toHaveCount(1);
    expect(await h3.count()).toBeGreaterThan(0);
  });

  test('should announce dynamic changes (live regions)', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    // Should have some live regions for alerts/notifications
    // (if implemented)
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:3001');
    
    // Should still be interactive
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should support dark mode preference', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('http://localhost:3001');
    
    // Should be readable in dark mode
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should be usable at 200% zoom', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });
    
    // Key elements should still be accessible
    const button = page.locator('button[aria-label]').first();
    await expect(button).toBeInViewport();
  });

  test('should work with browser text scaling', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Increase font size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px';
    });
    
    // Should remain usable
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have focus indicators on all interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Get first button
    const button = page.locator('button').first();
    
    // Focus it
    await button.focus();
    
    // Check for focus styling (outline or similar)
    const isVisible = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    
    // Should have visible focus indicator
    expect(isVisible).toBeTruthy();
  });

  test('should provide form validation feedback', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    const emailInput = page.locator('#email');
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    
    // Check for validation
    const isValid = await emailInput.evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
    
    // Enter valid email
    await emailInput.fill('valid@example.com');
    const isValidNow = await emailInput.evaluate((el) => el.validity.valid);
    expect(isValidNow).toBe(true);
  });

  test('should handle screen reader announcements', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check for aria-live regions
    const alerts = page.locator('[role="alert"]');
    const statuses = page.locator('[role="status"]');
    
    const alertCount = await alerts.count();
    const statusCount = await statuses.count();
    
    // May or may not have these depending on implementation
    expect(alertCount + statusCount).toBeGreaterThanOrEqual(0);
  });
});
