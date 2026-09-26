import css from '@eslint/css';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import astro from 'eslint-plugin-astro';
import checkFile from 'eslint-plugin-check-file';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import {
  ASTRO_NAMING_CONVENTION,
  COMPONENT_GROUPS,
  CSP_SAFE_TEMPLATE,
  CSS_LAYER_ORDER,
  GSAP_ENTRY_POINT,
  INLINE_REDIRECT_COMPONENT,
  JSON_LD_COMPONENT,
  MAX_LINES,
  NAMING_CONVENTION,
  NO_HARDCODED_TEXT,
  NO_INLINE_SCRIPT,
  RAW_COLORS,
  TEMPLATE_LOGIC,
} from './tooling/eslint/conventions.js';
import local from './tooling/eslint/local-plugin.js';

const CODE_FILES = ['**/*.{js,ts,astro}'];
const TEMPLATE_RULES = [...CSP_SAFE_TEMPLATE, ...NO_HARDCODED_TEXT, ...TEMPLATE_LOGIC];

export default defineConfig(
  globalIgnores(['dist/', '.astro/', 'public/']),
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  {
    files: ['**/*.{js,ts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.astro'],
    extends: [js.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  },
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],
  {
    files: CODE_FILES,
    rules: {
      'max-lines': ['error', { max: MAX_LINES, skipBlankLines: true, skipComments: true }],
      'no-inline-comments': 'error',
      'no-warning-comments': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/naming-convention': ['error', ...NAMING_CONVENTION],
    },
  },
  {
    files: ['tooling/eslint/**/*.js'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        ...NAMING_CONVENTION,
        { selector: 'objectLiteralMethod', format: ['camelCase', 'PascalCase'] },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,astro}'],
    ignores: ['src/lib/motion/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [GSAP_ENTRY_POINT] }],
    },
  },
  {
    files: ['src/**/*.{ts,astro}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.{js,ts}', 'tooling/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/**/*.{js,ts}'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unsafe-inline-scripts': 'error',
      'astro/prefer-class-list-directive': 'error',
      '@typescript-eslint/naming-convention': ['error', ...ASTRO_NAMING_CONVENTION],
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
      'no-restricted-syntax': ['error', ...TEMPLATE_RULES, NO_INLINE_SCRIPT],
    },
  },
  {
    files: [INLINE_REDIRECT_COMPONENT],
    rules: {
      'astro/no-set-html-directive': 'off',
      'astro/no-unsafe-inline-scripts': 'off',
      'no-restricted-syntax': ['error', ...TEMPLATE_RULES],
    },
  },
  {
    files: [JSON_LD_COMPONENT],
    rules: { 'astro/no-set-html-directive': 'off' },
  },
  {
    files: ['**/*.css'],
    plugins: { css, local },
    language: 'css/css',
    extends: [css.configs.recommended],
    rules: {
      'css/no-invalid-properties': ['error', { allowUnknownVariables: true }],
      'css/use-baseline': ['error', { available: 2024, allowSelectors: ['selection'] }],
      'css/use-layers': ['error', { requireImportLayers: false }],
      'css/prefer-logical-properties': 'error',
      'local/max-css-lines': ['error', { max: MAX_LINES }],
    },
  },
  {
    files: ['**/*.css'],
    ignores: ['src/styles/tokens.css'],
    rules: {
      'no-restricted-syntax': ['error', ...RAW_COLORS],
    },
  },
  {
    files: ['src/components/**/*.css', 'src/layouts/**/*.css', 'src/styles/global.css'],
    plugins: { local },
    rules: {
      'local/css-layer-order': ['error', { order: CSS_LAYER_ORDER }],
    },
  },
  {
    files: ['src/**/*.{ts,astro,css}', 'tooling/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
    ignores: ['src/pages/**'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/components/*/*/*.{astro,css,ts}': '<1>',
          'src/layouts/*/*.{astro,css,ts}': '<0>',
          'src/!(components|layouts)/**/*.{ts,css}': 'KEBAB_CASE',
          'tooling/**/*.{js,ts}': 'KEBAB_CASE',
          'scripts/**/*.{js,ts}': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/components/*/*/': 'PASCAL_CASE',
          'src/layouts/*/': 'PASCAL_CASE',
          'src/!(components|layouts|pages)/**/': 'KEBAB_CASE',
          'tooling/**/': 'KEBAB_CASE',
        },
        { ignoreWords: COMPONENT_GROUPS },
      ],
    },
  },
  {
    files: CODE_FILES,
    extends: [prettier],
  },
);
