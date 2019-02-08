import { createRouter, map, route } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("pageMap", () => {
  test("mapping over '/' returns full site", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let map = await router.resolveRouteMap('/')
    expect(Object.keys(map).length).toBe(4)
  })
   
  test("mapping over '' returns full site", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let map = await router.resolveRouteMap('/')
    expect(Object.keys(map).length).toBe(4)
  })

  test("does not include contents", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let map = await router.resolveRouteMap('/')
    expect(map['/'].contents.length).toBe(0)
  })

  test("can map from an intermediate url and exclude its index", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let map = await router.resolveRouteMap('/examples', {
      predicate: (segment) => segment.url.pathname !== '/examples/'
    })
    expect(Object.keys(map).length).toBe(2)
  })

  test("supports expandPattern()", async () => {
    let router = createRouter({
      matcher: map({
        '/about': route(),
        '/tags/:name': route()
      })
    })
    let siteMap = await router.resolveSiteMap('/', {
      expandPattern: pattern =>
        pattern !== '/tags/:name'
          ? [pattern]
          : ['/tags/react', '/tags/navi']
    })
    expect(Object.keys(siteMap.routes).length).toBe(3)
  })

  test("excludes patterns with wildcards when expandPattern() is not supplied", async () => {
    let router = createRouter({
      matcher: map({
        '/about': route(),
        '/tags/:name': route()
      })
    })
    let siteMap = await router.resolveSiteMap('/')
    expect(Object.keys(siteMap.routes).length).toBe(1)
  })
})

describe("pageRoute", () => {
  test("follows redirects when { followRedirects: true }", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let route = await router.resolve('/examples', { followRedirects: true })
    expect(route.url.pathname).toBe('/examples/basic/')
  })
})

describe("siteMap", () => {
  test("includes redirects", async () => {
    let router = createRouter({ matcher: fixtureMap })
    let map = await router.resolveSiteMap('/')
    expect(Object.keys(map.redirects).length).toBe(1)
  })
})