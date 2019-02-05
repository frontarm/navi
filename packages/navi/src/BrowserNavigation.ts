import { createBrowserHistory, History } from 'history';
import { Switch } from './Switch'
import { Navigation } from './Navigation'
import { Resolver } from './Resolver'
import { Router } from './Router'
import { Route } from './Route'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { CurrentRouteObservable, createCurrentRouteObservable } from './CurrentRouteObservable';


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
     * You can manually supply a history object. This is useful for
     * integration with react-router.
     * 
     * By default, a browser history object will be created.
     */
    history?: History,
}


export function createBrowserNavigation<Context extends object>(options: BrowserNavigationOptions<Context>) {
    return new BrowserNavigation(options)
}


export class BrowserNavigation<Context extends object> implements Navigation<Context> {
    router: Router<Context>
    history: History

    private pages: Switch
    private basename?: string
    private resolver: Resolver
    private receivedRoute: Route
    private renderedRoute?: Route
    private currentRouteObservable: CurrentRouteObservable<Context>

    constructor(options: BrowserNavigationOptions<Context>) {
        this.history = options.history || createBrowserHistory()
        this.resolver = new Resolver
        this.pages = options.pages
        this.basename = options.basename
        this.router = new Router(this.resolver, {
            context: options.context,
            pages: options.pages,
            basename: options.basename,
        })

        this.currentRouteObservable = createCurrentRouteObservable({
            history: this.history,
            router: this.router,
        })
        this.currentRouteObservable.subscribe(this.handleChange)
        this.renderedRoute = this.currentRouteObservable.getValue()
    }

    dispose() {
        this.currentRouteObservable.dispose()
        delete this.currentRouteObservable
        delete this.router
        delete this.history
        delete this.resolver
        delete this.pages
        delete this.receivedRoute
        delete this.renderedRoute
    }

    setContext(context: Context) {
        this.router = new Router(this.resolver, {
            context: context,
            pages: this.pages,
            basename: this.basename,
        })
        this.currentRouteObservable.setRouter(this.router)
    }

    getCurrentValue(): Route {
        return this.currentRouteObservable.getValue()
    }

    getSteadyValue(): Promise<Route> {
        return this.currentRouteObservable.getSteadyRoute()
    }

    async steady() {
        await this.getSteadyValue()
        return
    }

    /**
     * If you're using code splitting, you'll need to subscribe to changes to
     * the snapshot, as the route may change as new code chunks are received.
     */
    subscribe(
        onNextOrObserver: Observer<Route> | ((value: Route) => void),
        onError?: (error: any) => void,
        onComplete?: () => void
    ): SimpleSubscription {
        let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
        return this.currentRouteObservable.subscribe(navigationObserver)
    }

    private handleChange = (route: Route) => {
        this.receivedRoute = route
    }
}
