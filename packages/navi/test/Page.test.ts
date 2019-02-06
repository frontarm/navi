import { createMemoryNavigation, isValidPage, createPage, createSwitch } from '../src'

describe("Page", () => {
  test("Matches URLs with trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      pages: createSwitch({
        paths: {
          '/test': req => createPage({ title: 'test' }),
        }
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/test/')
  })

  test("Can specify payload using a function", async () => {
    let nav = createMemoryNavigation({
      url: '/test/',
      pages: createSwitch({
        paths: {
          '/test': req => createPage(req => ({ title: req.mountpath })),
        }
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.title).toBe('/test')
  })

  test("Matches URLs with no trailing /", async () => {
    let nav = createMemoryNavigation({
      url: '/test',
      pages: createSwitch({
        paths: {
          '/test': req => createPage({ title: 'test' }),
        }
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/test/')
  })

  test("is a valid page", () => {
    let page = createPage({ title: 'test' })
    expect(isValidPage(page)).toBe(true)
  })
})

describe("isValidPage()", () => {
  test("returns false for a Switch", () => {
    let x = createSwitch({
      paths: {
        '/test': req => createPage({ title: 'test' }),
      }
    })
    expect(isValidPage(x)).toBe(false)
  })
})
