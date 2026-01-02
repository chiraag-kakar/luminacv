#!/usr/bin/env node
/**
 * Build Script for LuminaCV
 * Minifies and bundles CSS/JS for production
 */

const fs = require('fs');
const path = require('path');

// Minify CSS
function minifyCSS(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around special chars
    .trim();
}

// Minify JS
function minifyJS(content) {
  return content
    .replace(/\/\/.*$/gm, '')           // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove multi-line comments
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .replace(/\s*([{}:;,()[\]=>])\s*/g, '$1') // Remove spaces around special chars
    .trim();
}

const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

console.log('📦 Building LuminaCV...\n');

// Bundle CSS
console.log('📝 Bundling CSS...');
const cssFiles = [
  'styles/main.css',
  'styles/components/modal.css',
  'styles/components/formatter.css',
  'styles/components/editor.css',
  'styles/layout/header.css',
  'styles/features/cv-document.css',
  'styles/features/settings.css'
];

let bundledCSS = '';
cssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  bundledCSS += `/* ${file} */\n${content}\n`;
});

const minCSS = minifyCSS(bundledCSS);
fs.writeFileSync('build/styles.min.css', minCSS);
console.log(`✅ CSS: ${bundledCSS.length} → ${minCSS.length} bytes (${Math.round(100 - (minCSS.length/bundledCSS.length)*100)}% smaller)`);

// Bundle JS
console.log('📝 Bundling JavaScript...');
const jsFiles = [
  'js/core/utils.js',
  'js/core/state.js',
  'js/core/modal.js',
  'js/core/icons.js',
  'js/data/templates.js',
  'js/data/defaults.js',
  'js/features/entries.js',
  'js/features/editor.js',
  'js/features/export.js',
  'js/features/import.js',
  'js/features/share.js',
  'js/features/formatter.js',
  'js/features/settings.js',
  'js/features/stats.js',
  'app.js'
];

let bundledJS = '';
jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  bundledJS += `\n/* ${file} */\n${content}`;
});

const minJS = minifyJS(bundledJS);
fs.writeFileSync('build/app.min.js', minJS);
console.log(`✅ JS: ${bundledJS.length} → ${minJS.length} bytes (${Math.round(100 - (minJS.length/bundledJS.length)*100)}% smaller)`);

// Copy HTML
console.log('📝 Copying HTML...');
const htmlContent = fs.readFileSync('editor.html', 'utf8');
const optimizedHTML = htmlContent
  .replace(/\n\s+/g, '\n') // Remove extra indentation
  .replace(/<!-- .*? -->/g, ''); // Remove comments
fs.writeFileSync('build/index.html', optimizedHTML);
console.log(`✅ HTML: ${htmlContent.length} → ${optimizedHTML.length} bytes`);

console.log('\n✨ Build complete! Output in ./build/');
console.log('\nFile Sizes:');
console.log(`  build/index.html ............ ${(fs.statSync('build/index.html').size / 1024).toFixed(2)} KB`);
console.log(`  build/styles.min.css ....... ${(fs.statSync('build/styles.min.css').size / 1024).toFixed(2)} KB`);
console.log(`  build/app.min.js ........... ${(fs.statSync('build/app.min.js').size / 1024).toFixed(2)} KB`);

const totalSize = fs.readdirSync('build').reduce((sum, file) => {
  return sum + fs.statSync(path.join('build', file)).size;
}, 0);

console.log(`\n📊 Total Build Size: ${(totalSize / 1024).toFixed(2)} KB`);
