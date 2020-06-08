module.exports = {
  extends: [
    'airbnb-base',
  ],
  parser: 'babel-eslint',
  env: {
    es6: true,
  },
  rules: {
    'max-len': ['error', {
      code: 120,
      ignoreComments: true,
      ignoreTrailingComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
  }
};
