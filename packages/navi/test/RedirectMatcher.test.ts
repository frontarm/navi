import { createMemoryNavigation, mount, redirect, route } from '../src'

describe("Redirect", () => {
  test("Supports relative paths", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from',
      routes: mount({
        '/switch': mount({
          '/from': redirect('./to'),
          '/to': route({})
        }),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.url.pathname).toBe('/switch/to/')
  })
})
