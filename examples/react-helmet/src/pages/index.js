import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      getContent: () => import('./index.mdx')
    }),
      
    '/about': Navi.createPage({
      getContent: async () => {
        // This simulates some async content loading, so that
        // you can test the site's loading bar.
        await new Promise(resolve => setTimeout(resolve, 1000))

        return import('./about.mdx')
      }
    }),
  }
})