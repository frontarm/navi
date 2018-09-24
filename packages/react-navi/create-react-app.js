const fs = require('fs')
const path = require('path')
const ReactDOMServer = require('react-dom/server')
const env = require('react-scripts/config/env')

let rootDir = process.cwd()

let templatePath = path.resolve(rootDir, 'public/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

let assetManifestPath = path.resolve(rootDir, 'build/asset-manifest.json')
let assetManifest = require(assetManifestPath)

function renderCreateReactAppPageToString({ replaceTitle, dependencies, element, config }) {
  let html = template
  
  // Replace the <title> tag with the contents of `replaceTitle`,
  // allowing the head to be modified.
  let END = '</title>'
  let titleStart = html.indexOf('<title>')
  let titleEnd = html.indexOf(END)
  if (titleStart !== -1 && titleEnd !== -1) {
    html = html.slice(0, titleStart) + replaceTitle + html.slice(titleEnd + END.length)
  }

  // Render the page content using React
  let content = ReactDOMServer.renderToString(element)

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
  html = html.replace('</body>', `${scriptTags}<script>window.${config.entryExportsGlobal}.main()</script>`)

  return html
}

module.exports = {
  renderCreateReactAppPageToString,
}