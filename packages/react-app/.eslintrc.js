module.exports = {
  extends: [
    'airbnb-base',
    "plugin:react/recommended"
  ],
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  rules: {
    'max-len': ['error', {
      code: 100,
      ignoreComments: true,
      ignoreTrailingComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  },
};
