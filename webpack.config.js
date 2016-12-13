/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */

const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const path = require('path');

const config = {
  entry: [
    './accessibility.cloud.js',
  ],
  output: {
    filename: 'dist/accessibility.cloud.min.js',
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV,
      },
    }),
    new BabiliPlugin({}),
  ],
  devServer: {
    historyApiFallback: true,
    publicPath: '/public/',
    index: '/public/',
    inline: true,
    hot: true,
  },
};

module.exports = config;
