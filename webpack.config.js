const { resolve } = require('path');
const webpack = require('webpack');
const locale = process.env.WP_LOCALE;
const locales = require('./bin/locales');
const packageJson = require('./package.json');

const c3poConfig = {
  extract: { output: 'src/translations.pot' },
};
if (locale) {
  c3poConfig.resolve = {
    translations: `src/translations/accessibility-cloud.js-widget/${locale}.po`,
  };
}

const config = {
  context: resolve(__dirname, 'src'),

  entry: [
    './index.js',
    // the entry point of our app
  ],
  output: {
    filename: `accessibility.cloud${locale ? `.${locale}` : ''}.min.js`,
    // library: 'AccessibilityCloud',
    // libraryTarget: 'umd',

    // the output bundle

    path: resolve(__dirname, 'dist'),

    publicPath: '/',
    // necessary for HMR to know where to load the hot update chunks
  },

  resolve: {
    alias: {
      // react: 'react-lite',
      // 'react-dom': 'react-lite',
      'c-3po': locale ? 'c-3po/dist/mock' : 'c-3po',
    },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [['c-3po', c3poConfig]],
          },
        },
        // exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        WP_LOCALE: locale ? `'${locale}'` : 'undefined',
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      PACKAGE_VERSION: `'${packageJson.version}'`,
    }),

  ],
};

if (process.env.NODE_ENV === 'production') {
  config.plugins = config.plugins.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ]);
}

if (process.env.NODE_ENV === 'development') {
  Object.assign(config, {
    devtool: 'inline-source-map',

    devServer: {
      hot: true,
      // enable HMR on the server

      contentBase: resolve(__dirname, 'dist'),
      // match the output path

      publicPath: '/',
      // match the output `publicPath`
    },
  });

  config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally
    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates
  ]);
  config.entry = [
    'react-hot-loader/patch',
    // activate HMR for React

    'webpack-dev-server/client?http://localhost:8080',
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint

    'webpack/hot/only-dev-server',
    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates
  ].concat(config.entry);
}


module.exports = config;
