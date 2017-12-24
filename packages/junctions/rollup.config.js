/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const config = {
  input: 'dist/umd-intermediate/index.js',
  plugins: []
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd' }
  config.name = 'Junctions'
  config.plugins.push(
    nodeResolve({
      jsnext: true
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