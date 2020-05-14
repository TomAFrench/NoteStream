module.exports = {
  env: {
    es6: true,
    mocha: true,
  },
  extends: [
    "airbnb-base",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["**/*.js"] },
    ],
  },
  overrides: [
    {
      files: ["test/**/*.js"],
      rules: {
        "func-names": "off",
      },
    },
  ],
};
