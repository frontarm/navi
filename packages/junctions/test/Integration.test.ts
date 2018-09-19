import { createMemoryHistory } from 'history'
import { createPage, createJunction, Env, Navigation, Router, PageRoute, createRedirect } from '../src'

describe("page under '/test' with 'redirectTo' param", () => {
    function createNavigation(initialURL) {
        let history = createMemoryHistory({
            initialEntries: [initialURL],
        })

        let router = new Router(createJunction({
            params: ['referrer'],

            children: {
                '/': createPage({
                    title: 'Junctions',
                    meta: {
                        description: 'Junctions Is A Router',
                    },
                    getContent() {
                        return Promise.resolve('index')
                    }
                }),

                '/examples': createJunction({
                    children: {
                        '/': createRedirect((location) => location.pathname+'basic'),

                        '/basic': () => Promise.resolve(createPage({
                            title: 'Basic example',
                            getContent() {
                                return Promise.resolve('basic-example')
                            }
                        })),

                        '/advanced': () => Promise.resolve(createPage({
                            title: 'Advanced example',
                            getContent() {
                                return Promise.resolve('advanced-example')
                            }
                        }))
                    }
                })
            }
        }))

        return new Navigation({
            history,
            router,
        })
    }

    test("is parsed correctly", async () => {
        let nav = createNavigation('/examples/basic?referrer=frontarm')

        await nav.steady()
        let route = nav.currentRoute
        let pageRoute = route.deepestRoute as PageRoute
        
        expect(route.type).toBe('junction')
        expect(route.params).toEqual({ referrer: 'frontarm' })
        expect(route.activePattern).toBe('/examples')
        expect(pageRoute.type).toBe('page')
        expect(pageRoute.title).toBe('Basic example')
        expect(pageRoute.content).toBe('basic-example')
        expect(pageRoute).toBe(route.activeChild.activeChild)

        nav.history.push('/examples/advanced')

        await nav.steady()
        route = nav.currentRoute
        pageRoute = route.deepestRoute as PageRoute

        expect(pageRoute.title).toBe('Advanced example')
    })
})