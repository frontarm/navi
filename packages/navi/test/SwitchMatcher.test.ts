import { createMemoryNavigation, isValidMapMatcher, map, redirect, page } from '../src'

describe("Map", () => {
  test("Passes correct pathname into path getter function", async () => {
    let nav = createMemoryNavigation({
      url: '/from',
      matcher: map({
        '/from': req => redirect('/to?from='+encodeURIComponent(req.mountpath)),
        '/to': req => page({ title: null }),
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/to/')
    expect(route.url.query.from).toBe('/from')
  })

  test("is a valid map", () => {
    let x = map({
      '/test': page({
        title: 'test'
      })
    })

    expect(isValidMapMatcher(x)).toBe(true)
  })

  test("Fails when non-functions are specified as paths", async () => {
    try {
      await createMemoryNavigation({
        url: '/from',
        matcher: map({
          '/fail': {title: 'this fails'}
          '/this-also-fails': {title: 'this too'}
        })
      })
    } catch (e) {
      expect(e.message.indexOf('/this-also-fails') > -1).toBeTruthy()
      expect(e.message.indexOf('/fail') > -1).toBeTruthy()
    }
  })
})

describe("isValidMapMatcher()", () => {
  test("returns false for a Redirect", () => {
    let page = redirect('/to')
    expect(isValidMapMatcher(page)).toBe(false)
  })
})
