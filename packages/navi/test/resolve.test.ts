import { crawl, mount, resolve, route, withData, withTitle } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("resolve", () => {
  test("does not follow redirects when { followRedirects: false }", async () => {
    let route = await resolve({
      followRedirects: false,
      routes: fixtureMap,
      url: '/examples/',
    })
    expect(route.type).toBe('redirect')
  })

  test("follows redirects when { followRedirects: true }", async () => {
    let route = await resolve({
      followRedirects: true,
      routes: fixtureMap,
      url: '/examples/',
    })
    expect(route.url.pathname).toBe('/examples/basic')
  })

  test("can accept an array of urls", async () => {
    let routes = await resolve({
      followRedirects: true,
      routes: fixtureMap,
      urls: ['/examples/basic/', '/examples/advanced/'],
    })
    expect(routes.length).toBe(2)
  })
})