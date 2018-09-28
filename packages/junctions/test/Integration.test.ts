import { JunctionRoute, createMemoryNavigation, PageRoute, Status, RouteType, createRouter } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            rootJunction: cmsJunction,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let state = await nav.getSteadyState()
        let firstRoute = state.firstRoute
        let pageRoute = state.lastRoute as PageRoute
        
        expect(firstRoute.type).toBe(RouteType.Junction)
        expect(firstRoute.content).toBe('site-layout')
        expect(firstRoute.status).toBe(Status.Ready)
        expect(firstRoute.nextPattern).toBe('/examples')
        expect(state.routes[1].content).toBe('example-layout')
        expect(state.routes[1].status).toBe(Status.Ready)
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Basic example')
        expect(pageRoute.content).toBe('basic-example')
        expect(pageRoute).toBe(firstRoute.nextRoute && firstRoute.nextRoute.nextRoute)

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstRoute = nav.getSnapshot().firstRoute
        let secondRoute = firstRoute.nextRoute

        expect(firstRoute.query).toEqual({ referrer: 'frontarm' })
        expect(firstRoute.nextPattern).toEqual('/examples')
        expect(firstRoute.status).toEqual(Status.Ready)
        expect(secondRoute.status).toEqual(Status.Busy)

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        pageRoute = state.lastRoute as PageRoute

        expect(pageRoute.query).toEqual({ referrer: 'frontarm' })
        expect(pageRoute.title).toBe('Advanced example')
        expect(pageRoute.meta.isPaywalled).toBe(true)
        expect(pageRoute.content).toBe('please-login')

        nav.setContext({
            isAuthenticated: true
        })

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        pageRoute = firstRoute.lastRemainingRoute as PageRoute

        expect(pageRoute.content).toBe('advanced-example')

        nav.history.push('/examples/intermediate')

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        let　junctionRoute = firstRoute.lastRemainingRoute as JunctionRoute
        
        expect(junctionRoute.error && junctionRoute.error.name).toBe("NotFoundError")
        expect(junctionRoute.error && junctionRoute.error.pathname).toBe("/examples/intermediate/")
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let { lastRoute } = await nav.getSteadyState()
        
        expect(Object.keys(lastRoute.content)).toEqual(['/examples/advanced/', '/examples/basic/'])
        expect(lastRoute.type).toBe(RouteType.Page)
        expect(lastRoute.title).toBe('Junctions')
    })
})