const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// https://github.com/webpack/webpack-dev-server/issues/1406

module.exports = (env, argv) => ({
  mode: "development",
  output: {
    path: path.join(__dirname, "dist"),
    filename: 'app.bundle.js'
  },
  devtool: 'source-map',
  entry: ['./src/index.js'],
  module: {
      rules: [
        {
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
        }, {
            test: /\.js(x?)$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }, {
            test: /\.html$/,
            exclude: /node_modules/,
            use: {loader: 'html-loader'}
        }
      ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
      ],
    }),
  ],
  devServer: {
    static: __dirname,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  }
});
