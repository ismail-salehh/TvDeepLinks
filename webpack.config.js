const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// LG webOS 22 runs Chromium 87.
const WEBOS_22_TARGET = 'chrome 87';

module.exports = (_env, argv) => ({
  entry: path.resolve(__dirname, 'index.web.js'),
  target: ['web', 'es2017'],
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: 'bundle.[contenthash].js',
    // webOS loads apps from file://, so assets must be relative.
    publicPath: '',
    clean: true,
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  resolve: {
    alias: { 'react-native$': 'react-native-web' },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              ['@babel/preset-env', { targets: WEBOS_22_TARGET }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'web/index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, 'webos') }],
    }),
  ],
  devServer: { port: 9090, hot: true },
});
