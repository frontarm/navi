import { createMemoryNavigation, ViewChunk, NotFoundError } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            routes: fixtureMap,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let route = await nav.getSteadyValue()
        let firstChunk = route.chunks[0]
        
        expect(firstChunk.type).toBe('url')
        expect(route.status).toBe(200)
        expect(route.views[0]).toBe('site-layout')
        expect(route.views[1]).toBe('example-layout')
        expect(route.type).toBe('ready')
        expect(route.views[2]).toBe('basic-example')
        expect(route.title).toBe('Basic example')

        nav.navigate('/examples/advanced?referrer=frontarm')

        firstChunk = nav.getCurrentValue().chunks[0]
        route = nav.getCurrentValue()
        
        expect(firstChunk.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.type).toEqual('busy')

        route = await nav.getSteadyValue()

        expect(route.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.title).toBe('Advanced example')
        expect(route.data['isPaywalled']).toBe(true)
        expect(route.views[route.views.length - 1]).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        route = await nav.getSteadyValue()

        expect((route.lastChunk as ViewChunk).view).toEqual({
            isPaywalled: true,
        })

        nav.navigate('/examples/intermediate')

        route = await nav.getSteadyValue()
        
        expect(route.error).toBeInstanceOf(NotFoundError)
        expect(route.error && route.error.pathname).toBe("/examples/intermediate")

        nav.dispose()
    })

    test("map-based view", async () => {
        let nav = createTestNavigation('/')

        let route = await nav.getSteadyValue()
        let lastChunk = route.lastChunk as ViewChunk
        
        expect(Object.keys(lastChunk.view)).toEqual(['/examples/basic', '/examples/advanced'])
        expect(route.type).toBe('ready')
        expect(route.title).toBe('Navi')
    })
})