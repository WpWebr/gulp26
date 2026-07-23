/**
 * @file gulp/tasks/serve.js
 * @description BrowserSync dev server with intelligent file watching.
 */

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
import { t } from '../utils/i18n.js';
import { findComponentByFile } from '../utils/component.js';

const TASK = 'serve';

function initServer(done) {
  browserSync.init({
    server: { baseDir: config.paths.dest.dev },
    port: config.server.port,
    open: config.server.open,
    notify: config.server.notify,
    reloadDebounce: config.server.reloadDebounce,
  });
  success(TASK, `${t('serve.server_running')} http://localhost:${config.server.port}`);
  done();
}

function watchFiles() {
  const { components, scss, js, html, images: imgDir, fonts: fontsDir, svg: svgDir } = config.paths.src;

  watch(`${scss}/**/*.scss`, series(styles)).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'css');
    } else {
      info(TASK, t('serve.global_scss'));
    }
  });

  watch(`${js}/**/*.js`, series(scripts)).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'js');
    } else {
      info(TASK, t('serve.global_js'));
    }
  });

  watch(
    [html, `${config.paths.src.root}/**/*.html`, `${components}/**/*.html`],
    series(pages)
  ).on('change', (filePath) => {
    const comp = findComponentByFile(filePath, components);
    if (comp) {
      componentRebuild(comp.name, 'html');
    } else {
      info(TASK, t('serve.html_changed'));
    }
  });

  watch(`${imgDir}/**/*`, series(images)).on('change', () => {
    info(TASK, t('serve.image_changed'));
  });

  watch(`${svgDir}/**/*.svg`, series(svgSprite)).on('change', () => {
    info(TASK, t('serve.svg_changed'));
  });

  watch(`${fontsDir}/**/*`, series(fonts)).on('change', () => {
    info(TASK, t('serve.font_changed'));
  });

  info(TASK, t('serve.watching'));
}

export const serve = series(initServer, watchFiles);
