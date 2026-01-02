# LuminaCV - Technical Documentation

## Architecture Overview

LuminaCV is a modular, browser-based resume builder with zero backend requirements.

```
┌─────────────────────────────────────────────────┐
│              Browser (editor.html)               │
├─────────────────────────────────────────────────┤
│  Editor Panel      │      Preview Panel          │
│  (React input)     │    (Live CV rendering)      │
├─────────────────────────────────────────────────┤
│            Modular JavaScript (/js/)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   core/  │  │  data/   │  │ features/│       │
│  │ utils    │  │templates │  │ export   │       │
│  │ state    │  │ defaults │  │ import   │       │
│  │ modal    │  │          │  │ share    │       │
│  │ icons    │  │          │  │formatter │       │
│  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────┤
│           localStorage (persistent)              │
└─────────────────────────────────────────────────┘
```

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

## Next Steps

- [ ] UI sections for editing (Personal Info, Experience, etc.)
- [ ] Live template switching
- [ ] Settings panel (color, font, template)
- [ ] Mobile responsive editor
- [ ] Automated testing (Playwright)
- [ ] CI/CD integration
