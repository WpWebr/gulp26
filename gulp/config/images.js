/**
 * @file gulp/config/images.js
 * @description Image processing options.
 */

export const images = {
  quality: {
    jpeg: 80,
    webp: 80,
    avif: 70,
  },
  formats: ['webp', 'avif'],
  sizes: [640, 768, 1024, 1280, 1536, 1920],
  skipOnDev: false,
};
