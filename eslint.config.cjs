const eslint = require('@eslint/js')
const {
  eslintConfigTypescript,
  eslintConfigCommonJS,
  eslintConfigEsm,
  eslintConfigImport,
  eslintConfigPrettier,
  eslintConfigSvelte,
} = require('config-aeryle/eslint/configs/index.cjs')
const tsEslint = require('typescript-eslint')

const eslintConfigIgnores = require('.eslint/ignores.cjs')

module.exports = tsEslint.config(
  eslint.configs.recommended,
  ...eslintConfigIgnores,
  ...eslintConfigTypescript,
  ...eslintConfigCommonJS,
  ...eslintConfigEsm,
  ...eslintConfigImport,
  ...eslintConfigPrettier,
  ...eslintConfigSvelte
)
