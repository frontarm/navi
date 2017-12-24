import React from 'react'
import ReactDOMServer from 'react-dom/server'
import env from 'react-scripts/config/env'
import App from './App'

export default function renderToString({ junction, location }) {
  // TODO:
  // - add "title" env from meta if available
  // - add any "page_" variables from meta to env
  // - read index.html from the public folder
  // - interpolate any env variables
  // - read scripts/links from the manifest in build/asset-manifest.json
  // - add any scripts/links to index.html
  // - add a call to `main()` to index.html

  return ReactDOMServer.renderToString(
    React.createElement(Application, {
      location: location,
    })
  )
}
