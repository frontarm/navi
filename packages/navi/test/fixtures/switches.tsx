import React from 'react'
import { createPage, createSwitch, createRedirect, createContext, Env } from '../../src'

export const fixtureSwitch = createSwitch({
    getContent() {
        return 'site-layout'
    },

    title: 'Site',

    paths: {
        '/': () => createPage({
            title: 'Navi',
            info: {
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

                    getHead: () => [
                        { type: 'meta', props: { name: 'description', content: 'examples meta description' } }
                    ],

                    paths: {
                        '/': async () => createRedirect(env => env.mountedPathname+'basic'),

                        '/basic': async () => createPage({
                            title: 'Basic example',
                            head: <>
                                <meta name='description' content='basic meta description' />
                            </>,
                            getContent: () => 'basic-example'
                        }),

                        '/advanced': createPage({
                            title: 'Advanced example',
                            getInfo: async () => ({
                                isPaywalled: true,
                            }),
                            async getContent(env, infoPromise) {
                                if (env.context.contextName !== 'examples' || !env.context.isAuthenticated) {
                                    return 'please-login'
                                }
                                
                                return {
                                    dat: await infoPromise
                                }
                            }
                        })
                    }
                })
            ),

        '/goodies': async () => createSwitch({
            paths: {
                '/cheatsheet': async () => createPage({
                    getContent() {
                        return Promise.resolve('cheatsheet')
                    }
                })
            }
        })
    }
})