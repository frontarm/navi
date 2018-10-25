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
    'history',
  ],
  globals: {
    'history': 'History',
  },
  input: 'dist/umd-intermediate/index.js',
  plugins: []
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd' }
  config.name = 'Navi'
  config.plugins.push(
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs(),

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