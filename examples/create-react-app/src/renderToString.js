import fs from 'fs'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import env from 'react-scripts/config/env'
import escapeStringRegexp from 'escape-string-regexp'
import { JunctionManager } from 'junctions'

let templatePath = path.resolve(__dirname, '..', 'public/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

let assetManifestPath = path.resolve(__dirname, '..', 'build/asset-manifest.json')
let assetManifest = require(assetManifestPath)

export default async function renderToString({ junction, location, dependencies, meta={} }) {
  let pageEnv = Object.assign({}, env)

  if (!pageEnv.PUBLIC_URL) {
    pageEnv.PUBLIC_URL = ''
  }

  // Add any "title" key to variables that can be substituted into template
  pageEnv.title = meta.title
  
  // Add any meta keys that are prefixed with "page_" to template variables
  let metaKeys = Object.keys(meta)
  for (let key of metaKeys) {
    if (key.substr(0, 5) === 'page_') {
      pageEnv[key] = meta(key)
    }
  }

  // Interpolate any variables into the template
  let html = template
  Object.keys(pageEnv).forEach(key => {
    let value = pageEnv[key]
    html = html.replace(
      new RegExp('%' + escapeStringRegexp(key) + '%', 'g'),
      value
    )
  })

  // Get the navigation state that corresponds to this page's URL
  let nav = new JunctionManager({
    initialLocation: location,
    rootJunction: junction,
  })
  let state = nav.getState()
  if (nav.isBusy()) {
    await new Promise((resolve) => {
      nav.subscribe((newState, oldState, isBusy) => {
        state = newState
        if (!isBusy) {
          resolve()
        }
      })
    })
  }

  // Render the page content using React
  let content = ReactDOMServer.renderToString(
    React.createElement(state.meta.wrapper, { nav: state }),
  )
  
  // TODO:
  // - add script tags for any dependencies

  if (assetManifest['main.css']) {
    html = html.replace('</head>', `<link rel="stylesheet" type="text/css" href="/${assetManifest['main.css']}" />`)
  }
  html = html.replace('<div id="root">', '<div id="root">'+content)
  if (assetManifest['main.js']) {
    html = html.replace('</body>', `<script src="/${assetManifest['main.js']}"></script><script>window.main()</script>`)
  }

  return html
}
