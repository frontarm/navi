import { createRouter } from '../src'
import { fixtureSwitch } from './fixtures/junctions'

describe("pageMap", () => {
    test("mapping over '/' returns full site", async () => {
        let router = createRouter({ rootSwitch: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })
     
    test("mapping over '' returns full site", async () => {
        let router = createRouter({ rootSwitch: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })

    test("doesn't include content", async () => {
        let router = createRouter({ rootSwitch: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(map['/'].content).toBeUndefined()
    })
})

describe("pageRoute", () => {
    test("follows redirects when { followRedirects: true }", async () => {
        let router = createRouter({ rootSwitch: fixtureSwitch })
        let route = await router.resolve('/examples', { followRedirects: true })
        expect(route.url.pathname).toBe('/examples/basic/')
    })
})

describe("siteMap", () => {
    test("includes redirects", async () => {
        let router = createRouter({ rootSwitch: fixtureSwitch })
        let map = await router.resolveSiteMap('/')
        expect(Object.keys(map.redirects).length).toBe(1)
    })
})