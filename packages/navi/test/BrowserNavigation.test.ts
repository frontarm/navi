import { createBrowserNavigation, mount, route } from '../src'

function createRoutes() {
  let i = 0

  return mount({
    '/': route(),
    '/test': route(async req => {
      if (req.method === 'POST' && !req.headers.token) {
        throw new Error('unauthenticated')
      }

      let memo1 = await req.memo(() => ++i)
      let memo2 = await req.memo(() => ++i)

      return {
        view: {
          method: req.method,
          body: req.body,
          memo1,
          memo2,
          memoExecutions: i,
        }
      }
    }),
  })
}

function createTestNavigation() {
  history.pushState({}, '', '/')
  return createBrowserNavigation({
    routes: createRoutes()
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
    expect(r.views[0].body).toBe('hello')
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

    expect(r.views[0].method).toBe('GET')
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

  test("on 'back', request.memoize() callbacks are not called again", async () => {
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
    expect(r.views[0].method).toBe('POST')
    expect(r.views[0].memo1).toBe(1)
    expect(r.views[0].memo2).toBe(2)
    expect(r.views[0].memoExecutions).toBe(2)
  })

  describe("extract()ing a state and reusing it in another BrowserNavigation", () => {
    test("does not call memo callbacks again", async () => {
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
  
      await nav.getSteadyValue()

      let nav1 = createBrowserNavigation({
        serverState: nav.extract(),
        routes: createRoutes()
      })
      
      let r = await nav1.getSteadyValue()

      expect(nav.history.length).toBe(originalHistoryLength + 2)
      expect(r.url.pathname).toBe('/test/')
      expect(r.views[0].method).toBe('POST')
      expect(r.views[0].memo1).toBe(1)
      expect(r.views[0].memo2).toBe(2)
      expect(r.views[0].memoExecutions).toBe(0)
    })
  })
})