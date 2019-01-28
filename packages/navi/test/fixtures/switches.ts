import { createPage, createSwitch, createRedirect, createContext, Env } from '../../src'

export const fixtureSwitch = createSwitch({
    getContent() {
        return 'site-layout'
    },

    title: 'Site',

    paths: {
        '/': () => createPage({
            title: 'Navi',
            meta: {
                description: 'Navi Is A Router/Loader',
            },
            getContent: (env: Env) => env.router.resolvePageMap('/examples'),
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
                            getContent: () => 'basic-example'
                        }),

                        '/advanced': createPage({
                            getTitle: () => 'Advanced example',
                            getMeta: async () => ({
                                isPaywalled: true,
                            }),
                            async getContent(env: Env, metaPromise) {
                                if (env.context.contextName !== 'examples' || !env.context.isAuthenticated) {
                                    return 'please-login'
                                }
                                
                                return {
                                    dat: await metaPromise
                                }
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