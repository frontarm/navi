import React from 'react'
import * as Navi from 'navi'

export default Navi.createPage({
  title: `You're running React on Navi`,
  meta: {
    tags: ['navi', 'react'],
    head:
      <>
        <meta name="description" content="A test post about Navi" />
      </>,
  },
  getContent: () => import('./document.mdx'),
})