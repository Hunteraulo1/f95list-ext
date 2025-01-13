const browserAPI = () => (typeof browser === 'undefined' ? chrome : browser);

const isFirefox = () => typeof browser !== 'undefined';

const isChrome = () => typeof browser === 'undefined';

export { browserAPI, isChrome, isFirefox };
