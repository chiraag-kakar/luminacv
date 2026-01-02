# LuminaCV - Developer Documentation

## For Product Managers

### Product Overview
LuminaCV is a privacy-first resume builder with zero backend infrastructure costs. Users create professional resumes entirely in-browser with real-time preview and multiple export formats.

**Key Metrics:**
- 107KB bundle size (single HTTP request)
- 100ms auto-save debounce
- 4 professional templates
- 50+ E2E test scenarios
- WCAG 2.1 Level AA compliant

**Competitive Advantages:**
- **Privacy:** No user data collection, no accounts, no tracking
- **Cost:** Zero hosting costs (client-side only, GitHub Pages)
- **Speed:** Instant load, real-time preview
- **Portability:** Export to PDF/JSON/Markdown, share via URL

**User Workflows:**
1. **New User:** Landing page → Start building → Live edit → Export PDF
2. **Returning User:** Auto-loaded from localStorage → Continue editing
3. **Sharing:** Generate URL with embedded resume data → Share link → Recipient views read-only

**Feature Roadmap Considerations:**
- LaTeX template support for academic CVs
- Multi-language support (i18n)
- Additional export formats (DOCX, HTML)
- Template marketplace

---

## For Engineering Managers

### Technical Architecture

**Stack:**
- **Frontend:** Vanilla JavaScript (ES6+), no frameworks
- **Build:** Custom Node.js bundler (`bundle.js`)
- **Testing:** Playwright (E2E), custom test framework (unit)
- **CI/CD:** GitHub Actions (4 workflows)
- **Hosting:** GitHub Pages (static)

**Architecture Decision Records:**

**Why Vanilla JS?**
- Zero framework dependencies = smaller bundle
- No build complexity (webpack/vite)
- Easier for contributors (no React/Vue learning curve)
- Faster load times

**Why Custom Bundler?**
- Simple: 100 lines vs webpack config hell
- Specific to our needs: combine 15 modules → 1 file
- No external dependencies (just Node.js fs)

**Why Client-Side Only?**
- Zero hosting costs
- No server maintenance
- User data privacy guaranteed
- Scales infinitely (CDN)

### Code Structure

```
luminacv/
├── app.js              # Production bundle (107KB)
├── bundle.js           # Build script (combines /js/)
├── editor.html         # Main application entry
├── index.html          # Landing page
├── js/                 # Modular source (15+ files)
│   ├── core/           # Utils, state, modal, icons
│   ├── data/           # Defaults, templates, samples
│   └── features/       # Export, import, share, format
├── styles/             # CSS structure
│   ├── base/           # Reset, typography
│   ├── components/     # Buttons, forms, cards
│   ├── layout/         # Grid, sections
│   └── utilities/      # Helpers, spacing
├── tests/              # Unit tests
├── e2e/                # Playwright E2E tests
└── scripts/            # Build scripts
```

### Development Workflow

**Local Development:**
```bash
npm install           # Install dependencies
npm run serve         # Start server (port 3000)
npm run build         # Bundle /js/ → app.js
npm test              # Run unit tests
npx playwright test   # Run E2E tests
```

**Production Build:**
```bash
node bundle.js        # Creates app.js from /js/*
# app.js is committed and deployed to GitHub Pages
```

**CI/CD Pipeline (Manual Trigger):**
- `tests.yml` — Unit tests, linting, coverage
- `e2e.yml` — Playwright tests (Chrome/Firefox/Safari)
- `quality.yml` — Bundle analysis, accessibility checks
- `deploy.yml` — GitHub Pages deployment

### Performance

**Bundle Size:** 107KB (unminified, no gzip)
- Could reduce to ~30KB with minification + gzip
- Trade-off: readability in production for debugging

**Load Performance:**
- 1 HTTP request for JS (vs 15+ in modular mode)
- No framework overhead
- Instant DOM rendering (vanilla JS)

**Testing Coverage:**
- 50+ E2E scenarios (Playwright)
- Multi-browser (Chrome, Firefox, Safari)
- Accessibility audits (WCAG 2.1 AA)

### Team Onboarding

**New Developer Setup (5 minutes):**
1. Clone repo
2. `npm install`
3. `npm run serve`
4. Edit files in `/js/`, run `npm run build`, refresh browser

**Code Review Checklist:**
- [ ] Tests added for new features
- [ ] `npm run build` executed (app.js updated)
- [ ] E2E tests pass (`npx playwright test`)
- [ ] Accessibility verified (keyboard nav, ARIA labels)
- [ ] No console errors in browser

---

## For Recruiters & Hiring Managers

### Technical Skills Demonstrated

**Frontend Development:**
- Modern JavaScript (ES6+): modules, arrow functions, destructuring, promises
- DOM manipulation: event handling, dynamic rendering
- CSS3: Flexbox, Grid, animations, responsive design
- HTML5: semantic markup, accessibility (ARIA)

**Software Engineering:**
- Modular architecture: separation of concerns
- State management: centralized state with localStorage persistence
- Build tooling: custom Node.js bundler
- Testing: unit tests + E2E with Playwright

**Quality Assurance:**
- WCAG 2.1 Level AA accessibility compliance
- 50+ automated E2E test scenarios
- Multi-browser testing (Chrome, Firefox, Safari)
- CI/CD pipeline with GitHub Actions

**DevOps:**
- GitHub Actions workflows (test, build, deploy)
- Static site deployment (GitHub Pages)
- Zero-infrastructure architecture (cost optimization)

**Product Thinking:**
- Privacy-first design (no backend, no tracking)
- User experience: real-time preview, auto-save, keyboard shortcuts
- Export flexibility: PDF, JSON, Markdown
- Sharing via URL-encoded data (no database needed)

**Code Quality Indicators:**
- Well-documented codebase
- Clean separation: core/data/features
- Comprehensive test coverage
- Production-ready deployment

---

## Development Guide

### Getting Started

**Setup:**
```bash
git clone https://github.com/chiraag-kakar/luminacv.git
cd luminacv
npm install
npm run serve
# Visit http://localhost:3000
```

**Project Structure:**
- `/js/` — Modular source code (edit these files)
- `app.js` — Generated bundle (don't edit directly)
- `bundle.js` — Build script (run after editing /js/)
- `/e2e/` — Playwright tests
- `/tests/` — Unit tests

### Development Workflow

**Making Changes:**
1. Edit modular files in `/js/` directory
2. Run `npm run build` to regenerate `app.js`
3. Test locally with `npm run serve`
4. Run tests: `npm test` and `npx playwright test`
5. Commit both `/js/` changes and updated `app.js`

**Adding Features:**
1. Create new module in `/js/features/`
2. Import in dependent modules
3. Add tests in `/tests/` and `/e2e/`
4. Update `bundle.js` dependency order if needed
5. Run `npm run build`

**Testing:**
```bash
npm test              # Unit tests (quick)
npx playwright test   # E2E tests (comprehensive)
npx playwright test --ui  # Interactive test UI
```

### Architecture Deep Dive

**State Management:**
```javascript
// Centralized state in core/state.js
let cvData = {
  personalInfo: { fullName, email, phone, location, summary },
  experience: [ { title, company, location, dates, description } ],
  education: [ { degree, institution, location, dates } ],
  skills: [ { category, items } ],
  projects: [ { name, description, technologies, link } ]
};

// Auto-save to localStorage on changes
function saveToStorage() {
  localStorage.setItem('cvData', JSON.stringify(cvData));
}
```

**Bundling Process:**
```javascript
// bundle.js reads files in dependency order:
const files = [
  'js/core/utils.js',      // Utilities first
  'js/core/icons.js',      // Then icons
  'js/data/defaults.js',   // Data structures
  'js/core/state.js',      // State depends on defaults
  'js/core/modal.js',      // UI components
  'js/features/export.js', // Features depend on state
  // ... etc
];

// Wraps in IIFE and outputs app.js
(function() {
  'use strict';
  // ...all module code...
})();
```

**Export System:**
```javascript
// features/export.js
function exportToPDF() {
  window.print(); // Uses browser print dialog
}

function exportToJSON() {
  const json = JSON.stringify(cvData, null, 2);
  downloadFile(json, 'resume.json', 'application/json');
}

function exportToMarkdown() {
  const md = convertToMarkdown(cvData);
  downloadFile(md, 'resume.md', 'text/markdown');
}
```

**URL Sharing:**
```javascript
// features/share.js
function generateShareURL() {
  const encoded = btoa(JSON.stringify(cvData));
  return `${window.location.origin}/editor.html?cv=${encoded}`;
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('cv');
  if (encoded) {
    cvData = JSON.parse(atob(encoded));
  }
}
```

### Accessibility Guidelines

**WCAG 2.1 Level AA Compliance:**
- All interactive elements have ARIA labels
- Keyboard navigation: Tab, Enter, Escape
- Focus indicators visible
- Color contrast ≥ 4.5:1
- Semantic HTML (nav, section, article, header)

**Keyboard Shortcuts:**
- Ctrl/Cmd+E: Export PDF
- Ctrl/Cmd+S: Save
- Escape: Close modal
- Tab: Navigate forms
- Enter: Submit/activate

**Testing Accessibility:**
```bash
npx playwright test --grep accessibility
# Tests keyboard nav, ARIA labels, focus management
```

### Code Style Guidelines

**Standards:**
- Use ES6+ features (const/let, arrow functions)
- Comment complex logic
- Follow existing naming conventions
- Keep functions small and focused

### CI/CD Details

**GitHub Actions Workflows (Manual Trigger):**

All workflows use `workflow_dispatch` (manual trigger from Actions tab):

1. **tests.yml** — Unit tests, linting, coverage
2. **e2e.yml** — Playwright E2E tests (multi-browser)
3. **quality.yml** — Bundle analysis, accessibility checks
4. **deploy.yml** — Deploy to GitHub Pages

**Why Manual?**
- Prevents CI from running on every commit
- Contributor controls when to run tests
- Faster development iteration

**Triggering CI:**
1. Go to GitHub Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch and run

---

## Troubleshooting

**Issue:** Changes to `/js/` not reflecting in browser
- **Solution:** Run `npm run build` to regenerate `app.js`

**Issue:** Script loading order errors
- **Solution:** Use bundled `app.js`, not modular `/js/` files directly

**Issue:** localStorage data corrupted
- **Solution:** Visit `/clear-storage.html` to reset

**Issue:** Tests failing locally
- **Solution:** Ensure server running on port 3000: `npm run serve`

**Issue:** Playwright browser not installed
- **Solution:** Run `npx playwright install`

---

## Data Structures

### CV Data Model
```javascript
{
  personalInfo: {
    fullName: string,
    email: string,
    phone: string,
    location: string,
    summary: string
  },
  experience: [
    {
      title: string,
      company: string,
      location: string,
      dates: string,
      description: string
    }
  ],
  education: [
    {
      degree: string,
      institution: string,
      location: string,
      dates: string,
      gpa: string (optional)
    }
  ],
  skills: [
    {
      category: string,
      items: string[] // Array of skill names
    }
  ],
  projects: [
    {
      name: string,
      description: string,
      technologies: string,
      link: string (optional)
    }
  ]
}
```

### Storage
- **Key:** `cvData`
- **Format:** JSON string
- **Location:** Browser localStorage
- **Auto-save:** 100ms debounced on every change


