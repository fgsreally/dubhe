// webpack.config.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { Sub } = require('dubhe-sub/webpack')
const config = require('./dubhe.config')
/** @type {import('webpack').Configuration} */
module.exports = webpackEnv => ({
  mode: webpackEnv,
  devtool: 'source-map',
  entry: './src/index.js',
  experiments: {
    outputModule: true,
  },
  externalsType: 'module',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    library: { type: 'module' },
    environment: { module: true },
  },

  externals: { },
  plugins: [new HtmlWebpackPlugin(), new Sub(config)],
  devServer: {
    hot: true,
    port: '8088',
    // inline: true,
    historyApiFallback: true,
  },
})
