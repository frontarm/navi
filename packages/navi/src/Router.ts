import { Matcher } from './Matcher'
import { createRootMapping, mappingAgainstPathname, Mapping } from './Mapping'
import { RouteObservable } from './RouteObservable'
import { RouteMapObservable } from './RouteMapObservable'
import { Resolver } from './Resolver'
import { ContentRoute, RedirectRoute } from './Route'
import { Segment } from './Segments'
import { SiteMap, PageMap, RedirectMap } from './Maps'
import { createPromiseFromObservable } from './Observable';
import { createURLDescriptor, URLDescriptor } from './URLTools';
import { createRequest, HTTPMethod } from './NaviRequest';
import { OutOfRootError } from './Errors';
import { Env } from './Env';
import { isValidMatcher } from './isValidMatcher';


export interface RouterOptions<Context extends object> {
    context?: Context,
    matcher?: Matcher<Context>,
    basename?: string,
}

export interface RouterResolveOptions {
    followRedirects?: boolean,
    body?: any,
    headers?: { [name: string]: string },
    method?: HTTPMethod,
    hostname?: string,
}

export interface RouterMapOptions {
    followRedirects?: boolean,
    maxDepth?: number,
    predicate?: (segment: Segment) => boolean,
    expandPattern?: (pattern: string, router: Router) => undefined | string[] | Promise<undefined | string[]>,
    method?: 'GET' | 'HEAD',
    headers?: { [name: string]: string },
    hostname?: string,
}
  

// The public factory function creates a resolver.
export function createRouter<Context extends object>(options: RouterOptions<Context>){
    return new Router(new Resolver(), options)
}

export class Router<Context extends object=any> {
    private resolver: Resolver
    private context: Context
    private matcher: Matcher<Context>
    private rootMapping: Mapping
    
    constructor(resolver: Resolver, options: RouterOptions<Context>) {
        if (process.env.NODE_ENV !== "production") {
            if (!options.matcher || !isValidMatcher(options.matcher)) {
                // TODO: support top-level context matchers
                throw new Error(`Expected to receive a Matcher object for the "pages" prop, but instead received "${options.matcher}".`)
            }
        }

        this.resolver = resolver
        this.context = options.context || {} as any
        this.matcher = options.matcher!

        let basename = options.basename
        if (basename && basename.slice(-1) === '/') {
            basename = basename.slice(0, -1)
        }

        this.rootMapping = createRootMapping(options.matcher!, basename)
    }

    createObservable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterResolveOptions = {}): RouteObservable | undefined {
        // need to somehow keep track of which promises in the resolver correspond to which observables,
        // so that I don't end up updating observables which haven't actually changed.
        let url = createURLDescriptor(urlOrDescriptor, { removeHash: true })
        let rootEnv: Env = {
            context: this.context,
            request: createRequest(this.context, {
                body: options.body,
                headers: options.headers || {},
                method: options.method || 'GET',
                hostname: options.hostname || '',
                mountpath: '',
                params: url.query,
                query: url.query,
                search: url.search,
                router: this,
                url: url.pathname+url.search,
                originalUrl: url.href,
                path: url.pathname,
            })
        }
        let matchEnv = mappingAgainstPathname(rootEnv, this.rootMapping, true)
        if (matchEnv) {
            return new RouteObservable(
                url,
                matchEnv,
                this.matcher,
                this.resolver,
            )
        }
    }

    createMapObservable(urlOrDescriptor: string | Partial<URLDescriptor>, options: RouterMapOptions = {}): RouteMapObservable {
        return new RouteMapObservable(
            createURLDescriptor(urlOrDescriptor, { ensureTrailingSlash: false }),
            this.context,
            this.matcher,
            this.rootMapping,
            this.resolver,
            this,
            options,
        )
    }

    resolve(url: string | Partial<URLDescriptor>, options?: RouterResolveOptions): Promise<ContentRoute>;
    resolve(urls: (string | Partial<URLDescriptor>)[], options?: RouterResolveOptions): Promise<ContentRoute[]>;
    resolve(urls: string | Partial<URLDescriptor> | (string | Partial<URLDescriptor>)[], options: RouterResolveOptions = {}): Promise<ContentRoute | ContentRoute[]> {
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
                if (route.type === 'content') {
                    pageMap[url] = route as ContentRoute
                    continue
                }
                else if (route.type === 'redirect') {
                    redirectMap[url] = route as RedirectRoute
                    continue
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

    private getPageRoutePromise(url: URLDescriptor, options: RouterResolveOptions): Promise<ContentRoute> {
        let observable = this.createObservable(url, options)
        if (!observable) {
            return Promise.reject(new OutOfRootError(url))
        }

        return createPromiseFromObservable(observable).then(route => {
            if (route.error) {
                throw route.error
            }
            if (route.type !== 'busy') {
                if (route.type === 'redirect' && options.followRedirects) {
                    return this.getPageRoutePromise(createURLDescriptor((route as RedirectRoute).to), options)
                }
                else if (route.type === 'content') {
                    return route as ContentRoute
                }
            }

            throw new Error('router error')
        })
    }
}

function getDescriptorsArray(urls: Partial<URLDescriptor> | string | (Partial<URLDescriptor> | string)[]): URLDescriptor[] {
    return Array.isArray(urls)
        ? urls.map(url => createURLDescriptor(url))
        : [createURLDescriptor(urls)]
}
