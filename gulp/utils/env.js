/**
 * @file gulp/utils/env.js
 * @description Environment detection. Reads --production / --debug flags.
 */

import process from 'node:process';

const args = process.argv.slice(2);

export const isProduction = args.includes('--production');
export const isDebug = args.includes('--debug');
export const isDev = !isProduction && !isDebug;

export function getBuildMode() {
  if (isProduction) return 'production';
  if (isDebug) return 'debug';
  return 'development';
}
