import { createMemoryNavigation, createSwitch, createRedirect, createPage } from '../src'

describe("Switch", () => {
  test("Passes correct pathname into path getter function", async () => {
    let nav = createMemoryNavigation({
      url: '/from',
      pages: createSwitch({
        paths: {
          '/from': env => createRedirect('/to?from='+encodeURIComponent(env.pathname)),
          '/to': env => createPage({ title: null }),
        }
      }),
    })

    let { route } = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/to/')
    expect(route.url.query.from).toBe('/from')
  })
})
