import { createMemoryNavigation, map, mount, redirect, route } from '../src'

describe("Mount", () => {
  test("Passes correct pathname into path getter function", async () => {
    let nav = createMemoryNavigation({
      url: '/from',
      routes: mount({
        '/from': map(req => redirect(req => '/to?from='+encodeURIComponent(req.mountpath))),
        '/to': map(req => route({ view: 'test' })),
      }),
    })

    let r = await nav.getRoute()
    
    expect(r.url.pathname).toBe('/to')
    expect(r.url.query.from).toBe('/from')
  })

  test("Fails when non-functions are specified as paths", async () => {
    try {
      await createMemoryNavigation({
        url: '/from',
        routes: mount({
          '/fail': {title: 'this fails'}
          '/this-also-fails': {title: 'this too'}
        })
      })
    } catch (e) {
      expect(e.message.indexOf('/this-also-fails') > -1).toBeTruthy()
      expect(e.message.indexOf('/fail') > -1).toBeTruthy()
    }
  })

  test("Matches wildcard parameters when they start with an adjecent route", async () => {
    let navigation = await createMemoryNavigation({
      url: '/test2',
      routes: mount({
        '/test': route({title: 'no match'})
        '/:x': route({title: 'match'})
      })
    })

    let r = await navigation.getRoute()

    expect(r.title).toEqual('match')
  })
})
