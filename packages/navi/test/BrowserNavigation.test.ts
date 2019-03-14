import { createBrowserNavigation, map, mount, redirect, route } from '../src'

function createRoutes() {
  let i = 0

  return mount({
    '/': route(),
    '/test': map(async req => {
      if (req.method === 'POST' && !req.headers.token) {
        throw new Error('unauthenticated')
      }

      if (req.params.redirect !== undefined) {
        return redirect('/')
      }

      let memo1
      try {
        memo1 = await req.serializeEffectToHistory(async () => {
          ++i
          if (req.params.fail !== undefined) {
            throw new Error()
          }
          return i
        })
      }
      catch (e) {}

      let memo2 = await req.serializeEffectToHistory(() => ++i)

      return route({
        view: {
          method: req.method,
          body: req.body,
          memo1,
          memo2,
          memoExecutions: i,
        }
      })
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
    let originalHistoryLength = window.history.length
    await nav.steady()
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })

    let r = await nav.getSteadyValue()

    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].body).toBe('hello')
    expect(window.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to the same path but a different hash defaults to history.push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    nav.navigate('/test#1')
    nav.navigate('/test#2')

    await nav.steady()

    expect(window.history.length).toBe(originalHistoryLength + 2)
  })

  test("navigating to exactly the current URL defaults to replace instead of push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    await nav.steady()
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    nav.navigate('/test')

    let r = await nav.getSteadyValue()

    expect(r.views[0].method).toBe('GET')
    expect(window.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to a redirect away from the current URL, and then navigating back remembers the effects", async () => {
    let nav = createTestNavigation()
    let r = await nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    expect(r.views[0].memo1).toBe(1)
    expect(r.views[0].memo2).toBe(2)
    expect(r.views[0].memoExecutions).toBe(2)
    r = await nav.navigate('/test?redirect')
    expect(r.url.pathname).toBe('/')
    r = await nav.goBack()
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].memo1).toBe(1)
    expect(r.views[0].memo2).toBe(2)
    expect(r.views[0].memoExecutions).toBe(2)
  })

  test("on 'back', successful request.memoize() callbacks are not called again", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    nav.navigate('/')

    await nav.steady()
    let r = await nav.goBack()

    expect(window.history.length).toBe(originalHistoryLength + 2)
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].method).toBe('POST')
    expect(r.views[0].memo1).toBe(1)
    expect(r.views[0].memo2).toBe(2)
    expect(r.views[0].memoExecutions).toBe(2)
  })

  test("on 'back', failed request.memoize() callbacks are not called again", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    nav.navigate('/test?fail', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    nav.navigate('/')

    await nav.steady()

    let r = await nav.goBack()

    expect(window.history.length).toBe(originalHistoryLength + 2)
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].method).toBe('POST')
    expect(r.views[0].memo2).toBe(2)
    expect(r.views[0].memoExecutions).toBe(2)
  })

  describe("extract()ing a state and reusing it in another BrowserNavigation", () => {
    test("does not call memo callbacks again", async () => {
      let nav = createTestNavigation()
      let originalHistoryLength = window.history.length
      nav.navigate('/test', {
        body: 'hello',
        headers: { token: 'auth' },
        method: 'POST',
      })
      nav.navigate('/')
  
      await nav.steady()
      await nav.goBack()
  
      let nav1 = createBrowserNavigation({
        serverStates: nav.extract(),
        routes: createRoutes()
      })
      
      let r = await nav1.getSteadyValue()

      expect(window.history.length).toBe(originalHistoryLength + 2)
      expect(r.url.pathname).toBe('/test')
      expect(r.views[0].method).toBe('POST')
      expect(r.views[0].memo1).toBe(1)
      expect(r.views[0].memo2).toBe(2)
      expect(r.views[0].memoExecutions).toBe(0)
    })
  })
})