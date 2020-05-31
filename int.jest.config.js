module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/integration-test/',
  ],
  testMatch: [
    '**/**/*.steps.ts',
  ],
  coverageReporters: [
    'text',
    'html',
    'lcov',
  ],
  coverageDirectory: 'integrationcoverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 85,
      statements: 85,
    },
  },
};
