import React from 'react'
import { createPage, createSwitch, createRedirect, createContext } from '../../src'

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
            getContent: (request) => request.router.resolvePageMap('/examples'),
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
                        '/': async () => createRedirect(reuqest => reuqest.mountpath+'basic'),

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
                            async getContent(request, context, infoPromise) {
                                if (request.context.contextName !== 'examples' || !request.context.isAuthenticated) {
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