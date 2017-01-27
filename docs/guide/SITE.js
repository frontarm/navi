module.exports = {
  title: 'Guide',
  indexWrapper: 'MenuWrapper',
  content: require('./tutorial.md'),
  index: [
      require('./tutorial.md'),
      require('./introduction/SITE.js'),
      require('./basics/SITE.js'),
      require('./advanced/SITE.js'),
      require('./Glossary.md'),
  ],
}
