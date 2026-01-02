#!/usr/bin/env node

/**
 * Simple bundler for LuminaCV
 * Combines /js/ modular architecture into production app.js
 * No external dependencies - pure Node.js
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, 'js');
const OUTPUT_FILE = path.join(__dirname, 'app.js');

// Module loading order (respects dependencies)
const MODULE_ORDER = [
  'core/utils.js',
  'core/state.js',
  'data/templates.js',
  'data/defaults.js',
  'features/export.js',
  'features/import.js',
  'features/share.js',
  'features/formatter.js',
  'main.js'
];

function readModule(modulePath) {
  const fullPath = path.join(MODULES_DIR, modulePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read module: ${modulePath}`);
    throw error;
  }
}

function wrapModule(content, modulePath) {
  return `\n// ============================================\n// Module: ${modulePath}\n// ============================================\n${content}\n`;
}

function bundle() {
  console.log('🔨 Bundling LuminaCV...\n');

  let bundledCode = `/**
 * LuminaCV - Bundled Application
 * Generated from modular /js/ architecture
 */

(function() {
  'use strict';\n`;

  for (const modulePath of MODULE_ORDER) {
    // Skip missing optional modules
    const fullPath = path.join(MODULES_DIR, modulePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⊘ Skipping (not yet created): ${modulePath}`);
      continue;
    }
    
    console.log(`  ✓ Including: ${modulePath}`);
    try {
      const moduleContent = readModule(modulePath);
      const wrapped = wrapModule(moduleContent, modulePath);
      bundledCode += wrapped;
    } catch (error) {
      console.error(`\n❌ Error: ${modulePath} - ${error.message}`);
      process.exit(1);
    }
  }

  bundledCode += `\n})();\n`;

  try {
    fs.writeFileSync(OUTPUT_FILE, bundledCode, 'utf8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`\n✅ Bundle complete!`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`\n❌ Write failed:`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  bundle();
}

module.exports = bundle;
