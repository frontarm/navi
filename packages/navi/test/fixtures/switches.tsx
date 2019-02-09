import { composeMatchers, map, lazy, route, redirect, withView, withData, withContext } from '../../src'

export const fixtureMap = composeMatchers(
  withView('site-layout'),
  withData({
    title: 'Site',
  }),
  map({
    '/': route(async req => ({
      title: 'Navi',
      data: {
        description: 'Navi Is A Router/Loader',
      },
      view: await req.router.resolveRouteMap('/examples'),
    })),

    '/examples': async () =>
      withContext(
        async (req, context) => ({
          ...context,
          contextName: 'examples'
        }),
        composeMatchers(
          withView(() => 'example-layout'),
          map({
            '/': async () => redirect(req => req.mountpath+'basic'),

            '/basic': async () => route(req => ({
              data: {
                description: 'basic meta description'
              },
              title: 'Basic example',
              view: 'basic-example'
            })),

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
        )
      ),

    '/goodies/cheatsheet': async () => map({
      '/cheatsheet': async () => 
        lazy(async () =>
          composeMatchers(
            route({
              view: 'cheatsheet'
            })
          )
        )
    })
  })
)