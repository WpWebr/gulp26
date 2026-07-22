/**
 * @file gulp/config/paths.js
 * @description All source and destination paths.
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

export const paths = {
  root,

  src: {
    root: path.join(root, 'src'),
    scss: path.join(root, 'src', 'scss'),
    js: path.join(root, 'src', 'js'),
    html: path.join(root, 'src', '*.html'),
    partials: path.join(root, 'src', 'partials'),
    components: path.join(root, 'src', 'components'),
    images: path.join(root, 'src', 'images'),
    fonts: path.join(root, 'src', 'fonts'),
    svg: path.join(root, 'src', 'svg'),
  },

  dest: {
    dev: path.join(root, 'dist'),
    prod: path.join(root, 'public'),
    css: 'css',
    js: 'js',
    html: '',
    images: 'images',
    fonts: 'fonts',
    svg: 'svg',
  },
};
