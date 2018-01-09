import fs from 'fs'
import path from 'path'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOMServer from 'react-dom/server'
import env from 'react-scripts/config/env'
import escapeStringRegexp from 'escape-string-regexp'
import { StaticNavigation } from 'junctions'

let rootDir = process.cwd()

let templatePath = path.resolve(rootDir, 'public/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

let assetManifestPath = path.resolve(rootDir, 'build/asset-manifest.json')
let assetManifest = require(assetManifestPath)

export default async function renderToString({ rootJunctionTemplate, location, dependencies, title, meta={} }) {
  let pageMeta = Object.assign({}, env, meta)

  // TODO: set this the same way that create-react-app does
  if (!pageMeta.PUBLIC_URL) {
    pageMeta.PUBLIC_URL = ''
  }
  
  // Interpolate any meta properties into the template, stringifying them if
  // they're not already strings.
  let html = template
  Object.keys(pageMeta).forEach(key => {
    let pattern = new RegExp('%' + escapeStringRegexp(key) + '%', 'g')
    if (pattern.test(html)) {
      let value = pageMeta[key]
      if (typeof value !== 'string') {
        value = JSON.stringify(value)
      }
      html = html.replace(pattern, value)
    }
  })

  // Interpolate title into the template
  html = html.replace(/%PAGE_TITLE%/g, title)

  // Get the navigation state that corresponds to this page's URL
  let navigation = new StaticNavigation({
    location: location,
    rootJunctionTemplate: rootJunctionTemplate,
  })
  let route = await navigation.getFinalRoute()

  // Render the page content using React
  let content = ReactDOMServer.renderToString(
    React.createElement(NavigationProvider, { navigation: navigation },
      React.createElement(route[0].component, {
        junction: route[0],
        env: {
          navigation: navigation,
          location: location,
        }
      })
    )
  )

  // Inject main css file into HTML
  if (assetManifest['main.css']) {
    html = html.replace('</head>', `<link rel="stylesheet" type="text/css" href="/${assetManifest['main.css']}" />`)
  }

  // Inject rendered content into HTML
  html = html.replace('<div id="root">', '<div id="root">'+content)

  // Create script tags for this page's dependencies
  let scriptPaths = ['/'+assetManifest['main.js']].concat(dependencies)
  let scriptTags = scriptPaths.map(path => `<script src="${path}"></script>`).join('')

  // Once all the dependencies have loaded, call `main`
  html = html.replace('</body>', `${scriptTags}<script>window.ReactApp.main()</script>`)

  return html
}

class NavigationProvider extends React.Component {
  static childContextTypes = {
    navigation: PropTypes.object,
  }

  getChildContext() {
    return {
      navigation: this.props.navigation,
    }
  }

  render() {
    return this.props.children
  }
}