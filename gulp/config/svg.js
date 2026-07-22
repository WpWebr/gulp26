/**
 * @file gulp/config/svg.js
 * @description SVG sprite and optimization options.
 */

export const svg = {
  sprite: {
    mode: {
      symbol: {
        sprite: 'sprite.svg',
        example: false,
      },
    },
    shape: {
      id: {
        generator: 'icon-%s',
      },
    },
  },
  optimize: {
    plugins: [
      { name: 'preset-default' },
      { name: 'removeViewBox', active: false },
    ],
  },
};
