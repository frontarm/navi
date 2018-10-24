import { SwitchSegment, createMemoryNavigation, PageSegment, Status, SegmentType, NotFoundError } from '../src'
import { fixtureSwitch } from './fixtures/switches'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            rootSwitch: fixtureSwitch,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let { route } = await nav.getSteadySnapshot()
        let firstSegment = route.firstSegment
        let pageSegment = route.lastSegment as PageSegment
        
        expect(firstSegment.type).toBe(SegmentType.Switch)
        expect(firstSegment.content).toBe('site-layout')
        expect(firstSegment.status).toBe(Status.Ready)
        expect(firstSegment.nextPattern).toBe('/examples')
        expect(route.segments[1].content).toBe('example-layout')
        expect(route.segments[1].status).toBe(Status.Ready)
        expect(pageSegment.type).toBe(SegmentType.Page)
        expect(pageSegment.title).toBe('Basic example')
        expect(pageSegment.content).toBe('basic-example')
        expect(pageSegment).toBe(firstSegment.nextSegment && firstSegment.nextSegment.nextSegment)

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstSegment = nav.getCurrentValue().route.firstSegment
        let secondSegment = firstSegment.nextSegment

        expect(firstSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(firstSegment.nextPattern).toEqual('/examples')
        expect(firstSegment.status).toEqual(Status.Ready)
        expect(secondSegment.status).toEqual(Status.Busy)

        route = (await nav.getSteadySnapshot()).route
        firstSegment = route.firstSegment
        pageSegment = route.lastSegment as PageSegment

        expect(pageSegment.url.query).toEqual({ referrer: 'frontarm' })
        expect(pageSegment.title).toBe('Advanced example')
        expect(pageSegment.meta.isPaywalled).toBe(true)
        expect(pageSegment.content).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        route = (await nav.getSteadySnapshot()).route
        firstSegment = route.firstSegment
        pageSegment = firstSegment.lastRemainingSegment as PageSegment

        expect(pageSegment.content).toBe('advanced-example')

        nav.history.push('/examples/intermediate')

        route = (await nav.getSteadySnapshot()).route
        firstSegment = route.firstSegment
        let　junctionSegment = firstSegment.lastRemainingSegment as SwitchSegment
        
        expect(junctionSegment.error && junctionSegment.error).toBeInstanceOf(NotFoundError)
        expect(junctionSegment.error && junctionSegment.error.pathname).toBe("/examples/intermediate/")
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let { route } = await nav.getSteadySnapshot()
        
        expect(Object.keys(route.lastSegment.content)).toEqual(['/examples/advanced/', '/examples/basic/'])
        expect(route.type).toBe(SegmentType.Page)
        expect(route.title).toBe('Navi')
    })
})