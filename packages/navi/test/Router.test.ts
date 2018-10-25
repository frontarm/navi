import { createRouter } from '../src'
import { fixtureSwitch } from './fixtures/switches'

describe("pageMap", () => {
    test("mapping over '/' returns full site", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })
     
    test("mapping over '' returns full site", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })

    test("doesn't include content", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(map['/'].content).toBeUndefined()
    })

    test("can map from an intermediate url and exclude its index", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/examples', {
            predicate: (segment) => segment.url.pathname !== '/examples/'
        })
        expect(Object.keys(map).length).toBe(2)
    })
})

describe("pageRoute", () => {
    test("follows redirects when { followRedirects: true }", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let route = await router.resolve('/examples', { followRedirects: true })
        expect(route.url.pathname).toBe('/examples/basic/')
    })
})

describe("siteMap", () => {
    test("includes redirects", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolveSiteMap('/')
        expect(Object.keys(map.redirects).length).toBe(1)
    })
})