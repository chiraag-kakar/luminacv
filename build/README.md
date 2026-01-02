# Build System

## Overview

LuminaCV uses a simple Node.js bundler to combine the modular `/js/` architecture into a single `app.js` file.

**No external build tools** - Pure Node.js, works everywhere.

## Scripts

### `npm run build`
Bundles all modules in `/js/` into `app.js`

### `npm test`
Runs all tests in the `tests/` directory

### `npm run serve`
Start local server at `http://localhost:3000`

## Module Loading Order

The bundler respects dependencies:
1. Core utilities (no deps)
2. State management
3. Data structures
4. Features (export, import, share, formatter)
5. Main application

## Development Workflow

```bash
npm run build     # Bundle modules
npm test          # Run tests
npm run serve     # Start server
```
