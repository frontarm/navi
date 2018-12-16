import * as Navi from 'navi'
import * as React from 'react'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: "MyApp",
      getContent: () => import('./index.mdx')
    }),
      
    '/create-react-site': Navi.createPage({
      title: "About create-react-site",
      getContent: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        return import('./create-react-site.mdx')
      }
    }),
  }
})