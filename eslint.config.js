import { eslint } from 'config-aeryle'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...eslint.typescript, //
  ...eslint.prettier,

  // eslint-plugin-import
  ...eslint.commonjs,
  ...eslint.esm,
  ...eslint.imports,

  // Ignore files
  eslint.ignores.base, // node_modules, .DS_Store
  eslint.ignores.env, // Environment files
  eslint.ignores.svelte, // SvelteKit
  ...eslint.ignores.packageManagers, // NPM, Pnpm, Yarn, Bun
  {
    ignores: ['builds/'],
  },
]
