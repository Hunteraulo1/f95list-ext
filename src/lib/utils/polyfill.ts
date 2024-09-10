import { dev } from '$app/environment';

const browserAPI = () => {
  if (dev) return;

  return typeof browser === 'undefined' ? chrome : browser;
};

const isFirefox = () => {
  if (dev) return false;

  return typeof browser !== 'undefined';
};

const isChrome = () => {
  if (dev) return false;

  return typeof browser === 'undefined';
};

export { browserAPI, isChrome, isFirefox };
