/**
 * @file gulp/utils/component.js
 * @description Component discovery and metadata extraction.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {object} Component
 * @property {string} name - Component name (directory name)
 * @property {string} path - Absolute path to component directory
 * @property {boolean} hasScss - Whether component has a .scss file
 * @property {boolean} hasJs - Whether component has a .js file
 * @property {boolean} hasHtml - Whether component has an .html file
 * @property {string|null} scssPath - Absolute path to component SCSS file
 * @property {string|null} jsPath - Absolute path to component JS file
 * @property {string|null} htmlPath - Absolute path to component HTML file
 */

/**
 * Scan components directory and return metadata for each component.
 * @param {string} componentsDir - Absolute path to components directory
 * @returns {Component[]}
 */
export function discoverComponents(componentsDir) {
  if (!fs.existsSync(componentsDir)) {
    return [];
  }

  return fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const name = entry.name;
      const compPath = path.join(componentsDir, name);
      const scssFile = path.join(compPath, `${name}.scss`);
      const jsFile = path.join(compPath, `${name}.js`);
      const htmlFile = path.join(compPath, `${name}.html`);

      return {
        name,
        path: compPath,
        hasScss: fs.existsSync(scssFile),
        hasJs: fs.existsSync(jsFile),
        hasHtml: fs.existsSync(htmlFile),
        scssPath: fs.existsSync(scssFile) ? scssFile : null,
        jsPath: fs.existsSync(jsFile) ? jsFile : null,
        htmlPath: fs.existsSync(htmlFile) ? htmlFile : null,
      };
    });
}

/**
 * Find which component a file belongs to.
 * @param {string} filePath - Absolute path to changed file
 * @param {string} componentsDir - Absolute path to components directory
 * @returns {Component|null}
 */
export function findComponentByFile(filePath, componentsDir) {
  const rel = path.relative(componentsDir, filePath);
  const topLevelDir = rel.split(path.sep)[0];
  const components = discoverComponents(componentsDir);
  return components.find((c) => c.name === topLevelDir) || null;
}

/**
 * Get all component SCSS entry points.
 * @param {string} componentsDir
 * @returns {string[]}
 */
export function getComponentScssEntries(componentsDir) {
  return discoverComponents(componentsDir)
    .filter((c) => c.hasScss)
    .map((c) => c.scssPath);
}

/**
 * Get all component JS entry points.
 * @param {string} componentsDir
 * @returns {string[]}
 */
export function getComponentJsEntries(componentsDir) {
  return discoverComponents(componentsDir)
    .filter((c) => c.hasJs)
    .map((c) => c.jsPath);
}

/**
 * Get all component HTML files.
 * @param {string} componentsDir
 * @returns {string[]}
 */
export function getComponentHtmlFiles(componentsDir) {
  return discoverComponents(componentsDir)
    .filter((c) => c.hasHtml)
    .map((c) => c.htmlPath);
}
