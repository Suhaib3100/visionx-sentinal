module.exports = {
  root: true,
  extends: ['./packages/eslint-config'],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    '*.config.js',
    '*.config.ts',
  ],
};
