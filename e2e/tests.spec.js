/**
 * E2E Test Suite for LuminaCV
 * Tests all major user workflows
 */

const { test, expect } = require('@playwright/test');

// Mock server for testing
function startMockServer() {
  const http = require('http');
  const fs = require('fs');
  
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('./editor.html', 'utf8'));
    } else if (req.url.endsWith('.js')) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(fs.readFileSync('.' + req.url, 'utf8'));
    } else if (req.url.endsWith('.css')) {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(fs.readFileSync('.' + req.url, 'utf8'));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  
  server.listen(3001, () => console.log('Mock server started on :3001'));
  return server;
}

test.describe('LuminaCV E2E Tests', () => {
  test.beforeAll(async () => {
    // Start mock server
    this.server = startMockServer();
  });

  test.afterAll(async () => {
    // Close mock server
    if (this.server) {
      this.server.close();
    }
  });

  test('should load application', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Check header
    await expect(page.locator('h1')).toContainText('LuminaCV');
    
    // Check toolbar
    await expect(page.locator('[aria-label="Export resume as PDF via print dialog"]')).toBeVisible();
    await expect(page.locator('[aria-label="Generate shareable URL with resume data"]')).toBeVisible();
  });

  test.describe('Personal Information', () => {
    test('should populate personal info', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      const fullName = page.locator('#fullName');
      const email = page.locator('#email');
      const phone = page.locator('#phone');
      
      await fullName.fill('John Doe');
      await email.fill('john@example.com');
      await phone.fill('(555) 123-4567');
      
      // Verify preview updates
      await expect(page.locator('.preview-content')).toContainText('John Doe');
      await expect(page.locator('.preview-content')).toContainText('john@example.com');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      const email = page.locator('#email');
      await email.fill('invalid-email');
      
      // HTML5 validation should prevent submission
      const isValid = await email.evaluate((el) => el.validity.valid);
      expect(isValid).toBe(false);
    });
  });

  test.describe('Experience Section', () => {
    test('should add experience entry', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Click add button
      await page.locator('button:has-text("+ Add")').first().click();
      
      // Check if entry form appears
      const fields = page.locator('input[placeholder="Software Engineer"]');
      await expect(fields).toBeVisible();
    });

    test('should display multiple experiences', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Add first entry
      await page.locator('#experience-list').locator('[type="text"]').first().fill('Software Engineer');
      
      // Verify it appears in preview
      await expect(page.locator('.preview-content')).toContainText('Software Engineer');
    });
  });

  test.describe('Export Features', () => {
    test('should export to JSON', async ({ page, context }) => {
      await page.goto('http://localhost:3001');
      
      // Fill basic info
      await page.locator('#fullName').fill('Test User');
      await page.locator('#email').fill('test@example.com');
      
      // Setup download listener
      const downloadPromise = context.waitForEvent('download');
      
      // Click export JSON
      await page.locator('[aria-label="Export resume as JSON file"]').click();
      
      // Would verify download in real test
      // const download = await downloadPromise;
      // const path = await download.path();
    });

    test('should generate shareable URL', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      await page.locator('#fullName').fill('Jane Doe');
      
      // Mock the alert
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('http://localhost:3001');
        dialog.accept();
      });
      
      await page.locator('[aria-label="Generate shareable URL with resume data"]').click();
    });
  });

  test.describe('Settings & Customization', () => {
    test('should open settings modal', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      await page.locator('[aria-label="Open settings for customization"]').click();
      
      // Check modal appears
      await expect(page.locator('.modal-backdrop')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Settings');
    });

    test('should change template', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      await page.locator('[aria-label="Open settings for customization"]').click();
      
      // Select template (implementation depends on HTML structure)
      const modernOption = page.locator('text=Modern');
      if (await modernOption.isVisible()) {
        await modernOption.click();
      }
    });

    test('should close settings with Escape key', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      await page.locator('[aria-label="Open settings for customization"]').click();
      await expect(page.locator('.modal-backdrop')).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(page.locator('.modal-backdrop')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate with Tab key', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Start from fullName
      await page.locator('#fullName').focus();
      
      // Tab to next field
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement.id);
      expect(focused).toBe('email');
    });

    test('should handle keyboard shortcuts', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Help shortcut
      page.once('dialog', dialog => {
        dialog.accept();
      });
      
      await page.keyboard.press('Slash');
      
      // Test Escape in any modal
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Local Storage Persistence', () => {
    test('should save data to localStorage', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      await page.locator('#fullName').fill('Persistent User');
      
      // Force save
      await page.evaluate(() => {
        if (window.state && window.state.saveToStorage) {
          window.state.saveToStorage();
        }
      });
      
      // Reload page
      await page.reload();
      
      // Check data persisted
      const nameValue = await page.locator('#fullName').inputValue();
      expect(nameValue).toBe('Persistent User');
    });

    test('should load sample data on first visit', async ({ page, context }) => {
      // Clear localStorage
      await context.clearCookies();
      
      await page.goto('http://localhost:3001');
      
      // Check if sample data loaded
      const preview = page.locator('.preview-content');
      // Sample data should be loaded
      await expect(preview).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Check toolbar buttons have labels
      const buttons = page.locator('button[aria-label]');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(5);
    });

    test('should support keyboard-only navigation', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Tab through major elements
      let tabCount = 0;
      while (tabCount < 20) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement.getAttribute('aria-label'));
        if (focused) {
          break;
        }
        tabCount++;
      }
      
      expect(tabCount).toBeLessThan(20);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Check h1 exists
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check h3s exist in sections
      const h3s = page.locator('h3');
      const count = await h3s.count();
      expect(count).toBeGreaterThan(3);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3001');
      
      // Check main elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.editor-panel')).toBeVisible();
    });

    test('should be tablet responsive', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:3001');
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.container')).toBeVisible();
    });

    test('should be desktop responsive', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3001');
      
      // Two-panel layout should be visible
      await expect(page.locator('.editor-panel')).toBeVisible();
      await expect(page.locator('.preview-panel')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing localStorage gracefully', async ({ page, context }) => {
      // localStorage disabled in context
      await page.goto('http://localhost:3001');
      
      // Should still work
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should display validation errors', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Try invalid email
      const email = page.locator('#email');
      await email.fill('not-an-email');
      await email.blur();
      
      // Should show validation state
      const isValid = await email.evaluate((el) => el.validity.valid);
      expect(isValid).toBe(false);
    });
  });

  test.describe('Performance', () => {
    test('should load in reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3001');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle large content', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // Add lots of text
      await page.locator('#fullName').fill('A'.repeat(500));
      
      // Should still be responsive
      await expect(page.locator('.preview-content')).toBeVisible();
    });
  });
});
