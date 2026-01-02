/**
 * E2E Test Configuration for Playwright
 * 
 * To run:
 * npm install -D @playwright/test
 * npx playwright test
 */

module.exports = {
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  webServer: {
    command: 'node -e "const http = require(\'http\'); const fs = require(\'fs\'); http.createServer((req, res) => { const url = req.url === \'/\' ? \'/editor.html\' : req.url; try { const content = fs.readFileSync(\'.\' + url); const type = url.endsWith(\'.js\') ? \'application/javascript\' : url.endsWith(\'.css\') ? \'text/css\' : \'text/html\'; res.writeHead(200, {\'Content-Type\': type}); res.end(content); } catch { res.writeHead(404); res.end(); } }).listen(3001);"',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').chromium },
    },
    {
      name: 'firefox',
      use: { ...require('@playwright/test').firefox },
    },
    {
      name: 'webkit',
      use: { ...require('@playwright/test').webkit },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: {
        ...require('@playwright/test').devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...require('@playwright/test').devices['iPhone 12'],
      },
    },
  ],
};
