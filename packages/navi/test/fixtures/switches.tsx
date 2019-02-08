import { composeMatchers, map, lazy, route, redirect, withContent, withContents, withInfo, withContext } from '../../src'

export const fixtureMap = composeMatchers(
  withContents(['site-layout']),
  withInfo({
    title: 'Site',
  }),
  map({
    '/': route(async req => ({
      info: {
        description: 'Navi Is A Router/Loader',
        title: 'Navi',
      },
      content: await req.router.resolveRouteMap('/examples'),
    })),

    '/examples': async () => composeMatchers(
      withContext(async (req, context) => ({
        ...context,
        contextName: 'examples'
      })),
      withContent(() => 'example-layout'),
      map({
        '/': async () => redirect(req => req.mountpath+'basic'),

        '/basic': async () => route(req => ({
          info: {
            title: 'Basic example',
            description: 'basic meta description'
          },
          content: 'basic-example'
        })),

        '/advanced': route({
          info: {
            isPaywalled: true,
            title: 'Advanced example',
          },
          getContent: async (request, context, infoPromise) => 
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
              content: 'cheatsheet'
            })
          )
        )
    })
  })
)