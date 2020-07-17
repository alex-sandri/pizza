module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    "import/resolver": "webpack",
  },
  rules: {
    "import/extensions": [
      "error",
      {
        ts: "never",
      },
    ],
  },
};
