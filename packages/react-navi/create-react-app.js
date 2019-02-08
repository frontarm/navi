const Navi = require('navi')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { Helmet } = require('react-helmet')
const { NavProvider, NavView } = require('react-navi')

async function renderCreateReactAppTemplate({ config, replaceTitleWith, insertIntoRootDiv }) {
  let html = (await config.fs.readFile(config.entry)).toString('utf8')

  // Replace the <title> tag with the contents of `replaceTitle`,
  // allowing the head to be modified.
  let END = '</title>'
  let titleStart = html.indexOf('<title>')
  let titleEnd = html.indexOf(END)
  if (titleStart !== -1 && titleEnd !== -1) {
    html = html.slice(0, titleStart) + replaceTitleWith + html.slice(titleEnd + END.length)
  }

  // Inject rendered content into HTML
  html = html.replace('<div id="root">', '<div id="root">'+insertIntoRootDiv)

  return html
}

async function renderPageToString({ config, exports={}, routes, siteMap, dependencies, url }) {
  let canonicalURLBase = process.env.CANONICAL_URL || process.env.PUBLIC_URL || ''

  // Create an in-memory Navigation object with the given URL
  let navigation = Navi.createMemoryNavigation({
    routes,
    url,
  })

  // Wait for any asynchronous content to finish fetching
  let route = await navigation.getSteadyValue()

  // react-helmet thinks it's in a browser because of JSDOM, so we need to
  // manually let it know that we're doing static rendering.
  Helmet.canUseDOM = false

  // Render the content
  let bodyHTML =
    ReactDOMServer.renderToString(
      React.createElement(
        NavProvider,
        { navigation }, 
        React.createElement(exports.App || NavView)
      )
    )

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
      stylesheetTags,
  })
}

module.exports = renderPageToString
module.exports.renderCreateReactAppTemplate = renderCreateReactAppTemplate