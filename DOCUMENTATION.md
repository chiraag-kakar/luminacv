# LuminaCV - Technical Documentation

## Architecture Overview

LuminaCV uses a **modular-first architecture** with a production bundler.

### Development vs Production

#### **Development Mode** (Modular /js/)
```
/js/
├── core/          # Foundation utilities
│   ├── utils.js   # Helper functions
│   ├── state.js   # State management
│   ├── modal.js   # Modal system
│   └── icons.js   # SVG icons
├── data/          # Data structures
│   ├── defaults.js # Default CV structure
│   ├── templates.js # CV templates
│   └── sample.js   # Sample data
└── features/      # Features
    ├── export.js  # Export (PDF, JSON, MD)
    ├── import.js  # Import functionality
    ├── share.js   # URL sharing
    └── formatter.js # Text formatting
```

**How it works:**
1. Each module is a separate `.js` file
2. Browser loads them individually via `<script>` tags
3. Must be loaded in correct dependency order
4. Good for development (easy debugging, hot reload)

#### **Production Mode** (Bundled app.js)
```bash
node bundle.js  # or npm run build
```

**What happens:**
1. `bundle.js` reads all files from `/js/` folder
2. Combines them in correct dependency order
3. Wraps everything in IIFE: `(function() { ...modules... })()`
4. Outputs single `app.js` (107KB)
5. Browser loads ONE file instead of 15+

**Result:**
```javascript
// app.js (generated)
(function() {
  'use strict';
  
  // Module: core/utils.js
  function escHtml(text) { ... }
  
  // Module: data/defaults.js  
  const defaultData = { ... }
  
  // Module: core/state.js
  let cvData = loadFromStorage() || defaultData;
  
  // ... all other modules ...
  
  // Module: main.js
  render();
})();
```

### Why Bundle?

**Without bundling (15 separate files):**
- ❌ 15 HTTP requests
- ❌ Script load order errors
- ❌ Dependency management issues
- ❌ Slower initial load
- ✅ Easy to debug individual files

**With bundling (1 file):**
- ✅ 1 HTTP request
- ✅ No load order issues
- ✅ Guaranteed dependency resolution
- ✅ Faster load time
- ✅ Production-ready
- ❌ Harder to debug (use source maps if needed)

### Key Difference: Modular vs Bundled

| Aspect | Modular (/js/) | Bundled (app.js) |
|--------|----------------|------------------|
| **Files** | 15+ separate files | 1 combined file |
| **Loading** | `<script src="js/core/utils.js">` × 15 | `<script src="app.js">` × 1 |
| **Development** | Easy (edit any file) | Rebuild after changes |
| **Production** | 15 HTTP requests | 1 HTTP request |
| **Debugging** | Each file separate | All in one file |
| **Build step** | None | `node bundle.js` |

### Current Setup

**You are using BUNDLED mode** (production-ready):
- ✅ `editor.html` loads single `app.js` (107KB)
- ✅ No script loading order issues
- ✅ Fast page load (1 request)
- ✅ Auto-validates localStorage
- ✅ Works offline after first load

### Data Flow

```
┌─────────────────────────────────────────────────┐
│              Browser (editor.html)               │
├─────────────────────────────────────────────────┤
│  Editor Panel      │      Preview Panel          │
│  (Form inputs)     │    (Live CV rendering)      │
├─────────────────────────────────────────────────┤
│               app.js (bundled 107KB)             │
│                                                   │
│  cvData.personalInfo ────────────► render()      │
│     ↕                                  ↓         │
│  localStorage          ←─────── innerHTML        │
└─────────────────────────────────────────────────┘
```

### localStorage Structure

**Current (Bundled):**
```javascript
{
  personalInfo: { fullName: "Alex", ... },
  experience: [...],
  education: [...],
  skills: { ... },
  projects: [...]
}
```

**Old (Modular - incompatible):**
```javascript
{
  data: {
    cv: {
      personalInfo: { ... },
      experience: [...]
    },
    settings: { ... }
  }
}
```

⚠️ **Important:** If you switch between modular and bundled, localStorage must be cleared!



## Data Model

```javascript
{
  personalInfo: {
    fullName: string,
    email: string,
    phone: string,
    linkedin: string,
    github: string
  },
  experience: [{
    id: string,
    jobTitle: string,
    company: string,
    location: string,
    startDate: string,
    endDate: string,
    bullets: string[],
    techStack: string
  }],
  education: [{
    id: string,
    degree: string,
    school: string,
    location: string,
    startDate: string,
    endDate: string,
    gpa: string
  }],
  skills: {
    languages: string,
    frameworks: string,
    tools: string
  },
  projects: [{
    id: string,
    name: string,
    tech: string,
    link: string,
    liveLink: string,
    description: string,
    bullets: string[]
  }]
}
```

## Module Responsibilities

### Core Modules (`js/core/`)

**utils.js**
- `genId()` - Generate unique IDs
- `escHtml()` - Escape HTML entities
- `getCurrentDate()` - Get current date in YYYY-MM-DD format
- `debounce()` - Debounce function calls
- `formatTextHTML()` - Convert markdown-like formatting to HTML

**state.js**
- `StateManager` class - Manage CV data and settings
- `loadFromStorage()` - Load from localStorage
- `saveToStorage()` - Persist to localStorage
- Auto-save on data changes (100ms debounce)

**modal.js**
- `Modal` class - Promise-based dialog system
- `Modal.open()` - Show dialog with content and buttons
- `Modal.confirm()` - Yes/No confirmation
- `Modal.alert()` - Info message
- `Modal.prompt()` - User text input

**icons.js**
- SVG icon definitions
- `getIcon()` - Retrieve icon by name

### Data Modules (`js/data/`)

**templates.js**
- 4 templates: Modern, Classic, Minimal, SWE
- Each has name, color scheme, description

**defaults.js**
- Default empty CV structure
- Default settings (Modern template, blue color, Lato font)

### Feature Modules (`js/features/`)

**export.js**
- `exportJSON()` - Export as JSON file
- `exportMarkdown()` - Export as Markdown
- `exportPDF()` - Print-to-PDF
- `_downloadFile()` - Helper for file downloads

**import.js**
- `importFromMarkdown()` - Parse Markdown file
- `_parseMarkdown()` - Simple markdown parser

**share.js**
- `generateShareURL()` - Create shareable URL with encoded data
- `parseShareURL()` - Decode CV data from URL

**formatter.js**
- `showFormattingToolbar()` - Display formatting UI
- `_applyFormatting()` - Apply bold, italic, underline, links

## Build System

### Bundle Process

```
js/core/ → js/data/ → js/features/ → bundled app.js
```

**Command:** `npm run build`

1. Reads modules in dependency order
2. Wraps in IIFE for scope safety
3. Outputs single `app.js` file
4. No transpilation needed (pure ES6)

## Export Formats

| Format | Use Case | Implementation |
|--------|----------|-----------------|
| **PDF** | Print-ready resume | Browser print dialog |
| **JSON** | Data backup, portable | Blob download |
| **Markdown** | Version control friendly | Text file download |

## Sharing Mechanism

1. User clicks "Share"
2. CV data is JSON.stringify() + JSON.encodeURIComponent() + btoa()
3. Encoded string appended to URL: `?cv=<encoded>`
4. Recipient opens link
5. App detects `?cv=` parameter, decodes, shows read-only view
6. No server needed - data lives in URL

## localStorage Persistence

Auto-saves on any change:
- Key: `luminacv_data`
- Value: JSON stringify of { cv, settings }
- 100ms debounce to avoid excessive writes
- Survives page reload and browser restart

## User Journeys

### Journey 1: Create & Export
1. Open editor.html
2. Load sample data (or create new)
3. Edit resume sections
4. Live preview updates
5. Click Export → Choose format (PDF/JSON/MD)
6. File downloads

### Journey 2: Share Resume
1. Finish resume
2. Click Share
3. URL copied to clipboard
4. Share link with recruiter/mentor
5. They open link → see read-only preview
6. Click "Edit Your Own" → load in editor

### Journey 3: Import Markdown
1. Have existing resume.md
2. Click Import
3. Select file
4. Parser extracts sections
5. Data populates editor
6. Review and adjust

---

## For Product Developers & Reviewers

### Understanding the Build Process

**Step-by-Step: How Modular Code Becomes Production app.js**

```
STEP 1: Write modular code
────────────────────────────────────────────
/js/core/utils.js:
  function escHtml(text) { ... }

/js/data/defaults.js:
  const defaultData = { ... }

/js/core/state.js:
  let cvData = loadFromStorage() || defaultData;

/js/features/export.js:
  function exportJSON() { ... }

/js/main.js:
  render();


STEP 2: Run bundler
────────────────────────────────────────────
$ node bundle.js

🔨 Bundling modular architecture...
  ✓ Including: core/utils.js
  ✓ Including: data/defaults.js
  ✓ Including: core/state.js
  ✓ Including: features/export.js
  ✓ Including: main.js
✅ Bundle complete! Size: 107 KB


STEP 3: Output app.js (unified)
────────────────────────────────────────────
app.js (107KB):

(function() {
  'use strict';
  
  // ============================================
  // Module: core/utils.js
  // ============================================
  function escHtml(text) {
    return text.replace(/[&<>"']/g, ...);
  }
  
  // ============================================
  // Module: data/defaults.js
  // ============================================
  const defaultData = {
    personalInfo: { ... },
    experience: [],
    ...
  };
  
  // ============================================
  // Module: core/state.js
  // ============================================
  let cvData = loadFromStorage() || JSON.parse(JSON.stringify(defaultData));
  let settings = loadSettingsFromStorage() || defaultSettings;
  
  // ============================================
  // Module: features/export.js
  // ============================================
  function exportJSON() {
    const json = JSON.stringify(cvData, null, 2);
    downloadFile(json, 'resume.json', 'application/json');
  }
  
  // ============================================
  // Module: main.js
  // ============================================
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = renderEditor() + renderPreview();
  }
  
  // Initialize
  render();
})();


STEP 4: Browser loads
────────────────────────────────────────────
editor.html:
  <div id="app"></div>
  <script src="app.js"></script>

Browser:
  1. Loads editor.html (empty <div>)
  2. Loads app.js (107KB, ONE HTTP request)
  3. app.js executes:
     - Defines all functions
     - Loads data from localStorage
     - Calls render()
     - Builds entire UI dynamically
  4. User sees complete resume editor!
```

### Why This Approach?

**Development Benefits:**
```javascript
// Easy to find and edit specific features
vim js/features/export.js  // Just export code
vim js/core/state.js       // Just state management
vim js/data/defaults.js    // Just default data
```

**Production Benefits:**
```html
<!-- Single HTTP request -->
<script src="app.js"></script>

<!-- vs 15+ requests without bundling -->
<script src="js/core/utils.js"></script>
<script src="js/data/defaults.js"></script>
<script src="js/core/state.js"></script>
... 12 more files ...
```

### Common Issues & Solutions

#### Issue 1: "Cannot read properties of undefined"

**Cause:** Old localStorage data structure doesn't match new code

**Solution:** Auto-validation added to `app.js` (line 2613):
```javascript
// Validate data structure
if (cvData && (!cvData.personalInfo || !cvData.experience)) {
  console.warn('Invalid data structure, resetting...');
  localStorage.clear();
  cvData = JSON.parse(JSON.stringify(defaultData));
}
```

#### Issue 2: Script loading order errors (modular mode)

**Cause:** `state.js` loaded before `defaults.js`

**Wrong:**
```html
<script src="js/core/state.js"></script>     <!-- ❌ needs defaults -->
<script src="js/data/defaults.js"></script>
```

**Correct:**
```html
<script src="js/data/defaults.js"></script>  <!-- ✅ loaded first -->
<script src="js/core/state.js"></script>
```

**Solution:** Use bundled mode (production) to avoid this entirely

#### Issue 3: CSS @import warnings

**Cause:** CSS @import must be at the very top of file

**Wrong:**
```css
:root { --color: blue; }
@import 'components/modal.css';  /* ❌ Must be first */
```

**Correct:**
```css
@import 'components/modal.css';  /* ✅ First line */
:root { --color: blue; }
```

### Testing Your Changes

```bash
# 1. Edit modular code
vim js/features/export.js

# 2. Bundle
node bundle.js

# 3. Test locally
npm run serve
open http://localhost:3000/editor.html

# 4. Run tests
npm test              # Unit tests
npx playwright test   # E2E tests

# 5. Commit
git add app.js js/features/export.js
git commit -m "feat: improved export functionality"
```

### Deployment Checklist

- [ ] Run `node bundle.js` to generate production `app.js`
- [ ] Test in browser: http://localhost:3000/editor.html
- [ ] Run E2E tests: `npx playwright test`
- [ ] Verify localStorage auto-validation works
- [ ] Check browser console for errors
- [ ] Test on mobile/tablet
- [ ] Commit both `/js/` changes AND `app.js`

---

- [ ] Live template switching
- [ ] Settings panel (color, font, template)
- [ ] Mobile responsive editor
- [ ] Automated testing (Playwright)
- [ ] CI/CD integration
