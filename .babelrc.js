const nodeVersion = require("./dev-utils/node-version");

const babelrc = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: nodeVersion
        }
      }
    ]
  ]
};

module.exports = babelrc;
