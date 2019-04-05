# Add meta tag to HTML file

## About

## Installation

`npm install --save-dev clean-webpack-plugin`

## Usage

```js
const MetaHtmlWebpackPlugin = require('meta-html-webpack-plugin');

const webpackConfig = {
  plugins: [
    new MetaHtmlWebpackPlugin(),
  ],
};

module.exports = webpackConfig;
```

## Example Webpack Config

```js
const CleanWebpackPlugin = require('clean-webpack-plugin'); // installed via npm
const HtmlWebpackPlugin = require('html-webpack-plugin'); // installed via npm
const MetaHtmlWebpackPlugin = require('meta-html-webpack-plugin'); // installed via npm
const webpack = require('webpack'); // to access built-in plugins
const path = require('path');

module.exports = {
    entry: './path/to/my/entry/file.js',
    output: {
        /**
         * With zero configuration,
         */
        path: path.resolve(process.cwd(), 'dist'),
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            loader: 'babel-loader',
        }, ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new MetaHtmlWebpackPlugin()
    ],
};
```
