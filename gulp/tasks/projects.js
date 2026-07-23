/**
 * @file gulp/tasks/projects.js
 * @description Project management CLI tasks: list, use, create, remove, deactivate.
 */

import readline from 'node:readline';
import {
  listProjects,
  getActiveProject,
  createProject,
  useProject,
  removeProject,
  deactivateAll,
  listTemplates,
  findProjectByPath,
  resolveProjectRoot,
} from '../utils/project.js';
import { info, success, warn, error } from '../utils/logger.js';
import { t } from '../utils/i18n.js';

const TASK = 'projects';

/**
 * Ask a y/n question via stdin.
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

export function projectList() {
  const projects = listProjects();
  const active = getActiveProject();

  if (projects.length === 0) {
    info(TASK, t('projects.no_projects'));
    return;
  }

  info(TASK, `${t('common.found')} ${projects.length} ${t('projects.found_projects')}:`);
  for (const p of projects) {
    const marker = p.name === active?.name ? '  * ' : '    ';
    const label = p.name === active?.name ? `${p.name} (${t('projects.active')})` : p.name;
    info(TASK, `${marker}${label}`);
    info(TASK, `      ${t('projects.path')}: ${p.root}`);
    if (p.template) info(TASK, `      ${t('projects.template')}: ${p.template}`);
  }
}

export function projectUse(name) {
  if (!name) {
    warn(TASK, t('projects.usage_use'));
    return;
  }

  try {
    const project = useProject(name);
    success(TASK, `${t('projects.switched')} "${project.name}"`);
    info(TASK, `  ${t('projects.path')}: ${project.root}`);
    info(TASK, `  ${t('projects.src')}:  ${project.src}`);
    info(TASK, `  ${t('projects.dest')}: ${project.dest}`);
    info(TASK, t('projects.run_build'));
  } catch (err) {
    error(TASK, err.message);
  }
}

export async function projectCreate(name, opts = {}) {
  if (!name) {
    warn(TASK, t('projects.usage_create'));
    const templates = listTemplates();
    if (templates.length > 0) {
      info(TASK, `${t('projects.available_templates')} ${templates.join(', ')}`);
    }
    return;
  }

  try {
    const projectRoot = resolveProjectRoot(name, opts.path);
    const existing = findProjectByPath(projectRoot);

    if (existing) {
      warn(TASK, `${t('projects.already_exists')} ${existing.root}`);

      const confirmed = await confirm(`  ${t('projects.overwrite_confirm')} `);
      if (!confirmed) {
        info(TASK, t('projects.overwrite_cancelled'));
        return;
      }

      info(TASK, t('projects.overwrite_removing'));
      removeProject(existing.name, true);
    }

    const project = createProject({
      name,
      template: opts.template,
      path: opts.path,
    });

    success(TASK, `${t('projects.created')} "${project.name}"`);
    info(TASK, `  ${t('projects.path')}: ${project.root}`);
    info(TASK, `  ${t('projects.src')}:  ${project.src}`);

    if (opts.template) {
      info(TASK, `  ${t('projects.template')}: ${opts.template}`);
    }

    info(TASK, '');
    info(TASK, `${t('common.next_steps')}:`);
    info(TASK, `  npx gulp project:use ${project.name}`);
    info(TASK, '  npx gulp dev');
  } catch (err) {
    error(TASK, err.message);
  }
}

export function projectRemove(name, deleteFiles = false) {
  if (!name) {
    warn(TASK, t('projects.usage_remove'));
    return;
  }

  try {
    removeProject(name, deleteFiles);
    success(TASK, `${t('projects.removed')} "${name}"`);
    if (deleteFiles) {
      info(TASK, t('projects.files_deleted'));
    }
  } catch (err) {
    error(TASK, err.message);
  }
}

export function projectDeactivate() {
  deactivateAll();
  success(TASK, t('projects.all_deactivated'));
}
