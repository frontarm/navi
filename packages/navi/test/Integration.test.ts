import { SwitchSegment, createMemoryNavigation, PageSegment, NotFoundError } from '../src'
import { fixtureSwitch } from './fixtures/switches'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            pages: fixtureSwitch,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let route = await nav.getSteadyValue()
        let firstSegment = route.firstSegment
        let pageSegment = route.lastSegment as PageSegment
        
        expect(firstSegment.type).toBe('switch')
        expect(firstSegment.title).toBe('Site')
        expect(firstSegment.content).toBe('site-layout')
        expect(firstSegment.status).toBe('ready')
        expect(firstSegment.nextPattern).toBe('/examples')
        expect(route.segments[1].content).toBe('example-layout')
        expect(route.segments[1].status).toBe('ready')
        expect(pageSegment.type).toBe('page')
        expect(pageSegment.title).toBe('Basic example')
        expect(pageSegment.content).toBe('basic-example')
        expect(pageSegment).toBe(route.segments[2])
        expect(route.heads.length).toBe(2)
        expect(route.heads[0][0].type).toBe('meta')

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstSegment = nav.getCurrentValue().firstSegment
        route = nav.getCurrentValue()
        let secondSegment = route.segments[1]

        expect(firstSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(firstSegment.nextPattern).toEqual('/examples')
        expect(firstSegment.status).toEqual('ready')
        expect(secondSegment.status).toEqual('busy')

        route = await nav.getSteadyValue()
        firstSegment = route.firstSegment
        pageSegment = route.lastSegment as PageSegment

        expect(pageSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(pageSegment.title).toBe('Advanced example')
        expect(pageSegment.info.isPaywalled).toBe(true)
        expect(pageSegment.content).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        route = await nav.getSteadyValue()
        firstSegment = route.firstSegment
        pageSegment = route.lastSegment as PageSegment

        expect(pageSegment.content.dat).toEqual({
            isPaywalled: true,
        })

        nav.history.push('/examples/intermediate')

        route = await nav.getSteadyValue()
        firstSegment = route.firstSegment
        let　junctionSegment = route.lastSegment as SwitchSegment
        
        expect(junctionSegment.error && junctionSegment.error).toBeInstanceOf(NotFoundError)
        expect(junctionSegment.error && junctionSegment.error.pathname).toBe("/examples/intermediate/")

        nav.dispose()
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let route = await nav.getSteadyValue()
        
        expect(Object.keys(route.lastSegment.content)).toEqual(['/examples/basic/', '/examples/advanced/'])
        expect(route.type).toBe('page')
        expect(route.title).toBe('Navi')
    })
})