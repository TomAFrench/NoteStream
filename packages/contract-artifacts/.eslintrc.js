module.exports = {
  "extends": [
      '../../.eslintrc.js',
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    "env": {
        "es6": true,
        "browser": true
    },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "project": "./tsconfig.json",
      "tsconfigRootDir": __dirname,
      "sourceType": "module"
  },
  "plugins": [
      "@typescript-eslint",
  ],
  "rules": {
      "import/extensions": [
          "error",
          "ignorePackages",
          {
            "js": "never",
            "ts": "never"
          }
      ]
  },                                                            
  "settings": {
      'import/resolver': {
          node: {
              extensions: ['.js', '.ts']
          },
      },
  }
};
