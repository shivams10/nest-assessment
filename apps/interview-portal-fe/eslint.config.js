import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // React
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript — strict
      '@typescript-eslint/no-explicit-any':           'error',
      '@typescript-eslint/no-unused-vars':            ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports':   ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',

      // General
      'no-console':        ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      'eqeqeq':            ['error', 'always'],
      'no-var':            'error',
      'prefer-const':      'error',
    },
  },
)
