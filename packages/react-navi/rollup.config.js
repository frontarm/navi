/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const config = {
  external: [
    'navi',
    'history',
    'react',
    'react-dom',
  ],
  globals: {
    'navi': 'Navi',
    'history': 'History',
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  input: 'dist/umd-intermediate/index.js',
  plugins: []
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd' }
  config.name = 'ReactNavi'
  config.plugins.push(
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        '../../node_modules/exenv/index.js': [ 'canUseDOM' ]
      }
    }),

    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  )
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config