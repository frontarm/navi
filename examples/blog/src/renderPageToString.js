import * as Navi from 'navi'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { renderCreateReactAppTemplate } from 'react-navi/create-react-app'
import renderRSSFeedToString from './renderRSSFeedToString'

/**
 * navi-scripts will call this function for each of your site's pages
 * to produce its statically rendered HTML.
 */
async function renderPageToString({
  // The URL to be rendered
  url,

  // The `exports` object passed to the call to `Navi.app()` in index.js
  exports,

  // Sets of JavaScript and CSS files that were used while rendering this
  // page
  dependencies,
  
  // The `pages` switch passed to the call to `Navi.app()` in index.js
  pages,
}) {
  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({
    pages,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  let { route } = await navigation.getSteadyValue()

  // The feed is a special case
  if (url.pathname === '/rss') {
    return await renderRSSFeedToString(route.content)
  }

  // Render the <App> element to a string, passing in `navigation` as a prop
  let appHTML = ReactDOMServer.renderToString(
    React.createElement(exports.App, { navigation })
  )

  // Add any stylesheets that were loaded to this page to the head, to avoid
  // a flash of unstyled content on load
  let stylesheetTags = Array.from(dependencies.stylesheets)
    .map(pathname => `<link rel="stylesheet" href="${pathname}" />`)
    .join('')

  let canonicalURLBase = process.env.CANONICAL_URL || process.env.PUBLIC_URL || ''
  let headHTML = `
    <title>${route.title || 'Untitled'}</title>
    <link rel="canonical" href="${canonicalURLBase+url.href}" />
    ${stylesheetTags}
  `

  // If a page has a `meta.head` property, it will be assumed to be a React
  // element, and will be rendered and added to the page head.
  if (route.meta.head) {
    if (!React.isValidElement(route.meta.head)) {
      console.error(`The page at "${route.url.href}" had a "meta.head" property, but it wasn't a React element. To add elements to a page's <head>, "meta.head" must be a React element.`)
    }
    else {
      headHTML += ReactDOMServer.renderToStaticMarkup(route.meta.head)
    }
  }

  // Read the `index.html` produced by create-react-app's build script,
  // then inject `appHTML` into the `<div id="root"></div>` tag,
  // and replace the `<title>` tag with `metaHTML`.
  return renderCreateReactAppTemplate({
    insertIntoRootDiv: appHTML,
    replaceTitleWith: headHTML,
  })
}

export default renderPageToString