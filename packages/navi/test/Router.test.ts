import { createRouter, createSwitch, createPage } from '../src'
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

    test("does not include contents", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/')
        expect(map['/'].contents.length).toBe(0)
    })

    test("can map from an intermediate url and exclude its index", async () => {
        let router = createRouter({ pages: fixtureSwitch })
        let map = await router.resolvePageMap('/examples', {
            predicate: (segment) => segment.url.pathname !== '/examples/'
        })
        expect(Object.keys(map).length).toBe(2)
    })

    test("supports expandPattern()", async () => {
        let router = createRouter({
            pages: createSwitch({
                paths: {
                    '/about': createPage({
                        title: 'About',
                    }),
                    '/tags/:name': createPage({
                        getTitle: env => `${env.params.name} Tag`
                    })
                }
            })
        })
        let map = await router.resolveSiteMap('/', {
            expandPattern: pattern =>
                pattern !== '/tags/:name'
                    ? [pattern]
                    : ['/tags/react', '/tags/navi']
        })
        expect(Object.keys(map.pages).length).toBe(3)
    })

    test("excludes patterns with wildcards when expandPattern() is not supplied", async () => {
        let router = createRouter({
            pages: createSwitch({
                paths: {
                    '/about': createPage({
                        title: 'About',
                    }),
                    '/tags/:name': createPage({
                        getTitle: env => `${env.params.name} Tag`
                    })
                }
            })
        })
        let map = await router.resolveSiteMap('/')
        expect(Object.keys(map.pages).length).toBe(1)
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