/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint import/no-extraneous-dependencies:0 */

const webpack = require('webpack');
const nib = require('nib');
const path = require('path');
const packageJson = require('./package.json');
const locale = process.env.WP_LOCALE;
const locales = require('./bin/locales');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const c3poConfig = {
  extract: { output: 'dist/translations.pot' },
  resolve: locale ? { locale } : null,
  locales,
};


const config = {
  context: __dirname,
  entry: [
    './app/accessibility.cloud.js',
  ],
  output: {
    filename: `accessibility.cloud${locale ? `.${locale}` : ''}.min.js`,
    path: path.join(__dirname, '/public'),
    library: 'accessibility.cloud',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.woff$/,
        use: {
          loader: 'url',
          options: {
            name: 'font/[hash].[ext]',
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      {
        test: /\.styl$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'stylus-loader',
            options: {
              use: [nib()],
              preferPathResolver: 'webpack',
              import: ['~nib/lib/nib/index.styl'],
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   plugins: [['c-3po', c3poConfig]],
          // },
        },
      },
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname, 'node_modules'),
      __dirname,
    ],
    extensions: ['.js', '.jsx', '.json', '.styl', '.woff'],
    // alias: {
    //   react: 'react-lite',
    //   'react-dom': 'react-lite',
    // },
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'main.css', allChunks: true }),
    new webpack.DefinePlugin({
      'process.env': {
        WP_LOCALE: locale ? `'${locale}'` : 'undefined',
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      PACKAGE_VERSION: `'${packageJson.version}'`,
    }),
    // new BundleAnalyzerPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    publicPath: '/public/',
    index: '/public/',
    inline: true,
    hot: true,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.plugins = config.plugins.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ]);
}

module.exports = config;
