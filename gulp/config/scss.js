/**
 * @file gulp/config/scss.js
 * @description SCSS compilation options.
 */

export const scss = {
  loadPaths: [],
  outputStyle: 'expanded',
  silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
  autoprefixer: {
    cascade: false,
  },
  cleanCss: {
    level: 2,
  },
};
