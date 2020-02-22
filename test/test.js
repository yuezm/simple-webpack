const Webpack = require('../index');
const webpackConfig = {
  entry: './entry.js',
  output: './dist/bundle.js',
};

const w = new Webpack(webpackConfig);
w.run();
