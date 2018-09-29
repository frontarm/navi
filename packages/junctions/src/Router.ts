import { RouterEnv } from './RouterEnv'
import { Junction } from './Junction'
import { createRootMapping, matchMappingAgainstPathname, Mapping } from './Mapping'
import { Observer } from './Observable'
import { RoutingObservable } from './RoutingObservable'
import { RoutingMapObservable } from './RoutingMapObservable'
import { Resolver } from './Resolver'
import { PageRoute, RouteType, Route } from './Route'
import { RoutingMapState, isRoutingStateMapSteady, SiteMap, PageRouteMap, RedirectRouteMap } from './Maps'
import { Subscription, createPromiseFromObservable } from './Observable';
import { RoutingState } from './RoutingState';
import { OutOfRootError } from './Errors';
import { createURLDescriptor, URLDescriptor } from './URLTools';
import { HTTPMethod } from './HTTPMethod';


export interface RouterOptions<Context> {
    rootContext?: Context,
    rootJunction: Junction,
    rootPath?: string,
}

export interface RouterLocationOptions {
    followRedirects?: boolean,
    withContent?: boolean,
    method?: HTTPMethod,
}

export interface RouterMapOptions {
    followRedirects?: boolean,
    maxDepth?: number,
    predicate?: (route: Route) => boolean,
  }
  

// The public factory function creates a resolver.
export function createRouter<Context>(options: RouterOptions<Context>){
    return new Router(new Resolver(), options)
}

export class Router<Context=any> {
    private resolver: Resolver
    private rootContext: Context
    private rootJunction: Junction<any, any, Context>
    private rootMapping: Mapping
    
    constructor(resolver: Resolver, options: RouterOptions<Context>) {
        if (process.env.NODE_ENV !== "production") {
            if (!options.rootJunction || options.rootJunction.type !== RouteType.Junction) {
                throw new Error(`Expected to receive a Junction object for the "junction" prop, but instead received "${options.rootJunction}".`)
            }
        }

        this.resolver = resolver
        this.rootContext = options.rootContext || {} as any
        this.rootJunction = options.rootJunction
        this.rootMapping = createRootMapping(options.rootJunction, options.rootPath)
    }

    observable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterLocationOptions = {}): RoutingObservable | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let url = createURLDescriptor(urlOrDescriptor)
        let rootEnv = {
            context: this.rootContext,
            method: options.method || HTTPMethod.Get,
            params: url.query,
            pathname: '',
            query: url.query,
            router: this,
            unmatchedPathnamePart: url.pathname,
        }
        let matchEnv = matchMappingAgainstPathname(rootEnv, this.rootMapping, true)
        if (matchEnv) {
            return new RoutingObservable(
                url,
                matchEnv,
                this.rootJunction,
                this.resolver,
                !!options.withContent,
            )
        }
    }

    mapObservable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): RoutingMapObservable {
        return new RoutingMapObservable(
            createURLDescriptor(urlOrDescriptor, { ensureTrailingSlash: false }),
            this.rootContext,
            this.rootJunction,
            this.rootMapping,
            this.resolver,
            this,
            options
        )
    }

    pageRoute(url: string | Partial<URLDescriptor>, options?: RouterLocationOptions): Promise<PageRoute>;
    pageRoute(urls: (string | Partial<URLDescriptor>)[], options?: RouterLocationOptions): Promise<PageRoute[]>;
    pageRoute(urls: string | Partial<URLDescriptor> | (string | Partial<URLDescriptor>)[], options: RouterLocationOptions = {}): Promise<PageRoute | PageRoute[]> {
        let urlDescriptors: URLDescriptor[] = getDescriptorsArray(urls)
        if (!urlDescriptors.length) {
            return Promise.resolve([])
        }

        // TODO: reject promises that depend on env when `context` is updated
        let promises = urlDescriptors.map(url => this.getPageRoutePromise(url, options))
        return !Array.isArray(urls) ? promises[0] : Promise.all(promises)
    }

    private getPageRoutePromise(url: URLDescriptor, options: RouterLocationOptions): Promise<PageRoute> {
        let observable = this.observable(url, options)
        if (!observable) {
            return Promise.reject(undefined)
        }

        return createPromiseFromObservable(observable).then(state => {
            let lastRoute = state.lastRoute!
            if (lastRoute.type === RouteType.Redirect && options.followRedirects) {
                return this.getPageRoutePromise(createURLDescriptor(lastRoute.to!), options)
            }
            else if (lastRoute.type !== RouteType.Page) {
                throw new Error(lastRoute.error)
            }
            else {
                return lastRoute as PageRoute
            }
        })
    }

    siteMap(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): Promise<SiteMap> {
        return createPromiseFromObservable(this.mapObservable(urlOrDescriptor, options)).then(siteMap => {
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

    pageMap(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): Promise<PageRouteMap> {
        return this.siteMap(urlOrDescriptor, options).then(siteMap => siteMap.pages)
    }
}

function getDescriptorsArray(urls: Partial<URLDescriptor> | string | (Partial<URLDescriptor> | string)[]): URLDescriptor[] {
    return Array.isArray(urls)
        ? urls.map(url => createURLDescriptor(url))
        : [createURLDescriptor(urls)]
}

const isRoutingStateSteady = (state: RoutingState) => state.isSteady