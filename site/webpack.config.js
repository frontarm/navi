const path = require('path')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')

const PROD = process.env.NODE_ENV === 'production'

module.exports = {
  devtool: 'source-map',

  entry: {
    app: path.join(__dirname, 'index.js'),
    vendor: [ 'react', 'react-dom' ],
  },

  output: {
    path: path.join(__dirname, 'build'),
    filename: `bundle-[chunkHash].js`,
    chunkFileName: `[name]-[chunkHash].js`,
    publicPath: '/',
  },

  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
    new webpack.optimize.CommonsChunkPlugin('vendor', `vendor-[chunkHash].js`),
    new HTMLWebpackPlugin({ template: 'index.html' })
  ].concat(PROD ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ] : []),

  resolve: {
    alias: {
      junctions: path.join(__dirname, '..'),
      sitepack: path.resolve(__dirname, 'Sitepack.js'),
    },
    modulesDirectories: [path.resolve(__dirname, "node_modules")],
  },

  resolveLoader: {
    modulesDirectories: [path.resolve(__dirname, 'loaders'), path.resolve(__dirname, "node_modules"), path.resolve(__dirname, "..", "node_modules")],
  },

  module: {
    loaders: [
      { test: /SITE\.js$/,
        loader: 'sitepack?site!babel',
      },
      { test: /\.example\.js$/,
        loader: 'sitepack!module-and-source',
      },
      { test: /\.js$/,
        exclude: /node_modules|\.example\.js|\.SITE\.js$/,
        loader: 'babel'
      },
      { test: /\.css$/,
        loader: 'style!css'
      },
      { test: /\.less$/,
        loader: 'style!css!less'
      },
      { test: /\.md$/,
        loader: 'sitepack?preload!markdown'
      },
      { test: /\.(gif|jpe?g|png|ico)$/,
        loader: 'url?limit=10000'
      }
    ]
  },

  sitepack: {
    root: path.resolve(__dirname, '..'),
  },

  devServer: {
    historyApiFallback: true,
    quiet: false,
    noInfo: false,
    stats: {
      assets: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: true
    }
  }
}
