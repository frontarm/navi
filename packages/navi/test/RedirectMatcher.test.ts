import { createMemoryNavigation, mount, redirect, route } from '../src'

describe("Redirect", () => {
  test("Supports relative paths", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from',
      routes: mount({
        '/switch': mount({
          '/from': redirect('../to'),
          '/to': route({})
        }),
      }),
    })

    let r = await nav.getRoute()
    
    expect(r.url.pathname).toBe('/switch/to')
  })

  test("Defaults to exact mode", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from/nested',
      routes: mount({
        '/switch': mount({
          '/from': redirect('../to'),
          '/to': route({})
        }),
      }),
    })

    let r = await nav.getRoute()
    
    expect(r.type).toBe('error')
  })

  test("Supports non-exact mode", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from/nested',
      routes: mount({
        '/switch': mount({
          '/from': redirect('../to', { exact: false }),
          '/to': route({})
        }),
      }),
    })

    let r = await nav.getRoute()
    
    expect(r.type).not.toBe('error')
    expect(r.url.pathname).toBe('/switch/to')
  })
})
