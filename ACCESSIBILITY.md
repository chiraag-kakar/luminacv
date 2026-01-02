# Accessibility Guide for LuminaCV

## Overview
LuminaCV is built with accessibility (a11y) in mind, following WCAG 2.1 Level AA standards.

## Keyboard Navigation

### Global Shortcuts
- **Ctrl/Cmd + E**: Export resume as PDF
- **Ctrl/Cmd + S**: Save to localStorage
- **Shift + E**: Export as JSON
- **Shift + S**: Generate shareable URL
- **,**: Open settings
- **/**: Show help/shortcuts

### Dialog Navigation
- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **Enter**: Activate button or submit form
- **Escape**: Close dialog
- **Space**: Toggle checkboxes/buttons

### Form Navigation
- **Tab**: Navigate between form fields
- **Enter**: In textarea, use Ctrl/Cmd + Enter to confirm
- **Arrow Keys**: In select dropdowns (implemented with semantic HTML)

## Screen Reader Support

### ARIA Labels
All interactive elements include descriptive `aria-label` attributes:
- Buttons: `aria-label="Export resume as PDF"`
- Form fields: `aria-label="Enter your full name"`
- Icons: `aria-label="Close dialog"`

### Semantic HTML
- Form sections use `<fieldset>` and `<legend>` for grouping
- Buttons and links are semantic elements
- Proper heading hierarchy with `<h1>`, `<h2>`, `<h3>`

### Live Regions
- Status messages use `role="status"` with `aria-live="polite"`
- Errors use `role="alert"` with `aria-live="assertive"`

## Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text)
- Template colors are tested for sufficient contrast
- Dark mode option available in settings

## Visual Indicators
- Focus states on all interactive elements
- Clear hover states for buttons and links
- Loading indicators for long operations
- Error states with clear messaging

## Mobile Accessibility
- Touch targets are minimum 44x44 pixels
- Responsive layout works with zoom
- Font sizes are readable (minimum 16px)
- Avoid hover-only interactions

## Testing
```bash
# Run accessibility tests
npm run test:a11y
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations
- PDF export uses browser print dialog (accessibility depends on system)
- URL sharing requires modern browser with URLSearchParams support
- Settings persist in localStorage (requires cookies/storage enabled)

## Feedback
For accessibility issues, please report via:
- Email: accessibility@luminacv.dev
- GitHub Issues with "a11y" label

---

**Last Updated**: 2 January 2026  
**WCAG Compliance**: Level AA
