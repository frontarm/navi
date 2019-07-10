import { Matcher, MatcherGenerator } from './Matcher'
import { createRootMapping, matchAgainstPathname, Mapping } from './Mapping'
import { ChunkListObservable } from './ChunkListObservable'
import { ChunksMapObservable } from './ChunksMapObservable'
import { Route, routeReducer } from './Route'
import { Chunk } from './Chunks'
import { SiteMap, RouteMap } from './Maps'
import { createPromiseFromObservable } from './Observable'
import { createURLDescriptor, URLDescriptor } from './URLTools'
import { OutOfRootError } from './Errors'
import { Crawler } from './Crawler'

export interface RouterOptions<Context extends object> {
  context?: Context
  routes?: Matcher<Context>
  basename?: string
}

export interface RouterResolveOptions {
  followRedirects?: boolean
  body?: any
  headers?: { [name: string]: string }
  method?: string
  url?: string | URLDescriptor
  crawler?: Crawler
  state?: any
}

export interface RouterMapOptions {
  followRedirects?: boolean
  maxDepth?: number
  predicate?: (chunk: Chunk, chunks: Chunk[]) => boolean
  expandPattern?: (
    pattern: string,
    router: Router,
  ) => undefined | string[] | Promise<undefined | string[]>
  method?: 'GET' | 'HEAD'
  headers?: { [name: string]: string }
  hostname?: string
}

export function createRouter<Context extends object>(
  options: RouterOptions<Context>,
) {
  return new Router(options)
}

export class Router<Context extends object = any> {
  context: Context

  private matcherGenerator: MatcherGenerator<Context>
  private rootMapping: Mapping

  constructor(options: RouterOptions<Context>) {
    this.context = options.context || ({} as any)
    this.matcherGenerator = options.routes!()

    let basename = options.basename
    if (basename && basename.slice(-1) === '/') {
      basename = basename.slice(0, -1)
    }

    this.rootMapping = createRootMapping(options.routes!, basename)
  }

  // Please don't document this API. It should only be used through
  // "createBrowserNavigation()" or "createMemoryNavigation()"
  setContext(context: Context) {
    this.context = context || {}
  }

  createObservable(
    url: URLDescriptor,
    options: RouterResolveOptions,
  ): ChunkListObservable | undefined {
    let request = {
      body: options.body,
      context: this.context,
      headers: options.headers || {},
      method: options.method || 'GET',
      hostname: url.hostname,
      hash: url.hash,
      mountpath: '/',
      params: url.query,
      query: url.query,
      search: url.search,
      url: url.pathname + url.search,
      originalUrl: url.href,
      path: url.pathname,
      crawler: options.crawler,
      state: options.state || {},
    }
    let matchRequest = matchAgainstPathname(request, this.rootMapping)
    if (matchRequest) {
      return new ChunkListObservable(url, matchRequest, this.matcherGenerator)
    }
  }

  createMapObservable(
    urlOrDescriptor: string | Partial<URLDescriptor>,
    options: RouterMapOptions = {},
  ): ChunksMapObservable {
    return new ChunksMapObservable(
      createURLDescriptor(urlOrDescriptor),
      this.context,
      this.matcherGenerator,
      this.rootMapping,
      this,
      options,
    )
  }

  resolve(
    url: string | Partial<URLDescriptor> | RouterResolveOptions,
    options?: RouterResolveOptions,
  ): Promise<Route>
  resolve(
    urls: (string | Partial<URLDescriptor>)[],
    options?: RouterResolveOptions,
  ): Promise<Route[]>
  resolve(
    urls:
      | string
      | Partial<URLDescriptor>
      | (string | Partial<URLDescriptor>)[]
      | RouterResolveOptions,
    options: RouterResolveOptions = {},
  ): Promise<Route | Route[]> {
    let urlDescriptors: URLDescriptor[]

    if (Array.isArray(urls)) {
      urlDescriptors = urls.map(url => createURLDescriptor(url))
    } else if (typeof urls === 'string') {
      urlDescriptors = [createURLDescriptor(urls)]
    } else if ((urls as RouterResolveOptions).url) {
      options = urls as RouterResolveOptions
      urlDescriptors = [createURLDescriptor(options.url!)]
    } else if (options) {
      urlDescriptors = [createURLDescriptor(urls as any)]
    } else {
      throw new Error(`You must specify a URL for router.resolve().`)
    }

    if (!urlDescriptors.length) {
      return Promise.resolve([])
    }

    let promises = urlDescriptors.map(url =>
      this.getPageRoutePromise(url, options),
    )
    return !Array.isArray(urls) ? promises[0] : Promise.all(promises)
  }

  resolveSiteMap(
    urlOrDescriptor: string | Partial<URLDescriptor>,
    options: RouterMapOptions = {},
  ): Promise<SiteMap<Route>> {
    return createPromiseFromObservable(
      this.createMapObservable(urlOrDescriptor, options),
    ).then(chunksMap => {
      let routeMap = {} as RouteMap<Route>
      let redirectMap = {} as { [name: string]: string }
      let urls = Object.keys(chunksMap)
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i]
        let chunks = chunksMap[url]
        let lastChunk = chunks[chunks.length - 1]
        if (lastChunk.type === 'redirect') {
          redirectMap[url] = lastChunk.to
          continue
        } else {
          routeMap[url] = [{ type: 'url', url: createURLDescriptor(url) }]
            .concat(chunks)
            .reduce(routeReducer, undefined)!
        }
      }
      return {
        routes: routeMap,
        redirects: redirectMap,
      }
    })
  }

  resolveRouteMap(
    urlOrDescriptor: string | Partial<URLDescriptor>,
    options: RouterMapOptions = {},
  ): Promise<RouteMap<Route>> {
    return this.resolveSiteMap(urlOrDescriptor, options).then(
      siteMap => siteMap.routes,
    )
  }

  private getPageRoutePromise(
    url: URLDescriptor,
    options: RouterResolveOptions,
  ): Promise<Route> {
    let observable = this.createObservable(url, options)
    if (!observable) {
      return Promise.reject(new OutOfRootError(url))
    }

    return createPromiseFromObservable(observable).then(chunks => {
      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i]
        if (chunk.type === 'busy') {
          break
        }
        if (chunk.type === 'redirect' && options.followRedirects) {
          return this.getPageRoutePromise(
            createURLDescriptor(chunk.to),
            options,
          )
        }
        if (chunk.type === 'error') {
          throw chunk.error
        }
      }

      return [{ type: 'url', url: createURLDescriptor(url) }]
        .concat(chunks)
        .reduce(routeReducer, undefined)!
    })
  }
}
