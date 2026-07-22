/**
 * @file gulp/utils/logger.js
 * @description Beautiful terminal logging with colors and timing.
 */

import log from 'fancy-log';
import chalk from 'chalk';

const timers = new Map();

/**
 * Start a named timer.
 * @param {string} name
 */
export function timerStart(name) {
  timers.set(name, Date.now());
}

/**
 * Get elapsed time for a named timer.
 * @param {string} name
 * @returns {string} Formatted time string
 */
export function timerEnd(name) {
  const start = timers.get(name);
  if (!start) return '0ms';
  const elapsed = Date.now() - start;
  timers.delete(name);
  return elapsed < 1000 ? `${elapsed}ms` : `${(elapsed / 1000).toFixed(2)}s`;
}

/**
 * Log a styled info message.
 * @param {string} task - Task name
 * @param {string} message
 */
export function info(task, message) {
  log(`${chalk.cyan(`[${task}]`)} ${message}`);
}

/**
 * Log a success message.
 * @param {string} task
 * @param {string} message
 */
export function success(task, message) {
  log(`${chalk.green(`[${task}]`)} ${message}`);
}

/**
 * Log a warning message.
 * @param {string} task
 * @param {string} message
 */
export function warn(task, message) {
  log(`${chalk.yellow(`[${task}]`)} ${message}`);
}

/**
 * Log an error message.
 * @param {string} task
 * @param {string} message
 */
export function error(task, message) {
  log(`${chalk.red(`[${task}]`)} ${message}`);
}

/**
 * Log build completion with file count and time.
 * @param {string} task
 * @param {number} count - Number of files processed
 * @param {string} time - Elapsed time
 */
export function buildComplete(task, count, time) {
  log(
    `${chalk.green(`[${task}]`)} ${chalk.bold(`${count} files`)} built in ${chalk.cyan(time)}`
  );
}

/**
 * Log a component rebuild notification.
 * @param {string} componentName
 * @param {string} type - 'css' | 'js' | 'html'
 */
export function componentRebuild(componentName, type) {
  const color = type === 'css' ? chalk.magenta : type === 'js' ? chalk.blue : chalk.cyan;
  log(`${color(`[${type.toUpperCase()}]`)} Component ${chalk.bold(componentName)} rebuilt`);
}
