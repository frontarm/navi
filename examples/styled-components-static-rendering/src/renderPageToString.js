import { createMemoryNavigation } from 'navi'
import { renderCreateReactAppTemplate } from 'react-navi/create-react-app'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { NaviProvider, View } from 'react-navi'

async function renderPageToString({ config, exports={}, routes, dependencies, url }) {
  let canonicalURLBase = process.env.CANONICAL_URL || process.env.PUBLIC_URL || ''

  // Create an in-memory Navigation object with the given URL
  let navigation = createMemoryNavigation({
    routes,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  let route = await navigation.getSteadyValue()

  // react-helmet thinks it's in a browser because of JSDOM, so we need to
  // manually let it know that we're doing static rendering.
  Helmet.canUseDOM = false

  // styled-components thinks it's in a browser because of JSDOM,
  // so let it know that it's not in a browser.
  exports.StyleSheet.reset(true)

  let sheet = new exports.ServerStyleSheet()

  // Render the content
  let bodyHTML =
    ReactDOMServer.renderToString(
      sheet.collectStyles(
        React.createElement(
          NaviProvider,
          { navigation }, 
          React.createElement(exports.App || View)
        )
      )
    )

  let styleTags = sheet.getStyleTags()

  // This must be called after rendering the app, as stylesheet tags are
  // captured as they're imported
  let stylesheetTags = Array.from(dependencies.stylesheets)
    .map(pathname => `<link rel="stylesheet" href="${pathname}" />`)
    .join('')
  
  // Generate page head
  let helmet = Helmet.renderStatic();
  let metaHTML = `
    ${helmet.title && helmet.title.toString() || "<title>"+route.title+"</title>"}
    ${helmet.meta && helmet.meta.toString()}
    ${helmet.link && helmet.link.toString()}
  `
  
  // This loads the react-scripts generated index.html file, and injects
  // our content into it
  return renderCreateReactAppTemplate({
    config,
    insertIntoRootDiv: bodyHTML,
    replaceTitleWith:
      `<link rel="canonical" href="${canonicalURLBase+url.href}" />\n`+
      metaHTML+
      stylesheetTags+
      styleTags,
  })
}

export default renderPageToString