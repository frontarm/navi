import { Location, createURL, joinPaths, parseLocationString, areLocationsEqual } from './Location'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
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
  RouteStatus,
  RouteContentStatus,
} from './Route'
import { Router, RouterMapOptions } from './Router'
import { RoutingMapState } from './Maps'
import { createRoutingState } from './RoutingState'

interface QueueItem {
  location: Location
  url: string
  fromURL: string
  depth: number
  matcher: Junction['prototype']
  routeCache?: JunctionRoute
  lastRouteCache?: Route
}

export class RoutingMapObservable implements Observable<RoutingMapState> {
  private cachedSiteMap?: RoutingMapState
  private context: any
  private rootJunction: Junction
  private rootMapping: AbsoluteMapping
  private observers: Observer<RoutingMapState>[]
  private resolver: Resolver
  private router: Router<any>
  private followRedirects?: boolean
  private maxDepth?: number
  private predicate?: (route: Route) => boolean

  private queueURLs: string[]
  private queueItems: QueueItem[]

  constructor(
    context: any,
    topLocation: Location,
    rootJunction: Junction,
    rootMapping: AbsoluteMapping,
    resolver: Resolver,
    router: Router,
    options: RouterMapOptions,
  ) {
    this.observers = []
    this.queueURLs = []
    this.queueItems = []
    this.context = context
    this.resolver = resolver
    this.router = router
    this.rootJunction = rootJunction
    this.rootMapping = rootMapping
    this.followRedirects = options.followRedirects
    this.maxDepth = options.maxDepth
    this.predicate = options.predicate

    let url = createURL(topLocation)
    if (url.substr(-1) === '/') {
      url = url.substr(0, url.length - 1)
    }
    this.addToQueue(url, 0)
  }

  subscribe(
    onNextOrObserver:
      | Observer<RoutingMapState>
      | ((value: RoutingMapState) => void),
    onError?: (error: any) => void,
    onComplete?: () => void,
  ): SimpleSubscription {
    if (this.observers.length === 0) {
      this.refresh()
    }
    let observer = createOrPassthroughObserver(
      onNextOrObserver,
      onError,
      onComplete,
    )
    this.observers.push(observer)
    return new SimpleSubscription(this.handleUnsubscribe, observer)
  }

  getState(): RoutingMapState {
    if (this.cachedSiteMap) {
      return this.cachedSiteMap
    } else {
      this.refresh()
      let siteMap = this.cachedSiteMap!
      this.handleUnsubscribe()
      return siteMap
    }
  }

  private handleUnsubscribe = (observer?: Observer<RoutingMapState>) => {
    if (observer) {
      let index = this.observers.indexOf(observer)
      if (index !== -1) {
        this.observers.splice(index, 1)
      }
    }
    if (this.observers.length === 0) {
      this.resolver.unlisten(this.handleChange)
      delete this.cachedSiteMap
    }
  }

  private handleChange = () => {
    let siteMap = this.refresh()
    for (let i = 0; i < this.observers.length; i++) {
      this.observers[i].next(siteMap)
    }
  }

  private refresh = () => {
    let allResolvableIds: number[] = []
    let i = 0
    while (i < this.queueURLs.length) {
      let url = this.queueURLs[i]
      let item = this.queueItems[i]
      let { route, resolutionIds } = item.matcher.run()
      let lastRoute =
        route &&
        (route.status === RouteStatus.Busy ? route : route.lastRemainingRoute)

      // The matcher will automatically match the `/` mapping on a
      // junction, which we don't want to happen right here.
      if (
        url.substr(-1) !== '/' &&
        lastRoute &&
        lastRoute.type !== RouteType.Junction
      ) {
        let secondLastRoute =
          (route!.remainingRoutes[
            route!.remainingRoutes.length - 2
          ] as JunctionRoute) || route!
        if (secondLastRoute.nextPattern === '/') {
          lastRoute = secondLastRoute
        }
      }

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
        !lastRoute ||
        lastRoute.contentStatus === RouteContentStatus.Error ||
        (
          lastRoute.status === RouteStatus.Error &&
          (!lastRoute.error || lastRoute.error.name !== "NotFoundError")
        ) ||
        // A URL's children can change based on context, so we need
        // to remove items from the children if their source stops
        // linking to them.
        (item.fromURL &&
          !doesLinkTo(
            this.queueItems[this.queueURLs.indexOf(item.fromURL)],
            url,
          )) ||
        // Allow for control over which routes are mapped.
        (this.predicate && !this.predicate(lastRoute))
      ) {
        this.removeFromQueue(url)
        continue
      }

      // If a redirect has been added or changed `to` location,
      // then add the location to the map.
      if (
        this.followRedirects &&
        lastRoute.type === RouteType.Redirect &&
        lastRoute.status === RouteStatus.Ready &&
        lastRoute.to &&
        (!cachedLastRoute ||
          cachedLastRoute.type !== RouteType.Redirect ||
          cachedLastRoute.status !== RouteStatus.Ready ||
          !cachedLastRoute.to ||
          !areLocationsEqual(cachedLastRoute.to!, lastRoute.to))
      ) {
        this.addToQueue(createURL(lastRoute.to), item.depth + 1, url)
      }

      if (
        lastRoute.type === RouteType.Junction &&
        lastRoute.status !== RouteStatus.Busy &&
        (!cachedLastRoute ||
          cachedLastRoute.type !== RouteType.Junction ||
          cachedLastRoute.status === RouteStatus.Busy ||
          cachedLastRoute.junction !== lastRoute.junction)
      ) {
        let mappings = lastRoute.junction.mappings
        for (let j = 0; j < mappings.length; j++) {
          this.addToQueue(
            joinPaths(url, mappings[j].pattern),
            item.depth + 1,
            url,
          )
        }
      }

      if (resolutionIds) {
        allResolvableIds = allResolvableIds.concat(resolutionIds)
      }
      i++
    }

    // This will replace any existing listener and its associated resolvables
    this.resolver.listen(this.handleChange, allResolvableIds!)

    this.cachedSiteMap = {}
    for (let i = 0; i < this.queueURLs.length; i++) {
      let url = this.queueURLs[i]
      let item = this.queueItems[i]
      let lastRoute = item.lastRouteCache!
      if (lastRoute.type !== RouteType.Junction ||
          lastRoute.status !== RouteStatus.Ready && !(lastRoute.error && lastRoute.error.name === "NotFoundError")) {
        this.cachedSiteMap[joinPaths(url, '/')] = createRoutingState(
          parseLocationString(url),
          item.routeCache!,
        )
      }
    }

    return this.cachedSiteMap
  }

  private removeFromQueue(url) {
    let i = this.queueURLs.indexOf(url)
    if (i !== -1) {
      this.queueURLs.splice(i, 1)
      this.queueItems.splice(i, 1)
    }
  }

  private addToQueue(url, depth, fromURL?) {
    if (
      this.queueURLs.indexOf(url) === -1 &&
      (!this.maxDepth || depth <= this.maxDepth)
    ) {
      let location = parseLocationString(url === '' ? '/' : url)
      this.queueURLs.push(url)
      this.queueItems.push({
        location,
        url,
        fromURL,
        depth,
        matcher: new this.rootJunction({
          context: this.context,
          matchableLocation: location,
          mapping: this.rootMapping,
          resolver: this.resolver,
          router: this.router,
        }),
      })
    }
  }
}

function doesLinkTo(queueItem: QueueItem | undefined, url: string) {
  let lastRoute = queueItem && queueItem.lastRouteCache

  return (
    lastRoute &&
    ((lastRoute.type == RouteType.Redirect &&
      lastRoute.status === RouteStatus.Ready &&
      lastRoute.to &&
      createURL(lastRoute.to) === url) ||
      (lastRoute.type === RouteType.Junction &&
        (lastRoute.status === RouteStatus.Ready || (lastRoute.error && lastRoute.error.name === "NotFoundError")) &&
        lastRoute.junction.patterns.indexOf(
          url.substr(lastRoute.url.length),
        ) !== -1))
  )
}
