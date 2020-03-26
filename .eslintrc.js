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
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
                                         // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "detect", // React version. "detect" automatically picks the version you have installed.
                           // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                           // default to latest and warns if missing
                           // It will default to "detect" in the future
      "flowVersion": "0.53" // Flow version
    },
  }
};
