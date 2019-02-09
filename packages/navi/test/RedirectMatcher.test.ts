import { createMemoryNavigation, map, redirect, route } from '../src'

describe("Redirect", () => {
  test("Supports relative paths", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from',
      routes: map({
        '/switch': map({
          '/from': redirect('./to'),
          '/to': route({})
        }),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.url.pathname).toBe('/switch/to/')
  })
})
