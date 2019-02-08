import { createMemoryNavigation, ContentSegment, NotFoundError } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            matcher: fixtureMap,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let route = await nav.getSteadyValue()
        let firstSegment = route.segments[0]
        
        expect(firstSegment.type).toBe('url')
        expect((route.segments[2] as any).info.title).toBe('Site')
        // expect(route.status).toBe(200)
        expect(route.contents[0]).toBe('site-layout')
        expect(route.contents[1]).toBe('example-layout')
        expect(route.type).toBe('success')
        expect(route.title).toBe('Basic example')
        expect(route.contents[2]).toBe('basic-example')

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstSegment = nav.getCurrentValue().segments[0]
        route = nav.getCurrentValue()
        
        expect(firstSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.type).toEqual('busy')

        route = await nav.getSteadyValue()

        expect(route.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.title).toBe('Advanced example')
        expect(route.info['isPaywalled']).toBe(true)
        expect(route.contents[route.contents.length - 1]).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        route = await nav.getSteadyValue()

        expect((route.lastSegment as ContentSegment).content).toEqual({
            isPaywalled: true,
        })

        nav.history.push('/examples/intermediate')

        route = await nav.getSteadyValue()
        
        expect(route.error).toBeInstanceOf(NotFoundError)
        expect(route.error && route.error.pathname).toBe("/examples/intermediate/")

        nav.dispose()
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let route = await nav.getSteadyValue()
        let lastSegment = route.lastSegment as ContentSegment
        
        expect(Object.keys(lastSegment.content)).toEqual(['/examples/basic/', '/examples/advanced/'])
        expect(route.type).toBe('success')
        expect(route.title).toBe('Navi')
    })
})