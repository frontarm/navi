import { Switch } from './Switch'
import { createRootMapping, matchMappingAgainstPathname, Mapping } from './Mapping'
import { RouteObservable } from './RouteObservable'
import { RouteMapObservable } from './RouteMapObservable'
import { Resolver, Status } from './Resolver'
import { PageRoute, RouteType, RedirectRoute } from './Route'
import { Segment } from './Segments'
import { SiteMap, PageMap, RedirectMap } from './Maps'
import { createPromiseFromObservable } from './Observable';
import { createURLDescriptor, URLDescriptor } from './URLTools';
import { HTTPMethod } from './HTTPMethod';
import { NaviNodeType } from './Node';
import { OutOfRootError } from './Errors';


export interface RouterOptions<Context extends object> {
    rootContext?: Context,
    pages: Switch,
    basename?: string,
}

export interface RouterResolveOptions {
    followRedirects?: boolean,
    withContent?: boolean,
    method?: HTTPMethod,
}

export interface RouterMapOptions {
    followRedirects?: boolean,
    maxDepth?: number,
    predicate?: (segment: Segment) => boolean,
    expandPattern?: (pattern: string, router: Router) => undefined | string[] | Promise<undefined | string[]>,
}
  

// The public factory function creates a resolver.
export function createRouter<Context extends object>(options: RouterOptions<Context>){
    return new Router(new Resolver(), options)
}

export class Router<Context extends object=any> {
    private resolver: Resolver
    private rootContext: Context
    private pages: Switch<any, any, Context>
    private rootMapping: Mapping
    
    constructor(resolver: Resolver, options: RouterOptions<Context>) {
        if (process.env.NODE_ENV !== "production") {
            if (!options.pages || options.pages.type !== NaviNodeType.Switch) {
                // TODO: support top-level context nodes
                throw new Error(`Expected to receive a Switch object for the "pages" prop, but instead received "${options.pages}".`)
            }
        }

        this.resolver = resolver
        this.rootContext = options.rootContext || {} as any
        this.pages = options.pages

        let basename = options.basename
        if (basename && basename.slice(-1) === '/') {
            basename = basename.slice(0, -1)
        }

        this.rootMapping = createRootMapping(options.pages, basename)
    }

    createObservable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterResolveOptions = {}): RouteObservable | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let url = createURLDescriptor(urlOrDescriptor)
        let rootEnv = {
            context: this.rootContext,
            hash: url.hash,
            headers: {},
            method: options.method || HTTPMethod.Get,
            mountname: '',
            params: url.query,
            pathname: '',
            query: url.query,
            search: url.search,
            router: this,
            url: url,
            unmatchedPathnamePart: url.pathname,
        }
        let matchEnv = matchMappingAgainstPathname(rootEnv, this.rootMapping, true)
        if (matchEnv) {
            return new RouteObservable(
                url,
                matchEnv,
                this.pages,
                this.resolver,
                !!options.withContent,
            )
        }
    }

    createMapObservable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): RouteMapObservable {
        return new RouteMapObservable(
            createURLDescriptor(urlOrDescriptor, { ensureTrailingSlash: false }),
            this.rootContext,
            this.pages,
            this.rootMapping,
            this.resolver,
            this,
            options
        )
    }

    resolve(url: string | Partial<URLDescriptor>, options?: RouterResolveOptions): Promise<PageRoute>;
    resolve(urls: (string | Partial<URLDescriptor>)[], options?: RouterResolveOptions): Promise<PageRoute[]>;
    resolve(urls: string | Partial<URLDescriptor> | (string | Partial<URLDescriptor>)[], options: RouterResolveOptions = {}): Promise<PageRoute | PageRoute[]> {
        let urlDescriptors: URLDescriptor[] = getDescriptorsArray(urls)
        if (!urlDescriptors.length) {
            return Promise.resolve([])
        }

        let promises = urlDescriptors.map(url => this.getPageRoutePromise(url, options))
        return !Array.isArray(urls) ? promises[0] : Promise.all(promises)
    }

    resolveSiteMap(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): Promise<SiteMap> {
        return createPromiseFromObservable(this.createMapObservable(urlOrDescriptor, options)).then(routeMap => {
            let pageMap = {} as PageMap
            let redirectMap = {} as RedirectMap
            let urls = Object.keys(routeMap)
            for (let i = 0; i < urls.length; i++) {
                let url = urls[i]
                let route = routeMap[url]
                if (route.status === Status.Ready) {
                    if (route.type === RouteType.Page) {
                        pageMap[url] = route as PageRoute
                        continue
                    }
                    else if (route.type === RouteType.Redirect) {
                        redirectMap[url] = route as RedirectRoute
                        continue
                    }
                }
                throw route.error || new Error('router error')
            }
            return {
                pages: pageMap,
                redirects: redirectMap,
            }
        })
    }

    resolvePageMap(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): Promise<PageMap> {
        return this.resolveSiteMap(urlOrDescriptor, options).then(siteMap => siteMap.pages)
    }

    private getPageRoutePromise(url: URLDescriptor, options: RouterResolveOptions): Promise<PageRoute> {
        let observable = this.createObservable(url, options)
        if (!observable) {
            return Promise.reject(new OutOfRootError(url))
        }

        return createPromiseFromObservable(observable).then(route => {
            if (route.status === Status.Ready) {
                if (route.type === RouteType.Redirect && options.followRedirects) {
                    return this.getPageRoutePromise(createURLDescriptor(route.to), options)
                }
                else if (route.type === RouteType.Page) {
                    return route as PageRoute
                }
            }
            throw route.error || new Error('router error')
        })
    }
}

function getDescriptorsArray(urls: Partial<URLDescriptor> | string | (Partial<URLDescriptor> | string)[]): URLDescriptor[] {
    return Array.isArray(urls)
        ? urls.map(url => createURLDescriptor(url))
        : [createURLDescriptor(urls)]
}
