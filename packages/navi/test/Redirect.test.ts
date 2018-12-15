import { createMemoryNavigation, createSwitch, createRedirect, createPage } from '../src'

describe("Redirect", () => {
  test("Supports relative paths", async () => {
    let nav = createMemoryNavigation({
      url: '/switch/from',
      pages: createSwitch({
        paths: {
          '/switch': createSwitch({
            paths: {
              '/from': createRedirect('./to'),
              '/to': createPage({ title: null })
            }
          }),
        }
      }),
    })

    let { route } = await nav.getSteadyValue()
    
    expect(route.url.pathname).toBe('/switch/to/')
  })
})
