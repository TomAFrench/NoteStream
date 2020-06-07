module.exports = {
  "env": {
      "es6": true,
  },
  "extends": [
      'eslint:recommended',
      "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  "rules": {
      "no-console": "off",
      "import/prefer-default-export": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          "ts": "never",
        }
    ],
      "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.js"]}]
  },                                                            
  "settings": {
      'import/resolver': {
          node: {
              paths: ["src"],
              extensions: ['.ts']
          },
      },
  },
};
