import { MapSegment, createMemoryNavigation, ContentSegment, NotFoundError } from '../src'
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
        let firstSegment = route.firstSegment
        
        expect(firstSegment.type).toBe('content')
        expect((firstSegment as ContentSegment).content.title).toBe('Site')
        expect(route.status).toBe(200)
        expect(route.bodies[0]).toBe('site-layout')
        expect(route.bodies[1]).toBe('example-layout')
        expect(route.type).toBe('content')
        expect(route.title).toBe('Basic example')
        expect(route.bodies[2]).toBe('basic-example')
        expect(route.heads.length).toBe(2)
        expect(route.heads[0][0].type).toBe('meta')

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstSegment = nav.getCurrentValue().firstSegment
        route = nav.getCurrentValue()
        
        expect(firstSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.type).toEqual('busy')

        route = await nav.getSteadyValue()

        expect(route.url.query).toEqual({ referrer: 'frontarm' })
        expect(route.title).toBe('Advanced example')
        expect(route.info['isPaywalled']).toBe(true)
        expect(route.bodies[route.bodies.length - 1]).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        route = await nav.getSteadyValue()

        expect((route.lastSegment as ContentSegment).content.body.dat).toEqual({
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
        
        expect(Object.keys(lastSegment.content.body)).toEqual(['/examples/basic/', '/examples/advanced/'])
        expect(route.type).toBe('content')
        expect(route.title).toBe('Navi')
    })
})