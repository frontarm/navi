import { createPage, createJunction, createRedirect, RouterEnv } from '../../src'

export const cmsJunction = createJunction({
    paramNames: ['referrer'],

    getContent() {
        return 'site-layout'
    },

    paths: {
        '/': createPage({
            title: 'Junctions',
            meta: {
                description: 'Junctions Is A Router',
            },
            async getContent(env: RouterEnv) {
                return await env.pageMap('/examples')
            },
        }),

        '/examples': createJunction({
            async getContent() {
                return 'example-layout'
            },

            paths: {
                '/': createRedirect(location => location.pathname+'basic'),

                '/basic': () => Promise.resolve(createPage({
                    title: 'Basic example',
                    getContent() {
                        return Promise.resolve('basic-example')
                    }
                })),

                '/advanced': () => Promise.resolve(createPage({
                    title: 'Advanced example',
                    meta: {
                        isPaywalled: true,
                    },
                    getContent(env) {
                        return env.context.isAuthenticated ? (
                            Promise.resolve('advanced-example')
                        ) : (
                            Promise.resolve('please-login')
                        )
                    }
                }))
            }
        })
    }
})