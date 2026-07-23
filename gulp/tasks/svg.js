/**
 * @file gulp/tasks/svg.js
 * @description SVG sprite generation and optimization.
 */

import fs from 'node:fs';
import path from 'node:path';
import SVGSprite from 'svg-sprite';
import config from '../config/index.js';
import { info, success, error, timerStart, timerEnd } from '../utils/logger.js';
import { t } from '../utils/i18n.js';
import { browserSync } from '../plugins.js';

const TASK = 'svg';

function getSvgFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith('.svg'))
    .map((f) => path.join(f.parentPath || f.path, f.name));
}

async function buildSprite() {
  timerStart('svg-sprite');

  const srcDir = config.paths.src.svg;
  const outDir = path.join(config.paths.dest.dev, config.paths.dest.svg);

  if (!fs.existsSync(srcDir)) {
    info(TASK, t('svg.no_directory'));
    return;
  }

  const files = getSvgFiles(srcDir);
  if (files.length === 0) {
    info(TASK, t('svg.no_files'));
    return;
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const spriter = new SVGSprite(config.svg.sprite);

    for (const file of files) {
      spriter.add(file, path.basename(file), fs.readFileSync(file, 'utf-8'));
    }

    spriter.compile((err, result) => {
      if (err) {
        error(TASK, err.message);
        reject(err);
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
      success(TASK, `${t('svg.sprite_done')} ${t('common.built_in')} ${time}`);
      resolve();
    });
  });
}

export async function svgSprite() {
  timerStart('svg');
  info(TASK, t('svg.processing'));

  await buildSprite();

  const time = timerEnd('svg');
  success(TASK, `${t('svg.complete')} ${t('common.complete_in')} ${time}`);

  browserSync.reload();
}
