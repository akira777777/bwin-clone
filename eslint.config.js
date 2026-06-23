import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.remember', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Ban console.log - use logger instead
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prefer const over let when possible
      'prefer-const': 'error',

      // No unused variables
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // No any types
      '@typescript-eslint/no-explicit-any': 'warn',

      // Require explicit return types for public functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Allow non-null assertions when necessary
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Ensure React hooks dependencies are correct
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Prevent missing React key prop
      'react/jsx-key': 'error',

      // Prevent unused JSX variables
      'react/jsx-no-useless-fragment': 'warn',
    },
  },
  {
    // Test files - allow console and relaxed rules
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
