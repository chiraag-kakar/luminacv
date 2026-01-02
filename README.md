# LuminaCV

> **Create professional resumes in minutes. Zero friction, zero tracking.**

Privacy-first resume builder running entirely in your browser. No sign-ups, no servers, no data collection. Edit with live preview, export to multiple formats, share via URL with embedded data.

**Live Demo**: https://chiraag-kakar.github.io/luminacv

![LuminaCV Demo](./public/demo.gif)

## Features

- 🔒 **Complete Privacy** — Your data never leaves your browser
- ⚡ **Real-time Preview** — See changes instantly as you type
- 🎨 **Professional Templates** — 4 industry-standard designs
- 📤 **Multiple Exports** — PDF, JSON, Markdown in one click
- 🔗 **Zero-Server Sharing** — Share via URL, no account required
- ⌨️ **Keyboard Shortcuts** — 10+ shortcuts for power users
- ♿ **Fully Accessible** — WCAG 2.1 Level AA compliant
- 📱 **Mobile Responsive** — Works on all devices
- ⚙️ **100% Client-Side** — No backend infrastructure needed
- 🧪 **Well-Tested** — 50+ E2E scenarios across browsers

## Quick Start

```bash
git clone https://github.com/chiraag-kakar/luminacv.git
cd luminacv
npm install
npm run serve
# Open http://localhost:3000
```

## Key Features

**Resume Building:**
- Real-time live preview
- 5 sections: Personal, Experience, Education, Skills, Projects
- Rich text formatting (bold, italic, underline, links)
- Auto-save to localStorage (100ms debounce)

**Import/Export:**
- Export: PDF (print), JSON (backup), Markdown (version control)
- Import: Paste markdown → auto-parsed resume
- Share: Generate URL with embedded data (no server needed)

**Customization:**
- 4 Templates: Modern, Classic, Minimal, SWE
- Color themes, fonts, backgrounds
- Statistics dashboard (word count, section analysis)

**Developer Experience:**
- 10+ keyboard shortcuts for power users
- Modular architecture with production bundler
- Comprehensive E2E and unit tests
- Automated CI/CD pipeline

## Technical Overview

**Architecture:**
- Vanilla JavaScript (ES6+) with no framework dependencies
- Custom bundler produces single 107KB artifact from 15+ modular sources
- Client-side only architecture—zero server infrastructure required
- Modular development with `/js/` source compiled via `node bundle.js`

**Quality & Testing:**
- 50+ Playwright E2E test scenarios across Chrome, Firefox, Safari
- WCAG 2.1 Level AA accessibility compliance
- GitHub Actions CI/CD for automated testing and deployment
- Comprehensive keyboard navigation and screen reader support

**Development workflow:**
1. Edit modular files in `/js/` directory
2. Run `npm run build` to bundle
3. Test with `npm run serve`

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed architecture and development setup.

## Quality Assurance

| Metric | Status |
|--------|--------|
| **Accessibility** | WCAG 2.1 Level AA ✅ |
| **E2E Tests** | 50+ scenarios (Playwright) ✅ |
| **Browser Support** | Chrome, Firefox, Safari ✅ |
| **Mobile Responsive** | Full support ✅ |
| **CI/CD** | GitHub Actions automated ✅ |
| **Keyboard Navigation** | Full support + shortcuts ✅ |

## Technology Stack

**Core:** Vanilla JavaScript (ES6+), HTML5, CSS3  
**Testing:** Playwright (E2E), Custom test framework  
**Build:** Custom Node.js bundler  
**CI/CD:** GitHub Actions (test, build, deploy)  
**Hosting:** GitHub Pages (zero-cost)

## Project Status

✅ **Production Ready**  
🔄 **Active Maintenance**  
📅 **Last Updated:** January 2026  
🌐 **Deployment:** https://chiraag-kakar.github.io/luminacv
