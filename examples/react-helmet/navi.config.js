import * as Navi from 'navi'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { renderCreateReactAppTemplate } from 'react-navi/create-react-app'

export async function renderPageToString({
  // The URL to be rendered
  url,

  // The `exports` object passed to `Navi.app()`
  exports,
  
  // The `pages` switch passed to `Navi.app()`
  pages,

  // An object containing all rendered pages and redirects
  siteMap,
}) {
  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({
    pages,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  await navigation.steady()

  // Navi simulates a DOM using jsdom, so we'll need to manually tell
  // react-helmet that we're not in a browser.
  exports.Helmet.canUseDOM = false

  // Render the <App> element to a string, passing in `navigation` and `siteMap`
  // objects as props
  let appHTML = ReactDOMServer.renderToString(
    React.createElement(exports.App, {
      navigation,
      siteMap,
    })
  )

  // Generate metadata 
  let helmet = exports.Helmet.renderStatic();
  let metaHTML = `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
  `

  // Read the `index.html` produced by create-react-app's build script, then
  // inject `appHTML` into the `<div id="root"></div>` tag, and replace the
  // `<title>` tag with `metaHTML`.
  return renderCreateReactAppTemplate({
    insertIntoRootDiv: appHTML,
    replaceTitleWith: metaHTML,
  })
}