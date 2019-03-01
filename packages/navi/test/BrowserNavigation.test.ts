import { createBrowserNavigation, mount, route } from '../src'

function createTestNavigation() {
  history.pushState({}, '', '/')
  return createBrowserNavigation({
    routes: mount({
      '/': route(),
      '/test': route(req => {
        if (req.method === 'POST' && !req.headers.token) {
          throw new Error('unauthenticated')
        }

        return {
          view: req.method === 'POST' ? req.body : (req.originalMethod ? 'original:'+req.originalMethod : 'get')
        }
      }),
    }),
  })
}

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    createTestNavigation()
  })

  test("matchers have access to method, body and headers", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = nav.history.length
    await nav.steady()
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })

    let r = await nav.getSteadyValue()

    expect(r.url.pathname).toBe('/test/')
    expect(r.views[0]).toBe('hello')
    expect(nav.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to exactly the current URL defaults to replace instead of push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = nav.history.length
    await nav.steady()
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    nav.navigate('/test')

    let r = await nav.getSteadyValue()

    expect(r.views[0]).toBe('get')
    expect(nav.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to the same path but a different hash defaults to history.push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = nav.history.length
    nav.navigate('/test/#1')
    nav.navigate('/test/#2')

    await nav.steady()

    expect(nav.history.length).toBe(originalHistoryLength + 2)
  })

  test("on 'back', POST requests are converted to GET with originalMethod", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = nav.history.length
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    nav.navigate('/')

    await nav.steady()

    nav.history.goBack()

    // Need to wait a bit for the popstate to be fired
    await new Promise(resolve => setTimeout(resolve, 50))

    let r = await nav.getSteadyValue()

    expect(nav.history.length).toBe(originalHistoryLength + 2)
    expect(r.url.pathname).toBe('/test/')
    expect(r.views[0]).toBe('original:POST')
  })
})