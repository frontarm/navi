module.exports = {
  title: 'Guide',
  path: 'guide',
  indexWrapper: 'MenuWrapper',
  content: require('./quick-start.md'),
  index: [
      require('./quick-start.md'),
      require('./introduction/SITE.js'),
      require('./basics/SITE.js'),
      require('./advanced/SITE.js'),
      require('./Glossary.md'),
  ],
}
