import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import {
  Observable,
  Observer,
  SimpleSubscription,
  createOrPassthroughObserver,
} from './Observable'
import { Resolver } from './Resolver'
import { Segment, BusySegment } from './Segments'
import { MatcherGenerator, MatcherIterator } from './Matcher'
import { RouterMapOptions, Router } from './Router'
import { Env } from './Env'
import { Mapping, mappingAgainstPathname } from './Mapping'
import { createRequest } from './NaviRequest';

interface MapItem {
  url: URLDescriptor
  pathname: string
  fromPathname?: string
  depth: number
  order: number[]
  matcherIterator: MatcherIterator
  lastResult?: IteratorResult<Segment[]>
  segmentsCache?: Segment[]
  lastSegmentCache?: Segment
}

export interface SegmentsMap {
  [name: string]: Segment[]
}

export class SegmentsMapObservable implements Observable<SegmentsMap> {
  private rootContext: any
  private matcherGeneratorFunction: MatcherGenerator<any>
  private rootMapping: Mapping
  private observers: Observer<SegmentsMap>[]
  private isRefreshScheduled: boolean
  private isRefreshing: boolean
  private resolver: Resolver
  private router: Router
  private options: RouterMapOptions
  private lastListenId: number
  
  private seenPathnames: Set<string>
  private mapItems: MapItem[]

  constructor(
    url: URLDescriptor,
    rootContext: any,
    matcherGeneratorClass: MatcherGenerator<any>,
    rootMapping: Mapping,
    resolver: Resolver,
    router: Router<any, any>,
    options: RouterMapOptions,
  ) {
    this.observers = []
    this.lastListenId = 0
    this.mapItems = []
    this.resolver = resolver
    this.router = router
    this.rootContext = rootContext
    this.matcherGeneratorFunction = matcherGeneratorClass
    this.rootMapping = rootMapping
    this.options = options
    this.seenPathnames = new Set()

    let pathname = url.pathname

    // A final '/' always indicates a Page or Redirect, and it
    // doesn't really make sense to build a map of a single page/redirect.
    if (pathname.substr(-1) === '/') {
      pathname = pathname.substr(0, pathname.length - 1)
    }

    this.addToQueue(pathname, 0)
  }

  subscribe(
    onNextOrObserver:
      | Observer<SegmentsMap>
      | ((value: SegmentsMap) => void),
    onError?: (error: any) => void,
    onComplete?: () => void,
  ): SimpleSubscription {
    if (!this.resolver) {
      throw new Error("Can't subscribe to an already-complete RoutingObservable.")
    }

    let observer = createOrPassthroughObserver(
      onNextOrObserver,
      onError,
      onComplete,
    )
    this.observers.push(observer)
    let subscription = new SimpleSubscription(this.handleUnsubscribe, observer)
    if (this.observers.length === 1) {
      this.refresh()
    }
    return subscription
  }

  private async expandPatterns(pattern: string) {
    if (this.options.expandPattern) {
      let expandedPatterns = await this.options.expandPattern(pattern, this.router)
      if (expandedPatterns) {
        return expandedPatterns
      }
    }
    return [pattern].filter(pattern => !/\/:/.test(pattern))
  }

  private handleUnsubscribe = (observer: Observer<SegmentsMap>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleResolverUpdate = (listenId) => {
    if (listenId === this.lastListenId) {
      this.lastListenId++
      if (!this.isRefreshing) {
        this.refresh()
      }
      else if (!this.isRefreshScheduled) {
        this.isRefreshScheduled = true
      }
    }
  }

  private refresh = async () => {
    this.isRefreshScheduled = false
    this.isRefreshing = true

    let allSegments: Segment[] = []
    let i = 0
    while (i < this.mapItems.length) {
      let item = this.mapItems[i]
      let pathname = item.pathname
      let result = item.matcherIterator.next()
      if (!item.lastResult || result.value) {
        item.lastResult = result
      }
      let segments = item.lastResult.value
      let lastSegment = segments[segments.length-1]
      let cachedLastSegment = item.lastSegmentCache
      item.segmentsCache = segments
      item.lastSegmentCache = lastSegment

      // If an item in the map cannot be found, throws an error, or is
      // no longer referenced by other items, then remove it from the
      // map.
      //
      // Note that later items in the map should always be "from" earlier
      // items, so if an earlier item is removed, its referenced items
      // will still be removed.
      if (
        lastSegment.type === "error" ||
        (this.options.predicate && !this.options.predicate(lastSegment))
      ) {
        this.removeFromQueue(item)
        continue
      }

      let lastSegmentRedirectsTo: string | undefined
      let cachedLastSegmentRedirectTo: string | undefined
      if (lastSegment.type === 'redirect') {
        lastSegmentRedirectsTo = lastSegment.to
      }
      if (cachedLastSegment && cachedLastSegment.type === 'redirect') {
        cachedLastSegmentRedirectTo = cachedLastSegment.to
      }

      // If a redirect has been added or changed `to` location,
      // then add the location to the map.
      if (
        this.options.followRedirects &&
        lastSegmentRedirectsTo &&
        lastSegmentRedirectsTo !== cachedLastSegmentRedirectTo
      ) {
        this.addToQueue(lastSegmentRedirectsTo, item.depth + 1, pathname, item.order)
      }

      if (
        lastSegment.type === 'mount' &&
        (!cachedLastSegment ||
          cachedLastSegment.type !== 'mount')
      ) {
        let patterns = lastSegment.patterns
        for (let j = 0; j < patterns.length; j++) {
          let expandedPatterns = await this.expandPatterns(joinPaths(pathname, patterns[j]))
          for (let k = 0; k < expandedPatterns.length; k++) {
            this.addToQueue(
              expandedPatterns[k],
              item.depth + 1,
              pathname,
              item.order.concat(j, k)
            )
          }
        }
      }

      if (segments) {
        allSegments = allSegments.concat(segments)
      }
      i++
    }

    let segmentsMapArray = [] as [string, Segment[], number[]][]
    for (let i = 0; i < this.mapItems.length; i++) {
      let item = this.mapItems[i]
      let lastSegment = item.lastSegmentCache!
      if (lastSegment.type !== 'mount' && lastSegment.type !== 'error') {
        segmentsMapArray.push([
          joinPaths(item.pathname, '/'),
          item.segmentsCache!,
          item.order
        ])
      }
    }

    let listenId = ++this.lastListenId
    let handleUpdate = () => this.handleResolverUpdate(listenId)
    Promise.race(
      allSegments
            .filter(isBusy)
            .map(pickSegmentPromise)
    ).then(handleUpdate, handleUpdate)

    segmentsMapArray.sort((itemX, itemY) => {
      let x = itemX[2]
      let y = itemY[2]
    
      if (x.length < y.length) {
        return -1
      }
      if (x.length > y.length) {
        return 1
      }
    
      for (let i = 0; i < x.length; i++) {
        if (x[i] < y[i]) {
          return -1
        }
        if (x[i] > y[i]) {
          return 1
        }
      }
      
      return 0
    })

    if (this.isRefreshScheduled) {
      this.refresh()
    }
    else {
      let segmentsMap: SegmentsMap = {}
      let isSteady = true
      for (let i = 0; i < segmentsMapArray.length; i++) {
        let [pathname, segments] = segmentsMapArray[i]
        if (segments.some(segment => segment.type === 'busy')) {
          isSteady = false
        }
        segmentsMap[pathname] = segments
      }
      
      for (let i = 0; i < this.observers.length; i++) {
        let observer = this.observers[i]
        observer.next(segmentsMap)
        if (isSteady && observer.complete) {
          observer.complete()
        }
      }
      if (isSteady) {
        delete this.rootContext
        delete this.mapItems
        delete this.router
        delete this.observers
        delete this.resolver
      }

      this.isRefreshing = false
    }
  }

  private removeFromQueue(item) {
    let i = this.mapItems.indexOf(item)
    if (i !== -1) {
      this.mapItems.splice(i, 1)
    }
  }

  private addToQueue(pathname: string, depth: number, fromPathname?: string, order = [0]) {
    if (this.seenPathnames.has(pathname)) {
      return
    }

    if (!this.options.maxDepth || depth <= this.options.maxDepth) {
      this.seenPathnames.add(pathname)

      let url = createURLDescriptor(pathname, {
        ensureTrailingSlash: false,
        removeHash: true,
      })
      let rootEnv = {
        context: this.rootContext,
        request: createRequest(this.rootContext, {
          body: null,
          headers: this.options.headers || {},
          method: this.options.method || 'HEAD',
          params: {},
          hostname: this.options.hostname || '',
          mountpath: '',
          query: url.query,
          search: url.search,
          router: this.router,
          path: url.pathname,
          url: url.pathname+url.search,
          originalUrl: url.href,
        }),
      }
      let matchEnv = mappingAgainstPathname(
        rootEnv,
        this.rootMapping,
        false,
      )
      if (matchEnv) {
        this.mapItems.push({
          url,
          fromPathname,
          depth,
          pathname,
          order,
          matcherIterator: this.matcherGeneratorFunction({
            env: matchEnv,
            appendFinalSlash: false,
            resolver: this.resolver,
          }),
        })
      }
    }
  }
}

function isBusy(segment: Segment): segment is BusySegment {
  return segment.type === 'busy'
}

function pickSegmentPromise(segment: BusySegment): PromiseLike<any> {
  return segment.promise
}