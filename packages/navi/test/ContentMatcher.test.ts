import { createMemoryNavigation, isValidContentMatcher, page, map } from '../src'

describe("ContentMatcher", () => {
  test("Matches URLs with trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      matcher: map({
        '/test': page({ title: 'test' }),
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/test/')
  })

  test("Can specify payload using a function", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      matcher: map({
        '/test': page(req => ({ title: req.mountpath })),
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.title).toBe('/test')
  })

  test("Matches URLs with no trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test',
      matcher: map({
        '/test': page({ title: 'test' }),
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/test/')
  })

  test("is a valid content matcher", () => {
    let pageMatcher = page({ title: 'test' })
    expect(isValidContentMatcher(pageMatcher)).toBe(true)
  })
})

describe("isValidContentMatcher()", () => {
  test("returns false for a Map", () => {
    let x = map({
      '/test': page({ title: 'test' }),
    })
    expect(isValidContentMatcher(x)).toBe(false)
  })
})
