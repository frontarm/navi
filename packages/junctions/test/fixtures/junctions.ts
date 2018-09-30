import { createPage, createSwitch, createRedirect, createContext, Env } from '../../src'

export const fixtureSwitch = createSwitch({
    getContent() {
        return 'site-layout'
    },

    paths: {
        '/': async () => createPage({
            title: 'Junctions',
            meta: {
                description: 'Junctions Is A Router',
            },
            async getContent(env: Env) {
                return await env.router.resolvePageMap('/examples')
            },
        }),

        '/examples': async () =>
            createContext(
                async ({ context }) => ({
                    ...context,
                    contextName: 'examples'
                }),
                async () => createSwitch({
                    async getContent() {
                        return 'example-layout'
                    },

                    paths: {
                        '/': async () => createRedirect(env => env.pathname+'basic'),

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
                            getContent(env: Env) {
                                return (env.context.contextName === 'examples' && env.context.isAuthenticated) ? (
                                    Promise.resolve('advanced-example')
                                ) : (
                                    Promise.resolve('please-login')
                                )
                            }
                        })
                    }
                })
            ),

        '/goodies': async () => createSwitch({
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