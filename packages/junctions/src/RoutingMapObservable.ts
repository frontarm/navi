import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { Junction } from './Junction'
import {
  Observable,
  Observer,
  SimpleSubscription,
  createOrPassthroughObserver,
} from './Observable'
import { Resolver, Resolvable } from './Resolver'
import {
  JunctionRoute,
  Route,
  RouteType,
  Status,
  PlaceholderRoute,
} from './Route'
import { RouterMapOptions, Router } from './Router'
import { RoutingMapState, isRoutingStateMapSteady } from './Maps'
import { createRoute } from './RoutingState'
import { RouterEnv } from './RouterEnv'
import { Mapping, matchMappingAgainstPathname } from './Mapping'
import { HTTPMethod } from './HTTPMethod'

interface QueueItem {
  url: URLDescriptor
  fromPathname?: string
  depth: number
  matcher: Junction['prototype']
  routeCache?: JunctionRoute | PlaceholderRoute
  lastRouteCache?: Route
}

export class RoutingMapObservable implements Observable<RoutingMapState> {
  private cachedSiteMap: RoutingMapState
  private rootContext: any
  private rootJunction: Junction
  private rootMapping: Mapping
  private observers: Observer<RoutingMapState>[]
  private resolver: Resolver
  private router: Router
  private options: RouterMapOptions

  private followRedirects?: boolean
  private maxDepth?: number
  private predicate?: (route: Route) => boolean

  private queuePathnames: string[]
  private queueItems: QueueItem[]

  constructor(
    url: URLDescriptor,
    rootContext: any,
    rootJunction: Junction,
    rootMapping: Mapping,
    resolver: Resolver,
    router: Router,
    options: RouterMapOptions,
  ) {
    this.observers = []
    this.queuePathnames = []
    this.queueItems = []
    this.resolver = resolver
    this.rootContext = rootContext
    this.rootJunction = rootJunction
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
      | Observer<RoutingMapState>
      | ((value: RoutingMapState) => void),
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

  private handleUnsubscribe = (observer: Observer<RoutingMapState>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleChange = () => {
    this.refresh()

    let isSteady = isRoutingStateMapSteady(this.cachedSiteMap)
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
      delete this.predicate
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
      let { route, resolutionIds } = item.matcher.getResult()
      let lastRoute = route.lastRemainingRoute || route
      let cachedLastRoute = item.lastRouteCache
      item.routeCache = route
      item.lastRouteCache = lastRoute

      // If an item in the map cannot be found, throws an error, or is
      // no longer referenced by other items, then remove it from the
      // map.
      //
      // Note that later items in the map should always be "from" earlier
      // items, so if an earlier item is removed, its referenced items
      // will still be removed.
      if (
        lastRoute.status === Status.Error ||
        (this.predicate && !this.predicate(lastRoute))
      ) {
        this.removeFromQueue(pathname)
        continue
      }

      // If a redirect has been added or changed `to` location,
      // then add the location to the map.
      if (
        this.followRedirects &&
        lastRoute.type === RouteType.Redirect &&
        lastRoute.status === Status.Ready &&
        lastRoute.to &&
        (!cachedLastRoute ||
          cachedLastRoute.type !== RouteType.Redirect ||
          cachedLastRoute.status !== Status.Ready ||
          !cachedLastRoute.to ||
          cachedLastRoute.to !== lastRoute.to)
      ) {
        this.addToQueue(lastRoute.to, item.depth + 1, pathname)
      }

      if (
        lastRoute.type === RouteType.Junction &&
        lastRoute.status === Status.Ready &&
        (!cachedLastRoute ||
          cachedLastRoute.type !== RouteType.Junction ||
          cachedLastRoute.status === Status.Busy ||
          cachedLastRoute.junction !== lastRoute.junction)
      ) {
        let mappings = lastRoute.junction.mappings
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
      let lastRoute = item.lastRouteCache!
      if (lastRoute.type !== RouteType.Junction && lastRoute.status !== Status.Error) {
        this.cachedSiteMap[joinPaths(url, '/')] = createRoute(
          createURLDescriptor(url, { ensureTrailingSlash: false }),
          item.routeCache!,
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
      (!this.maxDepth || depth <= this.maxDepth)
    ) {
      let url = createURLDescriptor(pathname, { ensureTrailingSlash: false })
      let rootEnv: RouterEnv = {
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
          matcher: new this.rootJunction({
            appendFinalSlash: false,
            env: matchEnv,
            resolver: this.resolver,
          }),
        })
      }
    }
  }
}
