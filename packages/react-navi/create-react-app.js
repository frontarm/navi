const Navi = require('navi')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { Router, View } = require('react-navi')

async function renderCreateReactAppTemplate({
  config,
  replaceTitleWith,
  insertIntoRootDiv,
}) {
  let html = (await config.fs.readFile(config.entry)).toString('utf8')

  // Replace the <title> tag with the contents of `replaceTitle`,
  // allowing the head to be modified.
  let END = '</title>'
  let titleStart = html.indexOf('<title>')
  let titleEnd = html.indexOf(END)
  if (titleStart !== -1 && titleEnd !== -1) {
    html =
      html.slice(0, titleStart) +
      replaceTitleWith +
      html.slice(titleEnd + END.length)
  }

  // Inject rendered content into HTML
  html = html.replace('<div id="root">', '<div id="root">' + insertIntoRootDiv)

  return html
}

async function renderPageToString({
  app: { head },
  config,
  exports = {},
  routes,
  dependencies,
  url,
}) {
  let canonicalURLBase =
    process.env.CANONICAL_URL || process.env.PUBLIC_URL || ''

  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({
    routes,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  let route = await navigation.getRoute()

  // Extract the navigation state into a script tag to bootstrap the browser Navigation.
  let state = `<script>window.__NAVI_STATE__=${JSON.stringify(
    navigation.extractState(),
  ).replace(/</g, '\\u003c')};</script>`

  let app = React.createElement(exports.App || View)

  // If using react-helmet-async, wrap the app with a helmet context.
  let helmetContext
  if (head) {
    helmetContext = {}
    app = React.createElement(
      head,
      {
        context: helmetContext,
        canUseDOM: false,
      },
      app,
    )
  }

  // Render the content
  let bodyHTML = ReactDOMServer.renderToString(
    React.createElement(Router, { navigation }, app),
  )

  // This must be called after rendering the app, as stylesheet tags are
  // captured as they're imported
  let stylesheetTags = Array.from(dependencies.stylesheets)
    .map(pathname => `<link rel="stylesheet" href="${pathname}" />`)
    .join('')

  // Generate page head if Helmet is available
  let metaHTML = ''
  let helmet
  if (helmetContext) {
    helmet = helmetContext.getHelmet()
  }
  if (helmet) {
    metaHTML = `
      ${(helmet.title && helmet.title.toString()) ||
        '<title>' + route.title + '</title>'}
      ${helmet.meta && helmet.meta.toString()}
      ${helmet.link && helmet.link.toString()}
    `
  }

  // This loads the react-scripts generated index.html file, and injects
  // our content into it
  return renderCreateReactAppTemplate({
    config,
    insertIntoRootDiv: bodyHTML,
    replaceTitleWith:
      `<link rel="canonical" href="${canonicalURLBase + url.href}" />\n` +
      metaHTML +
      stylesheetTags +
      state,
  })
}

module.exports = renderPageToString
module.exports.renderCreateReactAppTemplate = renderCreateReactAppTemplate
