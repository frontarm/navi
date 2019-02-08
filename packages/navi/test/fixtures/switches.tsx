import { composeMatchers, map, lazy, route, redirect, withView, withData, withContext } from '../../src'

export const fixtureMap = composeMatchers(
  withView('site-layout'),
  withData({
    title: 'Site',
  }),
  map({
    '/': route(async req => ({
      data: {
        description: 'Navi Is A Router/Loader',
        title: 'Navi',
      },
      view: await req.router.resolveRouteMap('/examples'),
    })),

    '/examples': async () => composeMatchers(
      withContext(async (req, context) => ({
        ...context,
        contextName: 'examples'
      })),
      withView(() => 'example-layout'),
      map({
        '/': async () => redirect(req => req.mountpath+'basic'),

        '/basic': async () => route(req => ({
          data: {
            title: 'Basic example',
            description: 'basic meta description'
          },
          view: 'basic-example'
        })),

        '/advanced': route({
          data: {
            isPaywalled: true,
            title: 'Advanced example',
          },
          getView: async (request, context, dataPromise) => 
            (context.contextName !== 'examples' || !context.isAuthenticated)
              ? 'please-login'
              : { isPaywalled: true }
        })
      })
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