import { JunctionRoute, createMemoryNavigation, PageRoute, RouteStatus, RouteContentStatus, RouteType, createRouter } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        return createMemoryNavigation({
            url: initialURL,
            router: createRouter({ junction: cmsJunction }),
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let state = await nav.getSteadyState()
        let firstRoute = state.firstRoute
        let pageRoute = state.lastRoute as PageRoute
        
        expect(firstRoute.type).toBe(RouteType.Junction)
        expect(firstRoute.content).toBe('site-layout')
        expect(firstRoute.contentStatus).toBe(RouteContentStatus.Ready)
        expect(firstRoute.nextPattern).toBe('/examples')
        expect(state.routes[1].content).toBe('example-layout')
        expect(state.routes[1].contentStatus).toBe(RouteContentStatus.Ready)
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Basic example')
        expect(pageRoute.content).toBe('basic-example')
        expect(pageRoute).toBe(firstRoute.nextRoute && firstRoute.nextRoute.nextRoute)

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstRoute = nav.getState().firstRoute
        let junctionRoute = firstRoute.lastRemainingRoute as JunctionRoute

        expect(firstRoute.params).toEqual({ referrer: 'frontarm' })
        expect(junctionRoute.type).toBe(RouteType.Junction)
        expect(junctionRoute.status).toBe(RouteStatus.Busy)
        expect(junctionRoute.nextPattern).toBe('/advanced')

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        pageRoute = state.lastRoute as PageRoute

        expect(pageRoute.title).toBe('Advanced example')
        expect(pageRoute.meta.isPaywalled).toBe(true)
        expect(pageRoute.content).toBe('please-login')

        nav.router.setContext({
            isAuthenticated: true
        })

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        pageRoute = firstRoute.lastRemainingRoute as PageRoute

        expect(pageRoute.content).toBe('advanced-example')

        nav.history.push('/examples/intermediate')

        state = await nav.getSteadyState()
        firstRoute = state.firstRoute
        junctionRoute = firstRoute.lastRemainingRoute as JunctionRoute
        
        expect(junctionRoute.error && junctionRoute.error.name).toBe("NotFoundError")
        expect(junctionRoute.error && junctionRoute.error.url).toBe("/examples/intermediate")
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let { lastRoute } = await nav.getSteadyState()
        
        expect(Object.keys(lastRoute.content)).toEqual(['/examples/advanced/', '/examples/basic/'])
        expect(lastRoute.type).toBe(RouteType.Page)
        expect(lastRoute.title).toBe('Junctions')
    })
})