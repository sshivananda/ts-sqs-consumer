module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
  ],
  coverageReporters: [
    'text',
    'html',
    'lcov',
  ],
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 38,
      lines: 57,
      statements: 57,
    },
  },
};
