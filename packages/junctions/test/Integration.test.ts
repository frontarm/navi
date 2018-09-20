import { createMemoryHistory } from 'history'
import { JunctionRoute, Navigation, Router, PageRoute, RouteStatus, RouteType } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("page under '/test' with 'redirectTo' param", () => {
    function createNavigation(initialURL) {
        let history = createMemoryHistory({
            initialEntries: [initialURL],
        })

        let router = new Router(cmsJunction)

        return new Navigation({
            history,
            router,
        })
    }

    test("integration", async () => {
        let nav = createNavigation('/examples')

        await nav.steadyState()
        let route = nav.currentState
        let pageRoute = route.lastRemainingRoute as PageRoute
        
        expect(route.type).toBe(RouteType.Junction)
        expect(route.nextPattern).toBe('/examples')
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Basic example')
        expect(pageRoute.content).toBe('basic-example')
        expect(pageRoute).toBe(route.nextRoute && route.nextRoute.nextRoute)

        nav.history.push('/examples/advanced?referrer=frontarm')

        route = nav.currentState
        let lastRoute = route.lastRemainingRoute as JunctionRoute

        expect(route.params).toEqual({ referrer: 'frontarm' })
        expect(lastRoute.type).toBe(RouteType.Junction)
        expect(lastRoute.status).toBe(RouteStatus.Busy)
        expect(lastRoute.nextPattern).toBe('/advanced')

        await nav.steadyState()
        route = nav.currentState
        pageRoute = route.lastRemainingRoute as PageRoute

        expect(pageRoute.title).toBe('Advanced example')
        expect(pageRoute.meta.isPaywalled).toBe(true)
        expect(pageRoute.content).toBe('please-login')

        nav.router.setContext({
            isAuthenticated: true
        })

        await nav.steadyState()
        route = nav.currentState
        pageRoute = route.lastRemainingRoute as PageRoute

        expect(pageRoute.content).toBe('advanced-example')

        nav.history.push('/examples/intermediate')

        await nav.steadyState()
        route = nav.currentState
        lastRoute = route.lastRemainingRoute as JunctionRoute
        
        expect(lastRoute.error && lastRoute.error.type).toBe("NotFoundError")
        expect(lastRoute.error && lastRoute.error.unmatchedURL).toBe("/intermediate")
    })

    test("map-based content", async () => {
        let nav = createNavigation('/')

        await nav.steadyState()
        let route = nav.currentState
        let pageRoute = route.lastRemainingRoute as PageRoute

        expect(Object.keys(pageRoute.content)).toEqual(['/examples/advanced/', '/examples/basic/'])
        expect(pageRoute.type).toBe(RouteType.Page)
        expect(pageRoute.title).toBe('Junctions')
    })
})