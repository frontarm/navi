import { Env } from './Env'
import { Location, parseLocationString } from './Location'
import { Junction } from './Junction'
import { matchMappingAgainstLocation, AbsoluteMapping, createRootMapping } from './Mapping'
import { Observer } from './Observable'
import { ObservableRoute, ObservableRouteOptions } from './ObservableRoute'
import { ObservableSiteMap, ObservableSiteMapOptions } from './ObservableSiteMap'
import { Resolver, ResolverStatus } from './Resolver'
import { JunctionRoute, SiteMap, RouteType, isRouteSteady } from './Route'
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

export class Router<Context=any, RootJunction extends Junction=any> {
    private resolver: Resolver<Context>
    private rootJunction: RootJunction
    private rootMapping: AbsoluteMapping
    
    constructor(rootJunction: RootJunction, options: RouterOptions<Context> = {}) {
        this.rootMapping = createRootMapping(rootJunction, options.rootPath)
        this.rootJunction = rootJunction
        this.resolver = new Resolver(
            new Env(options.initialContext!, this),
            options.onEvent || (() => {}),
        )
    }

    setContext(context: Context): void {
        this.resolver.setEnv(new Env(context, this))
    }

    observeRoute(locationOrURL: Location | string, options: ObservableRouteOptions = {}): ObservableRoute | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)
        if (location && match) {
            return new ObservableRoute(
                location,
                this.rootJunction,
                this.rootMapping,
                this.resolver,
                options
            )
        }
    }

    observeSiteMap(locationOrURL: Location | string, options: ObservableSiteMapOptions = {}): ObservableSiteMap | undefined {
        let location = typeof locationOrURL === 'string' ? parseLocationString(locationOrURL) : locationOrURL
        let match = location && matchMappingAgainstLocation(this.rootMapping, location)

        if (location && match) {
            let matcher = new this.rootJunction({
                matchableLocation: location,
                mapping: this.rootMapping,
                resolver: this.resolver,
                withContent: false,
            })

            return new ObservableSiteMap(matcher, this.resolver)
        }

        // TODO:
        // - return an observable of an empty object {}
    }

    route(url: string, options: ObservableRouteOptions): Promise<JunctionRoute<RootJunction>>;
    route(urls: string[], options: ObservableRouteOptions): Promise<JunctionRoute<RootJunction>[]>;
    route(urls: string | string[], options: ObservableRouteOptions = {}): Promise<JunctionRoute<RootJunction> | JunctionRoute<RootJunction>[]> {
        let locations: Location[] = getLocationsArray(urls)
        if (locations.length) {
            return Promise.resolve([])
        }

        // TODO: reject promises that depend on env when `context` is updated
        let promises: Promise<JunctionRoute<RootJunction>>[] = []
        for (let i = 0; i < locations.length; i++) {
            let observable = this.observeRoute(location, options)
            if (!observable) {
                return Promise.reject()
            }
            promises.push(getPromiseFromObservableRoute(observable))
        }
        return Promise.all(promises)
    }

    siteMap(url: string, options: ObservableSiteMapOptions = {}): Promise<SiteMap<RootJunction>> {
        return <any>undefined
    }
}

function getLocationsArray(urls: string | string[]) {
    return Array.isArray(urls)
        ? urls.map(url => parseLocationString(url))
        : [parseLocationString(urls)]
}

function getPromiseFromObservableRoute<RootJunction extends Junction>(observable?: ObservableRoute<RootJunction>): Promise<JunctionRoute<RootJunction>> {
    return new Promise<JunctionRoute<RootJunction>>((resolve, reject) => {
        if (!observable) {
            reject()
        }
        else {
            let observer = new RouteObserver(resolve, reject)
            observer.subscription = observable.subscribe(observer)
        }
    })
}

class RouteObserver implements Observer<JunctionRoute<any>> {
    resolve
    reject
    subscription: Subscription
    done: boolean

    constructor(resolve, reject) {
        this.resolve = resolve
        this.reject = reject
    }

    next(route: JunctionRoute<any>) {
        if (!this.done && isRouteSteady(route)) {
            if (!route.deepestRoute || route.deepestRoute.status !== ResolverStatus.Ready || (route.deepestRoute.type === RouteType.Junction && route.deepestRoute.isNotFound)) {
                this.error(route.error)
            }
            else {
                this.resolve(route)
                this.cleanup()
            }
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
    }
}