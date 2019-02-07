import React from 'react'
import * as Navi from 'navi'

export default Navi.map({
  '/': Navi.page({
    title: "Home",
    head: <>
      <meta name="description" content="My great site" />
    </>,
    getBody: () => import('./index.mdx')
  }),
    
  '/about': Navi.page({
    title: "About",
    getBody: async () => {
      // This simulates some async content loading, so that
      // you can test the site's loading bar.
      await new Promise(resolve => setTimeout(resolve, 1000))

      return import('./about.mdx')
    }
  }),
})