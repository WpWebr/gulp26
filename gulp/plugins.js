/**
 * @file gulp/plugins.js
 * @description Centralized plugin imports. Import from here in tasks.
 */

export { default as sourcemaps } from 'gulp-sourcemaps';
export { default as gulpNewer } from 'gulp-newer';
export { default as gulpRename } from 'gulp-rename';
export { default as fileInclude } from 'gulp-file-include';
export { default as browserSync } from 'browser-sync';
export { deleteAsync } from 'del';
