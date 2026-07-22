/**
 * @file gulp/config/html.js
 * @description HTML processing options.
 */

export const html = {
  fileInclude: {
    prefix: '@@',
    basepath: '@root',
  },
  minify: {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
  },
  pretty: {
    indentSize: 2,
    indentChar: ' ',
  },
};
