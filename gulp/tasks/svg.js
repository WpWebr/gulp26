/**
 * @file gulp/tasks/svg.js
 * @description SVG sprite generation and optimization.
 */

import fs from 'node:fs';
import path from 'node:path';
import SVGSprite from 'svg-sprite';
import config from '../config/index.js';
import { info, success, error, timerStart, timerEnd } from '../utils/logger.js';
import { browserSync } from '../plugins.js';

const TASK = 'svg';

/**
 * Get all SVG files from source directory.
 * @param {string} dir
 * @returns {string[]}
 */
function getSvgFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith('.svg'))
    .map((f) => path.join(f.parentPath || f.path, f.name));
}

/**
 * Build SVG sprite from all SVG files in src/svg/.
 */
async function buildSprite() {
  timerStart('svg-sprite');

  const srcDir = config.paths.src.svg;
  const outDir = path.join(config.paths.dest.dev, config.paths.dest.svg);

  if (!fs.existsSync(srcDir)) {
    info(TASK, 'No svg directory found, skipping');
    return;
  }

  const files = getSvgFiles(srcDir);
  if (files.length === 0) {
    info(TASK, 'No SVG files found, skipping sprite');
    return;
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const spriter = new SVGSprite(config.svg.sprite);

    for (const file of files) {
      spriter.add(file, path.basename(file), fs.readFileSync(file, 'utf-8'));
    }

    spriter.compile(
      (error, result) => {
        if (error) {
          error(TASK, `Sprite build failed: ${error.message}`);
          reject(error);
          return;
        }

        for (const mode of Object.keys(result)) {
          for (const resource of Object.keys(result[mode])) {
            const outputPath = path.join(outDir, path.basename(resource));
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, result[mode][resource].contents);
          }
        }

        const time = timerEnd('svg-sprite');
        success(TASK, `${files.length} SVGs compiled into sprite in ${time}`);
        resolve();
      }
    );
  });
}

/**
 * Main SVG task.
 */
export async function svgSprite() {
  timerStart('svg');
  info(TASK, 'Processing SVG...');

  await buildSprite();

  const time = timerEnd('svg');
  success(TASK, `SVG complete in ${time}`);

  browserSync.reload();
}
