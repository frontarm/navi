const fs = require('fs')
const path = require('path')
const ReactDOMServer = require('react-dom/server')

let rootDir = process.cwd()

let templatePath = path.resolve(rootDir, 'build/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

function renderCreateReactAppPageToString({ replaceTitle, element, config }) {
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

  // Inject rendered content into HTML
  html = html.replace('<div id="root">', '<div id="root">'+content)

  // Once all the dependencies have loaded, call `main`
  html = html.replace('</body>', `<script>window.${config.entryExportsGlobal}.main()</script>`)

  return html
}

module.exports = {
  renderCreateReactAppPageToString,
}