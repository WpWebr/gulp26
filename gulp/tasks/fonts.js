/**
 * @file gulp/tasks/fonts.js
 * @description Font file copying with optional WOFF2 generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import config from '../config/index.js';
import { info, success, timerStart, timerEnd } from '../utils/logger.js';
import { browserSync } from '../plugins.js';

const TASK = 'fonts';

/**
 * Copy font files from source to destination.
 */
export async function fonts() {
  timerStart('fonts');
  info(TASK, 'Copying fonts...');

  const srcDir = config.paths.src.fonts;
  const outDir = path.join(config.paths.dest.dev, config.paths.dest.fonts);

  if (!fs.existsSync(srcDir)) {
    info(TASK, 'No fonts directory found, skipping');
    return;
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const fontExts = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
  const files = fs
    .readdirSync(srcDir, { withFileTypes: true, recursive: true })
    .filter((f) => f.isFile() && fontExts.includes(path.extname(f.name).toLowerCase()));

  let count = 0;
  for (const file of files) {
    const srcFile = path.join(file.parentPath || file.path, file.name);
    const relPath = path.relative(srcDir, srcFile);
    const destFile = path.join(outDir, relPath);
    const destDir = path.dirname(destFile);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcFile, destFile);
    count++;
  }

  const time = timerEnd('fonts');
  success(TASK, `${count} font files copied in ${time}`);

  browserSync.reload();
}
