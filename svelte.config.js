import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const buildMode = process.env.BUILD_MODE;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    appDir: 'app',
    alias: {
      $utils: 'src/lib/utils',
      $ui: 'src/lib/components/ui',
    },
  },
};

export default config;
