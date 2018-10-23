import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { Switch } from './Switch'
import {
  Observable,
  Observer,
  SimpleSubscription,
  createOrPassthroughObserver,
} from './Observable'
import { Status, Resolver } from './Resolver'
import {
  SwitchSegment,
  Segment,
  SegmentType,
  PlaceholderSegment,
} from './Segments'
import { RouterMapOptions, Router } from './Router'
import { RouteMap, isRouteMapSteady } from './Maps'
import { createRoute } from './Route'
import { Env } from './Env'
import { Mapping, matchMappingAgainstPathname } from './Mapping'
import { HTTPMethod } from './HTTPMethod'

interface QueueItem {
  url: URLDescriptor
  fromPathname?: string
  depth: number
  matcher: Switch['prototype']
  segmentCache?: SwitchSegment | PlaceholderSegment
  lastSegmentCache?: Segment
}

export class RouteMapObservable implements Observable<RouteMap> {
  private cachedSiteMap: RouteMap
  private rootContext: any
  private rootSwitch: Switch
  private rootMapping: Mapping
  private observers: Observer<RouteMap>[]
  private resolver: Resolver
  private router: Router
  private options: RouterMapOptions

  private queuePathnames: string[]
  private queueItems: QueueItem[]

  constructor(
    url: URLDescriptor,
    rootContext: any,
    rootSwitch: Switch,
    rootMapping: Mapping,
    resolver: Resolver,
    router: Router,
    options: RouterMapOptions,
  ) {
    this.observers = []
    this.queuePathnames = []
    this.queueItems = []
    this.resolver = resolver
    this.router = router
    this.rootContext = rootContext
    this.rootSwitch = rootSwitch
    this.rootMapping = rootMapping
    this.options = options

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
      | Observer<RouteMap>
      | ((value: RouteMap) => void),
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
      this.handleChange()
    }
    return subscription
  }

  private handleUnsubscribe = (observer: Observer<RouteMap>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleChange = () => {
    this.refresh()

    let isSteady = isRouteMapSteady(this.cachedSiteMap)
    for (let i = 0; i < this.observers.length; i++) {
      let observer = this.observers[i]
      observer.next(this.cachedSiteMap)
      if (isSteady && observer.complete) {
        observer.complete()
      }
    }
    if (isSteady) {
      this.resolver.unlisten(this.handleChange)

      delete this.rootContext
      delete this.queueItems
      delete this.router
      delete this.observers
      delete this.resolver
    }
  }

  private refresh = () => {
    let allResolvableIds: number[] = []
    let i = 0
    while (i < this.queuePathnames.length) {
      let pathname = this.queuePathnames[i]
      let item = this.queueItems[i]
      let { segment, resolutionIds } = item.matcher.getResult()
      let lastSegment = segment.lastRemainingSegment || segment
      let cachedLastSegment = item.lastSegmentCache
      item.segmentCache = segment as SwitchSegment
      item.lastSegmentCache = lastSegment

      // If an item in the map cannot be found, throws an error, or is
      // no longer referenced by other items, then remove it from the
      // map.
      //
      // Note that later items in the map should always be "from" earlier
      // items, so if an earlier item is removed, its referenced items
      // will still be removed.
      if (
        lastSegment.status === Status.Error ||
        (this.options.predicate && !this.options.predicate(lastSegment))
      ) {
        this.removeFromQueue(pathname)
        continue
      }

      // If a redirect has been added or changed `to` location,
      // then add the location to the map.
      if (
        this.options.followRedirects &&
        lastSegment.type === SegmentType.Redirect &&
        lastSegment.status === Status.Ready &&
        lastSegment.to &&
        (!cachedLastSegment ||
          cachedLastSegment.type !== SegmentType.Redirect ||
          cachedLastSegment.status !== Status.Ready ||
          !cachedLastSegment.to ||
          cachedLastSegment.to !== lastSegment.to)
      ) {
        this.addToQueue(lastSegment.to, item.depth + 1, pathname)
      }

      if (
        lastSegment.type === SegmentType.Switch &&
        lastSegment.status === Status.Ready &&
        (!cachedLastSegment ||
          cachedLastSegment.type !== SegmentType.Switch ||
          cachedLastSegment.status === Status.Busy)
      ) {
        let mappings = lastSegment.switch.mappings
        for (let j = 0; j < mappings.length; j++) {
          this.addToQueue(
            joinPaths(pathname, mappings[j].pattern),
            item.depth + 1,
            pathname,
          )
        }
      }

      if (resolutionIds) {
        allResolvableIds = allResolvableIds.concat(resolutionIds)
      }
      i++
    }

    // This will replace any existing listener and its associated resolvables
    this.resolver.listen(this.handleChange, allResolvableIds)

    this.cachedSiteMap = {}
    for (let i = 0; i < this.queuePathnames.length; i++) {
      let url = this.queuePathnames[i]
      let item = this.queueItems[i]
      let lastSegment = item.lastSegmentCache!
      if (lastSegment.type !== SegmentType.Switch && lastSegment.status !== Status.Error) {
        this.cachedSiteMap[joinPaths(url, '/')] = createRoute(
          createURLDescriptor(url, { ensureTrailingSlash: false }),
          item.segmentCache!,
        )
      }
    }
  }

  private removeFromQueue(url) {
    let i = this.queuePathnames.indexOf(url)
    if (i !== -1) {
      this.queuePathnames.splice(i, 1)
      this.queueItems.splice(i, 1)
    }
  }

  private addToQueue(pathname: string, depth: number, fromPathname?: string) {
    if (
      this.queuePathnames.indexOf(pathname) === -1 &&
      (!this.options.maxDepth || depth <= this.options.maxDepth)
    ) {
      let url = createURLDescriptor(pathname, { ensureTrailingSlash: false })
      let rootEnv: Env = {
        context: this.rootContext,
        method: HTTPMethod.Get,
        params: {},
        pathname: '',
        query: url.query,
        router: this.router,
        unmatchedPathnamePart: url.pathname,
      }
      let matchEnv = matchMappingAgainstPathname(
        rootEnv,
        this.rootMapping,
        false,
      )
      if (matchEnv) {
        this.queuePathnames.push(pathname)
        this.queueItems.push({
          url,
          fromPathname,
          depth,
          matcher: new this.rootSwitch({
            appendFinalSlash: false,
            env: matchEnv,
            resolver: this.resolver,
          }),
        })
      }
    }
  }
}
