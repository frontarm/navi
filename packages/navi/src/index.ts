//
// Exports
//

export * from './matchers/map'
export * from './matchers/mount'
export * from './matchers/redirect'
export * from './matchers/route'
export * from './matchers/withContext'
export * from './matchers/withCrawlerPatterns'
export * from './matchers/withData'
export * from './matchers/withHead'
export * from './matchers/withHeaders'
export * from './matchers/withState'
export * from './matchers/withStatus'
export * from './matchers/withTitle'
export * from './matchers/withView'
export * from './Errors'
export * from './NaviRequest'
export * from './Chunks'
export * from './URLTools'
export { CrawlItem, Crawler } from './Crawler'
export { crawl, CrawlOptions, CrawlResult } from './crawl'
export { resolve, ResolveOptions } from './resolve'
export { compose } from './utils/compose'
export { Router, createRouter } from './Router'
export { Route, RouteType, routeReducer } from './Route'
export { SiteMap, RouteMap } from './Maps'
export {
  Matcher,
  MatcherGenerator,
  MatcherIterator,
  concatMatcherIterators,
} from './Matcher'
export { Navigation } from './Navigation'
export { Resolvable, default as resolveChunks } from './Resolvable'
export { createBrowserNavigation } from './BrowserNavigation'
export { createMemoryNavigation } from './MemoryNavigation'
export { Observer, Subscription } from './Observable'

//
// Aliases
//

export { map as lazy } from './matchers/map'
