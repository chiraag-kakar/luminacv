# LuminaCV

> **Create professional resumes in minutes. Zero friction, zero tracking.**

Privacy-first resume builder running entirely in your browser. No sign-ups, no servers, no data collection. Edit with live preview, export to multiple formats, share via URL with embedded data.

**Live Demo**: https://chiraag-kakar.github.io/luminacv

![LuminaCV Demo](./public/demo.gif)

## Why LuminaCV?

**For Job Seekers & Professionals:**
- 🔒 **Complete Privacy** — Your data never leaves your browser
- ⚡ **Real-time Preview** — See changes instantly as you type
- 🎨 **Professional Templates** — 4 industry-standard designs
- 📤 **Multiple Export Formats** — PDF, JSON, Markdown in one click
- 🔗 **Zero-Server Sharing** — Share via URL, no account required

**For Engineering Managers & Technical Recruiters:**
- Built with modern vanilla JavaScript (no framework bloat)
- WCAG 2.1 Level AA accessibility compliant
- 50+ Playwright E2E tests across Chrome/Firefox/Safari
- GitHub Actions CI/CD with automated deployment
- 107KB single-bundle architecture for optimal performance
- 100% client-side — zero backend infrastructure costs

**For Open Source Contributors:**
- Clean, modular codebase (`/js/` folder structure)
- Comprehensive test coverage with Playwright
- Well-documented architecture (see [DOCUMENTATION.md](DOCUMENTATION.md))
- MIT licensed — fork freely
- Active maintenance and feature roadmap

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

## Architecture Highlights

**Production:** Single bundled `app.js` (107KB)
```
/js/ (15+ modules) → node bundle.js → app.js (1 file, 1 HTTP request)
```

**Why it matters:**
- ✅ Faster page loads (1 request vs 15+)
- ✅ No script loading order issues
- ✅ Production-ready out of the box

**Development workflow:**
1. Edit modular files in `/js/` directory
2. Run `npm run build` to bundle
3. Test with `npm run serve`

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed architecture, development setup, and contribution guidelines.

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

## Contributing

We welcome contributions! See [DOCUMENTATION.md](DOCUMENTATION.md) for:
- Development environment setup
- Code architecture and patterns
- Testing guidelines
- Pull request process

**Good first issues:** Check GitHub issues labeled `good-first-issue`

## Project Status

✅ **Production Ready**  
🔄 **Active Maintenance**  
📅 **Last Updated:** January 2026  
🌐 **Deployment:** https://chiraag-kakar.github.io/luminacv

## License

MIT — Use freely for personal or commercial projects.
