import { createBrowserHistory, History } from 'history';
import { Switch } from './Switch'
import { Navigation, NavigationSnapshot } from './Navigation'
import { Resolver, Status } from './Resolver'
import { Router } from './Router'
import { Route, RouteType } from './Route'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable';
import { areURLDescriptorsEqual } from './URLTools';


export interface BrowserNavigationOptions<Context extends object> {
    /**
     * The Switch that declares your app's pages.
     */
    pages: Switch,

    /**
     * If provided, this part of any URLs will be ignored. This is useful
     * for mounting a Navi app in a subdirectory on a domain.
     */
    basename?: string,

    /**
     * This will be made available within your `pages` Switch through
     * the `env` object passed to any getter functions.
     */
    context?: Context,

    /**
   * If `true`, Navi won't perform any scrolling when navigating between
   * pages.
   */
    disableScrollHandling?: boolean,

    /**
     * The scroll behavior to use when scrolling between hashes on a
     * page. Defaults to smooth.
     */
    hashScrollBehavior?: 'smooth' | 'instant'

    /**
     * You can manually supply a history object. This is useful for
     * integration with react-router.
     * 
     * By default, a browser history object will be created.
     */
    history?: History,

    /**
     * Sets `document.title` to the value of the
     * `pageTitle` property in the current switchs' meta, if it exists.
     * 
     * You can also supply a function that reseives `pageTitle`, and
     * returns a processed string that will be set.
     * 
     * Defaults to `true`.
     */
    setDocumentTitle?: boolean | ((pageTitle?: string) => string),
}


export function createBrowserNavigation<Context extends object>(options: BrowserNavigationOptions<Context>) {
    return new BrowserNavigation(options)
}


export class BrowserNavigation<Context extends object> implements Navigation<Context> {
    router: Router<Context>

    history: History

    private setDocumentTitle: false | ((pageTitle?: string) => string)
    private disableScrollHandling: boolean

    private pages: Switch
    private basename?: string
    private resolver: Resolver
    private receivedRoute: Route
    private renderedRoute?: Route
    private hashScrollBehavior: 'smooth' | 'instant'
    private currentRouteObservable: CurrentRouteObservable<Context>

    constructor(options: BrowserNavigationOptions<Context>) {
        this.history = options.history || createBrowserHistory()
        this.resolver = new Resolver
        this.pages = options.pages
        this.basename = options.basename
        this.router = new Router(this.resolver, {
            rootContext: options.context,
            pages: options.pages,
            basename: options.basename,
        })

        if (options.setDocumentTitle !== false) {
            this.setDocumentTitle = typeof options.setDocumentTitle === 'function' ? options.setDocumentTitle : ((x?) => x || 'Untitled Page')
        }
        this.disableScrollHandling = !!options.disableScrollHandling

        this.currentRouteObservable = createCurrentRouteObservable({
            history: this.history,
            router: this.router,
        })
        this.currentRouteObservable.subscribe(this.handleChange)
        this.renderedRoute = this.currentRouteObservable.getValue()
        this.hashScrollBehavior = options.hashScrollBehavior || 'smooth'
    }

    dispose() {
        this.currentRouteObservable.dispose()
        delete this.currentRouteObservable
        delete this.router
        delete this.history
        delete this.resolver
        delete this.pages
        delete this.setDocumentTitle
        delete this.receivedRoute
        delete this.renderedRoute
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            rootContext: context,
            pages: this.pages,
            basename: this.basename,
        })
        this.currentRouteObservable.setRouter(this.router)
    }

    getCurrentValue(): NavigationSnapshot {
        let route = this.currentRouteObservable.getValue()
        return {
            route,
            url: route.url,
            history: this.history,
            router: this.router,
            onRendered: this.handleRendered,
        }
    }

    async steady() {
        await this.getSteadyValue()
        return
    }

    async getSteadyValue(): Promise<NavigationSnapshot> {
        return this.currentRouteObservable.getSteadyRoute().then(route => ({
            route,
            url: route.url,
            history: this.history,
            router: this.router,
            onRendered: this.handleRendered,
        }))
    }

    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * the snapshot, as the route may change as new code chunks are received.
     */
    subscribe(
        onNextOrObserver: Observer<NavigationSnapshot> | ((value: NavigationSnapshot) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        let mapObserver = new MapObserver(navigationObserver, this, this.handleRendered)
        return this.currentRouteObservable.subscribe(mapObserver)
    }

    private handleChange = (route: Route) => {
        this.receivedRoute = route
    }

    private handleRendered = () => {
        if (this.renderedRoute !== this.receivedRoute) {
            let prevRoute = this.renderedRoute
            let nextRoute = this.receivedRoute

            if (nextRoute && nextRoute.type === RouteType.Page && nextRoute.status === Status.Ready && this.setDocumentTitle) {
                document.title = this.setDocumentTitle(nextRoute.title)
            }

            if (nextRoute && nextRoute.isSteady) {
                if (prevRoute && areURLDescriptorsEqual(nextRoute.url, prevRoute.url)) {
                    return
                }

                if (!this.disableScrollHandling &&
                    (!prevRoute ||
                    !prevRoute.url ||
                    prevRoute.url.hash !== nextRoute.url.hash ||
                    prevRoute.url.pathname !== nextRoute.url.pathname)
                ) {
                    scrollToHash(
                        nextRoute.url.hash,
                        prevRoute && prevRoute.url && prevRoute.url.pathname === nextRoute.url.pathname
                            ? this.hashScrollBehavior
                            : 'instant'
                    )
                }
            }

            this.renderedRoute = this.receivedRoute
        }
        else {
            if (this.receivedRoute.url.hash) {
                scrollToHash(this.receivedRoute.url.hash, this.hashScrollBehavior)
            }
        }
    }
}


function scrollToHash(hash, behavior) {
    if (hash) {
        let id = document.getElementById(hash.slice(1))
        if (id) {
            id.scrollIntoView({
                behavior: behavior,
                block: 'start'
            })

            // Focus the element, as default behavior is cancelled.
            // https://css-tricks.com/snippets/jquery/smooth-scrolling/
            id.focus()
        }
    }
    else {
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'auto',
        })
    }
}


class MapObserver implements Observer<Route> {
    navigation: BrowserNavigation<any>
    observer: Observer<NavigationSnapshot>
    onRendered: () => void

    constructor(observer: Observer<NavigationSnapshot>, navigation: BrowserNavigation<any>, onRendered: () => void) {
        this.navigation = navigation
        this.observer = observer
        this.onRendered = onRendered
    }

    next(route: Route): void {
        this.observer.next({
            route,
            url: route.url,
            history: this.navigation.history,
            router: this.navigation.router,
            onRendered: this.onRendered,
        })
    }
    error(errorValue: any): void {
        if (this.observer.error) {
            this.observer.error(errorValue)
        }
    }
}