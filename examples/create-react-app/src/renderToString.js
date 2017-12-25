import fs from 'fs'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import env from 'react-scripts/config/env'
import escapeStringRegexp from 'escape-string-regexp'
import { StaticNavigation } from 'junctions'

let templatePath = path.resolve(__dirname, '..', 'public/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

let assetManifestPath = path.resolve(__dirname, '..', 'build/asset-manifest.json')
let assetManifest = require(assetManifestPath)

export default async function renderToString({ junction, location, dependencies, meta={} }) {
  let pageEnv = Object.assign({}, env)

  // TODO: set this the same way that create-react-app does
  if (!pageEnv.PUBLIC_URL) {
    pageEnv.PUBLIC_URL = ''
  }
  
  // Add any meta keys that are prefixed with "page" to template variables
  let metaKeys = Object.keys(meta)
  for (let key of metaKeys) {
    if (/^page[A-Z]/.test(key)) {
      pageEnv[key] = meta[key]
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
  let nav = new StaticNavigation({
    initialLocation: location,
    rootJunction: junction,
  })
  let state = await nav.getFirstCompleteState()

  // Render the page content using React
  let content = ReactDOMServer.renderToString(
    React.createElement(state.meta.wrapper, { nav: state }),
  )

  // Inject main css file
  if (assetManifest['main.css']) {
    html = html.replace('</head>', `<link rel="stylesheet" type="text/css" href="/${assetManifest['main.css']}" />`)
  }

  // Inject rendered content
  html = html.replace('<div id="root">', '<div id="root">'+content)

  // Create script tags for this page's dependencies
  let scriptPaths = ['/'+assetManifest['main.js']].concat(dependencies)
  let scriptTags = scriptPaths.map(path => `<script src="${path}"></script>`).join('')

  // Once all the dependencies have loaded, call `main`
  html = html.replace('</body>', `${scriptTags}<script>window.main({ isStatic: true })</script>`)

  return html
}
