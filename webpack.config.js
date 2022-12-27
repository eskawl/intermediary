
const { resolve } = require("path");
const babelConfig = require('./babel.config');

module.exports = {
  mode: "production",
  entry: {
    index: [resolve(__dirname, "src/intermediary.js")]
  },
  output: {
    path: resolve(__dirname, "lib"),
    library: "Intermediary",
    libraryTarget: "umd",
    filename: "intermediary.min.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: babelConfig.presets,
          }
        }
      }
    ]
  }
};