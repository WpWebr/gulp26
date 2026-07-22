/**
 * @file gulp/config/js.js
 * @description esbuild JavaScript bundling options.
 */

export const js = {
  target: 'es2020',
  format: 'esm',
  platform: 'browser',
  splitting: false,
  chunkNames: 'chunks/[name]-[hash]',
  loader: {
    '.js': 'js',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
  },
};
