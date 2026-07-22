/**
 * @file gulp/tasks/serve.js
 * @description BrowserSync dev server with intelligent file watching.
 * Rebuilds only the affected component on change.
 */

import path from 'node:path';
import { watch, series } from 'gulp';
import config from '../config/index.js';
import { browserSync } from '../plugins.js';
import { styles } from './styles.js';
import { scripts } from './scripts.js';
import { pages } from './pages.js';
import { images } from './images.js';
import { svgSprite } from './svg.js';
import { fonts } from './fonts.js';
import { info, success, componentRebuild } from '../utils/logger.js';
import { findComponentByFile } from '../utils/component.js';

const TASK = 'serve';

/**
 * Start BrowserSync server.
 */
function initServer(done) {
  browserSync.init({
    server: {
      baseDir: config.paths.dest.dev,
    },
    port: config.server.port,
    open: config.server.open,
    notify: config.server.notify,
    reloadDebounce: config.server.reloadDebounce,
  });
  success(TASK, `Dev server running at http://localhost:${config.server.port}`);
  done();
}

/**
 * Watch all source files and trigger appropriate rebuilds.
 */
function watchFiles() {
  const { components, scss, js, html, images: imgDir, fonts: fontsDir, svg: svgDir } = config.paths.src;

  // SCSS changes
  watch(`${scss}/**/*.scss`, series(styles)).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'css');
    } else {
      info(TASK, 'Global SCSS changed');
    }
  });

  // JS changes
  watch(`${js}/**/*.js`, series(scripts)).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'js');
    } else {
      info(TASK, 'Global JS changed');
    }
  });

  // HTML changes (pages + partials + components)
  watch(
    [html, `${config.paths.src.root}/**/*.html`, `${components}/**/*.html`],
    series(pages)
  ).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'html');
    } else {
      info(TASK, 'HTML changed');
    }
  });

  // Image changes
  watch(`${imgDir}/**/*`, series(images)).on('change', () => {
    info(TASK, 'Image changed');
  });

  // SVG changes
  watch(`${svgDir}/**/*.svg`, series(svgSprite)).on('change', () => {
    info(TASK, 'SVG changed');
  });

  // Font changes
  watch(`${fontsDir}/**/*`, series(fonts)).on('change', () => {
    info(TASK, 'Font changed');
  });

  info(TASK, 'Watching for changes...');
}

/**
 * Serve task: start server + watch.
 */
export const serve = series(initServer, watchFiles);
