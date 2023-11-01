const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename:
      process.env.NODE_ENV === 'production'
        ? 'aframe-cursor-teleport-component.min.js'
        : 'aframe-cursor-teleport-component.js'
  },
  externals: {
    // Stubs out `import ... from 'three'` so it returns `import ... from window.THREE` effectively using THREE global variable that is defined by AFRAME.
    three: 'THREE'
  },
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devServer: {
    port: process.env.PORT || 5000,
    hot: false,
    liveReload: true,
    server: {
      type: 'https'
    },
    static: {
      directory: path.resolve(__dirname)
    }
  }
};
