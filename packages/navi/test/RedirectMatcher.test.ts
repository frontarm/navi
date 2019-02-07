import { createMemoryNavigation, map, redirect, page } from '../src'

describe("Redirect", () => {
  test("Supports relative paths", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from',
      matcher: map({
        '/switch': map({
          '/from': redirect('./to'),
          '/to': page({ title: null })
        }),
      }),
    })

    let route = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/switch/to/')
  })
})
