/**
 * General utility helpers.
 */

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function on(el, event, handler, options) {
  if (typeof el === 'string') el = qs(el);
  if (el) el.addEventListener(event, handler, options);
}
