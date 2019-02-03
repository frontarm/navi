const he = require('he')
const Navi = require('navi')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { NavProvider } = require('react-navi')

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

async function renderPageToString({ config, exports, pages, siteMap, dependencies, url }) {
  let navigation = Navi.createMemoryNavigation({ pages, url })
  let { route } = await navigation.getSteadyValue()
  let canonicalURLBase = process.env.CANONICAL_URL || process.env.PUBLIC_URL || ''

  let stylesheetTags = Array.from(dependencies.stylesheets)
    .map(pathname => `<link rel="stylesheet" href="${pathname}" />`)
    .join('')
  
  return renderCreateReactAppTemplate({
    config,
    insertIntoRootDiv:
      ReactDOMServer.renderToString(
        React.createElement(
          NavProvider,
          { navigation }, 
          React.createElement(
            typeof exports === 'function' ? exports : exports.App,
            {
              navigation,
              siteMap,
            }
          )
        )
      ),
    replaceTitleWith:
      `\n<title>${route.title || 'Untitled'}</title>\n` +
      `<link rel="canonical" href="${canonicalURLBase+url.href}" />\n`+
      Object.entries(route.meta || {}).map(([key, value]) =>
        `<meta name="${he.encode(key)}" content="${he.encode(typeof value === 'string' ? value : String(value))}" />`
      ).concat('').join('\n')+
      stylesheetTags,
  })
}

module.exports = {
  renderCreateReactAppTemplate,
  default: renderPageToString,
}