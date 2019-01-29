/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV
const config = {
  external: [
    'history',
  ],
  input: 'dist/umd-intermediate/index.js',
  output: {
    format: 'umd',
    globals: {
      'history': 'History',
    },
    name: 'Navi',
  },
  onwarn: function (warning) {
    // Suppress warning caused by TypeScript classes using "this"
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }
    console.error(warning.message);
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs(),

    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
  config.plugins.push(
    terser()
  )
}

export default config