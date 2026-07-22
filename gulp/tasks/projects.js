/**
 * @file gulp/tasks/projects.js
 * @description Project management CLI tasks: list, use, create, remove, deactivate.
 */

import {
  listProjects,
  getActiveProject,
  createProject,
  useProject,
  removeProject,
  deactivateAll,
  listTemplates,
} from '../utils/project.js';
import { info, success, warn, error } from '../utils/logger.js';

const TASK = 'projects';

/**
 * List all registered projects and highlight the active one.
 */
export function projectList() {
  const projects = listProjects();
  const active = getActiveProject();

  if (projects.length === 0) {
    info(TASK, 'No projects registered. Create one with: npx gulp project:create <name>');
    return;
  }

  info(TASK, `Found ${projects.length} project(s):`);
  for (const p of projects) {
    const marker = p.name === active?.name ? '  * ' : '    ';
    const label = p.name === active?.name ? `${p.name} (active)` : p.name;
    info(TASK, `${marker}${label}`);
    info(TASK, `      path: ${p.root}`);
    if (p.template) info(TASK, `      template: ${p.template}`);
  }
}

/**
 * Switch to a project by name. All subsequent builds will use this project's config.
 * @param {string} name
 */
export function projectUse(name) {
  if (!name) {
    warn(TASK, 'Usage: npx gulp project:use <name>');
    return;
  }

  try {
    const project = useProject(name);
    success(TASK, `Switched to project "${project.name}"`);
    info(TASK, `  root: ${project.root}`);
    info(TASK, `  src:  ${project.src}`);
    info(TASK, `  dest: ${project.dest}`);
    info(TASK, 'Run "npx gulp build" to build this project');
  } catch (err) {
    error(TASK, err.message);
  }
}

/**
 * Create a new project.
 * @param {string} name - Project name
 * @param {object} [opts] - Options
 * @param {string} [opts.template] - Template to scaffold from
 * @param {string} [opts.path] - Custom path
 */
export function projectCreate(name, opts = {}) {
  if (!name) {
    warn(TASK, 'Usage: npx gulp project:create <name> [--template <tpl>] [--path <path>]');
    const templates = listTemplates();
    if (templates.length > 0) {
      info(TASK, `Available templates: ${templates.join(', ')}`);
    }
    return;
  }

  try {
    const project = createProject({
      name,
      template: opts.template,
      path: opts.path,
    });

    success(TASK, `Project "${project.name}" created`);
    info(TASK, `  path: ${project.root}`);
    info(TASK, `  src:  ${project.src}`);

    if (opts.template) {
      info(TASK, `  template: ${opts.template}`);
    }

    info(TASK, '');
    info(TASK, 'Next steps:');
    info(TASK, `  npx gulp project:use ${project.name}   # Switch to this project`);
    info(TASK, '  npx gulp dev                           # Start development');
  } catch (err) {
    error(TASK, err.message);
  }
}

/**
 * Remove a project from the registry.
 * @param {string} name
 * @param {boolean} [deleteFiles]
 */
export function projectRemove(name, deleteFiles = false) {
  if (!name) {
    warn(TASK, 'Usage: npx gulp project:remove <name> [--delete-files]');
    return;
  }

  try {
    removeProject(name, deleteFiles);
    success(TASK, `Project "${name}" removed`);
    if (deleteFiles) {
      info(TASK, 'Project files were also deleted');
    }
  } catch (err) {
    error(TASK, err.message);
  }
}

/**
 * Deactivate all projects (return to global build mode).
 */
export function projectDeactivate() {
  deactivateAll();
  success(TASK, 'All projects deactivated. Using global configuration.');
}
