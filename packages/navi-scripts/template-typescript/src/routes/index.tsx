import { map, route, withView } from 'navi'

export default map({
  '/': route({
    title: "React Site",
    getView: () => import('./index.mdx')
  }),
    
  '/getting-started': route({
    title: "Getting Started",
    getView: async () => {
      // This simulates some async content loading, so that
      // you can test the site's loading bar.
      await new Promise(resolve => setTimeout(resolve, 1000))

      return import('./getting-started.mdx')
    }
  }),
})