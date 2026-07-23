/**
 * @file gulp/tasks/clean.js
 * @description Clean dist/ and public/ directories.
 */

import { deleteAsync } from '../plugins.js';
import config from '../config/index.js';
import { info, success } from '../utils/logger.js';
import { t } from '../utils/i18n.js';

const TASK = 'clean';

export async function clean() {
  info(TASK, t('clean.removing'));
  await deleteAsync([config.paths.dest.dev, config.paths.dest.prod]);
  success(TASK, t('clean.complete'));
}
