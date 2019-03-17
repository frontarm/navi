import { compose, crawl, map, mount, lazy, route, redirect, withView, withData, withContext } from '../../src'

export const fixtureMap = compose(
  withView('site-layout'),
  withData({
    title: 'Site',
  }),
  mount({
    '/': route(async req => {
      let map = await crawl({
        routes: fixtureMap,
        root: '/examples'
      })

      return {
        title: 'Navi',
        data: {
          description: 'Navi Is A Router/Loader',
        },
        view: map.paths,
      }
    }),

    '/examples': map(async () =>
      withContext(
        async (req, context) => ({
          ...context,
          contextName: 'examples'
        }),
        compose(
          withView(() => 'example-layout'),
          mount({
            '/': map(async () => redirect(req => req.mountpath+'basic')),

            '/basic': map(async () => route(req => ({
              data: {
                description: 'basic meta description'
              },
              title: 'Basic example',
              view: 'basic-example'
            }))),

            '*': mount({
              '/advanced': route({
                title: 'Advanced example',
                data: {
                  isPaywalled: true,
                },
                getView: async (request, context: any, dataPromise) => 
                  (context.contextName !== 'examples' || !context.isAuthenticated)
                    ? 'please-login'
                    : { isPaywalled: true }
              })
            })
          })
        )
      )
    ),

    '/goodies/cheatsheet': map(async () => mount({
      '/cheatsheet': map(async () => 
        lazy(async () =>
          compose(
            route({
              view: 'cheatsheet'
            })
          )
        )
      )
    }))
  })
)