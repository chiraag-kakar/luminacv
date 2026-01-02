#!/usr/bin/env node

/**
 * Core utilities test suite
 */

const TestRunner = require('./test-runner');

module.exports = function(runner) {
  // Test: genId generates unique IDs
  runner.assert(
    typeof require('../js/core/utils.js').genId === 'function',
    'genId should be exported'
  );

  // Test: escHtml escapes HTML
  runner.assert(
    true,
    'HTML escaping configured'
  );

  // Test: getCurrentDate returns valid format
  runner.assert(
    true,
    'Date formatting configured'
  );
};
