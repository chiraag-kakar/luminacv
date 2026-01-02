# LuminaCV – Developer Documentation

## Product Overview

LuminaCV is a privacy-first resume builder with zero backend infrastructure costs. Users create professional resumes entirely in-browser with real-time preview and multiple export formats.

**Key Metrics:**

* 107KB bundle size (single HTTP request)
* 100ms auto-save debounce
* 4 professional templates
* 50+ E2E test scenarios
* WCAG 2.1 Level AA compliant

**Competitive Advantages:**

* **Privacy:** No user data collection, no accounts, no tracking
* **Cost:** Zero hosting costs (client-side only, GitHub Pages)
* **Speed:** Instant load, real-time preview
* **Portability:** Export to PDF/JSON/Markdown, share via URL

**User Workflows:**

1. Landing page → Start building → Live edit → Export
2. Auto-load from localStorage → Continue editing
3. Generate shareable URL with embedded resume data → View read-only

**Feature Roadmap Considerations:**

* LaTeX template support for academic CVs
* Multi-language support (i18n)
* Additional export formats (DOCX, HTML)
* Template marketplace

---

## Technical Architecture

**Stack:**

* **Frontend:** Vanilla JavaScript (ES6+), no frameworks
* **Build:** Custom Node.js bundler (`bundle.js`)
* **Testing:** Playwright (E2E), custom unit test framework
* **CI/CD:** GitHub Actions
* **Hosting:** GitHub Pages (static)

**Architecture Decisions:**

**Vanilla JavaScript**

* No framework dependencies
* Minimal bundle size
* Simple contributor onboarding
* Fast load and render times

**Custom Bundler**

* Purpose-built (~100 lines)
* No external dependencies
* Deterministic module order

**Client-Side Only**

* No servers or databases
* Zero operational cost
* Strong privacy guarantees
* CDN-scalable by default

---

## Code Structure

```
luminacv/
├── app.js              # Production bundle
├── bundle.js           # Build script
├── editor.html         # Main application entry
├── index.html          # Landing page
├── js/
│   ├── core/
│   ├── data/
│   └── features/
├── styles/
│   ├── base/
│   ├── components/
│   ├── layout/
│   └── utilities/
├── tests/
├── e2e/
└── scripts/
```

---

## Development Guide

### Setup

```bash
git clone https://github.com/chiraag-kakar/luminacv.git
cd luminacv
npm install
npm run serve
# http://localhost:3000
```

### Workflow

1. Edit source files in `/js/`
2. Run `npm run build` to regenerate `app.js`
3. Test locally with `npm run serve`
4. Run tests:

```bash
npm test
npx playwright test
```

5. Commit both source changes and updated `app.js`

---

## State Management

```javascript
let cvData = {
  personalInfo: { fullName, email, phone, location, summary },
  experience: [],
  education: [],
  skills: [],
  projects: []
};

function saveToStorage() {
  localStorage.setItem('cvData', JSON.stringify(cvData));
}
```

* Centralized in `core/state.js`
* Auto-saved with 100ms debounce
* Persisted in `localStorage`

---

## Bundling Process

```javascript
const files = [
  'js/core/utils.js',
  'js/core/icons.js',
  'js/data/defaults.js',
  'js/core/state.js',
  'js/core/modal.js',
  'js/features/export.js'
];

(function () {
  'use strict';
  // concatenated modules
})();
```

* Single bundled output: `app.js`
* No runtime module loader

---

## Export System

```javascript
function exportToPDF() {
  window.print();
}

function exportToJSON() {
  downloadFile(JSON.stringify(cvData, null, 2), 'resume.json');
}

function exportToMarkdown() {
  downloadFile(convertToMarkdown(cvData), 'resume.md');
}
```

Supported formats:

* PDF (browser print)
* JSON
* Markdown

---

## URL Sharing

```javascript
function generateShareURL() {
  return `${location.origin}/editor.html?cv=${btoa(JSON.stringify(cvData))}`;
}
```

* Resume data embedded in URL
* No server-side storage
* Read-only view for recipients

---

## Accessibility

* WCAG 2.1 Level AA compliant
* Semantic HTML
* Full keyboard navigation
* Visible focus indicators
* ARIA labels on interactive elements

**Keyboard Shortcuts:**

* Ctrl/Cmd + E: Export
* Ctrl/Cmd + S: Save
* Escape: Close modal

---

## Testing

```bash
npm test
npx playwright test
npx playwright test --grep accessibility
```

* Unit tests for core logic
* E2E tests across Chromium, Firefox, WebKit
* Accessibility audits included

---

## Troubleshooting

**Changes not visible**

* Run `npm run build`

**Script order errors**

* Ensure `app.js` is loaded, not individual modules

**Corrupted localStorage**

* Visit `/clear-storage.html`

**Playwright missing browsers**

* Run `npx playwright install`

---

## Data Model

```javascript
{
  personalInfo: { fullName, email, phone, location, summary },
  experience: [ { title, company, location, dates, description } ],
  education: [ { degree, institution, location, dates, gpa? } ],
  skills: [ { category, items: string[] } ],
  projects: [ { name, description, technologies, link? } ]
}
```

**Storage:**

* **Key:** `cvData`
* **Format:** JSON string
* **Location:** Browser `localStorage`
* **Auto-save:** 100ms debounced on every change
