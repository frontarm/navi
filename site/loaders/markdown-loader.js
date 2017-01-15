const frontMatter = require('front-matter')
const markdownIt = require('markdown-it')
const anchor = require('markdown-it-anchor')
const Prism = require('prismjs')

const aliases = {
  'js': 'jsx',
  'html': 'markup'
}

const highlight = (str, lang) => {
  if (!lang) {
    return str
  } else {
    lang = aliases[lang] || lang
    require(`prismjs/components/prism-${lang}.js`)
    if (Prism.languages[lang]) {
      return Prism.highlight(str, Prism.languages[lang])
    } else {
      return str
    }
  }
}

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight
}).use(anchor, {
  permalink: true,
  permalinkSymbol: '#',
  permalinkBefore: true
})

module.exports = function markdownLoader(content) {
  // Not cacheable due to metadata
  // this.cacheable()
  
  const meta = frontMatter(content)
  this.value = {
    body: md.render(meta.body),
    meta: meta.attributes,
  }
  return this.value.body
}
