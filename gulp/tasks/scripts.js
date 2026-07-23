/**
 * @file gulp/tasks/scripts.js
 * @description JavaScript bundling with esbuild.
 * Supports: bundle, separate, or both modes. Code splitting optional.
 */

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import config from '../config/index.js';
import { isProduction, isDebug, isDev } from '../utils/env.js';
import { discoverComponents } from '../utils/component.js';
import { info, success, error, timerStart, timerEnd } from '../utils/logger.js';
import { t } from '../utils/i18n.js';
import { browserSync } from '../plugins.js';

const TASK = 'scripts';

function getBaseOptions() {
  return {
    target: config.js.target,
    format: config.js.format,
    platform: config.js.platform,
    loader: config.js.loader,
    bundle: true,
    minify: isProduction,
    sourcemap: isDev || isDebug,
    treeShaking: true,
    metafile: isDebug,
    logLevel: 'warning',
  };
}

async function scriptsBundle() {
  timerStart('scripts-bundle');

  const appJs = path.join(config.paths.src.js, 'app.js');
  const outdir = path.join(config.paths.dest.dev, config.paths.dest.js);

  if (!fs.existsSync(appJs)) {
    info(TASK, t('scripts.no_app_js'));
    return;
  }

  const components = discoverComponents(config.paths.src.components);
  const jsComponents = components.filter((c) => c.hasJs);

  let entryPoint = appJs;
  let tmpDir = null;

  if (jsComponents.length > 0) {
    tmpDir = path.join(config.paths.src.js, '_tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const componentImports = jsComponents
      .map((c) => `import '${path.relative(tmpDir, c.jsPath).replace(/\\/g, '/')}';`)
      .join('\n');

    const tmpEntry = path.join(tmpDir, '_bundle_entry.js');
    fs.writeFileSync(tmpEntry, `import '../app.js';\n${componentImports}\n`, 'utf-8');
    entryPoint = tmpEntry;
  }

  const options = {
    ...getBaseOptions(),
    entryPoints: [entryPoint],
    outfile: path.join(outdir, 'app.js'),
    splitting: false,
    chunkNames: config.js.chunkNames,
    format: 'iife',
  };

  try {
    const result = await esbuild.build(options);

    if (isDebug && result.metafile) {
      const metaPath = path.join(outdir, 'meta.json');
      if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
      fs.writeFileSync(metaPath, JSON.stringify(result.metafile, null, 2), 'utf-8');
      info(TASK, t('scripts.metafile_written'));
    }

    const time = timerEnd('scripts-bundle');
    success(TASK, `${t('scripts.bundle_done')} ${t('common.built_in')} ${time}`);
  } catch (err) {
    error(TASK, `${t('scripts.bundle_failed')}: ${err.message}`);
    throw err;
  } finally {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

async function scriptsSeparate() {
  timerStart('scripts-separate');

  const components = discoverComponents(config.paths.src.components);
  const jsComponents = components.filter((c) => c.hasJs);
  const outdir = path.join(config.paths.dest.dev, config.paths.dest.js);

  for (const comp of jsComponents) {
    try {
      await esbuild.build({
        ...getBaseOptions(),
        entryPoints: [comp.jsPath],
        outdir,
        outfile: path.join(outdir, `${comp.name}.js`),
        splitting: false,
        format: 'iife',
      });
    } catch (err) {
      error(TASK, `${t('scripts.component_failed')} ${comp.name}: ${err.message}`);
      throw err;
    }
  }

  const time = timerEnd('scripts-separate');
  success(TASK, `${t('scripts.separate_done')} ${t('common.built_in')} ${time}`);
}

export async function scripts() {
  timerStart('scripts');
  info(TASK, t('scripts.bundling'));

  const { bundle, separate } = config.modes.js;

  if (bundle) await scriptsBundle();
  if (separate) await scriptsSeparate();

  const time = timerEnd('scripts');
  success(TASK, `${t('scripts.complete')} ${t('common.complete_in')} ${time}`);

  browserSync.reload();
}
