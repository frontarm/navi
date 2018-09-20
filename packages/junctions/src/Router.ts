import { RouterEnv } from './Env'
import { Location, parseLocationString } from './Location'
import { Junction } from './Junction'
import { matchMappingAgainstLocation, AbsoluteMapping, createRootMapping } from './Mapping'
import { Observer } from './Observable'
import { LocationStateObservable } from './LocationStateObservable'
import { LocationStateMapObservable } from './LocationStateMapObservable'
import { Resolver } from './Resolver'
import { JunctionRoute, PageRoute, isRouteSteady, RouteType, Route } from './Route'
import { RouterLocationStateMap, isRouterLocationStateMapSteady, SiteMap, PageRouteMap, RedirectRouteMap } from './Maps'
import { Subscription } from './Observable';


/**
 * Allows you to be notified when junctions or content at a certain
 * path start and finish loading.
 * 
 * This can be used to analyze which bundle chunks are required
 * for each URL, and for each junction, so that <script> tags can be added
 * to statically generated HTML, and appropriate files can be 
 * pre-emptively pushed when HTTP/2 is available.
 */
export interface RouterEvent {
    type: string,
    location: Location
}


interface RouterOptions<Context> {
    rootPath?: string,
    initialContext?: Context,
    onEvent?: (event: RouterEvent) => void,
}

export interface RouterLocationOptions {
  withContent?: boolean
}

export interface RouterMapOptions {
    followRedirects?: boolean,
    maxDepth?: number,
    predicate?: (route: Route) => boolean,
  }
  

// This is not necessary, but I'm exporting it just to fit in with
// other "React style" tools
export function createRouter<Context>(
    rootJunction: Junction,
    options: RouterOptions<Context> = {}
){
    return new Router(rootJunction, options)
}

export class Router<Context=any> {
    private resolver: Resolver<Context>
    private rootJunction: Junction
    private rootMapping: AbsoluteMapping
    
    constructor(rootJunction: Junction, options: RouterOptions<Context> = {}) {
        this.rootMapping = createRootMapping(rootJunction, options.rootPath)
        this.rootJunction = rootJunction
        this.resolver = new Resolver(
            new RouterEnv(options.initialContext || {} as any, this),
            options.onEvent || (() => {}),
        )
    }

    setContext(context: Context): void {
        this.resolver.setEnv(new RouterEnv(context || {}, this))
    }

    observeRoute(locationOrURL: Location | string, options: RouterLocationOptions = {}): LocationStateObservable | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)
        if (location && match) {
            return new LocationStateObservable(
                location,
                this.rootJunction,
                this.rootMapping,
                this.resolver,
                options
            )
        }
    }

    observeRouterLocationStateMap(locationOrURL: Location | string, options: RouterMapOptions = {}): LocationStateMapObservable | undefined {
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)

        if (location && match) {
            return new LocationStateMapObservable(
                location,
                this.rootJunction,
                this.rootMapping,
                this.resolver,
                options
            )
        }
    }

    pageRoute(url: string | Location, options: RouterLocationOptions): Promise<PageRoute>;
    pageRoute(urls: (Location | string)[], options: RouterLocationOptions): Promise<PageRoute[]>;
    pageRoute(urls: Location | string | (Location | string)[], options: RouterLocationOptions = {}): Promise<PageRoute | PageRoute[]> {
        let locations: Location[] = getLocationsArray(urls)
        if (locations.length) {
            return Promise.resolve([])
        }

        // TODO: reject promises that depend on env when `context` is updated
        let promises: Promise<PageRoute>[] = []
        for (let i = 0; i < locations.length; i++) {
            let location = locations[i]
            let observable = this.observeRoute(location, options)
            if (!observable) {
                return Promise.reject()
            }
            promises.push(getPromiseFromObservableRoute(observable))
        }
        return !Array.isArray(urls) ? promises[0] : Promise.all(promises)
    }

    siteMap(url: string | Location, options: RouterMapOptions = {}): Promise<SiteMap> {
        let observable = this.observeRouterLocationStateMap(url, options)
        let promise = new Promise<RouterLocationStateMap>((resolve, reject) => {
            if (!observable) {
                reject()
            }
            else {
                let initialValue = observable.getValue()
                if (isRouterLocationStateMapSteady(initialValue)) {
                    resolve(initialValue)
                }
                else {
                    observable.subscribe(new SteadyPromiseObserver<RouterLocationStateMap>(resolve, reject, isRouterLocationStateMapSteady))
                }
            }
        })
        return promise.then(siteMap => {
            let pageRouteMap = {} as PageRouteMap
            let redirectRouteMap = {} as RedirectRouteMap
            let urls = Object.keys(siteMap)
            for (let i = 0; i < urls.length; i++) {
                let url = urls[i]
                let route = siteMap[url]
                let lastRoute = route.lastRemainingRoute || route
                if (lastRoute.error || lastRoute.type === RouteType.Junction) {
                    throw new Error(lastRoute!.error)
                }
                else if (lastRoute.type === RouteType.Page) {
                    pageRouteMap[url] = lastRoute
                }
                else if (lastRoute.type === RouteType.Redirect) {
                    redirectRouteMap[url] = lastRoute
                }
            }
            return {
                pages: pageRouteMap,
                redirects: redirectRouteMap,
            }
        })
    }

    pageMap(url: string | Location, options: RouterMapOptions = {}): Promise<PageRouteMap> {
        return this.siteMap(url, options).then(siteMap => siteMap.pages)
    }
}

class SteadyPromiseObserver<T> implements Observer<T> {
    resolve: (value: T) => void
    reject: (error: any) => void
    isSteady: (value: T) => boolean
    subscription: Subscription
    done: boolean

    constructor(resolve: (value: T) => void, reject: (error: any) => void, isSteady: (value: T) => boolean) {
        this.resolve = resolve
        this.reject = reject
        this.isSteady = isSteady
    }

    start(subscription: Subscription) {
        this.subscription = subscription   
    }

    next(value: T) {
        if (!this.done && this.isSteady(value)) {
            this.resolve(value)
            this.cleanup()
        }
    }

    error(e) {
        if (!this.done) {
            this.reject(e)
            this.cleanup()
        }
    }

    cleanup() {
        this.done = true
        this.subscription.unsubscribe()
        delete this.subscription
        delete this.resolve
        delete this.reject
        delete this.isSteady
    }
}

function getLocationsArray(urls: Location | string | (Location | string)[]) {
    return Array.isArray(urls)
        ? urls.map(url => typeof url === 'string' ? parseLocationString(url) : url)
        : [typeof urls === 'string' ? parseLocationString(urls) : urls]
}

function getPromiseFromObservableRoute(observable: LocationStateObservable): Promise<PageRoute> {
    return new Promise<JunctionRoute>((resolve, reject) => {
        let initialValue = observable.getValue()
        if (isRouteSteady(initialValue)) {
            resolve(initialValue)
        }
        else {
            observable.subscribe(new SteadyPromiseObserver<JunctionRoute>(resolve, reject, isRouteSteady))
        }
    }).then(route => {
        let lastRoute = route.lastRemainingRoute || route
        if (lastRoute.type !== RouteType.Page) {
            throw new Error(lastRoute.error)
        }
        else {
            return lastRoute as PageRoute
        }
    })
}
