# LuminaCV

Browser-based resume builder. No backend, no accounts.

Edit your resume with live preview. Export to PDF, LaTeX, JSON, or Markdown. Share via URL—data is encoded in the link itself, no server storage.

## Features

- ✅ **Real-time preview** as you type
- ✅ **Export formats** — PDF, JSON, Markdown
- ✅ **URL sharing** with embedded data (no server needed)
- ✅ **Markdown import** — Paste markdown, auto-parse to CV
- ✅ **Text formatting** — Bold, italic, underline, links
- ✅ **localStorage persistence** — Auto-save on changes
- ✅ **Modular architecture** — Clean, maintainable code

## Quick Start

```bash
git clone https://github.com/chiraag-kakar/luminacv.git
cd luminacv
npm install
npm run serve
```

Open `http://localhost:3000/editor.html`

## Development

```bash
npm run build          # Bundle modules to app.js
npm test               # Run tests
npm run record-demo    # Create demo GIF
```

## Architecture

Modular JavaScript with no external dependencies:

```
js/
├── core/       # State, modal, utils, icons
├── data/       # Templates, defaults
└── features/   # Export, import, share, formatter
```

See [DOCUMENTATION.md](DOCUMENTATION.md) for complete architecture.

## Export Formats

| Format | Use Case |
|--------|----------|
| **PDF** | Print-ready via browser print |
| **JSON** | Data backup and portability |
| **Markdown** | Version control friendly |

## Sharing

Click "Share" to generate a URL:
```
https://example.com/editor.html?cv=<encoded-data>
```

Recipients see read-only preview. No database—data lives in the URL.

## Development Journey

See the project evolution in git history:

```bash
git log --oneline
```

Each commit represents a complete feature phase, showing how the product was built incrementally.

## License

MIT
