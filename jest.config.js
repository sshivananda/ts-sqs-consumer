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
      functions: 30,
      lines: 50,
      statements: 50,
    },
  },
};
