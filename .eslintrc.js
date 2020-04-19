module.exports = {
  extends: [
    'airbnb-typescript/base',
    'plugin:jest/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
};