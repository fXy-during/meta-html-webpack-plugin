const eslint = {
  extends: "@chrisblossom/eslint-config",
  overrides: [
    {
      files: ["dev-utils/**/*.js", "dev-utils/**/.*.js"],
      parserOptions: {
        sourceType: "script"
      },
      rules: {
        strict: ["error", "safe"],
        "import/no-extraneous-dependencies": "off",
        "node/no-unpublished-require": "off",
        "node/no-unsupported-features/es-builtins": "error",
        "node/no-unsupported-features/es-syntax": "error",
        "node/no-unsupported-features/node-builtins": "error"
      }
    }
  ],
  rules: {
    "filenames/match-exported": 0,
    "class-methods-use-this": 0,
    "no-param-reassign": 1,
    "no-extra-boolean-cast": 0
  }
};

module.exports = eslint;
