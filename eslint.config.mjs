import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

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
      'public/portal-adapter.js', // ignore legacy client-side JS
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

  // 3b) Layer hierarchy (P14)
  //
  // The intended direction, defined in docs/code-audit/CONFORMANCE.md:
  //
  //     app  →  features  →  components  →  lib  →  data
  //
  // `components` is presentation only and must not reach into `features`;
  // `lib` and `data` must never import UI. Before this rule existed the graph
  // had a cycle — components/platform/* imports features/platform, while
  // features/* imports components/ui (finding XC-03).
  //
  // Set to 'warn' rather than 'error' until XC-03 is fixed, so the rule can
  // land without breaking the build. Promote to 'error' the moment that
  // finding closes — see TRIAGE.md item 25.
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: { import: importPlugin },
    // Imports use the `@/*` alias from tsconfig. Without this resolver the
    // rule silently matches nothing, because it cannot turn `@/features/x`
    // into a path to compare against the zones below.
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'warn',
        {
          basePath: 'src',
          zones: [
            {
              target: './components',
              from: './features',
              message:
                'components is presentation-only and must not import from features. Move the component into the feature instead (P14, XC-03).',
            },
            {
              target: './lib',
              from: './components',
              message: 'lib must not import UI (P14).',
            },
            {
              target: './lib',
              from: './app',
              message: 'lib must not import UI (P14).',
            },
            {
              target: './data',
              from: './lib',
              message: 'data is static and must import nothing (P14).',
            },
          ],
        },
      ],
    },
  },

  // 4) Node scripts
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
