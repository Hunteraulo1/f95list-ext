const tsEslint = require('typescript-eslint')

/** @type {import('eslint').Linter.FlatConfig} */
module.exports = tsEslint.config({
  name: 'ignores',
  ignores: [
    '.DS_Store',
    'node_modules',
    'builds',
    '.svelte-kit',
    'package',
    '.env',
    '.env.*',
    '!.env.example',

    // Ignore files for PNPM, NPM and YARN
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
  ],
})
