const fs = require('fs')
const path = require('path')

let rootDir = process.cwd()

let templatePath = path.resolve(rootDir, 'build/index.html')
let template = fs.readFileSync(templatePath, 'utf8')

function renderCreateReactAppTemplate({ replaceTitleWith, insertIntoRootDiv }) {
  let html = template

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

module.exports = {
  renderCreateReactAppTemplate,
}