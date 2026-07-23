/**
 * @file gulpfile.js
 * @description Entry point for Gulp 5 build system.
 * Imports all tasks and registers them. No logic here — only orchestration.
 */

import { task, series, parallel } from 'gulp';
import { clean } from './gulp/tasks/clean.js';
import { styles } from './gulp/tasks/styles.js';
import { scripts } from './gulp/tasks/scripts.js';
import { pages } from './gulp/tasks/pages.js';
import { images } from './gulp/tasks/images.js';
import { svgSprite } from './gulp/tasks/svg.js';
import { fonts } from './gulp/tasks/fonts.js';
import { serve } from './gulp/tasks/serve.js';
import { buildComponents } from './gulp/tasks/components.js';
import {
  projectList,
  projectUse,
  projectCreate,
  projectRemove,
  projectDeactivate,
} from './gulp/tasks/projects.js';
import { t, getLanguage, setLanguage, listLanguages } from './gulp/utils/i18n.js';
import { info, success } from './gulp/utils/logger.js';

const dev = series(
  clean,
  parallel(styles, scripts, pages, images, svgSprite, fonts),
  serve
);

const build = series(
  clean,
  parallel(styles, scripts, pages, images, svgSprite, fonts)
);

// Build tasks
task('clean', clean);
task('styles', styles);
task('scripts', scripts);
task('pages', pages);
task('images', images);
task('svg', svgSprite);
task('fonts', fonts);
task('components', buildComponents);

// Composite tasks
task('dev', dev);
task('build', build);
task('default', dev);

// Project management tasks
task('project:list', (done) => { projectList(); done(); });

task('project:use', (done) => {
  projectUse(process.env.npm_config_name || process.env.PROJECT_NAME);
  done();
});

task('project:create', async (done) => {
  await projectCreate(process.env.npm_config_name || process.env.PROJECT_NAME, {
    template: process.env.npm_config_template || process.env.PROJECT_TEMPLATE,
    path: process.env.npm_config_path || process.env.PROJECT_PATH,
  });
  done();
});

task('project:remove', async (done) => {
  await projectRemove(
    process.env.npm_config_name || process.env.PROJECT_NAME,
    process.env.DELETE_FILES === 'true',
    process.env.PROJECT_PATH
  );
  done();
});

task('project:deactivate', (done) => {
  projectDeactivate();
  done();
});

// Language tasks
task('lang', (done) => {
  const lang = process.env.LANGUAGE;
  if (lang) {
    setLanguage(lang);
    success('lang', `${t('language.switched')} ${lang}`);
  } else {
    info('lang', `${t('language.current')}: ${getLanguage()}`);
    info('lang', `${t('language.available')}: ${listLanguages().join(', ')}`);
    info('lang', t('language.set_hint'));
  }
  done();
});
