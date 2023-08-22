module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin', 'import', '@typescript-eslint'],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: [
    '.parcel-cache/',
    'coverage/',
    'dist/',
    'node_modules/',
    'tsconfig.tsbuildinfo',
    'yarn.lock',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/no-duplicates': 'error',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'index',
          'parent',
          'sibling',
        ],
        'newlines-between': 'always',
      },
    ],
    'no-console': 'warn',
  },
};
