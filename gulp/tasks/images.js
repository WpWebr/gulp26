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
import { browserSync } from '../plugins.js';

const TASK = 'images';

/**
 * Ensure directory exists.
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get all image files from source directory.
 * @param {string} dir
 * @returns {string[]}
 */
function getImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.tif'];
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && exts.includes(path.extname(f.name).toLowerCase()))
    .map((f) => path.join(f.parentPath || f.path, f.name));
}

/**
 * Process a single image: optimize + generate WebP/AVIF variants.
 * @param {string} imgPath
 * @param {string} outputDir
 */
async function processImage(imgPath, outputDir) {
  const filename = path.basename(imgPath);
  const nameNoExt = path.parse(filename).name;
  const ext = path.extname(filename).toLowerCase();

  ensureDir(outputDir);

  // Copy original (optimized)
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

  // Generate WebP variant (if not already webp)
  if (ext !== '.webp' && config.images.formats.includes('webp')) {
    const webpPath = path.join(outputDir, `${nameNoExt}.webp`);
    await sharp(imgPath)
      .webp({ quality: config.images.quality.webp })
      .toFile(webpPath);
  }

  // Generate AVIF variant (if not already avif)
  if (ext !== '.avif' && config.images.formats.includes('avif')) {
    const avifPath = path.join(outputDir, `${nameNoExt}.avif`);
    await sharp(imgPath)
      .avif({ quality: config.images.quality.avif })
      .toFile(avifPath);
  }
}

/**
 * Main images task.
 */
export async function images() {
  timerStart('images');
  info(TASK, 'Processing images...');

  const srcDir = config.paths.src.images;
  const outDir = path.join(config.paths.dest.dev, config.paths.dest.images);

  if (!fs.existsSync(srcDir)) {
    info(TASK, 'No images directory found, skipping');
    return;
  }

  const files = getImageFiles(srcDir);
  if (files.length === 0) {
    info(TASK, 'No images found, skipping');
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
      error(TASK, `Failed to process ${path.basename(file)}: ${err.message}`);
    }
  }

  const time = timerEnd('images');
  success(TASK, `${count} images processed in ${time}`);

  browserSync.reload();
}
