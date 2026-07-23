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
  findProjectsByName,
  resolveProjectRoot,
  normalizePath,
  isPathInside,
  ROOT,
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

      if (!isPathInside(existing.root, ROOT)) {
        warn(TASK, `${t('projects.external_delete_warning')} ${existing.root}`);
        const extConfirmed = await confirm(`  ${t('projects.external_delete_confirm')} `);
        if (!extConfirmed) {
          info(TASK, t('projects.overwrite_cancelled'));
          return;
        }
      }

      removeProject(existing.name, true, true);
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

export async function projectRemove(name, deleteFiles = false, rootPath) {
  if (!name) {
    warn(TASK, t('projects.usage_remove'));
    return;
  }

  try {
    const matches = findProjectsByName(name);

    if (matches.length === 0) {
      throw new Error(`Project "${name}" not found`);
    }

    // Multiple matches — disambiguate by path
    if (matches.length > 1) {
      if (rootPath) {
        const match = matches.find(
          (p) => normalizePath(p.root) === normalizePath(rootPath)
        );
        if (!match) {
          throw new Error(
            `Project "${name}" not found at path "${rootPath}".\n` +
              `Available locations:\n` +
              matches.map((p) => `  ${p.root}`).join('\n')
          );
        }
        // Proceed with the narrowed-down match
        await removeSingleProject(match, deleteFiles);
        return;
      }

      // No path specified — show list and ask user to specify
      warn(TASK, t('projects.multiple_found').replace('{{name}}', name));
      for (const p of matches) {
        info(TASK, `  ${p.root}`);
      }
      info(TASK, '');
      info(TASK, t('projects.specify_path'));
      return;
    }

    // Single match — proceed directly
    await removeSingleProject(matches[0], deleteFiles);
  } catch (err) {
    error(TASK, err.message);
  }
}

/**
 * Remove a single matched project, handling external path confirmation.
 * @param {import('../utils/project.js').Project} project
 * @param {boolean} deleteFiles
 */
async function removeSingleProject(project, deleteFiles) {
  if (deleteFiles && !isPathInside(project.root, ROOT)) {
    warn(TASK, `${t('projects.external_delete_warning')} ${project.root}`);
    const confirmed = await confirm(`  ${t('projects.external_delete_confirm')} `);
    if (!confirmed) {
      info(TASK, t('projects.overwrite_cancelled'));
      return;
    }
    removeProject(project.name, true, true, project.root);
  } else {
    removeProject(project.name, deleteFiles, false, project.root);
  }

  success(TASK, `${t('projects.removed')} "${project.name}"`);
  if (deleteFiles) {
    info(TASK, t('projects.files_deleted'));
  }
}

export function projectDeactivate() {
  deactivateAll();
  success(TASK, t('projects.all_deactivated'));
}
