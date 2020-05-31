module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
  ],
  testMatch: [
    '**/**/*.steps.ts',
  ],
  coverageReporters: [
    'text',
    'html',
    'lcov',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 65,
      lines: 80,
      statements: 80,
    },
  },
};
