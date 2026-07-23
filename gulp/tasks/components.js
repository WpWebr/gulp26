/**
 * @file gulp/tasks/components.js
 * @description Dynamic component task registration.
 */

import config from '../config/index.js';
import { discoverComponents } from '../utils/component.js';
import { info, success } from '../utils/logger.js';
import { t } from '../utils/i18n.js';

const TASK = 'components';

export async function buildComponents() {
  info(TASK, t('components.scanning'));

  const components = discoverComponents(config.paths.src.components);

  if (components.length === 0) {
    info(TASK, t('components.no_components'));
    return;
  }

  info(TASK, `${t('common.found')} ${components.length} ${t('components.found')}:`);
  for (const comp of components) {
    const features = [
      comp.hasScss ? 'SCSS' : null,
      comp.hasJs ? 'JS' : null,
      comp.hasHtml ? 'HTML' : null,
    ].filter(Boolean).join(', ');
    info(TASK, `  - ${comp.name} (${features})`);
  }

  success(TASK, t('components.scan_complete'));
}
