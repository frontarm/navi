import { createRouter } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("pageMap", () => {
    test("mapping over '/' returns full site", async () => {
        let router = createRouter({ rootJunction: cmsJunction })
        let map = await router.pageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })
     
    test("mapping over '' returns full site", async () => {
        let router = createRouter({ rootJunction: cmsJunction })
        let map = await router.pageMap('/')
        expect(Object.keys(map).length).toBe(4)
    })

    test("doesn't include content", async () => {
        let router = createRouter({ rootJunction: cmsJunction })
        let map = await router.pageMap('/')
        expect(map['/'].content).toBeUndefined()
    })
})

describe("pageRoute", () => {
    test("follows redirects when { followRedirects: true }", async () => {
        let router = createRouter({ rootJunction: cmsJunction })
        let route = await router.pageRoute('/examples', { followRedirects: true })
        expect(route.url).toBe('/examples/basic')
    })
})

describe("pageAndRedirectMap", () => {
    test("includes redirects", async () => {
        let router = createRouter({ rootJunction: cmsJunction })
        let map = await router.siteMap('/')
        expect(Object.keys(map.redirects).length).toBe(1)
    })
})