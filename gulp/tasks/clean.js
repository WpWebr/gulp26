/**
 * @file gulp/tasks/clean.js
 * @description Clean dist/ and public/ directories.
 */

import { deleteAsync } from '../plugins.js';
import config from '../config/index.js';
import { info, success } from '../utils/logger.js';

export async function clean() {
  info('clean', 'Removing build directories...');
  await deleteAsync([config.paths.dest.dev, config.paths.dest.prod]);
  success('clean', 'Clean complete');
}
