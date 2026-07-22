/**
 * @file gulp/config/index.js
 * @description Central config hub.
 * Merges: base config → user overrides (gulp.config.js) → project overrides (project.config.js).
 */

import path from 'node:path';
import { merge } from '../utils/merge.js';
import { getActiveProject } from '../utils/project.js';
import { paths } from './paths.js';
import { modes } from './modes.js';
import { scss } from './scss.js';
import { js } from './js.js';
import { html } from './html.js';
import { images } from './images.js';
import { svg } from './svg.js';
import { fonts } from './fonts.js';
import { server } from './server.js';

const baseConfig = {
  paths,
  modes,
  scss,
  js,
  html,
  images,
  svg,
  fonts,
  server,
};

// Layer 1: User overrides (gulp.config.js)
let userConfig = {};
try {
  const mod = await import('../../gulp.config.js');
  userConfig = mod.default || mod;
} catch {
  // No user config — use defaults
}

let config = merge(baseConfig, userConfig);

// Layer 2: Project overrides (project.config.js)
const project = getActiveProject();
if (project) {
  const projectConfigPath = path.join(project.root, 'project.config.js');
  try {
    const mod = await import(projectConfigPath);
    const projectConfig = mod.default || mod;
    config = merge(config, projectConfig);

    // Override paths based on active project
    config.paths = {
      ...config.paths,
      root: project.root,
      src: {
        ...config.paths.src,
        root: path.join(project.root, project.src),
        scss: path.join(project.root, project.src, 'scss'),
        js: path.join(project.root, project.src, 'js'),
        html: path.join(project.root, project.src, '*.html'),
        partials: path.join(project.root, project.src, 'partials'),
        components: path.join(project.root, project.src, 'components'),
        images: path.join(project.root, project.src, 'images'),
        fonts: path.join(project.root, project.src, 'fonts'),
        svg: path.join(project.root, project.src, 'svg'),
      },
      dest: {
        ...config.paths.dest,
        dev: path.join(project.root, project.dest),
        prod: path.join(project.root, project.dest),
      },
    };
  } catch {
    // No project config — still override paths
    config.paths = {
      ...config.paths,
      root: project.root,
      src: {
        ...config.paths.src,
        root: path.join(project.root, project.src),
        scss: path.join(project.root, project.src, 'scss'),
        js: path.join(project.root, project.src, 'js'),
        html: path.join(project.root, project.src, '*.html'),
        partials: path.join(project.root, project.src, 'partials'),
        components: path.join(project.root, project.src, 'components'),
        images: path.join(project.root, project.src, 'images'),
        fonts: path.join(project.root, project.src, 'fonts'),
        svg: path.join(project.root, project.src, 'svg'),
      },
      dest: {
        ...config.paths.dest,
        dev: path.join(project.root, project.dest),
        prod: path.join(project.root, project.dest),
      },
    };
  }
}

export default config;
