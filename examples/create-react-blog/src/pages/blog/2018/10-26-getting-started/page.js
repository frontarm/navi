import * as React from 'react'
import * as Navi from 'navi'

export default Navi.createPage({
  title: `Getting Started`,
  meta: {
    description: `Now anyone can be a webmaster.`,
    tags: ['navi'],
  },
  getContent: async () => {
    let { default: Document } = await import('!babel-loader!mdx-loader!./document.md')
    return <Document />
  }
})