import { createMemoryNavigation, route, map } from '../src'

describe("ContentMatcher", () => {
  test("Matches URLs with trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      matcher: map({
        '/test': route({}),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.url.pathname).toBe('/test/')
  })

  test("Can specify payload using a function", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      matcher: map({
        '/test': route(req => ({ info: { title: req.mountpath } })),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.info.title).toBe('/test')
  })

  test("Matches URLs with no trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test',
      matcher: map({
        '/test': route({}),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.url.pathname).toBe('/test/')
  })
})
