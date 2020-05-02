module.exports = {
  extends: [
    'airbnb-typescript/base',
    'plugin:jest/recommended',
    'plugin:security/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
    'security',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'object-shorthand' : 0,
  }
};