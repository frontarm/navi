/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV
const config = {
  external: [
    'navi',
    'history',
    'react',
    'react-dom',
  ],
  input: 'dist/umd-intermediate/index.js',
  output: {
    format: 'umd',
    globals: {
      'navi': 'Navi',
      'history': 'History',
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    name: 'ReactNavi',
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
    nodeBuiltins(),

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
  ]
}

if (env === 'production') {
  config.plugins.push(
    terser()
  )
}

export default config