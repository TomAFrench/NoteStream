module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
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
  },
};
