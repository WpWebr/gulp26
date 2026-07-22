/**
 * @file gulp/tasks/styles.js
 * @description SCSS compilation with PostCSS autoprefixer.
 * Supports: bundle, separate, or both modes.
 */

import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import CleanCSS from 'clean-css';
import config from '../config/index.js';
import { isProduction, isDebug, isDev } from '../utils/env.js';
import { discoverComponents } from '../utils/component.js';
import { info, success, error, timerStart, timerEnd } from '../utils/logger.js';
import { browserSync } from '../plugins.js';

const TASK = 'styles';

/**
 * Process a single SCSS entry through the full pipeline and write to disk.
 * @param {string} scssPath - Absolute path to SCSS file
 * @param {string} outputDir - Absolute output directory
 * @param {string} [outputFile] - Output filename (defaults to input name)
 * @returns {Promise<void>}
 */
async function compileScss(scssPath, outputDir, outputFile) {
  const destFile = outputFile || path.basename(scssPath).replace('.scss', '.css');
  const destPath = path.join(outputDir, destFile);

  try {
    const result = await sass.compileAsync(scssPath, {
      loadPaths: [
        config.paths.src.scss,
        ...config.scss.loadPaths,
        'node_modules',
      ],
      sourceMap: isDev || isDebug,
      style: isProduction ? 'compressed' : 'expanded',
      silenceDeprecations: config.scss.silenceDeprecations,
    });

    let css = result.css;
    let sourceMap = result.sourceMap;

    // Autoprefixer via PostCSS
    const postcssResult = await postcss([autoprefixer(config.scss.autoprefixer)]).process(css, {
      from: undefined,
      map: sourceMap ? { prev: JSON.stringify(sourceMap) } : false,
    });
    css = postcssResult.css;

    // Minify in production
    if (isProduction) {
      const minified = new CleanCSS(config.scss.cleanCss).minify(css);
      css = minified.styles;
    }

    // Write output
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(destPath, css, 'utf-8');

    // Write sourcemap
    if (postcssResult.map && (isDev || isDebug)) {
      const mapPath = path.join(outputDir, destFile + '.map');
      fs.writeFileSync(mapPath, postcssResult.map.toString(), 'utf-8');
    }
  } catch (err) {
    error(TASK, `Failed to compile ${path.relative(config.paths.src.root, scssPath)}: ${err.message}`);
    throw err;
  }
}

/**
 * Bundle mode: compile app.scss + all component SCSS into one style.css.
 * Uses a temporary entry file that imports global styles then component styles.
 * Component @use directives resolve via loadPaths to the global _variables/_mixins.
 */
async function stylesBundle() {
  timerStart('styles-bundle');

  const outputDir = path.join(config.paths.dest.dev, config.paths.dest.css);
  const components = discoverComponents(config.paths.src.components);
  const scssComponents = components.filter((c) => c.hasScss);

  // If no components, just compile app.scss directly
  const appScss = path.join(config.paths.src.scss, 'app.scss');
  if (scssComponents.length === 0 || !fs.existsSync(appScss)) {
    if (fs.existsSync(appScss)) {
      await compileScss(appScss, outputDir, 'style.css');
    }
    const time = timerEnd('styles-bundle');
    success(TASK, `Bundle built in ${time}`);
    return;
  }

  // Generate temporary entry that imports app.scss then all components
  const tmpDir = path.join(config.paths.src.scss, '_tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const componentImports = scssComponents
    .map((c) => `@use '../../components/${c.name}/${c.name}';`)
    .join('\n');

  const tmpEntry = path.join(tmpDir, '_bundle_entry.scss');
  fs.writeFileSync(
    tmpEntry,
    `@use '../app';\n${componentImports}\n`,
    'utf-8'
  );

  try {
    await compileScss(tmpEntry, outputDir, 'style.css');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const time = timerEnd('styles-bundle');
  success(TASK, `Bundle built in ${time}`);
}

/**
 * Separate mode: compile each component's SCSS independently.
 */
async function stylesSeparate() {
  timerStart('styles-separate');

  const components = discoverComponents(config.paths.src.components);
  const scssComponents = components.filter((c) => c.hasScss);
  const outputDir = path.join(config.paths.dest.dev, config.paths.dest.css);

  for (const comp of scssComponents) {
    await compileScss(comp.scssPath, outputDir, `${comp.name}.css`);
  }

  // Also compile any global SCSS files (non-partial, non-app)
  const globalScssDir = config.paths.src.scss;
  if (fs.existsSync(globalScssDir)) {
    const files = fs.readdirSync(globalScssDir).filter(
      (f) => f.endsWith('.scss') && !f.startsWith('_') && f !== 'app.scss'
    );
    for (const file of files) {
      await compileScss(path.join(globalScssDir, file), outputDir);
    }
  }

  const time = timerEnd('styles-separate');
  success(TASK, `Separate styles built in ${time}`);
}

/**
 * Main styles task. Respects css.bundle and css.separate modes.
 */
export async function styles() {
  timerStart('styles');
  info(TASK, 'Compiling SCSS...');

  const { bundle, separate } = config.modes.css;

  if (bundle) await stylesBundle();
  if (separate) await stylesSeparate();

  const time = timerEnd('styles');
  success(TASK, `Styles complete in ${time}`);

  browserSync.reload();
}
