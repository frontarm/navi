module.exports = (pattern) => {
  pattern(/\.mdx?$/, {
    contentWrapper: 'MarkdownWrapper',
  })
  pattern(/example.jsx?$/, {
    contentWrapper: 'ExampleWrapper',
  })

  return {
    indexWrapper: 'RootWrapper',
    content: require('./README.md'),
    title: 'junctions.js',
    htmlTitle: "junctions.js",
    metaTitle: "junctions.js",
    metaDescription: "Composable routing for React",
    index: [
      require('./examples/SITE.js'),
      require('./docs/SITE.js'),
      require('./docs/api/SITE.js'),
    ]
  }
}
