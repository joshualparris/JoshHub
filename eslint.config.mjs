import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // 0) Global ignores
  {
    ignores: [
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/games/**', // big bundled JS
      'eslint.config.mjs', // don't lint this config file
    ],
  },

  // 1) Base JS rules
  js.configs.recommended,

  // 2) TypeScript (non-typed) rules
  ...tseslint.configs.recommended,

  // 3) Project-wide rules/plugins
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // React hooks basics
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Disable this noisy rule
      'react-hooks/set-state-in-effect': 'off',

      // TS noise → warnings only
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
);
