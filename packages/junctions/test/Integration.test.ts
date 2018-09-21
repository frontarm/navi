import { createMemoryHistory } from 'history'
import { JunctionRoute, createNavigation, PageRoute, RouteStatus, RouteType, createRouter } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("integration", () => {
    function createTestNavigation(initialURL) {
        let history = createMemoryHistory({
            initialEntries: [initialURL],
        })

        let router = createRouter(cmsJunction)

        return createNavigation({
            history,
            router,
        })
    }

    test("integration", async () => {
        let nav = createTestNavigation('/examples')

        let state = await nav.steadyState()
        let firstRoute = state.firstRoute
        let pageRoute = state.lastRoute as PageRoute
        
        expect(firstRoute.type).toBe(RouteType.Junction)
        expect(firstRoute.nextPattern).toBe('/examples')
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Basic example')
        expect(pageRoute.content).toBe('basic-example')
        expect(pageRoute).toBe(firstRoute.nextRoute && firstRoute.nextRoute.nextRoute)

        nav.history.push('/examples/advanced?referrer=frontarm')

        firstRoute = nav.currentState.firstRoute
        let junctionRoute = firstRoute.lastRemainingRoute as JunctionRoute

        expect(firstRoute.params).toEqual({ referrer: 'frontarm' })
        expect(junctionRoute.type).toBe(RouteType.Junction)
        expect(junctionRoute.status).toBe(RouteStatus.Busy)
        expect(junctionRoute.nextPattern).toBe('/advanced')

        state = await nav.steadyState()
        firstRoute = state.firstRoute
        pageRoute = state.lastRoute as PageRoute

        expect(pageRoute.title).toBe('Advanced example')
        expect(pageRoute.meta.isPaywalled).toBe(true)
        expect(pageRoute.content).toBe('please-login')

        nav.router.setContext({
            isAuthenticated: true
        })

        state = await nav.steadyState()
        firstRoute = state.firstRoute
        pageRoute = firstRoute.lastRemainingRoute as PageRoute

        expect(pageRoute.content).toBe('advanced-example')

        nav.history.push('/examples/intermediate')

        state = await nav.steadyState()
        firstRoute = state.firstRoute
        junctionRoute = firstRoute.lastRemainingRoute as JunctionRoute
        
        expect(junctionRoute.error && junctionRoute.error.name).toBe("NotFoundError")
        expect(junctionRoute.error && junctionRoute.error.url).toBe("/examples/intermediate")
    })

    test("map-based content", async () => {
        let nav = createTestNavigation('/')

        let state = await nav.steadyState()
        let firstRoute = state.firstRoute
        let pageRoute = state.lastRoute as PageRoute

        expect(Object.keys(pageRoute.content)).toEqual(['/examples/advanced/', '/examples/basic/'])
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Junctions')
    })
})