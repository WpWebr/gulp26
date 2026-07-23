/**
 * @file gulp/utils/i18n.js
 * @description Internationalization module. Loads translation files and provides t() function.
 *
 * Language can be set via:
 *   1. LANGUAGE env var (highest priority)
 *   2. gulp.config.js → language.language
 *   3. Default: 'en'
 *
 * Adding a new language:
 *   1. Copy gulp/i18n/en.json to gulp/i18n/<code>.json
 *   2. Translate all values
 *   3. Set LANGUAGE=<code> or add to gulp.config.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const I18N_DIR = path.resolve(__dirname, '../i18n');

/** @type {Record<string, any>} */
let translations = {};

/** @type {string} */
let currentLanguage = 'en';

/**
 * Read the language from gulp.config.js if available.
 * @returns {string|undefined}
 */
function getConfigLanguage() {
  try {
    const configPath = path.resolve(__dirname, '../../gulp.config.js');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const match = content.match(/language:\s*['"]([^'"]+)['"]/);
      if (match) return match[1];
    }
  } catch {}
  return undefined;
}

/**
 * Detect the active language from env or config.
 * @returns {string}
 */
function detectLanguage() {
  if (process.env.LANGUAGE) return process.env.LANGUAGE;
  return getConfigLanguage() || 'en';
}

/**
 * Load translations for a given language code.
 * Falls back to English if the requested language file doesn't exist.
 * @param {string} lang
 */
function loadLanguage(lang) {
  const filePath = path.join(I18N_DIR, `${lang}.json`);

  if (fs.existsSync(filePath)) {
    translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    currentLanguage = lang;
  } else {
    // Fallback to English
    const fallbackPath = path.join(I18N_DIR, 'en.json');
    if (fs.existsSync(fallbackPath)) {
      translations = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      currentLanguage = 'en';
    }
  }
}

/**
 * Get a translated string by dot-separated key.
 * Supports interpolation with {{variable}} placeholders.
 *
 * @param {string} key - Dot path, e.g. 'styles.compiling'
 * @param {Record<string, string>} [vars] - Interpolation variables
 * @returns {string}
 *
 * @example
 * t('styles.bundle_done')              // "Styles bundle"
 * t('common.built_in', { time: '12ms' }) // "built in 12ms"
 */
export function t(key, vars = {}) {
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found — return the key itself as fallback
      return key;
    }
  }

  if (typeof value !== 'string') return key;

  // Interpolate {{var}} placeholders
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`);
}

/**
 * Get the current language code.
 * @returns {string}
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Switch language at runtime.
 * @param {string} lang
 */
export function setLanguage(lang) {
  loadLanguage(lang);
}

/**
 * Initialize i18n. Call once at startup.
 */
export function initI18n() {
  loadLanguage(detectLanguage());
}

/**
 * List all available language codes.
 * @returns {string[]}
 */
export function listLanguages() {
  if (!fs.existsSync(I18N_DIR)) return [];
  return fs
    .readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

// Auto-initialize on import
initI18n();
