import * as Navi from "navi";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { NavProvider } from "react-navi";
import { renderCreateReactAppTemplate } from "react-navi/create-react-app";

export default async function renderPageToString({
  config,

  // The `exports` object passed to `Navi.app()`
  exports: { App, Helmet },
  
  // The `pages` switch passed to `Navi.app()`
  pages,

  // The URL to be rendered
  url,
}) {
  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({ pages, url })

  // Wait for any asynchronous content to finish fetching
  await navigation.steady()

  // Navi simulates a DOM using jsdom, so we'll need to manually tell
  // react-helmet that we're not in a browser.
  Helmet.canUseDOM = false

  // Render the `<App />` component, wrapped in a `<NavProvider>` that
  // configures the app's navigation object.
  let appHTML = ReactDOMServer.renderToString(
    React.createElement(
      NavProvider,
      { navigation },
      React.createElement(App)
    )
  )

  // Generate metadata 
  let helmet = Helmet.renderStatic();
  let metaHTML = `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
  `

  // Read the `index.html` produced by create-react-app's build script, then
  // inject `appHTML` into the `<div id="root"></div>` tag, and replace the
  // `<title>` tag with `metaHTML`.
  return renderCreateReactAppTemplate({
    config,
    insertIntoRootDiv: appHTML,
    replaceTitleWith: metaHTML,
  })
}