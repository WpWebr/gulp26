/**
 * @file gulp/tasks/components.js
 * @description Dynamic component task registration.
 * Provides helper for manual component builds.
 */

import config from '../config/index.js';
import { discoverComponents } from '../utils/component.js';
import { info, success } from '../utils/logger.js';

const TASK = 'components';

/**
 * Build all components (SCSS + JS + HTML separately).
 * Useful for debugging individual components.
 */
export async function buildComponents() {
  info(TASK, 'Scanning components...');

  const components = discoverComponents(config.paths.src.components);

  if (components.length === 0) {
    info(TASK, 'No components found');
    return;
  }

  info(TASK, `Found ${components.length} components:`);
  for (const comp of components) {
    const features = [
      comp.hasScss ? 'SCSS' : null,
      comp.hasJs ? 'JS' : null,
      comp.hasHtml ? 'HTML' : null,
    ]
      .filter(Boolean)
      .join(', ');
    info(TASK, `  - ${comp.name} (${features})`);
  }

  success(TASK, 'Component scan complete');
}
