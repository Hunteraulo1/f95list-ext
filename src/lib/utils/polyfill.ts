import { dev } from '$app/environment';

const isFirefox = () => {
  if (dev) return false;

  return typeof browser !== 'undefined';
};

const isChrome = () => {
  if (dev) return false;

  return typeof browser === 'undefined';
};

export { isChrome, isFirefox };
