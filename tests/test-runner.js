/**
 * Test Runner for LuminaCV
 * Simple testing framework with no external dependencies
 */

class TestRunner {
  constructor() {
    this.suites = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  registerSuite(name, fn) {
    this.suites.push({ name, fn });
  }

  async runTests() {
    console.log('🧪 Running tests...\n');

    for (const suite of this.suites) {
      try {
        console.log(`  📝 ${suite.name}`);
        await suite.fn(this);
        console.log(`     ✅ Passed\n`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ suite: suite.name, error: error.message });
        console.log(`     ❌ Failed: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
    this.results.passed++;
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `${message || 'Assertion failed'}: expected "${expected}", got "${actual}"`
      );
    }
    this.results.passed++;
  }

  printSummary() {
    const total = this.results.passed + this.results.failed;
    console.log('='.repeat(50));
    console.log(`Results: ${this.results.passed}/${total} passed`);

    if (this.results.failed > 0) {
      console.log(`\n❌ ${this.results.failed} failure(s):`);
      this.results.errors.forEach(err => {
        console.log(`   - ${err.suite}: ${err.error}`);
      });
      process.exit(1);
    } else {
      console.log('✅ All tests passed!');
    }
  }
}

module.exports = TestRunner;
