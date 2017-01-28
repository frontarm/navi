module.exports = (pattern) => {
  pattern(/\.md$/, {
    contentWrapper: 'MarkdownWrapper',
  })
  pattern(/example.jsx?$/, {
    contentWrapper: 'ExampleWrapper',
  })

  return {
    title: 'Junctions',
    indexWrapper: 'RootWrapper',
    content: require('./README.md'),
    index: [
      require('./examples/SITE.js'),
      require('./docs/SITE.js'),
      require('./docs/api/SITE.js'),
    ]
  }
}
