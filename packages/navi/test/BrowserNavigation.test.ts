import { createBrowserNavigation, compose, map, mount, redirect, route, withState } from '../src'

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

      return compose(
        withState(req => {
          let memo
          if (!req.state.memo) {
            return { memo: ++i }
          }
          return null
        }),
        route(req => ({
          view: {
            method: req.method,
            body: req.body,
            memo: req.state.memo,
            memoExecutions: i,
          }
        }))
      )
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
    await nav.getRoute()
    let r = await nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })

    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].body).toBe('hello')
    expect(window.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to the same path but a different hash defaults to history.push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    nav.navigate('/test#1')
    await nav.navigate('/test#2')

    expect(window.history.length).toBe(originalHistoryLength + 2)
  })

  test("navigating to exactly the current URL defaults to replace instead of push", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    await nav.getRoute()
    nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    let r = await nav.navigate('/test')

    expect(r.views[0].method).toBe('GET')
    expect(window.history.length).toBe(originalHistoryLength + 1)
  })

  test("navigating to a redirect away from the current URL, and then navigating back remembers state", async () => {
    let nav = createTestNavigation()
    let r = await nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    expect(r.views[0].memo).toBe(1)
    expect(r.views[0].memoExecutions).toBe(1)
    r = await nav.navigate('/test?redirect')
    expect(r.url.pathname).toBe('/')
    r = await nav.goBack()
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].memo).toBe(1)
    expect(r.views[0].memoExecutions).toBe(1)
  })

  test("on 'back', previous state is reused", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    await nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    await nav.navigate('/')

    let r = await nav.goBack()

    expect(window.history.length).toBe(originalHistoryLength + 2)
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].method).toBe('POST')
    expect(r.views[0].memo).toBe(1)
    expect(r.views[0].memoExecutions).toBe(1)
  })

  test("extractState() can be used to pass state to another Navigation object", async () => {
    let nav = createTestNavigation()
    let originalHistoryLength = window.history.length
    await nav.navigate('/test', {
      body: 'hello',
      headers: { token: 'auth' },
      method: 'POST',
    })
    await nav.navigate('/')
    await nav.goBack()

    let nav1 = createBrowserNavigation({
      state: nav.extractState(),
      routes: createRoutes()
    })
    
    let r = await nav1.getRoute()

    expect(window.history.length).toBe(originalHistoryLength + 2)
    expect(r.url.pathname).toBe('/test')
    expect(r.views[0].method).toBe('POST')
    expect(r.views[0].memo).toBe(1)
    expect(r.views[0].memoExecutions).toBe(0)
  })
})