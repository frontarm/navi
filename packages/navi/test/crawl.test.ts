import { compose, crawl, mount, route, withCrawlerPatterns, withData, withTitle } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("crawl", () => {
  let routes = mount({
    '/a': mount({
      '/': withData('test', withTitle('a')),
      '/b': withData('test', withTitle('b')),
      '/c': withData('test', withTitle('b'))
    }),
    '/d': withData('test', withTitle('b'))
  })

  test("crawl returns full site", async () => {
    let paths = await crawl({
      routes: fixtureMap
    })
    expect(paths.paths.length).toBe(4)
    expect(paths.redirects).toEqual({
      '/examples/': '/examples/basic',
    })
  })

  test("can crawl from a root url", async () => {
    let { paths } = await crawl({
      routes,
      root: '/a/'
    })
    expect(paths.length).toBe(3)
  })

  test("can crawl from a root url and exclude its index", async () => {
    let { paths } = await crawl({
      routes,
      root: '/a'
      predicate: (item) => item.url.pathname !== '/a/'
    })
    expect(paths.length).toBe(2)
  })

  test("supports expandPattern()", async () => {
    let { paths } = await crawl({
      routes: mount({
        '/about': route(),
        '/tags/:name': route()
      }),
      expandPattern: pattern =>
        pattern !== '/tags/:name'
          ? [pattern]
          : ['/tags/react', '/tags/navi']
    })
    expect(paths).toEqual([
      '/about',
      '/tags/react',
      '/tags/navi',
    ])
  })

  test("can use withCrawlerPatterns to expand paths", async () => {
    let { paths } = await crawl({
      routes: compose(
        withCrawlerPatterns({
          '/tags/:name': async () => ['/tags/react', '/tags/navi']
        }),
        mount({
          '/about': route(),
          '/tags/:name': route()
        })
      ),
      expandPattern: pattern =>
        pattern !== '/tags/:name'
          ? [pattern]
          : ['/tags/react', '/tags/navi']
    })
    expect(paths).toEqual([
      '/about',
      '/tags/react',
      '/tags/navi',
    ])
  })

  test("excludes patterns with parameters when expandPattern() is not supplied", async () => {
    let { paths } = await crawl({
      routes: mount({
        '/about': route(),
        '/tags/:name': route()
      }),
    })
    expect(paths.length).toBe(1)
  })

  test("crawled paths follow same order as mount() definitions", async () => {
    let { paths } = await crawl({
      routes: fixtureMap,
      root: '/examples/',
    })
    expect(paths).toEqual([
      '/examples/basic',
      '/examples/advanced'
    ])
  })
})