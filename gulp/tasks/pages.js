/**
 * @file gulp/tasks/pages.js
 * @description HTML processing with file-include and minification.
 * Supports: bundle, separate, or component-only modes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { src, dest } from 'gulp';
import fileInclude from 'gulp-file-include';
import { minify } from 'html-minifier-terser';
import config from '../config/index.js';
import { isProduction, isDebug, isDev } from '../utils/env.js';
import { discoverComponents } from '../utils/component.js';
import { info, success, timerStart, timerEnd } from '../utils/logger.js';
import { t } from '../utils/i18n.js';
import { browserSync } from '../plugins.js';

const TASK = 'pages';

function getOutputDir() {
  return path.join(config.paths.dest.dev, config.paths.dest.html);
}

async function pagesBundle() {
  timerStart('pages-bundle');

  const outputDir = getOutputDir();
  const htmlFiles = path.join(config.paths.src.root, '*.html');

  return new Promise((resolve, reject) => {
    const stream = src(htmlFiles, { allowEmpty: true })
      .pipe(
        fileInclude({
          prefix: config.html.fileInclude.prefix,
          basepath: config.paths.src.root,
          context: {
            title: 'Gulp26',
            isDev,
            isProduction,
            isDebug,
          },
        })
      );

    stream.pipe(dest(outputDir)).on('end', () => {
      const time = timerEnd('pages-bundle');
      success(TASK, `${t('pages.bundle_done')} ${t('common.built_in')} ${time}`);
      resolve();
    }).on('error', reject);
  });
}

async function pagesSeparate() {
  timerStart('pages-separate');

  const components = discoverComponents(config.paths.src.components);
  const htmlComponents = components.filter((c) => c.hasHtml);
  const outputDir = path.join(getOutputDir(), 'components');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const comp of htmlComponents) {
    const destFile = path.join(outputDir, `${comp.name}.html`);
    const content = fs.readFileSync(comp.htmlPath, 'utf-8');

    let processed = content;
    processed = processed.replace(
      /@@include\(['"]([^'"]+)['"]\)/g,
      (_, incPath) => {
        const full = path.resolve(comp.path, incPath);
        if (fs.existsSync(full)) return fs.readFileSync(full, 'utf-8');
        return `<!-- include not found: ${incPath} -->`;
      }
    );

    if (isProduction) {
      processed = await minify(processed, config.html.minify);
    }

    fs.writeFileSync(destFile, processed, 'utf-8');
  }

  const time = timerEnd('pages-separate');
  success(TASK, `${t('pages.separate_done')} ${t('common.built_in')} ${time}`);
}

export async function pages() {
  timerStart('pages');
  info(TASK, t('pages.processing'));

  const { mode } = config.modes.html;

  if (mode === 'bundle' || mode === 'both') await pagesBundle();
  if (mode === 'separate' || mode === 'both') await pagesSeparate();

  const time = timerEnd('pages');
  success(TASK, `${t('pages.complete')} ${t('common.complete_in')} ${time}`);

  browserSync.reload();
}
