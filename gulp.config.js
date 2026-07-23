/**
 * @file gulp.config.js
 * @description User configuration overrides.
 * Deep-merged with base config. Only override what you need to change.
 */

export default {
  language: {
    language: 'ru',
  },

  modes: {
    css: {
      bundle: true,
      separate: false,
    },
    js: {
      bundle: true,
      separate: false,
      splitting: false,
    },
    html: {
      mode: 'bundle',
    },
    build: 'development',
  },
};
