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
    // Overriding restricted syntax rule to remove for of from the blacklist
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  }
};