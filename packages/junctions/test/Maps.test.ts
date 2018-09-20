import { createRouter } from '../src'
import { cmsJunction } from './fixtures/junctions'

describe("pageMap", () => {
    test("mapping over '/' returns full site", async () => {
        let router = createRouter(cmsJunction)
        let map = await router.pageMap('/')
        expect(Object.keys(map).length).toBe(3)
    })
     
    test("mapping over '' returns full site", async () => {
        let router = createRouter(cmsJunction)
        let map = await router.pageMap('/')
        expect(Object.keys(map).length).toBe(3)
    })

    test("doesn't include content", async () => {
        let router = createRouter(cmsJunction)
        let map = await router.pageMap('/')
        expect(map['/'].content).toBeUndefined()
    })
})

describe("pageAndRedirectMap", () => {
    test("includes redirects", async () => {
        let router = createRouter(cmsJunction)
        let map = await router.siteMap('/')
        expect(Object.keys(map.redirects).length).toBe(1)
    })
})