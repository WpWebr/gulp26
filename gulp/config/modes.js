/**
 * @file gulp/config/modes.js
 * @description Build modes and feature toggles.
 */

export const modes = {
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
};
