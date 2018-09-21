import { createPage, createJunction, createRedirect, RouterEnv } from '../../src'

export const cmsJunction = createJunction({
    params: ['referrer'],

    paths: {
        '/': createPage({
            title: 'Junctions',
            meta: {
                description: 'Junctions Is A Router',
            },
            async getContent(routerEnv: RouterEnv) {
                return await routerEnv.pageMap('/examples')
            },
        }),

        '/examples': createJunction({
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