import * as React from 'react'
import * as Navi from 'navi'

export default Navi.createPage({
  title: `You're running React on Navi`,
  meta: {
    description: `Thanks!`,
    tags: ['navi', 'react'],
  },
  getContent: async () => {
    let { default: Document } = await import('!babel-loader!mdx-loader!./document.md')
    return <Document />
  }
})