import { createMemoryNavigation, map, redirect, route } from '../src'

describe("Map", () => {
  test("Passes correct pathname into path getter function", async () => {
    let nav = createMemoryNavigation({
      url: '/from',
      matcher: map({
        '/from': req => redirect('/to?from='+encodeURIComponent(req.mountpath)),
        '/to': req => route({ content: 'test' }),
      }),
    })

    let r = await nav.getSteadyValue()
    
    expect(r.url.pathname).toBe('/to/')
    expect(r.url.query.from).toBe('/from')
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
