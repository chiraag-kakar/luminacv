#!/usr/bin/env node

/**
 * Master test runner - loads and executes all tests
 */

const fs = require('fs');
const path = require('path');
const TestRunner = require('./test-runner');

async function runAllTests() {
  const runner = new TestRunner();
  const testsDir = __dirname;

  const testFiles = fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.test.js'))
    .sort();

  if (testFiles.length === 0) {
    console.log('⚠️  No test files found');
    return;
  }

  console.log(`Found ${testFiles.length} test file(s)\n`);

  for (const testFile of testFiles) {
    const testPath = path.join(testsDir, testFile);
    const testName = testFile.replace('.test.js', '');

    try {
      const testSuite = require(testPath);
      runner.registerSuite(testName, (r) => testSuite(r));
    } catch (error) {
      console.error(`Failed to load ${testFile}: ${error.message}`);
    }
  }

  await runner.runTests();
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
