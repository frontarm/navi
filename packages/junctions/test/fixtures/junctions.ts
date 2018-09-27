import { createPage, createJunction, createRedirect, RouterEnv } from '../../src'

export const cmsJunction = createJunction({
    useParams: ['referrer'],

    getContent() {
        return 'site-layout'
    },

    paths: {
        '/': async () => createPage({
            title: 'Junctions',
            meta: {
                description: 'Junctions Is A Router',
            },
            async getContent(env: RouterEnv) {
                return await env.router.pageMap('/examples')
            },
        }),

        '/examples': async () => createJunction({
            async getContent() {
                return 'example-layout'
            },

            paths: {
                '/': async () => createRedirect(location => location.pathname+'basic'),

                '/basic': async () => createPage({
                    title: 'Basic example',
                    getContent() {
                        return Promise.resolve('basic-example')
                    }
                }),

                '/advanced': async () => createPage({
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
                })
            }
        }),

        '/goodies': async () => createJunction({
            paths: {
                '/cheatsheet': async () => createPage({
                    title: 'Cheatsheet',
                    getContent() {
                        return Promise.resolve('cheatsheet')
                    }
                })
            }
        })
    }
})