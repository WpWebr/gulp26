/**
 * @file gulp/utils/project.js
 * @description Multi-project manager. Handles CRUD, activation, and scaffolding.
 *
 * Projects are stored in projects.json at the build system root.
 * Each project can live inside projects/ (default) or at a custom external path.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const PROJECTS_JSON = path.join(ROOT, 'projects.json');
const DEFAULT_PROJECTS_DIR = path.join(ROOT, 'projects');
const TEMPLATES_DIR = path.join(ROOT, 'templates');

/**
 * @typedef {object} Project
 * @property {string} name - Unique project identifier
 * @property {string} root - Absolute path to project directory
 * @property {string} src - Relative path from root to source files (default: 'src')
 * @property {string} dest - Relative path from root to output (default: 'dist')
 * @property {boolean} active - Whether this is the currently active project
 * @property {string} [template] - Template used during creation
 * @property {string} created - ISO date string
 */

/**
 * @typedef {object} ProjectsStore
 * @property {string} activeProject - Name of active project or null
 * @property {Project[]} projects - Array of project entries
 */

/** Default empty store. */
const EMPTY_STORE = { activeProject: null, projects: [] };

// ─── Store I/O ───────────────────────────────────────────────────────────────

/**
 * Read projects.json. Creates it if missing.
 * @returns {ProjectsStore}
 */
export function readStore() {
  if (!fs.existsSync(PROJECTS_JSON)) {
    fs.writeFileSync(PROJECTS_JSON, JSON.stringify(EMPTY_STORE, null, 2), 'utf-8');
    return { ...EMPTY_STORE };
  }
  return JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf-8'));
}

/**
 * Write projects.json.
 * @param {ProjectsStore} store
 */
function writeStore(store) {
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get the currently active project (or null).
 * @returns {Project|null}
 */
export function getActiveProject() {
  const store = readStore();
  return store.projects.find((p) => p.name === store.activeProject) || null;
}

/**
 * List all projects.
 * @returns {Project[]}
 */
export function listProjects() {
  return readStore().projects;
}

/**
 * Check if a project name already exists.
 * @param {string} name
 * @returns {boolean}
 */
export function projectExists(name) {
  return readStore().projects.some((p) => p.name === name);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Find a project that already occupies a given root path.
 * @param {string} root - Absolute path to check
 * @returns {Project|null}
 */
export function findProjectByPath(root) {
  const normalized = path.resolve(root);
  return readStore().projects.find((p) => path.resolve(p.root) === normalized) || null;
}

/**
 * Resolve the target project root before creation.
 * @param {string} name
 * @param {string} [customPath]
 * @returns {string}
 */
export function resolveProjectRoot(name, customPath) {
  const safeName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return customPath
    ? path.resolve(customPath)
    : path.join(DEFAULT_PROJECTS_DIR, safeName);
}

/**
 * Create a new project.
 *
 * @param {object} opts
 * @param {string} opts.name - Project name (used as folder name if no path given)
 * @param {string} [opts.path] - Custom absolute path for the project
 * @param {string} [opts.src='src'] - Relative source path
 * @param {string} [opts.dest='dist'] - Relative output path
 * @param {string} [opts.template] - Template name to scaffold from
 * @returns {Project}
 */
export function createProject({ name, path: customPath, src = 'src', dest = 'dist', template } = {}) {
  if (!name || !name.trim()) {
    throw new Error('Project name is required');
  }

  const safeName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const projectRoot = resolveProjectRoot(name, customPath);

  // Create directories
  if (!fs.existsSync(projectRoot)) {
    fs.mkdirSync(projectRoot, { recursive: true });
  }

  const srcDir = path.join(projectRoot, src);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Scaffold from template
  if (template) {
    const templateDir = path.join(TEMPLATES_DIR, template);
    if (fs.existsSync(templateDir)) {
      copyTemplateRecursive(templateDir, projectRoot);
    }
  }

  // Create project.config.js with defaults
  const configPath = path.join(projectRoot, 'project.config.js');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `/**
 * @file project.config.js
 * @description Project-specific configuration overrides.
 * These settings override the global gulp.config.js when this project is active.
 */
export default {
  // modes: {
  //   css: { bundle: true, separate: false },
  //   js: { bundle: true, separate: false },
  //   html: { mode: 'bundle' },
  // },
};
`,
      'utf-8'
    );
  }

  const project = {
    name: safeName,
    root: projectRoot,
    src,
    dest,
    active: false,
    template: template || null,
    created: new Date().toISOString(),
  };

  const store = readStore();
  store.projects.push(project);
  writeStore(store);

  return project;
}

/**
 * Set a project as active (deactivate all others).
 * @param {string} name
 * @returns {Project}
 */
export function useProject(name) {
  const store = readStore();
  const project = store.projects.find((p) => p.name === name);

  if (!project) {
    throw new Error(`Project "${name}" not found. Available: ${store.projects.map((p) => p.name).join(', ') || '(none)'}`);
  }

  store.projects.forEach((p) => {
    p.active = p.name === name;
  });
  store.activeProject = name;
  writeStore(store);

  return project;
}

/**
 * Remove a project from the registry. Optionally delete its files.
 * @param {string} name
 * @param {boolean} [deleteFiles=false]
 */
export function removeProject(name, deleteFiles = false) {
  const store = readStore();
  const idx = store.projects.findIndex((p) => p.name === name);

  if (idx === -1) {
    throw new Error(`Project "${name}" not found`);
  }

  const project = store.projects[idx];

  // Remove files if requested and project is inside our workspace
  if (deleteFiles && fs.existsSync(project.root)) {
    fs.rmSync(project.root, { recursive: true, force: true });
  }

  store.projects.splice(idx, 1);

  // If the removed project was active, clear it
  if (store.activeProject === name) {
    store.activeProject = null;
  }

  writeStore(store);
}

/**
 * Deactivate all projects (return to global build mode).
 */
export function deactivateAll() {
  const store = readStore();
  store.projects.forEach((p) => {
    p.active = false;
  });
  store.activeProject = null;
  writeStore(store);
}

// ─── Path Resolution ─────────────────────────────────────────────────────────

/**
 * Get resolved source/dest paths for the active project.
 * Returns null if no project is active.
 * @returns {{ src: string, dest: string, root: string } | null}
 */
export function getActiveProjectPaths() {
  const project = getActiveProject();
  if (!project) return null;

  return {
    root: project.root,
    src: path.join(project.root, project.src),
    dest: path.join(project.root, project.dest),
  };
}

// ─── Template Helpers ────────────────────────────────────────────────────────

/**
 * List available templates.
 * @returns {string[]}
 */
export function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/**
 * Recursively copy a template directory to a destination.
 * Skips files that already exist in the destination.
 * @param {string} src
 * @param {string} dest
 */
function copyTemplateRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyTemplateRecursive(srcPath, destPath);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}
