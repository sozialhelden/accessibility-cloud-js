/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */

const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const path = require('path');

const locale = process.env.WP_LOCALE;

const locales = require('./bin/locales');

const c3poConfig = {
  extract: { output: 'dist/translations.pot' },
  resolve: locale ? { locale } : null,
  locales,
};

const babelConfig = {
  env: {
    production: {
      presets: ['babili'],
    },
  },
  plugins: [['c-3po', c3poConfig]],
};

const config = {
  entry: [
    './accessibility.cloud.js',
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: babelConfig,
      },
    ],
  },
  output: {
    filename: `dist/accessibility.cloud${locale ? `.${locale}` : ''}.min.js`,
    library: 'accessibility.cloud',
    libraryTarget: 'umd',
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
        WP_LOCALE: locale ? `'${locale}'` : 'undefined',
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
