import { RouterEnv } from './RouterEnv'
import { Location, parseLocationString } from './Location'
import { Junction } from './Junction'
import { matchMappingAgainstLocation, AbsoluteMapping, createRootMapping } from './Mapping'
import { Observer } from './Observable'
import { RoutingObservable } from './RoutingObservable'
import { RoutingMapObservable } from './RoutingMapObservable'
import { Resolver } from './Resolver'
import { PageRoute, RouteType, Route } from './Route'
import { RoutingMapState, isRoutingStateMapSteady, SiteMap, PageRouteMap, RedirectRouteMap } from './Maps'
import { Subscription } from './Observable';
import { RoutingState } from './RoutingState';
import { UnmanagedLocationError } from './Errors';


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


export interface RouterOptions<Context> {
    rootJunction: Junction,
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
export function createRouter<Context>(options: RouterOptions<Context>){
    return new Router(options)
}

export class Router<Context=any> {
    private resolver: Resolver<Context>
    private rootJunction: Junction
    private rootMapping: AbsoluteMapping
    
    constructor(options: RouterOptions<Context>) {
        if (process.env.NODE_ENV !== "production") {
            if (!options.rootJunction || options.rootJunction.type !== RouteType.Junction) {
                throw new Error(`Expected to receive a Junction object for the "junction" prop, but instead received "${options.rootJunction}".`)
            }
        }

        this.rootMapping = createRootMapping(options.rootJunction, options.rootPath)
        this.rootJunction = options.rootJunction
        this.resolver = new Resolver(
            new RouterEnv(options.initialContext || {} as any, this),
            options.onEvent || (() => {}),
        )
    }

    setContext(context: Context): void {
        this.resolver.setEnv(new RouterEnv<Context>(context || ({} as any), this))
    }

    observable(locationOrURL: Location | string, options: RouterLocationOptions = {}): RoutingObservable | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)
        if (location && match) {
            return new RoutingObservable(
                location,
                this.rootJunction,
                this.rootMapping,
                this.resolver,
                options
            )
        }
    }

    mapObservable(locationOrURL: Location | string, options: RouterMapOptions = {}): RoutingMapObservable {
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)

        if (location && match) {
            return new RoutingMapObservable(
                location,
                this.rootJunction,
                this.rootMapping,
                this.resolver,
                options
            )
        }
        else {
            throw new UnmanagedLocationError(location)
        }
    }

    pageRoute(url: string | Location, options?: RouterLocationOptions): Promise<PageRoute>;
    pageRoute(urls: (Location | string)[], options?: RouterLocationOptions): Promise<PageRoute[]>;
    pageRoute(urls: Location | string | (Location | string)[], options: RouterLocationOptions = {}): Promise<PageRoute | PageRoute[]> {
        let locations: Location[] = getLocationsArray(urls)
        if (locations.length) {
            return Promise.resolve([])
        }

        // TODO: reject promises that depend on env when `context` is updated
        let promises: Promise<PageRoute>[] = []
        for (let i = 0; i < locations.length; i++) {
            let location = locations[i]
            let observable = this.observable(location, options)
            if (!observable) {
                return Promise.reject(undefined)
            }
            promises.push(getPromiseFromObservableRoute(observable))
        }
        return !Array.isArray(urls) ? promises[0] : Promise.all(promises)
    }

    siteMap(url: string | Location, options: RouterMapOptions = {}): Promise<SiteMap> {
        let promise = new Promise<RoutingMapState>((resolve, reject) => {
            let observable = this.mapObservable(url, options)
            let initialValue = observable.getState()
            if (isRoutingStateMapSteady(initialValue)) {
                resolve(initialValue)
            }
            else {
                observable.subscribe(new SteadyPromiseObserver<RoutingMapState>(resolve, reject, isRoutingStateMapSteady))
            }
        })
        return promise.then(siteMap => {
            let pageRouteMap = {} as PageRouteMap
            let redirectRouteMap = {} as RedirectRouteMap
            let urls = Object.keys(siteMap)
            for (let i = 0; i < urls.length; i++) {
                let url = urls[i]
                let route = siteMap[url]
                let lastRoute = route.lastRoute
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

function getPromiseFromObservableRoute(observable: RoutingObservable): Promise<PageRoute> {
    return new Promise<RoutingState>((resolve, reject) => {
        let initialValue = observable.getState()
        if (initialValue.isSteady) {
            resolve(initialValue)
        }
        else {
            observable.subscribe(new SteadyPromiseObserver<RoutingState>(resolve, reject, isRoutingStateSteady))
        }
    }).then(state => {
        let lastRoute = state.lastRoute!
        if (lastRoute.type !== RouteType.Page) {
            throw new Error(lastRoute.error)
        }
        else {
            return lastRoute as PageRoute
        }
    })
}

const isRoutingStateSteady = (state: RoutingState) => state.isSteady