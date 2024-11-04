import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'sveltekit-adapter-chrome-extension';

const buildMode = process.env.BUILD_MODE;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: `builds/${buildMode}`,
      assets: `builds/${buildMode}`,
      fallback: null,
      precompress: false,
      manifest: `manifest_${buildMode}.json`,
    }),
    appDir: 'app',
    alias: {
      $utils: 'src/lib/utils',
      $ui: 'src/lib/components/ui',
    },
  },
};

export default config;
