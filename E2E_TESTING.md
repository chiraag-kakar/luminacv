# E2E Testing with Playwright

## Overview

LuminaCV uses Playwright for end-to-end testing, ensuring all user workflows work correctly across browsers and devices.

## Test Coverage

### Core Functionality
- ✅ Personal information input and validation
- ✅ Experience entry management (add, edit, delete)
- ✅ Export to JSON, Markdown, PDF
- ✅ URL-based sharing
- ✅ Settings and customization
- ✅ localStorage persistence

### User Interactions
- ✅ Form input and validation
- ✅ Modal dialogs
- ✅ Keyboard shortcuts
- ✅ Tab navigation
- ✅ Escape key handling

### Accessibility (WCAG 2.1 AA)
- ✅ ARIA labels on interactive elements
- ✅ Semantic HTML structure
- ✅ Keyboard accessibility
- ✅ Focus indicators
- ✅ Color contrast
- ✅ Heading hierarchy
- ✅ Form labels and validation

### Responsive Design
- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)
- ✅ Desktop (1920x1080)

### Browser Compatibility
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

## Setup

### Installation

```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install

# Or install specific browsers
npx playwright install chromium firefox webkit
```

### Configuration

The `playwright.config.js` file defines:
- Test directory: `./e2e`
- Web server: http://localhost:3001
- Reporters: HTML, JSON, list
- Projects: Multiple browsers and device configs

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Suite
```bash
npx playwright test e2e/tests.spec.js
npx playwright test e2e/accessibility.spec.js
```

### Run Specific Test
```bash
npx playwright test -g "should populate personal info"
```

### Run in UI Mode
```bash
npx playwright test --ui
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Run with Headed Browsers
```bash
npx playwright test --headed
```

### Run Single Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Mobile Tests
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Reports

### View HTML Report
```bash
npx playwright show-report
```

### Test Results
- `playwright-report/` - HTML report with screenshots/videos
- `test-results/` - JSON results and traces
- Videos saved for failed tests

## Test Structure

### Basic Test
```javascript
const { test, expect } = require('@playwright/test');

test('should populate personal info', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  const fullName = page.locator('#fullName');
  await fullName.fill('John Doe');
  
  await expect(page.locator('.preview-content')).toContainText('John Doe');
});
```

### Test Organization
```javascript
test.describe('Personal Information', () => {
  test('should populate personal info', async ({ page }) => {
    // Test code
  });

  test('should validate email format', async ({ page }) => {
    // Test code
  });
});
```

### Setup and Teardown
```javascript
test.beforeAll(async () => {
  // Run once before all tests
});

test.beforeEach(async ({ page }) => {
  // Run before each test
  await page.goto('http://localhost:3001');
});

test.afterEach(async ({ page }) => {
  // Run after each test
});

test.afterAll(async () => {
  // Run once after all tests
});
```

## Common Selectors

### By ID
```javascript
page.locator('#fullName')
```

### By Placeholder
```javascript
page.locator('input[placeholder="John Doe"]')
```

### By ARIA Label
```javascript
page.locator('[aria-label="Export resume as PDF"]')
```

### By Text Content
```javascript
page.locator('text=Settings')
page.locator('button:has-text("Export")')
```

### By CSS Selector
```javascript
page.locator('.editor-toolbar button')
page.locator('.preview-content h2')
```

## Best Practices

### 1. Use Accessible Selectors
Prefer ARIA labels and semantic selectors over brittle class names:
```javascript
// ✓ Good
page.locator('[aria-label="Export resume as PDF"]')

// ✗ Avoid
page.locator('.btn-primary.export-btn-v3')
```

### 2. Wait for Elements
Always wait for elements to be visible/stable:
```javascript
await expect(page.locator('.modal-backdrop')).toBeVisible();
await page.locator('button').click();
```

### 3. Use Page Objects
For complex tests, use Page Object pattern:
```javascript
class HomePage {
  constructor(page) {
    this.page = page;
    this.fullName = page.locator('#fullName');
  }

  async fillName(name) {
    await this.fullName.fill(name);
  }
}
```

### 4. Test User Behavior
Test what users do, not implementation:
```javascript
// ✓ Test user behavior
await page.locator('[aria-label="Export PDF"]').click();
await expect(downloadPromise).toBeDefined();

// ✗ Avoid testing internals
expect(window.exportFunctions.called).toBe(true);
```

### 5. Avoid Sleeps
Use proper waits instead of `await page.waitForTimeout(1000)`:
```javascript
// ✓ Good
await expect(page.locator('.success-message')).toBeVisible();

// ✗ Avoid
await page.waitForTimeout(1000);
```

## Debugging

### Visual Debugging
```bash
npx playwright test --debug
```

### Screenshot on Failure
Automatically captured in `test-results/`

### Full Page Screenshots
```javascript
await page.screenshot({ path: 'screenshot.png' });
```

### Video Recording
```javascript
// Enabled in config.js
// Videos in test-results/ on failure
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions
The `e2e.yml` workflow:
- Runs tests on multiple browsers
- Tests accessibility compliance
- Generates HTML reports
- Uploads artifacts
- Comments on PRs

### Local Testing Before Push
```bash
npm run test:e2e
```

## Performance Considerations

### Test Timing
- Single test: ~500ms - 2s
- Full suite: ~2-5 minutes (depends on browser count)
- CI runs: ~10-15 minutes (parallel execution)

### Optimization
- Use `project` matrix for parallel browser testing
- Disable video recording in CI (use `retries` instead)
- Reuse server with `reuseExistingServer`

## Troubleshooting

### Tests Timing Out
```javascript
test.setTimeout(60000); // 60 second timeout
```

### Element Not Found
```javascript
// Debug selector
await page.pause(); // Opens inspector
```

### Browser Version Issues
```bash
npx playwright install --with-deps
npx playwright --version
```

### Mobile Test Issues
```bash
# Test on actual mobile device
npx playwright test --headed --project="Mobile Chrome"
```

## Future Enhancements

```javascript
// Potential additions:
- Visual regression testing
- Performance metrics collection
- PDF generation validation
- Import/export roundtrip testing
- Multi-user concurrent testing
- Load testing with multiple tabs
```

## References

- [Playwright Documentation](https://playwright.dev)
- [Test Examples](https://github.com/microsoft/playwright/tree/main/tests)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

---

**Last Updated:** 2 January 2026  
**Status:** ✅ Active
