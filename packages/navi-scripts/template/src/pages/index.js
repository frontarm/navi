import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: "React Site",
      meta: {
        // This will be added to your page <head> during static rendering.
        description: "My great site",
      },
      getContent: () => import('./index.mdx')
    }),
      
    '/getting-started': Navi.createPage({
      title: "Getting Started",
      getContent: async () => {
        // This simulates some async content loading, so that
        // you can test the site's loading bar.
        await new Promise(resolve => setTimeout(resolve, 1000))

        return import('./getting-started.mdx')
      }
    }),
  }
})