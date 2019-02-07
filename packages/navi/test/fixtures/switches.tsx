import React from 'react'
import { map, page, redirect, withContent, withContext } from '../../src'

export const fixtureMap = withContent(
  {
    getBody() {
      return 'site-layout'
    },
    title: 'Site',
  },
  map({
    '/': () => page({
      title: 'Navi',
      info: {
        description: 'Navi Is A Router/Loader',
      },
      getBody: (request) => request.router.resolvePageMap('/examples'),
    }),

    '/examples': async () =>
      withContext(
        async (request, context) => ({
          ...context,
          contextName: 'examples'
        }),
        map(async () =>
          withContent(
            {
              getBody() {
                return 'example-layout'
              },
              getHead: () => [
                { type: 'meta', props: { name: 'description', content: 'examples meta description' } }
              ],
            },
            map({
              '/': async () => redirect(reuqest => reuqest.mountpath+'basic'),

              '/basic': async () => page({
                title: 'Basic example',
                head: <>
                  <meta name='description' content='basic meta description' />
                </>,
                getBody: () => 'basic-example'
              }),

              '/advanced': page({
                title: 'Advanced example',
                getInfo: async () => ({
                  isPaywalled: true,
                }),
                async getBody(request, context: any, infoPromise) {
                  if (context.contextName !== 'examples' || !context.isAuthenticated) {
                    return 'please-login'
                  }
                  
                  return {
                    dat: await infoPromise
                  }
                }
              })
            })
          )
        )
      ),

    '/goodies': async () => map({
      '/cheatsheet': async () => page({
        getBody() {
          return Promise.resolve('cheatsheet')
        }
      })
    })
  })
)