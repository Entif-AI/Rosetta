import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'apps/rosetta-operator/react-router.config.ts',
      'apps/rosetta-operator/tests/**',
      'apps/rosetta-operator/vite.config.ts',
      'apps/rosetta-operator/build/**',
      'apps/rosetta-operator/dist/**',
      'apps/rosetta-cli/dist/**',
      'apps/rosetta-api/dist/**',
      'apps/entif-site/.astro/**',
      'apps/entif-site/dist/**',
      'apps/entif-site/playwright-report/**',
      'apps/entif-site/test-results/**',
      '.nx/**',
      'coverage/**',
      'node_modules/**',
      'packages/**/dist/**',
      'tmp/**',
      '**/tmp/**',
      'vitest.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  ...eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['apps/entif-site/**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['apps/entif-site/tests/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...[
          'getByText',
          'getAllByText',
          'queryByText',
          'queryAllByText',
          'findByText',
          'findAllByText',
          'getByRole',
          'getAllByRole',
          'queryByRole',
          'queryAllByRole',
          'findByRole',
          'findAllByRole',
          'getByLabelText',
          'getAllByLabelText',
          'queryByLabelText',
          'queryAllByLabelText',
          'findByLabelText',
          'findAllByLabelText',
          'getByPlaceholderText',
          'queryByPlaceholderText',
          'findByPlaceholderText',
          'getByAltText',
          'queryByAltText',
          'findByAltText',
          'getByTitle',
          'queryByTitle',
          'findByTitle',
        ].map((property) => ({
          property,
          message:
            'Locate project-owned UI through a stable data-test-id contract instead of user-facing or accessibility text.',
        })),
      ],
    },
  },
  {
    files: ['apps/entif-site/**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
    },
  }
);
