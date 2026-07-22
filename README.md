# Gulp26 — Modern Gulp 5 Build System

A modular, scalable, and extensible build system based on **Gulp 5** for HTML and WordPress projects. Features automatic component discovery, flexible bundling modes, and a centralized configuration.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Multi-Project System](#multi-project-system)
  - [Creating a Project](#creating-a-project)
  - [Switching Projects](#switching-projects)
  - [Per-Project Configuration](#per-project-configuration)
  - [Available Templates](#available-templates)
  - [Project Management Commands](#project-management-commands)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
  - [Build Modes](#build-modes)
  - [Build Profiles](#build-profiles)
  - [CSS Modes](#css-modes)
  - [JavaScript Modes](#javascript-modes)
  - [HTML Modes](#html-modes)
- [Component Architecture](#component-architecture)
  - [Adding a Component](#adding-a-component)
  - [How Auto-Discovery Works](#how-auto-discovery-works)
- [Tasks](#tasks)
  - [Development](#development)
  - [Production Build](#production-build)
  - [Individual Tasks](#individual-tasks)
- [SCSS](#scss)
- [JavaScript](#javascript)
- [HTML](#html)
- [Images](#images)
- [SVG](#svg)
- [Fonts](#fonts)
- [Watch and Live Reload](#watch-and-live-reload)
- [Adding a New Task](#adding-a-new-task)
- [Extending Configuration](#extending-configuration)
- [Dependencies](#dependencies)
- [Architecture](#architecture)

## Features

- **Gulp 5** with native ES Modules (`"type": "module"`)
- **Component auto-discovery** — create a folder and the component is picked up automatically
- **Flexible bundling** — bundle, separate, or both for CSS, JS, and HTML
- **Three build profiles** — development, production, production + debug
- **SCSS** — Dart Sass API, `@use`/`@forward`, PostCSS autoprefixer, CleanCSS minification
- **JavaScript** — esbuild (no Babel), tree shaking, code splitting, source maps, minification
- **HTML** — `gulp-file-include` with variables, includes, conditional compilation
- **Images** — sharp: optimization, automatic WebP and AVIF generation
- **SVG** — sprite generation via svg-sprite
- **Fonts** — automatic copying with WOFF2 support
- **Watch** — BrowserSync with intelligent per-component rebuild detection
- **~15 dependencies** — minimal and focused

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server with live reload
npm run dev

# Production build
npm run build:prod

# Build with debug info (sourcemaps + metafile)
npm run build:debug
```

## Multi-Project System

Gulp26 supports managing multiple projects from a single build system. Each project has its own source files, configuration, and build output.

### Creating a Project

```bash
# Create with a template
PROJECT_NAME=my-site PROJECT_TEMPLATE=landing npx gulp project:create

# Create with a custom path
PROJECT_NAME=my-site PROJECT_PATH=/path/to/my-site npx gulp project:create

# Create without a template (empty project)
PROJECT_NAME=my-site npx gulp project:create
```

### Switching Projects

```bash
# Switch to a project
PROJECT_NAME=my-site npx gulp project:use

# Build the active project
npx gulp build

# List all projects
npx gulp project:list

# Deactivate (return to global build mode)
npx gulp project:deactivate
```

### Per-Project Configuration

Each project can have its own `project.config.js` that overrides the global `gulp.config.js`:

```js
// projects/my-site/project.config.js
export default {
  modes: {
    css: { bundle: true, separate: false },
    js: { bundle: true, separate: false, splitting: true },
    html: { mode: 'bundle' },
  },
  scss: {
    loadPaths: ['node_modules/bootstrap/scss'],
  },
};
```

Configuration is merged in order: **base config → user overrides → project overrides**.

### Available Templates

| Template | Description |
|----------|-------------|
| `landing` | Single-page landing with header, hero, footer |
| `multipage` | Multi-page site with shared header/footer |

### Project Management Commands

| Command | Description |
|---------|-------------|
| `npx gulp project:list` | List all registered projects |
| `npx gulp project:use` | Switch to a project (set `PROJECT_NAME` env var) |
| `npx gulp project:create` | Create a new project |
| `npx gulp project:remove` | Remove a project (set `DELETE_FILES=true` to delete files) |
| `npx gulp project:deactivate` | Deactivate all projects (global mode) |

## Project Structure

```
gulp26/
├── gulpfile.js                  # Entry point: imports and registers tasks
├── gulp.config.js               # User configuration overrides
├── package.json
│
├── gulp/
│   ├── config/
│   │   ├── index.js             # Config hub (merges all modules + user override)
│   │   ├── paths.js             # All source and destination paths
│   │   ├── modes.js             # Bundle/separate/both toggles
│   │   ├── scss.js              # Sass + PostCSS options
│   │   ├── js.js                # esbuild options
│   │   ├── html.js              # file-include + minification options
│   │   ├── images.js            # WebP/AVIF, quality settings
│   │   ├── svg.js               # SVG sprite config
│   │   ├── fonts.js             # Font handling options
│   │   └── server.js            # BrowserSync options
│   │
│   ├── tasks/
│   │   ├── styles.js            # SCSS → PostCSS → CSS
│   │   ├── scripts.js           # esbuild JS bundling
│   │   ├── pages.js             # HTML processing
│   │   ├── images.js            # Image optimization
│   │   ├── svg.js               # SVG sprite generation
│   │   ├── fonts.js             # Font copying
│   │   ├── clean.js             # Directory cleanup
│   │   ├── serve.js             # BrowserSync + watch
│   │   └── components.js        # Component diagnostics
│   │
│   ├── utils/
│   │   ├── logger.js            # Colored terminal output
│   │   ├── component.js         # Component auto-discovery
│   │   ├── cache.js             # File modification cache
│   │   ├── env.js               # Environment detection
│   │   └── merge.js             # Deep merge utility
│   │
│   └── plugins.js               # Centralized plugin imports
│
├── src/
│   ├── index.html               # Main page
│   ├── partials/                # Shared templates
│   ├── scss/
│   │   ├── app.scss             # Global styles entry point
│   │   ├── _variables.scss      # Design tokens
│   │   ├── _mixins.scss         # SCSS mixins
│   │   └── _base.scss           # CSS reset / base styles
│   ├── js/
│   │   ├── app.js               # Global JS entry point
│   │   └── utils/helpers.js     # Utility functions
│   ├── components/              # Auto-discovered component blocks
│   │   ├── header/
│   │   │   ├── header.html
│   │   │   ├── header.scss
│   │   │   └── header.js
│   │   ├── hero/
│   │   │   ├── hero.html
│   │   │   └── hero.scss
│   │   └── footer/
│   │       ├── footer.html
│   │       ├── footer.scss
│   │       └── footer.js
│   ├── images/
│   ├── fonts/
│   └── svg/
│
├── dist/                        # Build output (development)
└── public/                      # Build output (production)
```

## Configuration

All build behavior is controlled by two files:

| File | Purpose |
|------|---------|
| `gulp/config/*.js` | Base configuration (one file per concern) |
| `gulp.config.js` | User overrides (deep-merged at runtime) |

You only need to edit `gulp.config.js`. The base files provide sensible defaults.

### Build Modes

Edit `gulp.config.js` to switch modes:

```js
export default {
  modes: {
    css: { bundle: true, separate: false },
    js: { bundle: true, separate: false, splitting: false },
    html: { mode: 'bundle' },
  },
};
```

No changes to gulp tasks are required.

### Build Profiles

| Command | Mode | Sourcemaps | Minification |
|---------|------|-----------|-------------|
| `npm run dev` | development | yes | no |
| `npm run build` | development | yes | no |
| `npm run build:prod` | production | no | yes |
| `npm run build:debug` | debug | yes + metafile | yes |

### CSS Modes

| `bundle` | `separate` | Output |
|----------|-----------|--------|
| `true` | `false` | Single `style.css` with all styles |
| `false` | `true` | Individual `header.css`, `hero.css`, `footer.css` |
| `true` | `true` | Both: single bundle + individual files |

### JavaScript Modes

| `bundle` | `separate` | Output |
|----------|-----------|--------|
| `true` | `false` | Single `app.js` bundle |
| `false` | `true` | Individual `header.js`, `hero.js`, `footer.js` |
| `true` | `true` | Both: single bundle + individual files |

### HTML Modes

| `mode` | Output |
|--------|--------|
| `'bundle'` | `index.html` with all includes resolved |
| `'separate'` | Individual `components/header.html`, etc. |
| `'both'` | Both: main page + individual component HTML |

## Component Architecture

Components are the core of this build system. Each component is a self-contained block in `src/components/`.

### Adding a Component

Create a new directory with any combination of `.scss`, `.js`, and `.html` files:

```
src/components/gallery/
├── gallery.html     # HTML fragment (optional)
├── gallery.scss     # Component styles (optional)
└── gallery.js       # Component logic (optional)
```

That's it. The build system will:

1. **Automatically include** `gallery.scss` in the CSS bundle (bundle mode)
2. **Automatically bundle** `gallery.js` into `app.js` (bundle mode)
3. **Make** `gallery.html` available for `@@include` in templates

No manual registration required.

### How Auto-Discovery Works

The `gulp/utils/component.js` module scans `src/components/` on every build:

```js
import { discoverComponents } from './gulp/utils/component.js';

const components = discoverComponents('src/components');
// Returns:
// [
//   { name: 'header', hasScss: true, hasJs: true, hasHtml: true, ... },
//   { name: 'gallery', hasScss: true, hasJs: false, hasHtml: true, ... },
// ]
```

Each task (`styles`, `scripts`, `pages`) calls this function and processes only the components relevant to its domain.

### Using Component HTML

In your main `index.html`, include component HTML with variables:

```html
@@include('components/header/header.html', {
  "title": "My Page",
  "navItems": "home,about,contact"
})
```

### Component Independence

Each component is fully autonomous:
- Its SCSS can use `@use 'variables'` to access global design tokens
- Its JS runs independently with its own `DOMContentLoaded` listener
- Its HTML is a self-contained fragment

## Tasks

### Development

```bash
npm run dev
```

Starts BrowserSync dev server at `http://localhost:3000` with file watching. The browser opens automatically.

### Production Build

```bash
npm run build:prod
```

Full production build with minification, no sourcemaps, optimized images.

### Individual Tasks

```bash
npx gulp styles      # Compile SCSS only
npx gulp scripts     # Bundle JS only
npx gulp pages       # Process HTML only
npx gulp images      # Optimize images only
npx gulp svg         # Build SVG sprite only
npx gulp fonts       # Copy fonts only
npx gulp components  # List discovered components
npx gulp clean       # Remove dist/ directory
```

## SCSS

**Engine:** Dart Sass API (direct, not via gulp-sass)

**Features:**
- `@use` and `@forward` fully supported
- PostCSS autoprefixer for vendor prefixes
- CleanCSS minification in production
- Source maps in development
- Component styles auto-included in bundle mode

**Global tokens** (`_variables.scss`):
```scss
$color-primary: #16c79a;
$breakpoint-md: 768px;
$spacing-unit: 8px;
```

**Component SCSS** can access globals:
```scss
@use 'variables' as *;

.hero {
  color: $color-primary;  // works!
}
```

## JavaScript

**Engine:** esbuild (direct API, no gulp plugin)

**Features:**
- ES Modules, TypeScript, JSX/TSX out of the box
- Tree shaking
- Code splitting (optional via `splitting: true`)
- Source maps in development
- Minification in production
- Component JS auto-included in bundle mode

**Global utilities** (`src/js/utils/helpers.js`):
```js
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
```

**Import in app.js:**
```js
import './utils/helpers.js';
import { qs } from './utils/helpers.js';
```

## HTML

**Engine:** `gulp-file-include`

**Features:**
- `@@include('path/to/file.html')` — file includes
- `@@include('file.html', { "key": "value" })` — includes with variables
- Conditional compilation via build mode context
- Minification in production via `html-minifier-terser`

**Example:**
```html
@@include('partials/head.html', {
  "title": "Home Page",
  "description": "Welcome to our site"
})

@@include('components/header/header.html')

<main>
  @@include('components/hero/hero.html')
</main>

@@include('partials/footer.html')
```

## Images

**Engine:** sharp (direct API)

**Features:**
- Automatic WebP and AVIF generation
- JPEG/PNG optimization in production
- Responsive variants via `sizes` config
- Skip processing on dev for speed (configurable)

**Output structure:**
```
dist/images/
├── photo.jpg          # Optimized original
├── photo.webp         # WebP variant
└── photo.avif         # AVIF variant
```

## SVG

**Engine:** svg-sprite

**Features:**
- Symbol-based sprite generation
- Automatic icon ID generation (`icon-{name}`)
- Optimized output

**Usage in HTML:**
```html
<svg><use href="svg/sprite.svg#icon-arrow"></use></svg>
```

## Fonts

**Features:**
- Automatic copying of `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`
- Nested directory support
- WOFF2 generation (configurable)

## Watch and Live Reload

BrowserSync watches for changes and triggers intelligent rebuilds:

| Changed File | Rebuild Trigger |
|-------------|-----------------|
| `src/scss/app.scss` | Full SCSS rebuild |
| `src/components/header/header.scss` | Component CSS rebuild |
| `src/js/app.js` | Full JS rebuild |
| `src/components/header/header.js` | Component JS rebuild |
| `src/**/*.html` | HTML rebuild |
| `src/images/**/*` | Image processing |
| `src/svg/**/*` | SVG sprite rebuild |
| `src/fonts/**/*` | Font copying |

The console shows which component was rebuilt:
```
[CSS] Component header rebuilt
[JS] Component hero rebuilt
[styles] Global SCSS changed
```

## Adding a New Task

1. Create `gulp/tasks/my-task.js`:

```js
import config from '../config/index.js';
import { info, success } from '../utils/logger.js';
import { browserSync } from '../plugins.js';

const TASK = 'my-task';

export async function myTask() {
  info(TASK, 'Running...');

  // Your logic here

  success(TASK, 'Done');
  browserSync.reload();
}
```

2. Register in `gulpfile.js`:

```js
import { myTask } from './gulp/tasks/my-task.js';
task('my-task', myTask);
```

3. Run with `npx gulp my-task`.

## Extending Configuration

1. Create `gulp/config/my-feature.js`:

```js
export const myFeature = {
  enabled: true,
  option: 'value',
};
```

2. Import in `gulp/config/index.js`:

```js
import { myFeature } from './my-feature.js';
const baseConfig = { /* ... */, myFeature };
```

3. Override in `gulp.config.js`:

```js
export default {
  myFeature: { enabled: false },
};
```

The deep merge ensures partial overrides work correctly.

## Dependencies

| Package | Purpose |
|---------|---------|
| `gulp` | Task runner |
| `sass` | Dart Sass compiler |
| `esbuild` | JavaScript bundler |
| `postcss` + `autoprefixer` | CSS postprocessing |
| `clean-css` | CSS minification |
| `html-minifier-terser` | HTML minification |
| `gulp-file-include` | HTML includes and templating |
| `browser-sync` | Dev server + live reload |
| `sharp` | Image optimization + WebP/AVIF |
| `svg-sprite` | SVG sprite generation |
| `del` | Directory cleanup |
| `chalk` + `fancy-log` | Terminal logging |
| `gulp-sourcemaps` | Source map generation |

## Architecture

### Design Principles

- **SOLID** — each task has a single responsibility
- **DRY** — shared utilities in `gulp/utils/`, config in `gulp/config/`
- **KISS** — minimal abstraction, direct API calls (no unnecessary gulp plugins)
- **ESM** — native ES Modules throughout
- **JSDoc** — typed via JSDoc comments (no TypeScript)

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| esbuild API directly (no gulp-esbuild) | Full control, incremental builds, no wrapper overhead |
| Sass API directly (no gulp-sass) | Better ESM support, `@use`/`@forward` compatibility |
| Temp entry files for bundling | Auto-includes components without modifying source files |
| Deep merge config | User overrides don't touch base config |
| Component discovery at build time | Zero-config component registration |

### Data Flow

```
gulp.config.js (user override)
        ↓
gulp/config/index.js (deep merge)
        ↓
gulp/tasks/* (read config, process files)
        ↓
gulp/utils/component.js (discover components)
        ↓
dist/ (output)
```

## License

MIT
