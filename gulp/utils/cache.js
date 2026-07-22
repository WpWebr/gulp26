/**
 * @file gulp/utils/cache.js
 * @description Simple file modification cache for incremental builds.
 */

import fs from 'node:fs';

const cache = new Map();

/**
 * Check if a file has changed since last check.
 * @param {string} filePath - Absolute path
 * @returns {boolean} True if file is new or modified
 */
export function hasChanged(filePath) {
  try {
    const stat = fs.statSync(filePath);
    const mtime = stat.mtimeMs;
    const cached = cache.get(filePath);
    if (cached === mtime) return false;
    cache.set(filePath, mtime);
    return true;
  } catch {
    return true;
  }
}

/**
 * Reset cache for a specific file or all files.
 * @param {string} [filePath]
 */
export function resetCache(filePath) {
  if (filePath) {
    cache.delete(filePath);
  } else {
    cache.clear();
  }
}
