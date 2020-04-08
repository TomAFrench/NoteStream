module.exports = {
  "env": {
      "es6": true,
  },
  "extends": [
      'eslint:recommended',
      "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  "ignorePatterns": [],
  "rules": {
      "no-console": "off",
      "import/extensions": [
          "error",
          "ignorePackages",
          {
            "js": "never",
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
  "overrides": [
    {
      "files": ["**/*.ts"],
      "env": { "browser": true, "es6": true, "node": true },
      "extends": [
        'eslint:recommended',
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
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
      "eqeqeq": "off",
      "import/prefer-default-export": "off",
      "import/extensions": [
          "error",
          "ignorePackages",
          {
            "ts": "never",
          }
      ],
      "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.ts"]}]
  }, 
    }
  ]
};
