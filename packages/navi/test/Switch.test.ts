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
  test("Fails on non-function as path", async () => {
    try {
      await createMemoryNavigation({
        url: '/from',
        pages: createSwitch({
          paths: {
            '/fail': {title: 'this fails'}
          }
        })
      })
    } catch (e) {
      expect(e.message).toMatch('The given path: /fail is invalid. Path should be an instance of Switch, Page, Redirect, Context or a function. See https://frontarm.com/navi/reference/declarations/#declaring-pages');
    }
  })
  test("Fails on multiple non-functions as paths", async () => {
    try {
      await createMemoryNavigation({
        url: '/from',
        pages: createSwitch({
          paths: {
            '/fail': {title: 'this fails'}
            '/this-also-fails': {title: 'this too'}
          }
        })
      })
    } catch (e) {
      expect(e.message).toMatch('The given paths: /fail, /this-also-fails are invalid. Path should be an instance of Switch, Page, Redirect, Context or a function. See https://frontarm.com/navi/reference/declarations/#declaring-pages');
    }
  })
})
