import { createMemoryHistory } from 'history'
import { createPage, createJunction, Env, Navigation, Router, PageRoute } from '../src'

describe("page under '/test' with 'redirectTo' param", () => {
    function root() {
        let pageTemplate = createPage({
            title: 'Test',
            meta: {
                description: 'test-page',
            },
            params: ['redirectTo'],
            getContent(env) {
                // return 'content'
                return Promise.resolve('content')
            }
        })

        return createJunction({
            children: {
                '/test': pageTemplate,
            }
        })
    }

    test("is parsed correctly", async () => {
        let junction = root()
        let router = new Router(junction)
        let history = createMemoryHistory({
            initialEntries: ['/test?redirectTo=no'],
        })

        let nav = new Navigation({
            history,
            router,
        })
        await nav.steady()
        let route = nav.currentRoute
        let pageRoute = route.activeChild as PageRoute
        
        expect(route.type).toBe('junction')
        expect(route.activePattern).toBe('/test')
        expect(pageRoute.type).toBe('page')
        expect(pageRoute.title).toBe('Test')
        expect(pageRoute.meta.description).toBe('test-page')
        expect(pageRoute.content).toBe('content')
        expect(pageRoute).toBe(route.deepestRoute)
        expect(pageRoute.params).toEqual({ redirectTo: 'no' })
    })
})