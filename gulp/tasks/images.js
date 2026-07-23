/**
 * @file gulp/tasks/images.js
 * @description Image optimization with WebP/AVIF generation.
 * Uses sharp for fast, modern image processing.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import config from '../config/index.js';
import { isProduction, isDebug, isDev } from '../utils/env.js';
import { info, success, error, timerStart, timerEnd } from '../utils/logger.js';
import { t } from '../utils/i18n.js';
import { browserSync } from '../plugins.js';

const TASK = 'images';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.tif'];
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && exts.includes(path.extname(f.name).toLowerCase()))
    .map((f) => path.join(f.parentPath || f.path, f.name));
}

async function processImage(imgPath, outputDir) {
  const filename = path.basename(imgPath);
  const nameNoExt = path.parse(filename).name;
  const ext = path.extname(filename).toLowerCase();

  ensureDir(outputDir);

  const outOriginal = path.join(outputDir, filename);
  let pipeline = sharp(imgPath);

  if (isProduction) {
    if (['.jpg', '.jpeg'].includes(ext)) {
      pipeline = pipeline.jpeg({ quality: config.images.quality.jpeg, progressive: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: config.images.quality.jpeg, compressionLevel: 9 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: config.images.quality.webp });
    } else if (ext === '.avif') {
      pipeline = pipeline.avif({ quality: config.images.quality.avif });
    }
  }

  await pipeline.toFile(outOriginal);

  if (ext !== '.webp' && config.images.formats.includes('webp')) {
    await sharp(imgPath).webp({ quality: config.images.quality.webp }).toFile(path.join(outputDir, `${nameNoExt}.webp`));
  }

  if (ext !== '.avif' && config.images.formats.includes('avif')) {
    await sharp(imgPath).avif({ quality: config.images.quality.avif }).toFile(path.join(outputDir, `${nameNoExt}.avif`));
  }
}

export async function images() {
  timerStart('images');
  info(TASK, t('images.processing'));

  const srcDir = config.paths.src.images;
  const outDir = path.join(config.paths.dest.dev, config.paths.dest.images);

  if (!fs.existsSync(srcDir)) {
    info(TASK, t('images.no_directory'));
    return;
  }

  const files = getImageFiles(srcDir);
  if (files.length === 0) {
    info(TASK, t('images.no_files'));
    return;
  }

  let count = 0;
  for (const file of files) {
    try {
      const relPath = path.relative(srcDir, file);
      const fileOutDir = path.join(outDir, path.dirname(relPath));
      await processImage(file, fileOutDir);
      count++;
    } catch (err) {
      error(TASK, `${t('images.failed')} ${path.basename(file)}: ${err.message}`);
    }
  }

  const time = timerEnd('images');
  success(TASK, `${count} ${t('images.processed')} ${t('common.built_in')} ${time}`);

  browserSync.reload();
}
