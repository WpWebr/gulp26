/**
 * @file gulp/utils/merge.js
 * @description Deep merge utility for config objects.
 */

/**
 * Deep merge two objects. Source values override target.
 * Arrays are replaced, not concatenated.
 * @param {object} target
 * @param {object} source
 * @returns {object} Merged object (new reference)
 */
export function merge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = merge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
